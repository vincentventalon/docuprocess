/**
 * API Route: Get Packing Slip Template Info
 * GET /api/generators/packing-slip/template
 *
 * Without ?id=: returns all 7 packing slip templates (for template selector)
 * With ?id=<uuid>: returns a single template
 * No authentication required (public endpoint)
 */

import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

const PACKING_SLIP_TEMPLATE_IDS = [
  "0e8bacde-06b4-4453-8ed2-2314c6abe676", // Clean Ecommerce Packing Slip (default)
  "ed89c84a-8c79-48c1-86a1-147ce86d82cb", // Modern Packing Slip With QR code and Barcode
  "562c7687-a21a-479c-984d-4adeb7fde53d", // Warehouse Wholesale Packing Slip
  "b699cbe4-af89-4f72-8159-87ea918c430c", // Fashion Boutique Packing Slip
  "55a292cf-b71f-4c3c-9cb8-44611d2a81c2", // Tech Electronics Packing Slip
  "79fd5e8c-afad-400f-9a2a-21a8bc02a753", // Food & Beverage Delivery Packing Slip
  "9289037c-8591-490a-9a19-9c64886dff1b", // Pharmaceutical Medical Packing Slip
];

const DEFAULT_TEMPLATE_ID = "0e8bacde-06b4-4453-8ed2-2314c6abe676";

async function fetchTemplate(templateId: string) {
  const response = await fetch(
    `${BACKEND_URL}/public/free-tools/template/${templateId}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );

  if (!response.ok) {
    console.error(`Error fetching template ${templateId}:`, response.status);
    return null;
  }

  return await response.json();
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    // Single template request
    if (id) {
      if (!PACKING_SLIP_TEMPLATE_IDS.includes(id)) {
        return NextResponse.json(
          { error: "Invalid template ID" },
          { status: 400 }
        );
      }

      const template = await fetchTemplate(id);
      if (!template) {
        return NextResponse.json(
          { error: "Failed to fetch template" },
          { status: 500 }
        );
      }

      return NextResponse.json(template);
    }

    // All templates request
    const results = await Promise.all(
      PACKING_SLIP_TEMPLATE_IDS.map((tid) => fetchTemplate(tid))
    );

    const templates = results.filter(Boolean);

    return NextResponse.json({
      templates,
      default_template_id: DEFAULT_TEMPLATE_ID,
    });
  } catch (error) {
    console.error("Error fetching packing slip templates:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
