"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { TeamAdminCard } from "./TeamAdminCard";
import type { AdminTeam } from "@/app/dashboard/admin/teams/page";

type FilterType = "all" | "paid" | "free";

type TeamAdminListProps = {
  teams: AdminTeam[];
};

export function TeamAdminList({ teams }: TeamAdminListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");

  const filteredTeams = useMemo(() => {
    let result = teams;

    // Apply payment filter
    if (filter === "paid") {
      result = result.filter((t) => t.has_paid);
    } else if (filter === "free") {
      result = result.filter((t) => !t.has_paid);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.slug.toLowerCase().includes(query) ||
          (t.owner_email && t.owner_email.toLowerCase().includes(query))
      );
    }

    return result;
  }, [teams, filter, searchQuery]);

  const paidCount = teams.filter((t) => t.has_paid).length;
  const freeCount = teams.filter((t) => !t.has_paid).length;

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search teams, owners..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter Badges */}
        <div className="flex gap-2">
          <Badge
            variant={filter === "all" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setFilter("all")}
          >
            All ({teams.length})
          </Badge>
          <Badge
            variant={filter === "paid" ? "default" : "outline"}
            className={`cursor-pointer ${filter === "paid" ? "bg-green-600 hover:bg-green-700" : ""}`}
            onClick={() => setFilter("paid")}
          >
            Paid ({paidCount})
          </Badge>
          <Badge
            variant={filter === "free" ? "default" : "outline"}
            className={`cursor-pointer ${filter === "free" ? "bg-gray-600 hover:bg-gray-700" : ""}`}
            onClick={() => setFilter("free")}
          >
            Free ({freeCount})
          </Badge>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-500">
        Showing {filteredTeams.length} of {teams.length} teams
      </div>

      {/* Teams Grid */}
      {filteredTeams.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No teams found matching your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTeams.map((team) => (
            <TeamAdminCard key={team.id} team={team} />
          ))}
        </div>
      )}
    </div>
  );
}
