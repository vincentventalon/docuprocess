import { createClient } from "@/libs/supabase/server";
import { getCurrentTeamId } from "@/libs/team";
import { NextRequest, NextResponse } from "next/server";

/**
 * PATCH /api/api-keys/[id]
 * Rename an API key
 * Requires admin or owner role
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teamId = await getCurrentTeamId(supabase, user.id);
    if (!teamId) {
      return NextResponse.json({ error: "No team found" }, { status: 404 });
    }

    // Check user role
    const { data: membership } = await supabase
      .from("team_members")
      .select("role")
      .eq("team_id", teamId)
      .eq("user_id", user.id)
      .single();

    if (!membership || !["owner", "admin"].includes(membership.role)) {
      return NextResponse.json(
        { error: "Admin or owner access required" },
        { status: 403 }
      );
    }

    const { name } = await req.json();

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    if (name.length > 50) {
      return NextResponse.json(
        { error: "Name must be 50 characters or less" },
        { status: 400 }
      );
    }

    // Update the key (RLS ensures user can only update keys from their team)
    const { data: updatedKey, error } = await supabase
      .from("team_api_keys")
      .update({ name: name.trim() })
      .eq("id", id)
      .eq("team_id", teamId)
      .select("id, name, api_key, created_at, last_used_at, revoked_at, created_by")
      .single();

    if (error) {
      console.error("Error updating API key:", error);
      if (error.code === "23P01") {
        return NextResponse.json(
          { error: "An active key with this name already exists" },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!updatedKey) {
      return NextResponse.json({ error: "API key not found" }, { status: 404 });
    }

    return NextResponse.json({ key: updatedKey });
  } catch (error) {
    console.error("Error in PATCH /api/api-keys/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/api-keys/[id]
 * Revoke an API key (soft delete)
 * Requires admin or owner role
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teamId = await getCurrentTeamId(supabase, user.id);
    if (!teamId) {
      return NextResponse.json({ error: "No team found" }, { status: 404 });
    }

    // Check user role
    const { data: membership } = await supabase
      .from("team_members")
      .select("role")
      .eq("team_id", teamId)
      .eq("user_id", user.id)
      .single();

    if (!membership || !["owner", "admin"].includes(membership.role)) {
      return NextResponse.json(
        { error: "Admin or owner access required" },
        { status: 403 }
      );
    }

    // Check if this is the last active key
    const { count } = await supabase
      .from("team_api_keys")
      .select("id", { count: "exact", head: true })
      .eq("team_id", teamId)
      .is("revoked_at", null);

    if (count === 1) {
      return NextResponse.json(
        { error: "Cannot revoke the last active API key. Create a new key first." },
        { status: 400 }
      );
    }

    // Soft delete by setting revoked_at
    const { data: revokedKey, error } = await supabase
      .from("team_api_keys")
      .update({
        revoked_at: new Date().toISOString(),
        revoked_by: user.id,
      })
      .eq("id", id)
      .eq("team_id", teamId)
      .is("revoked_at", null) // Only revoke if not already revoked
      .select("id, name, api_key, created_at, last_used_at, revoked_at, created_by")
      .single();

    if (error) {
      console.error("Error revoking API key:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!revokedKey) {
      return NextResponse.json(
        { error: "API key not found or already revoked" },
        { status: 404 }
      );
    }

    return NextResponse.json({ key: revokedKey });
  } catch (error) {
    console.error("Error in DELETE /api/api-keys/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
