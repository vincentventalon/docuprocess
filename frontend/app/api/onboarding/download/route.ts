import { createClient } from "@/libs/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get user's team ID and API key
  const { data: profile } = await supabase
    .from("profiles")
    .select("last_team_id")
    .eq("id", user.id)
    .single();

  if (!profile?.last_team_id) {
    return NextResponse.json(
      { error: "No team found" },
      { status: 500 }
    );
  }

  // Get API key from team_api_keys
  const { data: apiKeyData } = await supabase
    .from("team_api_keys")
    .select("api_key")
    .eq("team_id", profile.last_team_id)
    .is("revoked_at", null)
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  if (!apiKeyData?.api_key) {
    return NextResponse.json(
      { error: "API key not found" },
      { status: 500 }
    );
  }

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

  try {
    const body = await request.json();
    const { template_id, data } = body;

    if (!template_id) {
      return NextResponse.json(
        { error: "template_id is required" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${backendUrl}/public/example-templates/generate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKeyData.api_key,
        },
        body: JSON.stringify({
          template_id,
          data: data || {},
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Error generating PDF:", errorData);
      return NextResponse.json(
        { error: errorData.detail || "Could not generate PDF" },
        { status: response.status }
      );
    }

    const pdfBuffer = await response.arrayBuffer();

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="document.pdf"',
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { error: "Could not generate PDF" },
      { status: 500 }
    );
  }
}
