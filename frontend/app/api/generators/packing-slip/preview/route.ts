/**
 * API Route: Generate Packing Slip Preview
 * POST /api/generators/packing-slip/preview
 *
 * Generates HTML preview for a packing slip template
 * No authentication required (public endpoint)
 */

import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

const PACKING_SLIP_TEMPLATE_IDS = [
  "0e8bacde-06b4-4453-8ed2-2314c6abe676",
  "ed89c84a-8c79-48c1-86a1-147ce86d82cb",
  "562c7687-a21a-479c-984d-4adeb7fde53d",
  "b699cbe4-af89-4f72-8159-87ea918c430c",
  "55a292cf-b71f-4c3c-9cb8-44611d2a81c2",
  "79fd5e8c-afad-400f-9a2a-21a8bc02a753",
  "9289037c-8591-490a-9a19-9c64886dff1b",
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

    if (!template_id || !PACKING_SLIP_TEMPLATE_IDS.includes(template_id)) {
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
    console.error("Error generating packing slip preview:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
