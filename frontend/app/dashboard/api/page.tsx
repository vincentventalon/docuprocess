import { createClient } from "@/libs/supabase/server";
import { APIKeysManager } from "@/components/APIKeysManager";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function APIPage() {
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
    redirect("/dashboard");
  }

  // Get user's role in the team
  const { data: membership } = await supabase
    .from("team_members")
    .select("role")
    .eq("team_id", profile.last_team_id)
    .eq("user_id", user.id)
    .single();

  const canManage = membership?.role === "owner" || membership?.role === "admin";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="px-8 py-6">
          <h1 className="text-2xl font-semibold text-gray-900">API Keys</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage API keys for your organisation
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8">
        <APIKeysManager canManage={canManage} />
      </main>
    </div>
  );
}
