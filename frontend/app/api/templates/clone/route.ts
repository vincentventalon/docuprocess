/**
 * API Route: Clone Template
 * POST /api/templates/clone
 *
 * Creates a copy of an existing template with all its content
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/libs/supabase/server";
import { DEFAULT_PAGE_PADDING, DEFAULT_PAGE_SETTINGS } from "@/types/page-settings";
import { sanitizeTemplateHtml } from "@/libs/sanitize-html";

interface CloneTemplateRequest {
  templateId: string; // The ID of the template to clone
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user's current team
    const { data: profile } = await supabase
      .from("profiles")
      .select("last_team_id")
      .eq("id", user.id)
      .single();

    if (!profile?.last_team_id) {
      return NextResponse.json(
        { error: "No team found" },
        { status: 400 }
      );
    }

    // Parse request body
    const body: CloneTemplateRequest = await req.json();
    const { templateId } = body;

    if (!templateId) {
      return NextResponse.json(
        { error: "Missing templateId" },
        { status: 400 }
      );
    }

    // Fetch the original template
    const { data: originalTemplate, error: fetchError } = await supabase
      .from("templates")
      .select(`
        id,
        short_id,
        name,
        html_content,
        css_content,
        sample_data,
        paper_format,
        page_orientation,
        page_padding,
        infinite_mode
      `)
      .eq("id", templateId)
      .eq("team_id", profile.last_team_id)
      .single();

    if (fetchError || !originalTemplate) {
      console.error("Error fetching template:", fetchError);
      return NextResponse.json(
        { error: "Template not found or access denied" },
        { status: 404 }
      );
    }

    // Prepare the content for the cloned template
    const content = {
      html: originalTemplate.html_content || "",
      css: originalTemplate.css_content || "",
      data: originalTemplate.sample_data || {},
      paper_format: (originalTemplate.paper_format as string) || DEFAULT_PAGE_SETTINGS.format,
      page_orientation: (originalTemplate.page_orientation as string) || DEFAULT_PAGE_SETTINGS.orientation,
      page_padding: originalTemplate.page_padding || DEFAULT_PAGE_PADDING,
      infinite_mode: originalTemplate.infinite_mode ?? false,
    };

    // Create new template with cloned name
    // Sanitize HTML to prevent XSS attacks (re-sanitize even cloned content)
    const clonedName = `${originalTemplate.name}`;
    const { data: newTemplate, error: templateError } = await supabase
      .from("templates")
      .insert({
        team_id: profile.last_team_id,
        name: clonedName,
        html_content: sanitizeTemplateHtml(content.html),
        css_content: content.css,
        sample_data: content.data,
        paper_format: content.paper_format,
        page_orientation: content.page_orientation,
        page_padding: content.page_padding,
        infinite_mode: content.infinite_mode,
      })
      .select()
      .single();

    if (templateError) {
      console.error("Error creating cloned template:", templateError);
      return NextResponse.json(
        { error: "Failed to create cloned template" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      template: newTemplate,
    });
  } catch (error) {
    console.error("Error cloning template:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
