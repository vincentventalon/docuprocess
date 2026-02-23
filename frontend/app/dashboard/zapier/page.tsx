import { createClient } from "@/libs/supabase/server";
import { ZapierIntegration } from "@/components/zapier/ZapierIntegration";

export const dynamic = "force-dynamic";

export default async function ZapierPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Get user's current team
  const { data: profile } = await supabase
    .from("profiles")
    .select("last_team_id")
    .eq("id", user.id)
    .single();

  if (!profile?.last_team_id) {
    return null;
  }

  // Fetch team's templates and API key in parallel
  const [templatesResult, apiKeyResult] = await Promise.all([
    supabase
      .from("templates")
      .select(`
        id,
        short_id,
        name,
        sample_data,
        created_at,
        updated_at
      `)
      .eq("team_id", profile.last_team_id)
      .order("updated_at", { ascending: false }),
    supabase
      .from("team_api_keys")
      .select("api_key")
      .eq("team_id", profile.last_team_id)
      .is("revoked_at", null)
      .order("created_at", { ascending: true })
      .limit(1)
      .single()
  ]);

  const { data: templates, error } = templatesResult;
  const apiKey = apiKeyResult.data?.api_key || null;

  if (error) {
    console.error("Error fetching templates:", error);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="p-8">
        <ZapierIntegration templates={templates || []} apiKey={apiKey} />
      </main>
    </div>
  );
}
