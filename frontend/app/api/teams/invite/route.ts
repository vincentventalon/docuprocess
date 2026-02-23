import { createClient } from "@/libs/supabase/server";
import { sendEmail } from "@/libs/resend";
import config from "@/config";
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

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

    const { teamId, email, role } = await req.json();

    if (!teamId || !email || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!["admin", "member"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Verify user has permission to invite (must be admin or owner of the team)
    const { data: membership } = await supabase
      .from("team_members")
      .select("role")
      .eq("team_id", teamId)
      .eq("user_id", user.id)
      .single();

    if (!membership || !["owner", "admin"].includes(membership.role)) {
      return NextResponse.json(
        { error: "You don't have permission to invite members" },
        { status: 403 }
      );
    }

    // Verify team exists
    const { data: team } = await supabase
      .from("teams")
      .select("id, name")
      .eq("id", teamId)
      .single();

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Check if user is already a member via profiles table
    const { data: inviteeProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email.toLowerCase())
      .maybeSingle();

    if (inviteeProfile) {
      const { data: isMember } = await supabase
        .from("team_members")
        .select("user_id")
        .eq("team_id", teamId)
        .eq("user_id", inviteeProfile.id)
        .maybeSingle();

      if (isMember) {
        return NextResponse.json(
          { error: "This user is already a team member" },
          { status: 400 }
        );
      }
    }

    // Check if there's already a pending invitation
    const { data: existingInvite } = await supabase
      .from("team_invitations")
      .select("id")
      .eq("team_id", teamId)
      .eq("email", email.toLowerCase())
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (existingInvite) {
      return NextResponse.json(
        { error: "An invitation has already been sent to this email" },
        { status: 400 }
      );
    }

    // Generate invitation token
    const token = randomUUID();

    // Set expiration to 7 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create invitation
    const { error: insertError } = await supabase
      .from("team_invitations")
      .insert({
        team_id: teamId,
        email: email.toLowerCase(),
        token,
        role,
        invited_by: user.id,
        expires_at: expiresAt.toISOString(),
      });

    if (insertError) {
      console.error("Error creating invitation:", insertError);
      return NextResponse.json(
        { error: "Failed to create invitation" },
        { status: 500 }
      );
    }

    // Send invitation email
    const inviteUrl = `https://${config.domainName}/invite/${token}`;

    // Get inviter's email for the email content
    const { data: inviterProfile } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", user.id)
      .single();

    const inviterName = inviterProfile?.full_name || inviterProfile?.email || "A team member";

    try {
      await sendEmail({
        to: email,
        subject: `You've been invited to join ${team.name} on ${config.appName}`,
        text: `${inviterName} has invited you to join the team "${team.name}" on ${config.appName}.\n\nClick the link below to accept the invitation:\n${inviteUrl}\n\nThis invitation expires in 7 days.`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>You've been invited to join ${team.name}</h2>
            <p>${inviterName} has invited you to join their team on ${config.appName}.</p>
            <p style="margin: 24px 0;">
              <a href="${inviteUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Accept Invitation
              </a>
            </p>
            <p style="color: #666; font-size: 14px;">
              Or copy and paste this link: ${inviteUrl}
            </p>
            <p style="color: #666; font-size: 14px;">
              This invitation expires in 7 days.
            </p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Error sending invitation email:", emailError);
      // Don't fail the request if email fails - invitation is still created
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in invite API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
