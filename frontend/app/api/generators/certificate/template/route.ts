/**
 * API Route: Get Certificate Template Info
 * GET /api/generators/certificate/template
 *
 * Without ?id=: returns all certificate templates (for template selector)
 * With ?id=<uuid>: returns a single template
 * No authentication required (public endpoint)
 */

import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

const CERTIFICATE_TEMPLATE_IDS = [
  "eb676de4-6e12-469b-9820-c166f099eca1", // Default Certificate
];

const DEFAULT_TEMPLATE_ID = "eb676de4-6e12-469b-9820-c166f099eca1";

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
      if (!CERTIFICATE_TEMPLATE_IDS.includes(id)) {
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
      CERTIFICATE_TEMPLATE_IDS.map((tid) => fetchTemplate(tid))
    );

    const templates = results.filter(Boolean);

    return NextResponse.json({
      templates,
      default_template_id: DEFAULT_TEMPLATE_ID,
    });
  } catch (error) {
    console.error("Error fetching certificate templates:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
