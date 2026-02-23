"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Trash2, Loader2 } from "lucide-react";
import { ExampleTemplateAdminCard } from "./ExampleTemplateAdminCard";
import { useRouter } from "next/navigation";
import { createClient } from "@/libs/supabase/client";

type ExampleTemplate = {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  category: string | null;
  tags: string[] | null;
  thumbnail_url: string | null;
  is_active: boolean;
  is_locked: boolean;
  created_at: string;
  updated_at: string;
};

type Props = {
  templates: ExampleTemplate[];
};

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
  { value: "locked", label: "Locked" },
];

const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "invoice", label: "Invoices" },
  { value: "receipt", label: "Receipts" },
  { value: "certificate", label: "Certificates" },
  { value: "letter", label: "Letters" },
  { value: "packing_slip", label: "Packing Slips" },
  { value: "label", label: "Labels" },
];

export function ExampleTemplateAdminGallery({ templates }: Props) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
      // Status filter
      if (statusFilter === "active" && !t.is_active) return false;
      if (statusFilter === "draft" && t.is_active) return false;
      if (statusFilter === "locked" && !t.is_locked) return false;

      // Category filter
      if (categoryFilter !== "all" && t.category !== categoryFilter) return false;

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          t.name.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [templates, statusFilter, categoryFilter, searchQuery]);

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const selectAll = () => {
    if (selectedIds.size === filteredTemplates.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredTemplates.map((t) => t.id)));
    }
  };

  const handleBulkDelete = async () => {
    // Filter out locked templates
    const deletableIds = Array.from(selectedIds).filter(
      (id) => !templates.find((t) => t.id === id)?.is_locked
    );
    const lockedCount = selectedIds.size - deletableIds.length;

    if (deletableIds.length === 0) {
      alert("All selected templates are locked and cannot be deleted.");
      return;
    }

    const message = lockedCount > 0
      ? `${lockedCount} locked template${lockedCount > 1 ? "s" : ""} will be skipped. Delete ${deletableIds.length} template${deletableIds.length > 1 ? "s" : ""}? This cannot be undone.`
      : `Delete ${deletableIds.length} template${deletableIds.length > 1 ? "s" : ""}? This cannot be undone.`;

    if (!confirm(message)) {
      return;
    }

    setIsBulkDeleting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("example_templates")
        .delete()
        .in("id", deletableIds);

      if (error) throw error;
      setSelectedIds(new Set());
      router.refresh();
    } catch (error) {
      alert("Failed to delete templates");
      console.error(error);
    } finally {
      setIsBulkDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters Row */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Status Filter */}
        <div className="flex gap-2">
          {STATUS_FILTERS.map((f) => (
            <Badge
              key={f.value}
              variant={statusFilter === f.value ? "default" : "outline"}
              className="cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => setStatusFilter(f.value)}
            >
              {f.label}
            </Badge>
          ))}
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((c) => (
            <Badge
              key={c.value}
              variant={categoryFilter === c.value ? "default" : "outline"}
              className="cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => setCategoryFilter(c.value)}
            >
              {c.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Selection Bar */}
      {selectedIds.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex items-center justify-between">
          <span className="text-sm font-medium text-blue-900">
            {selectedIds.size} template{selectedIds.size > 1 ? "s" : ""} selected
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setSelectedIds(new Set())}>
              Clear Selection
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              disabled={isBulkDeleting}
            >
              {isBulkDeleting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete Selected
            </Button>
          </div>
        </div>
      )}

      {/* Results count */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">
          {filteredTemplates.length} template{filteredTemplates.length !== 1 ? "s" : ""}
        </span>
        {filteredTemplates.length > 0 && (
          <Button variant="ghost" size="sm" onClick={selectAll}>
            {selectedIds.size === filteredTemplates.length ? "Deselect All" : "Select All"}
          </Button>
        )}
      </div>

      {/* Card Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No templates found</p>
          <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <ExampleTemplateAdminCard
              key={template.id}
              template={template}
              isSelected={selectedIds.has(template.id)}
              onToggleSelect={toggleSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
