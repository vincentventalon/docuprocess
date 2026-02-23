"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Trash2,
  Copy,
  Pencil,
  MoreVertical,
  Check,
  X,
  Loader2,
  Eye,
  EyeOff,
  Lock,
  Unlock,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/libs/supabase/client";

type ExampleTemplate = {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  category: string | null;
  is_active: boolean;
  is_locked: boolean;
  created_at: string;
  updated_at: string;
};

type ExampleTemplatesTableProps = {
  templates: ExampleTemplate[];
};

export function ExampleTemplatesTable({ templates }: ExampleTemplatesTableProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [lockingId, setLockingId] = useState<string | null>(null);

  const toggleSelectAll = () => {
    if (selectedIds.size === templates.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(templates.map((t) => t.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkDelete = async () => {
    const count = selectedIds.size;
    if (!confirm(`Are you sure you want to delete ${count} template${count > 1 ? 's' : ''}? This action cannot be undone.`)) {
      return;
    }

    setBulkDeleting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("example_templates")
        .delete()
        .in("id", Array.from(selectedIds));

      if (error) {
        throw new Error(error.message);
      }

      // Clear selection and refresh
      setSelectedIds(new Set());
      router.refresh();
    } catch (error) {
      console.error("Error deleting templates:", error);
      alert(error instanceof Error ? error.message : "Failed to delete templates");
    } finally {
      setBulkDeleting(false);
    }
  };

  const allSelected = templates.length > 0 && selectedIds.size === templates.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < templates.length;

  const handleDelete = async (templateId: string, templateName: string) => {
    if (!confirm(`Are you sure you want to delete "${templateName}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(templateId);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("example_templates")
        .delete()
        .eq("id", templateId);

      if (error) {
        throw new Error(error.message);
      }

      // Refresh the page to show updated list
      router.refresh();
    } catch (error) {
      console.error("Error deleting template:", error);
      alert(error instanceof Error ? error.message : "Failed to delete template");
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleActive = async (templateId: string, currentStatus: boolean) => {
    setTogglingId(templateId);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("example_templates")
        .update({ is_active: !currentStatus })
        .eq("id", templateId);

      if (error) {
        throw new Error(error.message);
      }

      // Refresh the page
      router.refresh();
    } catch (error) {
      console.error("Error toggling status:", error);
      alert(error instanceof Error ? error.message : "Failed to update status");
    } finally {
      setTogglingId(null);
    }
  };

  const handleToggleLock = async (templateId: string, currentLocked: boolean) => {
    setLockingId(templateId);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("example_templates")
        .update({ is_locked: !currentLocked })
        .eq("id", templateId);

      if (error) throw new Error(error.message);
      router.refresh();
    } catch (error) {
      console.error("Error toggling lock:", error);
      alert(error instanceof Error ? error.message : "Failed to update lock status");
    } finally {
      setLockingId(null);
    }
  };

  const getCategoryColor = (category: string | null) => {
    if (!category) return "bg-gray-100 text-gray-800";
    const colors: Record<string, string> = {
      invoice: "bg-blue-100 text-blue-800",
      receipt: "bg-green-100 text-green-800",
      certificate: "bg-purple-100 text-purple-800",
      letter: "bg-yellow-100 text-yellow-800",
    };
    return colors[category.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  const formatRelativeTime = (dateString: string) => {
    const updatedAt = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - updatedAt.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    return updatedAt.toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm">
      {selectedIds.size > 0 && (
        <div className="px-4 py-3 bg-blue-50 border-b flex items-center justify-between">
          <span className="text-sm text-blue-900 font-medium">
            {selectedIds.size} template{selectedIds.size > 1 ? 's' : ''} selected
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleBulkDelete}
            disabled={bulkDeleting}
          >
            {bulkDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected
              </>
            )}
          </Button>
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={allSelected}
                onCheckedChange={toggleSelectAll}
                aria-label="Select all templates"
                className={someSelected ? "data-[state=checked]:bg-gray-400" : ""}
              />
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Slug (SEO URL)</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {templates.map((template) => (
            <TableRow key={template.id}>
              <TableCell>
                <Checkbox
                  checked={selectedIds.has(template.id)}
                  onCheckedChange={() => toggleSelect(template.id)}
                  aria-label={`Select ${template.name}`}
                />
              </TableCell>
              <TableCell className="font-medium">{template.name}</TableCell>
              <TableCell className="max-w-xs">
                {template.slug ? (
                  <code className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    /{template.slug}
                  </code>
                ) : (
                  <span className="text-gray-400 text-xs italic">Not set</span>
                )}
              </TableCell>
              <TableCell>
                {template.category ? (
                  <Badge variant="secondary" className={getCategoryColor(template.category)}>
                    {template.category}
                  </Badge>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-1.5">
                  {/* Lock badge */}
                  {lockingId === template.id ? (
                    <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
                  ) : template.is_locked ? (
                    <Badge
                      className="bg-amber-100 text-amber-800 cursor-pointer hover:bg-amber-200 transition-colors"
                      onClick={() => handleToggleLock(template.id, template.is_locked)}
                    >
                      <Lock className="h-3 w-3 mr-1" />
                      Locked
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-gray-400 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleToggleLock(template.id, template.is_locked)}
                    >
                      <Unlock className="h-3 w-3 mr-1" />
                      Unlocked
                    </Badge>
                  )}
                  {/* Active/Draft badge */}
                  {togglingId === template.id ? (
                    <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                  ) : template.is_active ? (
                    <Badge
                      className={`bg-green-100 text-green-800 ${template.is_locked ? "cursor-default" : "hover:bg-green-200 cursor-pointer"}`}
                      onClick={template.is_locked ? undefined : () => handleToggleActive(template.id, template.is_active)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className={`text-gray-500 ${template.is_locked ? "cursor-default" : "hover:bg-gray-100 cursor-pointer"}`}
                      onClick={template.is_locked ? undefined : () => handleToggleActive(template.id, template.is_active)}
                    >
                      <EyeOff className="h-3 w-3 mr-1" />
                      Draft
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-gray-600">
                <div className="flex flex-col">
                  <span className="text-sm">{formatRelativeTime(template.updated_at)}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(template.updated_at).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleToggleLock(template.id, template.is_locked)}
                      disabled={lockingId === template.id}
                    >
                      {lockingId === template.id ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : template.is_locked ? (
                        <Unlock className="h-4 w-4 mr-2" />
                      ) : (
                        <Lock className="h-4 w-4 mr-2" />
                      )}
                      {template.is_locked ? "Unlock" : "Lock"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {template.is_locked ? (
                      <DropdownMenuItem disabled>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit Template
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/dashboard/admin/example-templates/designer?id=${template.id}`}
                          className="cursor-pointer"
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit Template
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem disabled>
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDelete(template.id, template.name)}
                      disabled={deletingId === template.id || template.is_locked}
                      className="text-red-600 focus:text-red-600"
                    >
                      {deletingId === template.id ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </>
                      )}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
