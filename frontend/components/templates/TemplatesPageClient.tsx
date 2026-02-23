"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus } from "lucide-react";
import { TemplatesTable } from "@/components/templates/TemplatesTable";
import { NewTemplateModal } from "@/components/templates/NewTemplateModal";
import { ImportPdfDialog } from "@/components/templates/ImportPdfDialog";

interface Template {
  id: string;
  short_id: string;
  name: string;
  sample_data: any;
  created_at: string;
  updated_at: string;
}

interface TemplatesPageClientProps {
  templates: Template[] | null;
  apiKey: string | null;
}

export function TemplatesPageClient({ templates, apiKey }: TemplatesPageClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="flex items-center justify-between px-8 py-6">
          <div>
            <h1 className="text-3xl font-bold">Manage Templates</h1>
            <p className="text-sm text-gray-600 mt-1">
              Create and manage your PDF templates
            </p>
          </div>
          <div className="flex gap-2">
            <ImportPdfDialog />
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8">
        {!templates || templates.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No templates yet</CardTitle>
              <CardDescription>
                Get started by creating your first PDF template
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Template
              </Button>
            </CardContent>
          </Card>
        ) : (
          <TemplatesTable templates={templates} apiKey={apiKey} />
        )}
      </main>

      {/* New Template Modal */}
      <NewTemplateModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  );
}
