import { createClient } from "@/libs/supabase/server";
import { getCurrentTeamId } from "@/libs/team";

/**
 * Get current team's first active (non-revoked) API key from team_api_keys table
 */
export async function getTeamApiKey(userId: string) {
  const supabase = await createClient();

  const teamId = await getCurrentTeamId(supabase, userId);
  if (!teamId) {
    return null;
  }

  // Get team's first active (non-revoked) API key from team_api_keys
  const { data: apiKey } = await supabase
    .from("team_api_keys")
    .select("api_key, created_at")
    .eq("team_id", teamId)
    .is("revoked_at", null)
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  return apiKey ? { api_key: apiKey.api_key, api_key_updated_at: apiKey.created_at } : null;
}

/**
 * @deprecated Use /api/api-keys endpoints for key management
 */
export async function getApiKey(userId: string) {
  return getTeamApiKey(userId);
}

/**
 * Update log requests setting (stays on profile for now)
 */
export async function updateLogRequests(
  userId: string,
  logRequests: boolean
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({ log_requests: logRequests })
    .eq("id", userId);

  if (error) {
    console.error("Error updating log requests:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
