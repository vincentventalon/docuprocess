"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Coins, Eye } from "lucide-react";
import { useTeam, TeamWithRole } from "@/contexts/TeamContext";
import { useRouter } from "next/navigation";
import type { AdminTeam } from "@/app/dashboard/admin/teams/page";

type TeamAdminCardProps = {
  team: AdminTeam;
};

export function TeamAdminCard({ team }: TeamAdminCardProps) {
  const { impersonateTeam } = useTeam();
  const router = useRouter();

  const handleImpersonate = () => {
    // Convert AdminTeam to TeamWithRole for impersonation
    const teamWithRole: TeamWithRole = {
      id: team.id,
      name: team.name,
      slug: team.slug,
      owner_id: "", // Not needed for impersonation display
      credits: team.credits,
      has_paid: team.has_paid,
      price_id: null,
      customer_id: null,
      created_at: team.created_at,
      role: "owner", // Admin sees as owner
    };

    impersonateTeam(teamWithRole);
    router.push("/dashboard");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isLowCredits = team.credits < 10;

  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          {/* Team Avatar */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
              {getInitials(team.name)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate" title={team.name}>
                {team.name}
              </h3>
              <p className="text-xs text-gray-500 truncate" title={team.slug}>
                {team.slug}
              </p>
            </div>
          </div>

          {/* Paid/Free Badge */}
          {team.has_paid ? (
            <Badge className="bg-green-100 text-green-800 shrink-0">Paid</Badge>
          ) : (
            <Badge variant="outline" className="shrink-0">Free</Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-3 pt-0">
        {/* Owner Email */}
        <div className="text-xs">
          <span className="text-gray-500">Owner: </span>
          <span className="text-gray-700 truncate" title={team.owner_email || "No owner"}>
            {team.owner_email || "No owner"}
          </span>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-4 text-xs">
          {/* Members */}
          <div className="flex items-center gap-1 text-gray-600">
            <Users className="h-3.5 w-3.5" />
            <span>{team.member_count} member{team.member_count !== 1 ? "s" : ""}</span>
          </div>

          {/* Credits */}
          <div
            className={`flex items-center gap-1 ${
              isLowCredits ? "text-amber-600" : "text-gray-600"
            }`}
          >
            <Coins className="h-3.5 w-3.5" />
            <span className={isLowCredits ? "font-medium" : ""}>
              {team.credits} credit{team.credits !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Created Date */}
        <div className="text-xs text-gray-400">
          Created {formatDate(team.created_at)}
        </div>
      </CardContent>

      <CardFooter className="pt-3">
        <Button
          size="sm"
          variant="outline"
          className="w-full"
          onClick={handleImpersonate}
        >
          <Eye className="h-4 w-4 mr-2" />
          View as Team
        </Button>
      </CardFooter>
    </Card>
  );
}
