import { createClient } from "@/libs/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        { error: "Invitation token is required" },
        { status: 400 }
      );
    }

    // Fetch invitation
    const { data: invitation, error: fetchError } = await supabase
      .from("team_invitations")
      .select("id, team_id, email, role, expires_at, invited_by")
      .eq("token", token)
      .single();

    if (fetchError || !invitation) {
      return NextResponse.json(
        { error: "Invalid invitation" },
        { status: 404 }
      );
    }

    // Check if invitation has expired
    if (new Date(invitation.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "This invitation has expired" },
        { status: 400 }
      );
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from("team_members")
      .select("user_id")
      .eq("team_id", invitation.team_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingMember) {
      // Delete the invitation since user is already a member
      await supabase
        .from("team_invitations")
        .delete()
        .eq("id", invitation.id);

      return NextResponse.json(
        { error: "You are already a member of this team" },
        { status: 400 }
      );
    }

    // Create team membership
    const { error: memberError } = await supabase
      .from("team_members")
      .insert({
        team_id: invitation.team_id,
        user_id: user.id,
        role: invitation.role,
        invited_by: invitation.invited_by,
        joined_at: new Date().toISOString(),
      });

    if (memberError) {
      console.error("Error creating membership:", memberError);
      return NextResponse.json(
        { error: "Failed to join team" },
        { status: 500 }
      );
    }

    // Delete the invitation
    await supabase
      .from("team_invitations")
      .delete()
      .eq("id", invitation.id);

    // Update user's last_team_id to the new team
    await supabase
      .from("profiles")
      .update({ last_team_id: invitation.team_id })
      .eq("id", user.id);

    return NextResponse.json({ success: true, teamId: invitation.team_id });
  } catch (error) {
    console.error("Error in accept-invite API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
