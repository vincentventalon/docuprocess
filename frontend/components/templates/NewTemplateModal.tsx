"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Infinity as InfinityIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface NewTemplateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type TemplateMode = "fixed" | "infinite";

export function NewTemplateModal({ open, onOpenChange }: NewTemplateModalProps) {
  const router = useRouter();
  const [selectedMode, setSelectedMode] = useState<TemplateMode | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!selectedMode || isCreating) return;
    setIsCreating(true);
    setError(null);

    try {
      const response = await fetch("/api/templates/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "New Template",
          content: {
            html: '<div data-gjs-type="section" class="pdf-container" style="height:200px"></div>',
            data: {},
            infinite_mode: selectedMode === "infinite",
          },
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create template");
      }

      const data = await response.json();
      onOpenChange(false);
      router.push(`/dashboard/templates/designer?template_id=${data.template.short_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create template");
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    if (isCreating) return; // Prevent closing while creating
    setSelectedMode(null);
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Template</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-gray-600 mb-4">
            Choose a template mode. This cannot be changed later.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {/* Fixed Mode Card */}
            <button
              onClick={() => setSelectedMode("fixed")}
              className={cn(
                "flex flex-col items-center p-4 rounded-lg border-2 transition-all text-left",
                selectedMode === "fixed"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center mb-3",
                selectedMode === "fixed" ? "bg-blue-100" : "bg-gray-100"
              )}>
                <FileText className={cn(
                  "w-6 h-6",
                  selectedMode === "fixed" ? "text-blue-600" : "text-gray-600"
                )} />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Fixed</h3>
              <p className="text-xs text-gray-500 text-center">
                Best for certificates, simple invoices, and single-page documents
              </p>
            </button>

            {/* Infinite Mode Card */}
            <button
              onClick={() => setSelectedMode("infinite")}
              className={cn(
                "flex flex-col items-center p-4 rounded-lg border-2 transition-all text-left",
                selectedMode === "infinite"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center mb-3",
                selectedMode === "infinite" ? "bg-blue-100" : "bg-gray-100"
              )}>
                <InfinityIcon className={cn(
                  "w-6 h-6",
                  selectedMode === "infinite" ? "text-blue-600" : "text-gray-600"
                )} />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Infinite</h3>
              <p className="text-xs text-gray-500 text-center">
                Best for invoices, reports, and documents with repeating sections
              </p>
            </button>
          </div>
        </div>
        {error && (
          <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">
            {error}
          </div>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isCreating}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!selectedMode || isCreating}>
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Template"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
