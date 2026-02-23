/**
 * API Route: Generate Invoice Preview
 * POST /api/generators/invoice/preview
 *
 * Generates HTML preview for an invoice template
 * No authentication required (public endpoint)
 */

import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

const INVOICE_TEMPLATE_IDS = [
  "7c75ec48-3f86-47d8-80bd-6cd98a2d8df3",
  "127eb43b-7b9e-4a0b-8dd6-0a64f0786ca3",
  "8d728210-d563-4803-a1a6-e32c4d9f5566",
  "7c1db658-3de3-406c-9fc1-fb2720bb8906",
  "19447d24-d1d1-4900-83c4-7d0a9e2c4cf0",
  "488c0863-a6c4-4717-a97c-121f7b50cd03",
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

    if (!template_id || !INVOICE_TEMPLATE_IDS.includes(template_id)) {
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
    console.error("Error generating invoice preview:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
