/**
 * API Route: Get Invoice Template Info
 * GET /api/generators/invoice/template
 *
 * Without ?id=: returns all 6 invoice templates (for template selector)
 * With ?id=<uuid>: returns a single template
 * No authentication required (public endpoint)
 */

import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

const INVOICE_TEMPLATE_IDS = [
  "7c75ec48-3f86-47d8-80bd-6cd98a2d8df3", // Sapphire Professional Invoice (default)
  "127eb43b-7b9e-4a0b-8dd6-0a64f0786ca3", // American Invoice with ACH Details
  "8d728210-d563-4803-a1a6-e32c4d9f5566", // European Corporate Invoice
  "7c1db658-3de3-406c-9fc1-fb2720bb8906", // Minimalist European Invoice
  "19447d24-d1d1-4900-83c4-7d0a9e2c4cf0", // Modern Invoice with QR Code
  "488c0863-a6c4-4717-a97c-121f7b50cd03", // Neo Brutalist Invoice
];

const DEFAULT_TEMPLATE_ID = "7c75ec48-3f86-47d8-80bd-6cd98a2d8df3";

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
      if (!INVOICE_TEMPLATE_IDS.includes(id)) {
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
      INVOICE_TEMPLATE_IDS.map((tid) => fetchTemplate(tid))
    );

    const templates = results.filter(Boolean);

    return NextResponse.json({
      templates,
      default_template_id: DEFAULT_TEMPLATE_ID,
    });
  } catch (error) {
    console.error("Error fetching invoice templates:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
