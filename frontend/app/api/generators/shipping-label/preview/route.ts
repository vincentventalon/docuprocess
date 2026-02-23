/**
 * API Route: Generate Shipping Label Preview
 * POST /api/generators/shipping-label/preview
 *
 * Generates HTML preview for a shipping label template
 * No authentication required (public endpoint)
 */

import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

const SHIPPING_LABEL_TEMPLATE_IDS = [
  "02eabbf3-8782-4d23-b660-1a6bab318109",
  "121e08d5-b9c4-4236-934f-b08a8cfda261",
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

    if (!template_id || !SHIPPING_LABEL_TEMPLATE_IDS.includes(template_id)) {
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
    console.error("Error generating shipping label preview:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
