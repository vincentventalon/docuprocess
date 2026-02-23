import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Get user's current team ID.
 * First tries profile.last_team_id, then falls back to finding a team they own.
 */
export async function getCurrentTeamId(
  supabase: SupabaseClient,
  userId: string
): Promise<string | null> {
  // First try to get from profile.last_team_id
  const { data: profile } = await supabase
    .from("profiles")
    .select("last_team_id")
    .eq("id", userId)
    .single();

  if (profile?.last_team_id) {
    return profile.last_team_id;
  }

  // Fallback: find team user owns
  const { data: team } = await supabase
    .from("teams")
    .select("id")
    .eq("owner_id", userId)
    .single();

  return team?.id || null;
}

/**
 * Get user's current team ID and customer_id for billing.
 * First tries profile.last_team_id, then falls back to finding a team they own.
 */
export async function getCurrentTeamWithBilling(
  supabase: SupabaseClient,
  userId: string
): Promise<{ teamId: string; customerId: string | null } | null> {
  // First try to get from profile.last_team_id
  const { data: profile } = await supabase
    .from("profiles")
    .select("last_team_id")
    .eq("id", userId)
    .single();

  let teamId = profile?.last_team_id;

  if (teamId) {
    const { data: team } = await supabase
      .from("teams")
      .select("id, customer_id")
      .eq("id", teamId)
      .single();

    if (team) {
      return { teamId: team.id, customerId: team.customer_id };
    }
  }

  // Fallback: find team user owns
  const { data: ownedTeam } = await supabase
    .from("teams")
    .select("id, customer_id")
    .eq("owner_id", userId)
    .single();

  if (ownedTeam) {
    return { teamId: ownedTeam.id, customerId: ownedTeam.customer_id };
  }

  return null;
}
