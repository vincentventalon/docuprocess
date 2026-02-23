import { createClient } from "@/libs/supabase/server";
import { AnalyticsClient } from "@/components/analytics/AnalyticsClient";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
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

  // Get team's templates for mapping template_id -> name
  const { data: templates } = await supabase
    .from("templates")
    .select("short_id, name")
    .eq("team_id", profile.last_team_id);

  // Get team's API keys for mapping api_key_id -> name
  const { data: apiKeys } = await supabase
    .from("team_api_keys")
    .select("id, name")
    .eq("team_id", profile.last_team_id);

  // Get transactions
  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("team_id", profile.last_team_id)
    .order("created_at", { ascending: false })
    .limit(300);

  // Create template map for looking up names
  const templateMap: Record<string, string> = {};
  templates?.forEach((t) => {
    templateMap[t.short_id] = t.name;
  });

  // Create API key map for looking up names
  const apiKeyMap: Record<string, string> = {};
  apiKeys?.forEach((k) => {
    apiKeyMap[k.id] = k.name;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="px-8 py-6">
        <h1 className="text-3xl font-light text-gray-700">Analytics</h1>
      </header>

      {/* Main Content */}
      <main className="px-8 pb-8 space-y-6">
        <AnalyticsClient
          transactions={transactions || []}
          templates={templateMap}
          apiKeys={apiKeyMap}
          userEmail={user.email || ""}
        />
      </main>
    </div>
  );
}
