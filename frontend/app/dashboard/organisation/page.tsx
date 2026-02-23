"use client";

import { useState, useEffect } from "react";
import { useTeam } from "@/contexts/TeamContext";
import { createClient } from "@/libs/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Crown,
  Shield,
  User,
  Check,
  Trash2,
  LogOut,
  UserPlus,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface TeamMember {
  user_id: string;
  role: "owner" | "admin" | "member";
  joined_at: string;
  profiles: {
    email: string;
    name: string | null;
  };
}

const roleConfig = {
  owner: { icon: Crown, label: "Owner", color: "text-amber-600 bg-amber-50" },
  admin: { icon: Shield, label: "Admin", color: "text-blue-600 bg-blue-50" },
  member: { icon: User, label: "Member", color: "text-gray-600 bg-gray-50" },
};

export default function TeamSettingsPage() {
  const { currentTeam, refreshCurrentTeam } = useTeam();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  const [teamName, setTeamName] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const isOwner = currentTeam?.role === "owner";
  const isAdmin = currentTeam?.role === "admin" || isOwner;

  // Fetch current user ID
  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    fetchUser();
  }, []);

  // Set initial team name
  useEffect(() => {
    if (currentTeam?.name) {
      setTeamName(currentTeam.name);
    }
  }, [currentTeam?.name]);

  // Fetch team members
  useEffect(() => {
    const fetchMembers = async () => {
      if (!currentTeam?.id) return;

      setIsLoadingMembers(true);
      const supabase = createClient();

      const { data, error } = await supabase
        .from("team_members")
        .select(`
          user_id,
          role,
          joined_at,
          profiles (
            email,
            name
          )
        `)
        .eq("team_id", currentTeam.id)
        .order("role", { ascending: true });

      if (error) {
        console.error("Error fetching members:", error);
        toast.error("Failed to load organisation members");
      } else {
        setMembers((data as unknown as TeamMember[]) || []);
      }
      setIsLoadingMembers(false);
    };

    fetchMembers();
  }, [currentTeam?.id]);

  const handleSaveName = async () => {
    if (!currentTeam?.id || !teamName.trim()) return;

    setIsSavingName(true);
    const supabase = createClient();

    const { error } = await supabase
      .from("teams")
      .update({ name: teamName.trim() })
      .eq("id", currentTeam.id);

    if (error) {
      toast.error("Failed to update organisation name");
    } else {
      toast.success("Organisation name updated");
      refreshCurrentTeam();
    }
    setIsSavingName(false);
  };

  const handleRemoveMember = async (userId: string) => {
    if (!currentTeam?.id) return;

    const supabase = createClient();

    const { error } = await supabase
      .from("team_members")
      .delete()
      .eq("team_id", currentTeam.id)
      .eq("user_id", userId);

    if (error) {
      toast.error("Failed to remove member");
    } else {
      toast.success("Member removed");
      setMembers((prev) => prev.filter((m) => m.user_id !== userId));
    }
  };

  const handleLeaveTeam = async () => {
    if (!currentTeam?.id || !currentUserId) return;

    const supabase = createClient();

    const { error } = await supabase
      .from("team_members")
      .delete()
      .eq("team_id", currentTeam.id)
      .eq("user_id", currentUserId);

    if (error) {
      toast.error("Failed to leave organisation");
    } else {
      toast.success("You have left the organisation");
      // Refresh will redirect to another team or show empty state
      window.location.href = "/dashboard";
    }
  };

  if (!currentTeam) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Organisation Settings</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your organisation, members, and API access
          </p>
        </header>

        <div className="space-y-6">
          {/* Team Name Card */}
          <Card>
            <CardHeader>
              <CardTitle>Organisation Name</CardTitle>
              <CardDescription>
                The name of your organisation as it appears across the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Input
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  disabled={!isOwner}
                  className="max-w-sm"
                />
                {isOwner && (
                  <Button
                    onClick={handleSaveName}
                    disabled={isSavingName || teamName === currentTeam.name}
                  >
                    {isSavingName ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Save"
                    )}
                  </Button>
                )}
              </div>
              {!isOwner && (
                <p className="text-xs text-gray-500 mt-2">
                  Only the organisation owner can change the organisation name
                </p>
              )}
            </CardContent>
          </Card>

          {/* Team Members Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Organisation Members</CardTitle>
                <CardDescription>
                  People who have access to this organisation
                </CardDescription>
              </div>
              {isAdmin && (
                <Button asChild>
                  <Link href="/dashboard/organisation/invite">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite
                  </Link>
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {isLoadingMembers ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : (
                <div className="divide-y">
                  {members.map((member) => {
                    const config = roleConfig[member.role];
                    const RoleIcon = config.icon;
                    const isCurrentUser = member.user_id === currentUserId;
                    const canRemove = isAdmin && member.role !== "owner" && !isCurrentUser;

                    return (
                      <div
                        key={member.user_id}
                        className="flex items-center justify-between py-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm">
                            {member.profiles.email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {member.profiles.name || member.profiles.email}
                              {isCurrentUser && (
                                <span className="text-gray-400 ml-1">(you)</span>
                              )}
                            </p>
                            <p className="text-xs text-gray-500">
                              {member.profiles.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className={config.color}>
                            <RoleIcon className="h-3 w-3 mr-1" />
                            {config.label}
                          </Badge>
                          {canRemove && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-gray-400 hover:text-red-600"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remove member?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {member.profiles.email} will lose access to this
                                    organisation. They can be re-invited later.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleRemoveMember(member.user_id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Remove
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Leave Team Card (Non-owners only) */}
          {!isOwner && (
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">Leave Organisation</CardTitle>
                <CardDescription>
                  Remove yourself from this organisation. You will lose access to all organisation
                  resources.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <LogOut className="h-4 w-4 mr-2" />
                      Leave Organisation
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Leave organisation?</AlertDialogTitle>
                      <AlertDialogDescription>
                        You will lose access to all templates and resources in this
                        organisation. You&apos;ll need a new invitation to rejoin.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleLeaveTeam}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Leave Organisation
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
