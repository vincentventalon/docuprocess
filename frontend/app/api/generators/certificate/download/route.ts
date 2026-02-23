/**
 * API Route: Download Certificate PDF
 * POST /api/generators/certificate/download
 *
 * Generates and returns PDF for the certificate
 * Includes Turnstile verification and rate limiting (5/day per IP)
 */

import { NextRequest, NextResponse } from "next/server";
import { SupabaseClient } from "@supabase/supabase-js";
import { headers } from "next/headers";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
const CERTIFICATE_TEMPLATE_ID = "eb676de4-6e12-469b-9820-c166f099eca1";
const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY;
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;
const DAILY_DOWNLOAD_LIMIT = 5;
const TOOL_NAME = "certificate-generator";

interface TurnstileResponse {
  success: boolean;
  "error-codes"?: string[];
}

async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  if (!TURNSTILE_SECRET_KEY) {
    console.error("TURNSTILE_SECRET_KEY not configured");
    return false;
  }

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          secret: TURNSTILE_SECRET_KEY,
          response: token,
          remoteip: ip,
        }),
      }
    );

    const data: TurnstileResponse = await response.json();
    return data.success;
  } catch (error) {
    console.error("Turnstile verification error:", error);
    return false;
  }
}

function getClientIP(headersList: Headers): string {
  // Try various headers in order of preference
  const cfConnectingIP = headersList.get("cf-connecting-ip");
  if (cfConnectingIP) return cfConnectingIP;

  const xRealIP = headersList.get("x-real-ip");
  if (xRealIP) return xRealIP;

  const xForwardedFor = headersList.get("x-forwarded-for");
  if (xForwardedFor) return xForwardedFor.split(",")[0].trim();

  // Fallback
  return "unknown";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, turnstileToken, email } = body;

    if (!data || typeof data !== "object") {
      return NextResponse.json(
        { error: "Missing or invalid data field" },
        { status: 400 }
      );
    }

    // Get client IP
    const headersList = await headers();
    const clientIP = getClientIP(headersList);

    // Verify Turnstile token (optional - only if configured)
    if (TURNSTILE_SECRET_KEY && turnstileToken) {
      const isValidTurnstile = await verifyTurnstile(turnstileToken, clientIP);
      if (!isValidTurnstile) {
        return NextResponse.json(
          { error: "Invalid Turnstile verification" },
          { status: 403 }
        );
      }
    }

    // Create Supabase service client for rate limiting
    const supabase = new SupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check rate limit: count downloads in the last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // Build query based on whether email is provided
    let query = supabase
      .from("free_tool_downloads")
      .select("id", { count: "exact" })
      .eq("tool_name", TOOL_NAME)
      .gte("created_at", oneDayAgo);

    // If email provided, check limit for that email
    // Otherwise, check limit for IP
    if (email) {
      query = query.eq("email", email);
    } else {
      query = query.eq("ip_address", clientIP).is("email", null);
    }

    const { count, error: countError } = await query;

    if (countError) {
      console.error("Error checking rate limit:", countError);
      return NextResponse.json(
        { error: "Failed to check rate limit" },
        { status: 500 }
      );
    }

    const downloadCount = count || 0;
    const downloadsRemaining = Math.max(0, DAILY_DOWNLOAD_LIMIT - downloadCount);

    if (downloadCount >= DAILY_DOWNLOAD_LIMIT) {
      return NextResponse.json(
        {
          error: "Daily download limit reached",
          downloads_remaining: 0,
          requires_email: !email,
        },
        { status: 429 }
      );
    }

    // Check internal API key is configured
    if (!INTERNAL_API_KEY) {
      console.error("INTERNAL_API_KEY not configured");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Generate PDF via backend
    const pdfResponse = await fetch(`${BACKEND_URL}/public/free-tools/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-API-Key": INTERNAL_API_KEY,
      },
      body: JSON.stringify({
        template_id: CERTIFICATE_TEMPLATE_ID,
        data,
      }),
    });

    if (!pdfResponse.ok) {
      const errorData = await pdfResponse.json().catch(() => ({}));
      console.error("Error generating PDF:", errorData);
      return NextResponse.json(
        { error: errorData.detail || "Failed to generate PDF" },
        { status: pdfResponse.status }
      );
    }

    // Record the download
    const { error: insertError } = await supabase
      .from("free_tool_downloads")
      .insert({
        ip_address: clientIP,
        email: email || null,
        tool_name: TOOL_NAME,
        template_id: CERTIFICATE_TEMPLATE_ID,
      });

    if (insertError) {
      console.error("Error recording download:", insertError);
      // Don't fail the request, just log the error
    }

    // Return PDF with remaining downloads header
    const pdfBytes = await pdfResponse.arrayBuffer();

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="certificate.pdf"',
        "X-Downloads-Remaining": String(downloadsRemaining - 1),
      },
    });
  } catch (error) {
    console.error("Error generating certificate PDF:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
