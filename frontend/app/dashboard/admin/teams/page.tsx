import { createClient } from "@/libs/supabase/server";
import { redirect } from "next/navigation";
import { TeamAdminList } from "@/components/admin/TeamAdminList";

export const dynamic = "force-dynamic";

export type AdminTeam = {
  id: string;
  name: string;
  slug: string;
  owner_email: string | null;
  member_count: number;
  credits: number;
  has_paid: boolean;
  created_at: string;
};

export default async function AdminTeamsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    redirect("/dashboard");
  }

  // Fetch all teams using the admin RPC with empty search query
  const { data: teams, error } = await supabase.rpc("admin_search_teams", {
    search_query: "",
    result_limit: 1000,
  });

  if (error) {
    console.error("Error fetching teams:", error);
  }

  const typedTeams: AdminTeam[] = (teams || []).map((t: AdminTeam) => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
    owner_email: t.owner_email,
    member_count: Number(t.member_count),
    credits: t.credits,
    has_paid: t.has_paid,
    created_at: t.created_at,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="flex items-center justify-between px-8 py-6">
          <div>
            <h1 className="text-3xl font-bold">Teams</h1>
            <p className="text-sm text-gray-600 mt-1">
              View and manage all teams in the system
            </p>
          </div>
          <div className="text-sm text-gray-500">
            {typedTeams.length} total teams
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8">
        <TeamAdminList teams={typedTeams} />
      </main>
    </div>
  );
}
