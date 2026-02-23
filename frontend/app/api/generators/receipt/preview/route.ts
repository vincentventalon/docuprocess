/**
 * API Route: Generate Receipt Preview
 * POST /api/generators/receipt/preview
 *
 * Generates HTML preview for a receipt template
 * No authentication required (public endpoint)
 */

import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

const RECEIPT_TEMPLATE_IDS = [
  "a1b2c3d4-1111-4000-8000-000000000001", // Rent Receipt
  "a1b2c3d4-2222-4000-8000-000000000002", // Professional Service Receipt
  "a1b2c3d4-3333-4000-8000-000000000003", // Payment Confirmation Receipt
  "a1b2c3d4-4444-4000-8000-000000000004", // Donation Receipt
  "a1b2c3d4-5555-4000-8000-000000000005", // Sales Receipt with Line Items
  "a1b2c3d4-6666-4000-8000-000000000006", // Deposit Receipt
  "a1b2c3d4-7777-4000-8000-000000000007", // Cafe Receipt (A6)
  "a1b2c3d4-8888-4000-8000-000000000008", // Retail POS Receipt (A6)
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

    if (!template_id || !RECEIPT_TEMPLATE_IDS.includes(template_id)) {
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
    console.error("Error generating receipt preview:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
