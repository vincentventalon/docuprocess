import { createClient } from "@/libs/supabase/server";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus } from "lucide-react";
import Link from "next/link";
import { ExampleTemplateAdminGallery } from "@/components/admin/ExampleTemplateAdminGallery";

export const dynamic = "force-dynamic";

export default async function AdminExampleTemplatesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch all example templates
  const { data: templates, error } = await supabase
    .from("example_templates")
    .select(`
      id,
      name,
      slug,
      description,
      category,
      tags,
      thumbnail_url,
      thumbnail_sm_url,
      page_orientation,
      is_active,
      is_locked,
      created_at,
      updated_at
    `)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error fetching example templates:", error);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="flex items-center justify-between px-8 py-6">
          <div>
            <h1 className="text-3xl font-bold">Example Templates</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage system-wide template examples for all users
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/admin/example-templates/designer">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Example Template
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8">
        {!templates || templates.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No example templates yet</CardTitle>
              <CardDescription>
                Create your first example template to help users get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/admin/example-templates/designer">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Example Template
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <ExampleTemplateAdminGallery templates={templates} />
        )}
      </main>
    </div>
  );
}
