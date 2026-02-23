/**
 * API Route: Create New Example Template (Admin Only)
 * POST /api/admin/example-templates/create
 *
 * Creates a new example template
 * Requires admin privileges
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/libs/supabase/server";
import { TemplateContent } from "@/libs/types/template";
import { sanitizeTemplateHtml } from "@/libs/sanitize-html";

interface CreateExampleTemplateRequest {
  name: string;
  description?: string;
  category?: string;
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
    const body: CreateExampleTemplateRequest = await req.json();
    const { name, description, category, content } = body;

    if (!name || !content?.html) {
      return NextResponse.json(
        { error: "Missing name or content.html" },
        { status: 400 }
      );
    }

    // Create example template (inactive by default - admin must activate when ready)
    // Sanitize HTML to prevent XSS attacks
    const { data: template, error: templateError } = await supabase
      .from("example_templates")
      .insert({
        name,
        description: description || null,
        category: category || null,
        html_content: sanitizeTemplateHtml(content.html),
        css_content: content.css,
        sample_data: content.data || {},
        paper_format: content.paper_format,
        page_orientation: content.page_orientation,
        page_padding: content.page_padding,
        infinite_mode: content.infinite_mode ?? false,
        is_active: false, // Default to inactive - admin activates when ready
      })
      .select()
      .single();

    if (templateError) {
      console.error("Error creating example template:", templateError);
      return NextResponse.json(
        { error: "Failed to create example template" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      template,
    });
  } catch (error) {
    console.error("Error creating example template:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
