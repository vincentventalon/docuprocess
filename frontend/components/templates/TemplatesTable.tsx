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
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Trash2, Copy, ArrowDownUp, Pencil, Check, X, Loader2, Terminal } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Template = {
  id: string;
  short_id: string;
  name: string;
  sample_data: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

type TemplatesTableProps = {
  templates: Template[];
  apiKey: string | null;
};

export function TemplatesTable({ templates, apiKey }: TemplatesTableProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [cloningId, setCloningId] = useState<string | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [apiModalTemplate, setApiModalTemplate] = useState<Template | null>(null);
  const [curlCopied, setCurlCopied] = useState(false);

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

  const startEditing = (template: Template) => {
    setEditingId(template.id);
    setEditingName(template.name);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingName("");
  };

  const saveEdit = async () => {
    // TODO: Implement save to database
    console.log("Saving:", editingId, editingName);
    setEditingId(null);
    setEditingName("");
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleDelete = async (templateId: string) => {
    if (!confirm("Are you sure you want to delete this template? This action cannot be undone.")) {
      return;
    }

    setDeletingId(templateId);
    try {
      const response = await fetch("/api/templates/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ templateIds: [templateId] }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete template");
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

  const handleClone = async (templateId: string) => {
    setCloningId(templateId);
    try {
      const response = await fetch("/api/templates/clone", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ templateId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to clone template");
      }

      // Refresh the page to show the new cloned template
      router.refresh();
    } catch (error) {
      console.error("Error cloning template:", error);
      alert(error instanceof Error ? error.message : "Failed to clone template");
    } finally {
      setCloningId(null);
    }
  };

  const handleBulkDelete = async () => {
    const count = selectedIds.size;
    if (!confirm(`Are you sure you want to delete ${count} template${count > 1 ? 's' : ''}? This action cannot be undone.`)) {
      return;
    }

    setBulkDeleting(true);
    try {
      const response = await fetch("/api/templates/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ templateIds: Array.from(selectedIds) }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete templates");
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

  // Public API URL for documentation (not the internal backend URL)
  const publicApiUrl = "https://api.parsedocu.com";

  const generateCurlCommand = (template: Template) => {
    const hasData = template.sample_data && Object.keys(template.sample_data).length > 0;
    const sampleData = hasData ? template.sample_data : { "your_variable": "your_value" };
    const requestBody = {
      template_id: template.short_id,
      data: sampleData,
      export_type: "url"
    };

    return `curl -X POST "${publicApiUrl}/v1/pdf/create" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${apiKey || 'YOUR_API_KEY'}" \\
  -d '${JSON.stringify(requestBody, null, 2)}'`;
  };

  const copyCurlCommand = async () => {
    if (!apiModalTemplate) return;
    try {
      await navigator.clipboard.writeText(generateCurlCommand(apiModalTemplate));
      setCurlCopied(true);
      setTimeout(() => setCurlCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm">
      {selectedIds.size > 0 && (
        <div className="px-4 py-3 bg-purple-50 border-b flex items-center justify-between">
          <span className="text-sm text-purple-900 font-medium">
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
            <TableHead>Template ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="cursor-pointer">
              <div className="flex items-center gap-1">
                Updated At <ArrowDownUp className="h-3 w-3" />
              </div>
            </TableHead>
            <TableHead>API</TableHead>
            <TableHead>Delete</TableHead>
            <TableHead>Clone</TableHead>
            <TableHead>Editor</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {templates.map((template) => {
            const updatedAt = new Date(template.updated_at);
            const now = new Date();
            const diffMs = now.getTime() - updatedAt.getTime();
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);

            let relativeTime = "";
            if (diffMins < 1) relativeTime = "just now";
            else if (diffMins < 60)
              relativeTime = `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
            else if (diffHours < 24)
              relativeTime = `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
            else if (diffDays < 30)
              relativeTime = `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
            else relativeTime = updatedAt.toLocaleDateString();

            return (
              <TableRow key={template.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedIds.has(template.id)}
                    onCheckedChange={() => toggleSelect(template.id)}
                    aria-label={`Select ${template.name}`}
                  />
                </TableCell>
                <TableCell className="font-mono text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    {template.short_id}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                      onClick={() => copyToClipboard(template.short_id, template.id)}
                    >
                      {copiedId === template.id ? (
                        <Check className="h-3 w-3 text-green-600" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  {editingId === template.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="h-8"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEdit();
                          if (e.key === "Escape") cancelEditing();
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                        onClick={saveEdit}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        onClick={cancelEditing}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEditing(template)}
                        className="flex items-center gap-2 hover:text-[#570df8] transition-colors"
                      >
                        <Pencil className="h-3 w-3 text-gray-400" />
                        {template.name}
                      </button>
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-gray-600">
                  <div className="flex flex-col">
                    <span className="text-sm">{relativeTime}</span>
                    <span className="text-xs text-gray-400">
                      {updatedAt.toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-green-600"
                    onClick={() => setApiModalTemplate(template)}
                  >
                    <Terminal className="h-4 w-4" />
                  </Button>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-red-600"
                    onClick={() => handleDelete(template.id)}
                    disabled={deletingId === template.id}
                  >
                    {deletingId === template.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-[#570df8]"
                    onClick={() => handleClone(template.id)}
                    disabled={cloningId === template.id}
                  >
                    {cloningId === template.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </TableCell>
                <TableCell>
                  <Link href={`/dashboard/templates/designer?template_id=${template.short_id}`}>
                    <Button size="sm">
                      <Pencil className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* API Command Modal */}
      <Dialog open={!!apiModalTemplate} onOpenChange={(open) => !open && setApiModalTemplate(null)}>
        <DialogContent className="w-[95vw] max-w-4xl">
          <DialogHeader className="min-w-0">
            <DialogTitle className="flex items-center gap-2">
              <Terminal className="h-5 w-5" />
              API Command - {apiModalTemplate?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 min-w-0">
            <div className="min-w-0">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Generate PDF via API
              </label>
              <div className="relative min-w-0 overflow-hidden">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-auto font-mono max-h-[50vh]">
                  {apiModalTemplate && generateCurlCommand(apiModalTemplate)}
                </pre>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2 bg-gray-800 hover:bg-gray-700 text-white border-gray-600"
                  onClick={copyCurlCommand}
                >
                  {curlCopied ? (
                    <>
                      <Check className="h-3 w-3 mr-1" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 min-w-0">
              <p className="text-sm text-purple-800 break-words">
                {apiKey ? (
                  <>
                    <strong>Note:</strong> The <code className="bg-purple-100 px-1 rounded">data</code> object should match your template placeholders (e.g., <code className="bg-purple-100 px-1 rounded">{"{{name}}"}</code>).
                  </>
                ) : (
                  <>
                    <strong>Note:</strong> You need to <a href="/dashboard/api" className="underline font-medium">generate an API key</a> first.
                    The <code className="bg-purple-100 px-1 rounded">data</code> object should match your template placeholders (e.g., <code className="bg-purple-100 px-1 rounded">{"{{name}}"}</code>).
                  </>
                )}
              </p>
            </div>
            <div className="text-sm text-gray-600">
              <p><strong>Template ID:</strong> <code className="bg-gray-100 px-1 rounded">{apiModalTemplate?.short_id}</code></p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
