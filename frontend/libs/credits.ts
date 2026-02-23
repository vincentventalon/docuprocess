import { createClient } from "@/libs/supabase/server";
import { getCurrentTeamId } from "@/libs/team";

/**
 * Check if user's current team has enough credits
 */
export async function hasEnoughCredits(
  userId: string,
  requiredCredits: number = 1
): Promise<boolean> {
  const supabase = await createClient();

  const teamId = await getCurrentTeamId(supabase, userId);
  if (!teamId) return false;

  const { data: team } = await supabase
    .from("teams")
    .select("credits")
    .eq("id", teamId)
    .single();

  if (!team) return false;

  return (team.credits || 0) >= requiredCredits;
}

/**
 * Decrement team credits
 * Returns true if successful, false if not enough credits
 */
export async function decrementCredits(
  userId: string,
  amount: number = 1
): Promise<{ success: boolean; remainingCredits?: number }> {
  const supabase = await createClient();

  const teamId = await getCurrentTeamId(supabase, userId);
  if (!teamId) {
    return { success: false };
  }

  // Get current credits
  const { data: team } = await supabase
    .from("teams")
    .select("credits")
    .eq("id", teamId)
    .single();

  if (!team) {
    return { success: false };
  }

  const currentCredits = team.credits || 0;

  // Check if team has enough credits
  if (currentCredits < amount) {
    return { success: false, remainingCredits: currentCredits };
  }

  // Decrement credits
  const { error } = await supabase
    .from("teams")
    .update({ credits: currentCredits - amount })
    .eq("id", teamId);

  if (error) {
    console.error("Error decrementing credits:", error);
    return { success: false };
  }

  return { success: true, remainingCredits: currentCredits - amount };
}

/**
 * Get user's current team credit balance
 */
export async function getCredits(userId: string): Promise<number> {
  const supabase = await createClient();

  const teamId = await getCurrentTeamId(supabase, userId);
  if (!teamId) return 0;

  const { data: team } = await supabase
    .from("teams")
    .select("credits")
    .eq("id", teamId)
    .single();

  return team?.credits || 0;
}

/**
 * Get credits for a specific team (direct lookup)
 */
export async function getTeamCredits(teamId: string): Promise<number> {
  const supabase = await createClient();

  const { data: team } = await supabase
    .from("teams")
    .select("credits")
    .eq("id", teamId)
    .single();

  return team?.credits || 0;
}

/**
 * Add credits to team (useful for admin operations or refunds)
 */
export async function addCredits(
  userId: string,
  amount: number
): Promise<{ success: boolean; newBalance?: number }> {
  const supabase = await createClient();

  const teamId = await getCurrentTeamId(supabase, userId);
  if (!teamId) {
    return { success: false };
  }

  const { data: team } = await supabase
    .from("teams")
    .select("credits")
    .eq("id", teamId)
    .single();

  if (!team) {
    return { success: false };
  }

  const currentCredits = team.credits || 0;
  const newBalance = currentCredits + amount;

  const { error } = await supabase
    .from("teams")
    .update({ credits: newBalance })
    .eq("id", teamId);

  if (error) {
    console.error("Error adding credits:", error);
    return { success: false };
  }

  return { success: true, newBalance };
}
