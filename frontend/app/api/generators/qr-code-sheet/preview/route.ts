/**
 * API Route: Generate QR Code Sheet Preview
 * POST /api/generators/qr-code-sheet/preview
 *
 * Generates HTML preview for a QR code sheet template
 * No authentication required (public endpoint)
 */

import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

const QR_TEMPLATE_IDS = [
  "0b51407c-46e2-4295-b2ec-5c3e35f73f79", // QR Code Sheet
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, template_id } = body;

    if (!data || typeof data !== "object") {
      return NextResponse.json(
        { error: "Missing or invalid data field" },
        { status: 400 }
      );
    }

    if (!template_id || !QR_TEMPLATE_IDS.includes(template_id)) {
      return NextResponse.json(
        { error: "Invalid template ID" },
        { status: 400 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/public/free-tools/preview`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ template_id, data }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Error generating preview:", errorData);
      return NextResponse.json(
        { error: errorData.detail || "Failed to generate preview" },
        { status: response.status }
      );
    }

    const html = await response.text();
    return new NextResponse(html, {
      status: 200,
      headers: { "Content-Type": "text/html" },
    });
  } catch (error) {
    console.error("Error generating QR code sheet preview:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
