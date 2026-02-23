/**
 * API Route: Get Receipt Template Info
 * GET /api/generators/receipt/template
 *
 * Without ?id=: returns all 8 receipt templates (for template selector)
 * With ?id=<uuid>: returns a single template
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

const DEFAULT_TEMPLATE_ID = "a1b2c3d4-1111-4000-8000-000000000001";

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
      if (!RECEIPT_TEMPLATE_IDS.includes(id)) {
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
      RECEIPT_TEMPLATE_IDS.map((tid) => fetchTemplate(tid))
    );

    const templates = results.filter(Boolean);

    return NextResponse.json({
      templates,
      default_template_id: DEFAULT_TEMPLATE_ID,
    });
  } catch (error) {
    console.error("Error fetching receipt templates:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
