/**
 * API Route: Create New Template
 * POST /api/templates/create
 *
 * Creates a new template
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/libs/supabase/server";
import { TemplateContent } from "@/libs/types/template";
import { sanitizeTemplateHtml } from "@/libs/sanitize-html";

interface CreateTemplateRequest {
  name: string;
  content: TemplateContent;
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
    const body: CreateTemplateRequest = await req.json();
    const { name, content } = body;

    if (!name || !content?.html) {
      return NextResponse.json(
        { error: "Missing name or content.html" },
        { status: 400 }
      );
    }

    // Create template
    // Sanitize HTML to prevent XSS attacks
    const { data: template, error: templateError } = await supabase
      .from("templates")
      .insert({
        team_id: profile.last_team_id,
        name,
        html_content: sanitizeTemplateHtml(content.html),
        css_content: content.css,
        sample_data: content.data || {},
        paper_format: content.paper_format,
        page_orientation: content.page_orientation,
        page_padding: content.page_padding,
        infinite_mode: content.infinite_mode ?? false,
      })
      .select()
      .single();

    if (templateError) {
      console.error("Error creating template:", templateError);
      return NextResponse.json(
        { error: "Failed to create template" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      template,
    });
  } catch (error) {
    console.error("Error creating template:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
