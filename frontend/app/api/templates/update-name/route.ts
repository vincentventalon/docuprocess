/**
 * API Route: Update Template Name
 * POST /api/templates/update-name
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
    const body: UpdateNameRequest = await req.json();
    const { template_id, name } = body;

    if (!template_id || !name?.trim()) {
      return NextResponse.json(
        { error: "Missing template_id or name" },
        { status: 400 }
      );
    }

    // Get template UUID from short_id
    const { data: template, error: templateError } = await supabase
      .from("templates")
      .select("id, team_id")
      .eq("short_id", template_id)
      .single();

    if (templateError || !template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    if (template.team_id !== profile.last_team_id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // Update only the name
    const { error: updateError } = await supabase
      .from("templates")
      .update({ name: name.trim() })
      .eq("id", template.id);

    if (updateError) {
      console.error("Error updating template name:", updateError);
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
    console.error("Error updating template name:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
