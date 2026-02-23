/**
 * API Route: Save Example Template (Admin Only)
 * POST /api/admin/example-templates/save
 *
 * Updates an example template's content in the database.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/libs/supabase/server";
import { TemplateContent } from "@/libs/types/template";
import type { PagePadding, PageFormat, PageOrientation } from "@/types/page-settings";
import { sanitizeTemplateHtml } from "@/libs/sanitize-html";

interface SaveExampleTemplateRequest {
  template_id: string;
  content: TemplateContent;
  name?: string;
  paper_format?: PageFormat;
  page_orientation?: PageOrientation;
  page_padding?: PagePadding;
  infinite_mode?: boolean;
  description?: string;
  category?: string;
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

    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    // Parse request body
    const body: SaveExampleTemplateRequest = await req.json();
    const {
      template_id,
      content,
      name,
      paper_format,
      page_orientation,
      page_padding,
      infinite_mode,
      description,
      category,
    } = body;

    if (!template_id || !content?.html) {
      return NextResponse.json(
        { error: "Missing template_id or content.html" },
        { status: 400 }
      );
    }

    // Verify template exists
    const { data: template, error: templateError } = await supabase
      .from("example_templates")
      .select("id, name, is_locked")
      .eq("id", template_id)
      .single();

    if (templateError || !template) {
      return NextResponse.json(
        { error: "Example template not found" },
        { status: 404 }
      );
    }

    if (template.is_locked) {
      return NextResponse.json(
        { error: "Template is locked" },
        { status: 403 }
      );
    }

    // Update template in database
    // Sanitize HTML to prevent XSS attacks
    const updateData: Record<string, any> = {
      html_content: sanitizeTemplateHtml(content.html),
      sample_data: content.data || {},
    };

    if (name) {
      updateData.name = name;
    }

    if (content.css) {
      updateData.css_content = content.css;
    }

    if (paper_format) {
      updateData.paper_format = paper_format;
    }

    if (page_orientation) {
      updateData.page_orientation = page_orientation;
    }

    if (page_padding) {
      updateData.page_padding = page_padding;
    }

    if (typeof description === "string") {
      updateData.description = description;
    }

    if (typeof category === "string") {
      updateData.category = category;
    }

    if (typeof infinite_mode === "boolean") {
      updateData.infinite_mode = infinite_mode;
    }

    const { error: updateError } = await supabase
      .from("example_templates")
      .update(updateData)
      .eq("id", template_id);

    if (updateError) {
      console.error("Error updating example template:", updateError);
      return NextResponse.json(
        { error: "Failed to save example template" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error saving example template:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
