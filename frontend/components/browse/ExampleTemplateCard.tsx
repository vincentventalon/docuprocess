"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileText, Eye, ArrowRight, Sparkles, Copy, Check } from "lucide-react";
import { UseTemplateDialog } from "./UseTemplateDialog";

type ExampleTemplate = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  thumbnail_url: string | null;
  thumbnail_sm_url: string | null;
  sample_data: Record<string, unknown> | null;
  page_orientation?: string;
  created_at: string;
  updated_at: string;
};

type ExampleTemplateCardProps = {
  template: ExampleTemplate;
};

export function ExampleTemplateCard({ template }: ExampleTemplateCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const isLandscape = template.page_orientation === "landscape";

  const handleCopyPayload = async () => {
    if (!template.sample_data) return;
    await navigator.clipboard.writeText(JSON.stringify(template.sample_data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Card
        className="h-full hover:shadow-lg transition-shadow cursor-pointer overflow-hidden !py-0 !gap-0"
        onClick={() => setIsPreviewOpen(true)}
      >
        <div className="px-2 py-2 bg-gray-50">
          {/* Title bar */}
          <div className="flex items-center justify-between mb-1.5">
            <h3 className="font-medium text-sm text-gray-900 line-clamp-1 flex-1">{template.name}</h3>
            <div className="flex gap-1 shrink-0 ml-2">
              <button
                className="p-1.5 hover:bg-gray-200 rounded-full transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPreviewOpen(true);
                }}
                title="Preview"
              >
                <Eye className="h-4 w-4 text-gray-500" />
              </button>
              <button
                className="p-1.5 bg-[#570df8] hover:bg-[#4a0bd4] rounded-full transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDialogOpen(true);
                }}
                title="Use template"
              >
                <ArrowRight className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>

          {/* Thumbnail */}
          <div className="w-full flex items-center justify-center">
            <div
              className={`relative w-full ${isLandscape ? "aspect-[297/210]" : "aspect-[210/297]"}`}
            >
              {(template.thumbnail_sm_url || template.thumbnail_url) ? (
                <div className="w-full h-full shadow-md border border-gray-200 rounded overflow-hidden">
                  <img
                    src={template.thumbnail_sm_url || template.thumbnail_url!}
                    alt={template.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-full h-full shadow-md border border-gray-200 rounded bg-white flex items-center justify-center">
                  <FileText className="h-10 w-10 text-gray-300" />
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      <UseTemplateDialog
        template={template}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{template.name}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            {/* Large Preview */}
            <div className="w-full flex justify-center p-6 bg-gray-100 rounded-lg">
              {template.thumbnail_url ? (
                <div
                  className={`${isLandscape ? "aspect-[297/210]" : "aspect-[210/297]"} max-h-[60vh] shadow-xl border border-gray-300 rounded overflow-hidden bg-white`}
                >
                  <img
                    src={template.thumbnail_url}
                    alt={template.name}
                    className="h-full w-auto object-contain"
                  />
                </div>
              ) : (
                <div
                  className={`${isLandscape ? "aspect-[297/210]" : "aspect-[210/297]"} h-[400px] shadow-xl border border-gray-300 rounded bg-white flex items-center justify-center`}
                >
                  <div className="text-center">
                    <FileText className="h-16 w-16 text-gray-300 mx-auto" />
                    <span className="text-gray-400 mt-2 block">No preview available</span>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            {template.description && (
              <p className="text-gray-600 text-center max-w-lg">
                {template.description}
              </p>
            )}

            {/* Sample Payload */}
            {template.sample_data && Object.keys(template.sample_data).length > 0 && (
              <div className="w-full max-w-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Sample Payload (for Zapier/API)</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyPayload}
                    className="h-7 text-xs"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3 w-3 mr-1" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3 mr-1" />
                        Copy Payload
                      </>
                    )}
                  </Button>
                </div>
                <pre className="bg-gray-100 rounded-lg p-3 text-xs text-gray-700 overflow-auto max-h-48 font-mono">
                  {JSON.stringify(template.sample_data, null, 2)}
                </pre>
              </div>
            )}

            {/* Use Template Button */}
            <Button
              className="bg-[#570df8] hover:bg-[#4a0bd4]"
              onClick={() => {
                setIsPreviewOpen(false);
                setIsDialogOpen(true);
              }}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Use This Template
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
