/**
 * API Route: Get QR Code Sheet Template Info
 * GET /api/generators/qr-code-sheet/template
 *
 * Without ?id=: returns all QR Code templates (for template selector)
 * With ?id=<uuid>: returns a single template
 * No authentication required (public endpoint)
 */

import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

const QR_TEMPLATE_IDS = [
  "0b51407c-46e2-4295-b2ec-5c3e35f73f79", // QR Code Sheet
];

const DEFAULT_TEMPLATE_ID = "0b51407c-46e2-4295-b2ec-5c3e35f73f79";

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
      if (!QR_TEMPLATE_IDS.includes(id)) {
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
      QR_TEMPLATE_IDS.map((tid) => fetchTemplate(tid))
    );

    const templates = results.filter(Boolean);

    return NextResponse.json({
      templates,
      default_template_id: DEFAULT_TEMPLATE_ID,
    });
  } catch (error) {
    console.error("Error fetching QR code sheet templates:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
