/**
 * API Route: Download Invoice PDF
 * POST /api/generators/invoice/download
 *
 * Generates and returns PDF for an invoice template
 * Includes Turnstile verification and rate limiting (5/day per IP)
 */

import { NextRequest, NextResponse } from "next/server";
import { SupabaseClient } from "@supabase/supabase-js";
import { headers } from "next/headers";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY;
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;
const DAILY_DOWNLOAD_LIMIT = 5;
const TOOL_NAME = "invoice-generator";

const INVOICE_TEMPLATE_IDS = [
  "7c75ec48-3f86-47d8-80bd-6cd98a2d8df3",
  "127eb43b-7b9e-4a0b-8dd6-0a64f0786ca3",
  "8d728210-d563-4803-a1a6-e32c4d9f5566",
  "7c1db658-3de3-406c-9fc1-fb2720bb8906",
  "19447d24-d1d1-4900-83c4-7d0a9e2c4cf0",
  "488c0863-a6c4-4717-a97c-121f7b50cd03",
];
const DEFAULT_TEMPLATE_ID = "7c75ec48-3f86-47d8-80bd-6cd98a2d8df3";

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
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
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
  const cfConnectingIP = headersList.get("cf-connecting-ip");
  if (cfConnectingIP) return cfConnectingIP;

  const xRealIP = headersList.get("x-real-ip");
  if (xRealIP) return xRealIP;

  const xForwardedFor = headersList.get("x-forwarded-for");
  if (xForwardedFor) return xForwardedFor.split(",")[0].trim();

  return "unknown";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, turnstileToken, email, template_id } = body;

    if (!data || typeof data !== "object") {
      return NextResponse.json(
        { error: "Missing or invalid data field" },
        { status: 400 }
      );
    }

    const resolvedTemplateId =
      template_id && INVOICE_TEMPLATE_IDS.includes(template_id)
        ? template_id
        : DEFAULT_TEMPLATE_ID;

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

    let query = supabase
      .from("free_tool_downloads")
      .select("id", { count: "exact" })
      .eq("tool_name", TOOL_NAME)
      .gte("created_at", oneDayAgo);

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
        template_id: resolvedTemplateId,
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
        template_id: resolvedTemplateId,
      });

    if (insertError) {
      console.error("Error recording download:", insertError);
    }

    const pdfBytes = await pdfResponse.arrayBuffer();

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="invoice.pdf"',
        "X-Downloads-Remaining": String(downloadsRemaining - 1),
      },
    });
  } catch (error) {
    console.error("Error generating invoice PDF:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
