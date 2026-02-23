"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Shield, User, Loader2, CheckCircle, Users } from "lucide-react";
import Link from "next/link";
import config from "@/config";
import toast from "react-hot-toast";

const roleConfig = {
  owner: { icon: Crown, label: "Owner", color: "text-amber-600 bg-amber-50" },
  admin: { icon: Shield, label: "Admin", color: "text-blue-600 bg-blue-50" },
  member: { icon: User, label: "Member", color: "text-gray-600 bg-gray-50" },
};

interface AcceptInvitationClientProps {
  token: string;
  teamName: string;
  role: "owner" | "admin" | "member";
  invitedEmail: string;
  isLoggedIn: boolean;
  currentUserEmail?: string;
}

export function AcceptInvitationClient({
  token,
  teamName,
  role,
  invitedEmail,
  isLoggedIn,
  currentUserEmail,
}: AcceptInvitationClientProps) {
  const router = useRouter();
  const [isAccepting, setIsAccepting] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);

  const roleInfo = roleConfig[role];
  const RoleIcon = roleInfo.icon;

  // Check if user email matches invitation
  const emailMismatch = isLoggedIn && currentUserEmail && currentUserEmail.toLowerCase() !== invitedEmail.toLowerCase();

  const handleAccept = async () => {
    if (!isLoggedIn) {
      // Redirect to sign in with return URL
      router.push(`/signin?redirect=/invite/${token}`);
      return;
    }

    setIsAccepting(true);

    try {
      const response = await fetch("/api/teams/accept-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to accept invitation");
      }

      setIsAccepted(true);
      toast.success(`You've joined ${teamName}!`);

      // Redirect to dashboard after a brief delay
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to accept invitation");
      setIsAccepting(false);
    }
  };

  if (isAccepted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Welcome to {teamName}!
          </h1>
          <p className="text-gray-600 mb-6">
            You&apos;ve successfully joined the organisation. Redirecting to dashboard...
          </p>
          <Loader2 className="w-5 h-5 animate-spin mx-auto text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl border border-gray-200 shadow-sm p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Join {teamName}
          </h1>
          <p className="text-gray-600">
            You&apos;ve been invited to join this organisation on {config.appName}
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Your role</span>
            <Badge variant="secondary" className={roleInfo.color}>
              <RoleIcon className="h-3 w-3 mr-1" />
              {roleInfo.label}
            </Badge>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm text-gray-600">Invited as</span>
            <span className="text-sm font-medium text-gray-900">{invitedEmail}</span>
          </div>
        </div>

        {emailMismatch && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-amber-800">
              This invitation was sent to <strong>{invitedEmail}</strong>, but you&apos;re
              logged in as <strong>{currentUserEmail}</strong>. Please{" "}
              <a href="/signout" className="underline font-medium">sign out</a> and sign in
              with the correct account to accept this invitation.
            </p>
          </div>
        )}

        {isLoggedIn ? (
          <Button
            onClick={handleAccept}
            disabled={isAccepting || emailMismatch}
            className="w-full"
            size="lg"
          >
            {isAccepting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Joining...
              </>
            ) : emailMismatch ? (
              "Sign in with correct account"
            ) : (
              "Accept Invitation"
            )}
          </Button>
        ) : (
          <div className="space-y-3">
            <Button
              onClick={handleAccept}
              className="w-full"
              size="lg"
            >
              Sign in to Accept
            </Button>
            <p className="text-xs text-center text-gray-500">
              You&apos;ll be redirected back here after signing in
            </p>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Learn more about {config.appName}
          </Link>
        </div>
      </div>
    </div>
  );
}
