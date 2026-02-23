/**
 * API Route: Update Example Template Name (Admin Only)
 * POST /api/admin/example-templates/update-name
 *
 * Updates just the template name without creating a new version
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/libs/supabase/server";

interface UpdateNameRequest {
  template_id: string;
  name: string;
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
    const body: UpdateNameRequest = await req.json();
    const { template_id, name } = body;

    if (!template_id || !name?.trim()) {
      return NextResponse.json(
        { error: "Missing template_id or name" },
        { status: 400 }
      );
    }

    // Verify template exists
    const { data: template, error: templateError } = await supabase
      .from("example_templates")
      .select("id, is_locked")
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

    // Update only the name
    const { error: updateError } = await supabase
      .from("example_templates")
      .update({ name: name.trim() })
      .eq("id", template_id);

    if (updateError) {
      console.error("Error updating example template name:", updateError);
      return NextResponse.json(
        { error: "Failed to update template name" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      name: name.trim(),
    });
  } catch (error) {
    console.error("Error updating example template name:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
