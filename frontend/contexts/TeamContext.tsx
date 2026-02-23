"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { createClient } from "@/libs/supabase/client";

export interface Team {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  credits: number;
  has_paid: boolean;
  price_id: string | null;
  customer_id: string | null;
  created_at: string;
}

export interface TeamMember {
  team_id: string;
  user_id: string;
  role: "owner" | "admin" | "member";
  joined_at: string;
}

export interface TeamWithRole extends Team {
  role: "owner" | "admin" | "member";
}

interface TeamContextType {
  currentTeam: TeamWithRole | null;
  teams: TeamWithRole[];
  isLoading: boolean;
  error: string | null;
  switchTeam: (id: string) => Promise<void>;
  refreshTeams: () => Promise<void>;
  refreshCurrentTeam: () => Promise<void>;
  isAdmin: boolean;
  isImpersonating: boolean;
  impersonatedTeam: TeamWithRole | null;
  impersonateTeam: (t: TeamWithRole) => void;
  exitImpersonation: () => void;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export function TeamProvider({ children }: { children: ReactNode }) {
  const [currentTeam, setCurrentTeam] = useState<TeamWithRole | null>(null);
  const [teams, setTeams] = useState<TeamWithRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [impersonatedTeam, setImpersonatedTeam] = useState<TeamWithRole | null>(null);

  const fetchTeams = useCallback(async () => {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setTeams([]);
      setCurrentTeam(null);
      setIsLoading(false);
      return;
    }

    // Fetch all teams user is a member of with their role
    const { data: memberships, error: membershipError } = await supabase
      .from("team_members")
      .select(
        `
        role,
        teams (
          id,
          name,
          slug,
          owner_id,
          credits,
          has_paid,
          price_id,
          customer_id,
          created_at
        )
      `
      )
      .eq("user_id", user.id);

    if (membershipError) {
      console.error("Error fetching teams:", membershipError);
      setError("Failed to load teams");
      setIsLoading(false);
      return;
    }

    const teamsWithRoles: TeamWithRole[] = (memberships || [])
      .filter((m) => m.teams)
      .map((m) => ({
        ...(m.teams as unknown as Team),
        role: m.role as "owner" | "admin" | "member",
      }));

    setTeams(teamsWithRoles);

    // Get user's last_team_id and admin status from profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("last_team_id, is_admin")
      .eq("id", user.id)
      .single();

    // Set admin status
    setIsAdmin(profile?.is_admin || false);

    // Set current team based on last_team_id or default to first team
    let activeTeam: TeamWithRole | null = null;

    if (profile?.last_team_id) {
      activeTeam = teamsWithRoles.find((t) => t.id === profile.last_team_id) || null;
    }

    if (!activeTeam && teamsWithRoles.length > 0) {
      activeTeam = teamsWithRoles[0];
      // Update profile with the default team
      await supabase
        .from("profiles")
        .update({ last_team_id: activeTeam.id })
        .eq("id", user.id);
    }

    setCurrentTeam(activeTeam);
    setIsLoading(false);
  }, []);

  const refreshCurrentTeam = useCallback(async () => {
    if (!currentTeam) return;

    const supabase = createClient();

    const { data: team, error: teamError } = await supabase
      .from("teams")
      .select("*")
      .eq("id", currentTeam.id)
      .single();

    if (teamError || !team) {
      console.error("Error refreshing team:", teamError);
      return;
    }

    setCurrentTeam({
      ...team,
      role: currentTeam.role,
    });

    // Also update in the teams array
    setTeams((prev) =>
      prev.map((t) =>
        t.id === team.id ? { ...team, role: t.role } : t
      )
    );
  }, [currentTeam]);

  const switchTeam = useCallback(async (teamId: string) => {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    // Verify user is a member of this team
    const targetTeam = teams.find((t) => t.id === teamId);
    if (!targetTeam) {
      setError("Team not found");
      return;
    }

    // Update profile with new last_team_id
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ last_team_id: teamId })
      .eq("id", user.id);

    if (updateError) {
      console.error("Error switching team:", updateError);
      setError("Failed to switch team");
      return;
    }

    setCurrentTeam(targetTeam);
    setError(null);
  }, [teams]);

  // Check for existing impersonation on mount
  useEffect(() => {
    const storedTeam = sessionStorage.getItem("impersonating_team");
    if (storedTeam) {
      try {
        const team = JSON.parse(storedTeam) as TeamWithRole;
        setIsImpersonating(true);
        setImpersonatedTeam(team);
      } catch {
        sessionStorage.removeItem("impersonating_team");
      }
    }
  }, []);

  const impersonateTeam = useCallback((team: TeamWithRole) => {
    setImpersonatedTeam(team);
    setIsImpersonating(true);
    sessionStorage.setItem("impersonating_team", JSON.stringify(team));
  }, []);

  const exitImpersonation = useCallback(() => {
    setImpersonatedTeam(null);
    setIsImpersonating(false);
    sessionStorage.removeItem("impersonating_team");
  }, []);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  // Listen for auth state changes
  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        fetchTeams();
      } else if (event === "SIGNED_OUT") {
        setTeams([]);
        setCurrentTeam(null);
        setIsLoading(false);
        setIsAdmin(false);
        setIsImpersonating(false);
        setImpersonatedTeam(null);
        sessionStorage.removeItem("impersonating_team");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchTeams]);

  // Override currentTeam when impersonating
  const effectiveCurrentTeam = isImpersonating && impersonatedTeam ? impersonatedTeam : currentTeam;

  return (
    <TeamContext.Provider
      value={{
        currentTeam: effectiveCurrentTeam,
        teams,
        isLoading,
        error,
        switchTeam,
        refreshTeams: fetchTeams,
        refreshCurrentTeam,
        isAdmin,
        isImpersonating,
        impersonatedTeam,
        impersonateTeam,
        exitImpersonation,
      }}
    >
      {children}
    </TeamContext.Provider>
  );
}

export function useTeam() {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error("useTeam must be used within a TeamProvider");
  }
  return context;
}
