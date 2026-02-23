/**
 * API Route: Generate Certificate Preview
 * POST /api/generators/certificate/preview
 *
 * Generates HTML preview for the certificate
 * No authentication required (public endpoint)
 */

import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
const CERTIFICATE_TEMPLATE_ID = "eb676de4-6e12-469b-9820-c166f099eca1";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data } = body;

    if (!data || typeof data !== "object") {
      return NextResponse.json(
        { error: "Missing or invalid data field" },
        { status: 400 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/public/free-tools/preview`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        template_id: CERTIFICATE_TEMPLATE_ID,
        data,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Error generating preview:", errorData);
      return NextResponse.json(
        { error: errorData.detail || "Failed to generate preview" },
        { status: response.status }
      );
    }

    // Return HTML content
    const html = await response.text();
    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html",
      },
    });
  } catch (error) {
    console.error("Error generating certificate preview:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
