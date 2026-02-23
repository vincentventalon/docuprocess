"use client";

import { useState, useEffect, useRef } from "react";
import { useTeam, TeamWithRole } from "@/contexts/TeamContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, Check, Settings, Crown, Shield, User, Search, Loader2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface TeamSearchResult {
  id: string;
  name: string;
  slug: string;
  owner_email: string;
  member_count: number;
  has_paid: boolean;
  created_at: string;
}

const roleIcons = {
  owner: Crown,
  admin: Shield,
  member: User,
};

const roleLabels = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
};

interface TeamSwitcherProps {
  variant?: "default" | "compact";
  className?: string;
}

export function TeamSwitcher({ variant = "default", className }: TeamSwitcherProps) {
  const { currentTeam, teams, isLoading, switchTeam, isAdmin, impersonateTeam } = useTeam();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<TeamSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/admin/teams/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        setSearchResults(data.teams || []);
      } catch (error) {
        console.error("Team search error:", error);
        setSearchResults([]);
      }
      setIsSearching(false);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const handleImpersonate = (team: TeamSearchResult) => {
    const teamWithRole: TeamWithRole = {
      id: team.id,
      name: team.name,
      slug: team.slug,
      owner_id: "", // Not needed for impersonation
      credits: 0, // Will be fetched when needed
      has_paid: team.has_paid,
      price_id: null,
      customer_id: null,
      created_at: team.created_at,
      role: "owner", // Admin gets owner-level access
    };
    impersonateTeam(teamWithRole);
    setSearchQuery("");
    setSearchResults([]);
  };

  if (isLoading) {
    return (
      <div className={cn("h-9 w-full animate-pulse rounded-lg bg-gray-100", className)} />
    );
  }

  if (!currentTeam) {
    return null;
  }

  const RoleIcon = roleIcons[currentTeam.role];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-between gap-2 px-3 py-2 h-auto",
            variant === "compact" && "px-2",
            className
          )}
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary font-semibold text-xs">
              {currentTeam.name.charAt(0).toUpperCase()}
            </div>
            {variant !== "compact" && (
              <div className="flex flex-col items-start min-w-0">
                <span className="text-sm font-medium truncate max-w-[120px]">
                  {currentTeam.name}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <RoleIcon className="h-3 w-3" />
                  {roleLabels[currentTeam.role]}
                </span>
              </div>
            )}
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[220px]">
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
          Switch Organisation
        </DropdownMenuLabel>
        {teams.map((team) => {
          const TeamRoleIcon = roleIcons[team.role];
          const isActive = team.id === currentTeam.id;

          return (
            <DropdownMenuItem
              key={team.id}
              onClick={() => switchTeam(team.id)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary font-semibold text-xs">
                {team.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-sm truncate">{team.name}</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <TeamRoleIcon className="h-3 w-3" />
                  {roleLabels[team.role]}
                </span>
              </div>
              {isActive && <Check className="h-4 w-4 text-primary shrink-0" />}
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard/organisation" className="flex items-center gap-2 cursor-pointer">
            <Settings className="h-4 w-4" />
            <span>Organisation Settings</span>
          </Link>
        </DropdownMenuItem>

        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <div className="px-2 py-2">
              <p className="text-xs text-muted-foreground mb-2 font-medium">Admin: View any team</p>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 text-sm pl-8"
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                />
              </div>
              {isSearching && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2 px-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Searching...
                </div>
              )}
              {!isSearching && searchResults.length > 0 && (
                <div className="mt-2 max-h-[200px] overflow-y-auto">
                  {searchResults.map((team) => (
                    <button
                      key={team.id}
                      onClick={() => handleImpersonate(team)}
                      className="w-full text-left px-2 py-1.5 hover:bg-muted rounded text-sm flex items-center gap-2"
                    >
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-amber-100 text-amber-700 font-semibold text-xs">
                        {team.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="truncate font-medium">{team.name}</span>
                        <span className="text-xs text-muted-foreground truncate">
                          {team.owner_email} ({team.member_count} members)
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {!isSearching && searchQuery.length >= 2 && searchResults.length === 0 && (
                <p className="text-xs text-muted-foreground mt-2 px-1">No teams found</p>
              )}
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
