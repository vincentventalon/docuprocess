import { createClient } from "@/libs/supabase/server";
import { NextResponse } from "next/server";

// Welcome/onboarding example template UUID
const ONBOARDING_TEMPLATE_ID = "43893b42-432e-4bea-825f-d5ddd738ced3";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch the example template directly from Supabase
  const { data: template, error } = await supabase
    .from("example_templates")
    .select(`
      id,
      name,
      html_content,
      css_content,
      sample_data,
      paper_format,
      page_orientation,
      page_padding,
      infinite_mode
    `)
    .eq("id", ONBOARDING_TEMPLATE_ID)
    .eq("is_active", true)
    .single();

  if (error || !template) {
    console.error("Error fetching example template:", error);
    return NextResponse.json(
      { error: "Template not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    template: {
      id: template.id,
      short_id: template.id,
      name: template.name || "Welcome template",
      html_content: template.html_content || "",
      css_content: template.css_content || "",
      sample_data: template.sample_data || {},
      paper_format: template.paper_format || "A4",
      page_orientation: template.page_orientation || "portrait",
      page_padding: template.page_padding || { top: 12, right: 12, bottom: 12, left: 12 },
      infinite_mode: template.infinite_mode ?? false,
    },
  });
}
