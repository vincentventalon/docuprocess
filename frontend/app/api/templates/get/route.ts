import { createClient } from "@/libs/supabase/server";
import { NextResponse } from "next/server";
import { DEFAULT_PAGE_PADDING, DEFAULT_PAGE_SETTINGS } from "@/types/page-settings";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const templateId = searchParams.get("template_id");

  if (!templateId) {
    return NextResponse.json(
      { error: "template_id is required" },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get user's current team
  const { data: profile } = await supabase
    .from("profiles")
    .select("last_team_id")
    .eq("id", user.id)
    .single();

  if (!profile?.last_team_id) {
    return NextResponse.json({ error: "No team found" }, { status: 400 });
  }

  // Fetch template by short_id
  const { data: template, error } = await supabase
    .from("templates")
    .select(
      `
      id,
      short_id,
      name,
      html_content,
      css_content,
      sample_data,
      paper_format,
      page_orientation,
      page_padding,
      infinite_mode,
      created_at,
      updated_at
    `
    )
    .eq("short_id", templateId)
    .eq("team_id", profile.last_team_id)
    .single();

  if (error) {
    console.error("Error fetching template:", error);
    return NextResponse.json(
      { error: "Template not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    template: {
      ...template,
      html_content: template.html_content || "",
      css_content: template.css_content || "",
      sample_data: template.sample_data || {},
      paper_format: (template.paper_format as string) || DEFAULT_PAGE_SETTINGS.format,
      page_orientation: (template.page_orientation as string) || DEFAULT_PAGE_SETTINGS.orientation,
      page_padding: template.page_padding || DEFAULT_PAGE_PADDING,
      infinite_mode: template.infinite_mode ?? false,
    },
  });
}
