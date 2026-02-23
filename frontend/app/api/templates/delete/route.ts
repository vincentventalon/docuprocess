/**
 * API Route: Delete Template(s)
 * DELETE /api/templates/delete
 *
 * Deletes one or more templates
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/libs/supabase/server";

interface DeleteTemplateRequest {
  templateIds: string[]; // Array of template IDs to delete
}

export async function DELETE(req: NextRequest) {
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
    const body: DeleteTemplateRequest = await req.json();
    const { templateIds } = body;

    if (!templateIds || !Array.isArray(templateIds) || templateIds.length === 0) {
      return NextResponse.json(
        { error: "Missing or invalid templateIds array" },
        { status: 400 }
      );
    }

    // Verify that all templates belong to the team
    const { data: templates, error: fetchError } = await supabase
      .from("templates")
      .select("id")
      .in("id", templateIds)
      .eq("team_id", profile.last_team_id);

    if (fetchError) {
      console.error("Error fetching templates:", fetchError);
      return NextResponse.json(
        { error: "Failed to verify template ownership" },
        { status: 500 }
      );
    }

    if (!templates || templates.length !== templateIds.length) {
      return NextResponse.json(
        { error: "Some templates not found or do not belong to team" },
        { status: 403 }
      );
    }

    // Delete templates
    const { error: templatesError } = await supabase
      .from("templates")
      .delete()
      .in("id", templateIds);

    if (templatesError) {
      console.error("Error deleting templates:", templatesError);
      return NextResponse.json(
        { error: "Failed to delete templates" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      deletedCount: templateIds.length,
    });
  } catch (error) {
    console.error("Error deleting templates:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
