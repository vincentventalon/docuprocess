"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Copy,
  MoreHorizontal,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Check,
  Search,
} from "lucide-react";

interface ApiKey {
  id: string;
  name: string;
  api_key: string;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
  created_by: string | null;
}

interface APIKeysManagerProps {
  canManage: boolean;
}

export function APIKeysManager({ canManage }: APIKeysManagerProps) {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Create dialog state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [creating, setCreating] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<ApiKey | null>(null);

  // Rename dialog state
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [renameKeyId, setRenameKeyId] = useState<string | null>(null);
  const [renameKeyName, setRenameKeyName] = useState("");
  const [renaming, setRenaming] = useState(false);

  // Revoke dialog state
  const [showRevokeDialog, setShowRevokeDialog] = useState(false);
  const [revokeKeyId, setRevokeKeyId] = useState<string | null>(null);
  const [revokeKeyName, setRevokeKeyName] = useState("");
  const [revoking, setRevoking] = useState(false);

  // Key visibility state
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

  // Copy state
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  useEffect(() => {
    fetchKeys();
  }, []);

  async function fetchKeys() {
    try {
      setLoading(true);
      const response = await fetch("/api/api-keys");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch API keys");
      }

      setKeys(data.keys || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch API keys");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!newKeyName.trim()) return;

    try {
      setCreating(true);
      const response = await fetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName.trim() }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create API key");
      }

      setNewlyCreatedKey(data.key);
      setShowCreateDialog(false);
      setNewKeyName("");
      await fetchKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create API key");
    } finally {
      setCreating(false);
    }
  }

  async function handleRename() {
    if (!renameKeyId || !renameKeyName.trim()) return;

    try {
      setRenaming(true);
      const response = await fetch(`/api/api-keys/${renameKeyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: renameKeyName.trim() }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to rename API key");
      }

      setShowRenameDialog(false);
      setRenameKeyId(null);
      setRenameKeyName("");
      await fetchKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to rename API key");
    } finally {
      setRenaming(false);
    }
  }

  async function handleRevoke() {
    if (!revokeKeyId) return;

    try {
      setRevoking(true);
      const response = await fetch(`/api/api-keys/${revokeKeyId}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to revoke API key");
      }

      setShowRevokeDialog(false);
      setRevokeKeyId(null);
      setRevokeKeyName("");
      await fetchKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to revoke API key");
    } finally {
      setRevoking(false);
    }
  }

  async function copyToClipboard(key: string, keyId: string) {
    await navigator.clipboard.writeText(key);
    setCopiedKeyId(keyId);
    setTimeout(() => setCopiedKeyId(null), 2000);
  }

  function toggleKeyVisibility(keyId: string) {
    setVisibleKeys((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(keyId)) {
        newSet.delete(keyId);
      } else {
        newSet.add(keyId);
      }
      return newSet;
    });
  }

  function formatRelativeTime(dateStr: string | null) {
    if (!dateStr) return "Never";

    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min. ago`;
    if (diffHours < 24) return `${diffHours} hr. ago`;
    if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    if (diffMonths < 12) return `${diffMonths} mo. ago`;
    return `${diffYears} yr. ago`;
  }

  // Filter active keys and apply search
  const activeKeys = keys.filter((k) => !k.revoked_at);
  const filteredKeys = activeKeys.filter((k) =>
    k.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 underline hover:no-underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header: Search + Create Button */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white"
          />
        </div>
        {canManage && (
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="bg-violet-600 hover:bg-violet-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create API Key
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                Name
              </th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                API Key
              </th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                Last Used
              </th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                Created
              </th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredKeys.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-gray-500">
                  {searchQuery ? "No API keys match your search" : "No API keys yet"}
                </td>
              </tr>
            ) : (
              filteredKeys.map((key) => (
                <tr key={key.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {key.name}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 bg-gray-100 rounded-md px-3 py-1.5">
                        <span className="font-mono text-sm text-gray-700 select-all">
                          {visibleKeys.has(key.id)
                            ? key.api_key
                            : "••••••••••••••••"}
                        </span>
                        <button
                          onClick={() => toggleKeyVisibility(key.id)}
                          className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-700"
                        >
                          {visibleKeys.has(key.id) ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      <button
                        onClick={() => copyToClipboard(key.api_key, key.id)}
                        className="p-2 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700"
                      >
                        {copiedKeyId === key.id ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {formatRelativeTime(key.last_used_at)}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {formatRelativeTime(key.created_at)}
                  </td>
                  <td className="px-4 py-4">
                    {canManage && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-2 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setRenameKeyId(key.id);
                              setRenameKeyName(key.name);
                              setShowRenameDialog(true);
                            }}
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => {
                              setRevokeKeyId(key.id);
                              setRevokeKeyName(key.name);
                              setShowRevokeDialog(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Revoke
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create API Key</DialogTitle>
            <DialogDescription>
              Give your API key a name to help you identify it later.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="e.g., Production, Development, Zapier"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              maxLength={50}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && !creating && newKeyName.trim()) {
                  handleCreate();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                setNewKeyName("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={creating || !newKeyName.trim()}
              className="bg-violet-600 hover:bg-violet-700"
            >
              {creating ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Key Created Dialog */}
      <Dialog
        open={!!newlyCreatedKey}
        onOpenChange={(open) => {
          if (!open) setNewlyCreatedKey(null);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>API Key Created</DialogTitle>
            <DialogDescription>
              Copy your API key now. You won&apos;t be able to see the full key again.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Name</label>
              <p className="text-gray-900 mt-1">{newlyCreatedKey?.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">API Key</label>
              <div className="flex items-center gap-2 mt-1">
                <code className="flex-1 font-mono text-sm bg-gray-100 px-3 py-2 rounded-md border break-all">
                  {newlyCreatedKey?.api_key}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    newlyCreatedKey &&
                    copyToClipboard(newlyCreatedKey.api_key, newlyCreatedKey.id)
                  }
                >
                  {copiedKeyId === newlyCreatedKey?.id ? (
                    <>
                      <Check className="h-4 w-4 mr-2 text-green-600" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setNewlyCreatedKey(null)}
              className="bg-violet-600 hover:bg-violet-700"
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Rename API Key</DialogTitle>
            <DialogDescription>Enter a new name for this API key.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="API key name"
              value={renameKeyName}
              onChange={(e) => setRenameKeyName(e.target.value)}
              maxLength={50}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && !renaming && renameKeyName.trim()) {
                  handleRename();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRenameDialog(false);
                setRenameKeyId(null);
                setRenameKeyName("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRename}
              disabled={renaming || !renameKeyName.trim()}
              className="bg-violet-600 hover:bg-violet-700"
            >
              {renaming ? "Renaming..." : "Rename"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke Confirmation Dialog */}
      <AlertDialog open={showRevokeDialog} onOpenChange={setShowRevokeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke API Key</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to revoke &quot;{revokeKeyName}&quot;? This action
              cannot be undone. Any applications using this key will no longer be
              able to authenticate.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowRevokeDialog(false);
                setRevokeKeyId(null);
                setRevokeKeyName("");
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevoke}
              disabled={revoking}
              className="bg-red-600 hover:bg-red-700"
            >
              {revoking ? "Revoking..." : "Revoke Key"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
