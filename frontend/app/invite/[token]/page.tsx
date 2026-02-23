import { createClient } from "@/libs/supabase/server";
import { redirect } from "next/navigation";
import config from "@/config";
import { AcceptInvitationClient } from "./AcceptInvitationClient";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function AcceptInvitationPage({ params }: PageProps) {
  const { token } = await params;
  const supabase = await createClient();

  // Fetch invitation details
  const { data: invitation, error } = await supabase
    .from("team_invitations")
    .select(`
      id,
      email,
      role,
      expires_at,
      teams (
        id,
        name
      )
    `)
    .eq("token", token)
    .single();

  // Check if invitation exists and is valid
  if (error || !invitation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Invalid Invitation
          </h1>
          <p className="text-gray-600 mb-6">
            This invitation link is invalid or has already been used.
          </p>
          <a
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  // Check if invitation has expired
  if (new Date(invitation.expires_at) < new Date()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Invitation Expired
          </h1>
          <p className="text-gray-600 mb-6">
            This invitation has expired. Please ask your organisation admin to send a new invitation.
          </p>
          <a
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const team = invitation.teams as unknown as { id: string; name: string };

  return (
    <AcceptInvitationClient
      token={token}
      teamName={team.name}
      role={invitation.role}
      invitedEmail={invitation.email}
      isLoggedIn={!!user}
      currentUserEmail={user?.email}
    />
  );
}
