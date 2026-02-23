"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Copy, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface APIKeyActionsProps {
  initialApiKey: string;
  initialLogRequests: boolean;
  lastUpdated: string;
}

export function APIKeyActions({
  initialApiKey,
  initialLogRequests,
  lastUpdated,
}: APIKeyActionsProps) {
  const [apiKey, setApiKey] = useState(initialApiKey);
  const [logRequests, setLogRequests] = useState(initialLogRequests);
  const [isResetting, setIsResetting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(apiKey);
    // You can add a toast notification here
    alert("API Key copied to clipboard!");
  };

  const handleGenerateApiKey = async () => {
    setIsResetting(true);
    try {
      const response = await fetch("/api/api-key/reset", {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        setApiKey(data.apiKey);
        alert("API Key has been generated successfully!");
        router.refresh();
      } else {
        alert("Failed to generate API key: " + data.error);
      }
    } catch (error) {
      console.error("Error generating API key:", error);
      alert("Failed to generate API key");
    } finally {
      setIsResetting(false);
    }
  };

  const handleResetApiKey = async () => {
    if (!confirm("Are you sure you want to reset your API key? This action cannot be undone and will invalidate your current key.")) {
      return;
    }

    await handleGenerateApiKey();
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/api-key/log-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ logRequests }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Settings saved successfully!");
        router.refresh();
      } else {
        alert("Failed to save settings: " + data.error);
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRefresh = () => {
    router.refresh();
  };

  return (
    <>
      {/* API Key Section */}
      <div className="space-y-4">
        <div className="grid grid-cols-[120px_1fr] gap-4 items-start">
          <label className="text-lg font-semibold pt-2">API Key</label>
          <div className="space-y-3">
            {!apiKey ? (
              <div>
                <p className="text-sm text-gray-600 mb-3">
                  You don&apos;t have an API key yet. Generate one to start using the API.
                </p>
                <Button
                  onClick={handleGenerateApiKey}
                  disabled={isResetting}
                                  >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isResetting ? "animate-spin" : ""}`} />
                  {isResetting ? "Generating..." : "Generate API Key"}
                </Button>
              </div>
            ) : (
              <>
                <div className="flex gap-3">
                  <Input
                    value={apiKey}
                    readOnly
                    className="flex-1 font-mono text-sm bg-white"
                  />
                  <Button
                    onClick={copyToClipboard}
                                      >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy to Clipboard
                  </Button>
                  <Button
                    variant="destructive"
                    className="bg-red-500 hover:bg-red-600"
                    onClick={handleResetApiKey}
                    disabled={isResetting}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isResetting ? "animate-spin" : ""}`} />
                    {isResetting ? "Resetting..." : "Reset API Key"}
                  </Button>
                </div>
                <p className="text-sm text-gray-500">
                  Last Updated at {lastUpdated}
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Log Request Section */}
      <div className="space-y-4">
        <div className="grid grid-cols-[120px_1fr] gap-4 items-start">
          <label className="text-lg font-semibold pt-1">Log Request</label>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="logRequest"
                checked={logRequests}
                onCheckedChange={(checked) => setLogRequests(checked as boolean)}
              />
              <label
                htmlFor="logRequest"
                className="text-sm text-gray-600 cursor-pointer"
              >
                Enable/Disable API Logs. API logs are generated for troubleshooting and
                it&apos;s retained for up to 14 days.
              </label>
            </div>
            <div className="flex gap-3">
              <Button
                                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save"}
              </Button>
              <Button variant="outline" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
