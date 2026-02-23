"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  HardDrive,
  Save,
  TestTube,
  Trash2,
  CheckCircle,
  XCircle,
  Loader2,
  Info,
} from "lucide-react";

interface S3Config {
  configured: boolean;
  bucket_name?: string;
  endpoint_url?: string | null;
  access_key_id?: string;
  secret_access_key_masked?: string;
  default_prefix?: string;
}

export function S3Integration() {
  const [config, setConfig] = useState<S3Config | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [showTestDialog, setShowTestDialog] = useState(false);

  // Form state
  const [endpointUrl, setEndpointUrl] = useState("");
  const [accessKeyId, setAccessKeyId] = useState("");
  const [secretAccessKey, setSecretAccessKey] = useState("");
  const [bucketName, setBucketName] = useState("");
  const [defaultPrefix, setDefaultPrefix] = useState("");

  useEffect(() => {
    loadConfig();
  }, []);

  async function loadConfig() {
    try {
      const res = await fetch("/api/s3/config");
      const data = await res.json();
      setConfig(data);

      if (data.configured) {
        setEndpointUrl(data.endpoint_url || "");
        setAccessKeyId(data.access_key_id || "");
        setBucketName(data.bucket_name || "");
        setDefaultPrefix(data.default_prefix || "");
      }
    } catch {
      setMessage({ type: "error", text: "Failed to load configuration" });
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);

    try {
      const body: Record<string, unknown> = {
        endpoint_url: endpointUrl.trim(),
        bucket_name: bucketName.trim(),
        access_key_id: accessKeyId.trim(),
        default_prefix: defaultPrefix.trim(),
      };

      if (secretAccessKey.trim()) {
        body.secret_access_key = secretAccessKey.trim();
      }

      const res = await fetch("/api/s3/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({
          type: "error",
          text: data.error || "Failed to save configuration",
        });
        return;
      }

      setMessage({ type: "success", text: "Configuration saved" });
      setSecretAccessKey("");
      await loadConfig();
    } catch {
      setMessage({ type: "error", text: "Failed to save configuration" });
    } finally {
      setSaving(false);
    }
  }

  async function handleTest() {
    setTesting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/s3/test", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setMessage({
          type: "error",
          text: data.error || "Connection test failed",
        });
        return;
      }

      setMessage({ type: "success", text: "Connection successful" });
    } catch {
      setMessage({ type: "error", text: "Connection test failed" });
    } finally {
      setTesting(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete your S3 configuration?")) {
      return;
    }

    setDeleting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/s3/delete", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setMessage({
          type: "error",
          text: data.error || "Failed to delete configuration",
        });
        return;
      }

      setConfig({ configured: false });
      setEndpointUrl("");
      setAccessKeyId("");
      setSecretAccessKey("");
      setBucketName("");
      setDefaultPrefix("");
      setMessage({ type: "success", text: "Configuration deleted" });
    } catch {
      setMessage({ type: "error", text: "Failed to delete configuration" });
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b">
          <div className="px-8 py-6">
            <h1 className="text-3xl font-bold">S3 Storage</h1>
            <p className="text-sm text-gray-600 mt-1">Loading...</p>
          </div>
        </header>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="px-8 py-6">
          <div className="flex items-center gap-3">
            <HardDrive className="h-8 w-8 text-amber-500" />
            <div>
              <h1 className="text-3xl font-bold">S3 Storage</h1>
              <p className="text-sm text-gray-600 mt-1">
                Store generated PDFs in your own S3-compatible bucket
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8 max-w-3xl">
        <div className="space-y-6">
          {/* Status message */}
          {message && (
            <div
              className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                message.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle className="h-4 w-4 shrink-0" />
              ) : (
                <XCircle className="h-4 w-4 shrink-0" />
              )}
              {message.text}
            </div>
          )}

          {/* Configuration Form */}
          <Card>
            <CardHeader>
              <CardTitle>S3-compatible storage configuration</CardTitle>
              <CardDescription>
                Specify credentials and default bucket for S3-compatible
                storage, which you can use to store generated PDFs.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Endpoint URL */}
              <div className="space-y-2">
                <Label htmlFor="endpoint_url">Endpoint URL</Label>
                <Input
                  id="endpoint_url"
                  value={endpointUrl}
                  onChange={(e) => setEndpointUrl(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  For AWS, use{" "}
                  <code className="bg-gray-100 px-1 rounded">
                    https://s3.&lt;region&gt;.amazonaws.com
                  </code>
                  . Any S3-compatible storage is supported, e.g.{" "}
                  <code className="bg-gray-100 px-1 rounded">
                    https://&lt;accountId&gt;.r2.cloudflarestorage.com
                  </code>{" "}
                  for Cloudflare R2 or{" "}
                  <code className="bg-gray-100 px-1 rounded">
                    https://storage.googleapis.com
                  </code>{" "}
                  for GCP.
                </p>
              </div>

              {/* Permissions best practice */}
              <div className="flex gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
                <Info className="h-4 w-4 shrink-0 mt-0.5" />
                <div className="space-y-1.5">
                  <p>
                    <strong>Least privilege:</strong> Only{" "}
                    <code className="bg-amber-100 px-1 rounded">
                      s3:PutObject
                    </code>{" "}
                    is required.
                  </p>
                  <p className="text-amber-700">
                    Scope the policy to your target bucket only. Create a
                    dedicated service account or IAM user with no other
                    permissions.
                  </p>
                </div>
              </div>

              {/* Access Key ID */}
              <div className="space-y-2">
                <Label htmlFor="access_key_id">Access Key ID</Label>
                <Input
                  id="access_key_id"
                  value={accessKeyId}
                  onChange={(e) => setAccessKeyId(e.target.value)}
                />
              </div>

              {/* Secret Key */}
              <div className="space-y-2">
                <Label htmlFor="secret_access_key">Secret Key</Label>
                <Input
                  id="secret_access_key"
                  type="password"
                  placeholder={
                    config?.configured
                      ? `Current: ${config.secret_access_key_masked} — Enter new to update`
                      : undefined
                  }
                  value={secretAccessKey}
                  onChange={(e) => setSecretAccessKey(e.target.value)}
                />
                {config?.configured && (
                  <p className="text-xs text-gray-500">
                    Leave empty to keep the current secret key
                  </p>
                )}
              </div>

              {/* Default Bucket */}
              <div className="space-y-2">
                <Label htmlFor="bucket_name">Default Bucket</Label>
                <Input
                  id="bucket_name"
                  value={bucketName}
                  onChange={(e) => setBucketName(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  You can override the bucket on a per-request basis.
                </p>
              </div>

              {/* Default Folder */}
              <div className="space-y-2">
                <Label htmlFor="default_prefix">
                  Default Folder{" "}
                  <span className="text-gray-400">(optional)</span>
                </Label>
                <Input
                  id="default_prefix"
                  value={defaultPrefix}
                  onChange={(e) => setDefaultPrefix(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  All generated PDFs will be stored under this path in your
                  bucket. You can override this on a per-request basis.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowTestDialog(true)}
                  disabled={
                    testing || !endpointUrl || !accessKeyId || !bucketName
                  }
                >
                  {testing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <TestTube className="h-4 w-4 mr-2" />
                  )}
                  Test Configuration
                </Button>

                <div className="flex-1" />

                <Button
                  onClick={handleSave}
                  disabled={
                    saving || !endpointUrl || !accessKeyId || !bucketName
                  }
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Configuration
                </Button>
              </div>

              {config?.configured && (
                <div className="pt-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    {deleting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-2" />
                    )}
                    Delete Configuration
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Usage Info */}
          <Card>
            <CardHeader>
              <CardTitle>API Usage</CardTitle>
              <CardDescription>
                How to use S3 storage when generating PDFs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">
                Once configured, add{" "}
                <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">
                  &quot;store_s3&quot;: true
                </code>{" "}
                to your PDF generation request to upload the PDF directly to
                your S3 bucket:
              </p>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                {`curl -X POST https://api.example.com/v1/pdf/create \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "template_id": "YOUR_TEMPLATE_ID",
    "data": { "name": "John Doe" },
    "store_s3": true,
    "s3_filepath": "invoices/2024",
    "s3_bucket": "my-other-bucket"
  }'`}
              </pre>
              <p className="text-sm text-gray-500 mt-3">
                Both{" "}
                <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">
                  s3_filepath
                </code>{" "}
                and{" "}
                <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">
                  s3_bucket
                </code>{" "}
                are optional — they override the defaults configured above.
                The response will include{" "}
                <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">
                  s3_bucket
                </code>{" "}
                and{" "}
                <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">
                  s3_key
                </code>
                .
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Test Connection Confirmation Dialog */}
      <AlertDialog open={showTestDialog} onOpenChange={setShowTestDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Test Connection</AlertDialogTitle>
            <AlertDialogDescription>
              This will create an empty file called{" "}
              <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">
                .yourapp-connection-test
              </code>{" "}
              in your bucket to verify the connection works.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowTestDialog(false);
                handleTest();
              }}
            >
              Run Test
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
