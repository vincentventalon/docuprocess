"use client";

import React, { useState, useRef } from "react";
import { useTeam } from "@/contexts/TeamContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Link2,
  Upload,
  Copy,
  Check,
  Loader2,
  FileText,
  AlertCircle,
} from "lucide-react";

interface ConversionResult {
  success: boolean;
  markdown?: string;
  page_count?: number;
  credits_used?: number;
  remaining_credits?: number;
  error?: string;
  code?: string;
}

export default function PlaygroundPage() {
  const { currentTeam, refreshCurrentTeam } = useTeam();
  const [activeTab, setActiveTab] = useState("url");
  const [url, setUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        setResult({
          success: false,
          error: "Please select a PDF file",
          code: "INVALID_FILE_TYPE",
        });
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setResult({
          success: false,
          error: "File size must be under 10MB",
          code: "FILE_TOO_LARGE",
        });
        return;
      }
      setSelectedFile(file);
      setResult(null);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Extract base64 part from data URL
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleConvert = async () => {
    setIsConverting(true);
    setResult(null);

    try {
      let body: { url?: string; pdf_base64?: string };

      if (activeTab === "url") {
        if (!url.trim()) {
          setResult({
            success: false,
            error: "Please enter a URL",
            code: "MISSING_URL",
          });
          setIsConverting(false);
          return;
        }
        body = { url: url.trim() };
      } else {
        if (!selectedFile) {
          setResult({
            success: false,
            error: "Please select a PDF file",
            code: "MISSING_FILE",
          });
          setIsConverting(false);
          return;
        }
        const base64 = await fileToBase64(selectedFile);
        body = { pdf_base64: base64 };
      }

      const response = await fetch("/api/convert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      setResult(data);

      // Refresh team to get updated credits
      if (data.success) {
        refreshCurrentTeam();
      }
    } catch {
      setResult({
        success: false,
        error: "Failed to connect to the server",
        code: "NETWORK_ERROR",
      });
    } finally {
      setIsConverting(false);
    }
  };

  const handleCopy = async () => {
    if (result?.markdown) {
      await navigator.clipboard.writeText(result.markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const credits = currentTeam?.credits ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">API Playground</h1>
        <p className="text-muted-foreground">
          Test the PDF to Markdown conversion API
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Convert PDF</CardTitle>
                <CardDescription>
                  Enter a URL or upload a PDF file
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-sm">
                {credits} credits
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="url" className="gap-2">
                  <Link2 className="h-4 w-4" />
                  URL
                </TabsTrigger>
                <TabsTrigger value="upload" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Upload
                </TabsTrigger>
              </TabsList>
              <TabsContent value="url" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pdf-url">PDF URL</Label>
                  <Input
                    id="pdf-url"
                    type="url"
                    placeholder="https://example.com/document.pdf"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={isConverting}
                  />
                  <p className="text-xs text-muted-foreground">
                    Must be a publicly accessible HTTPS URL
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="upload" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pdf-file">PDF File</Label>
                  <div
                    className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      id="pdf-file"
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                      disabled={isConverting}
                    />
                    {selectedFile ? (
                      <div className="flex items-center justify-center gap-2 text-sm">
                        <FileText className="h-5 w-5 text-primary" />
                        <span className="font-medium">{selectedFile.name}</span>
                        <span className="text-muted-foreground">
                          ({(selectedFile.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Click to select a PDF file
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Max size: 10MB
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <Button
              onClick={handleConvert}
              disabled={isConverting || credits === 0}
              className="w-full"
            >
              {isConverting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Converting...
                </>
              ) : (
                "Convert to Markdown"
              )}
            </Button>

            {credits === 0 && (
              <p className="text-sm text-destructive text-center">
                No credits remaining. Please purchase more credits.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Result Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Result</CardTitle>
                <CardDescription>
                  {result?.success
                    ? `${result.page_count} page${result.page_count === 1 ? "" : "s"} converted`
                    : "Converted markdown will appear here"}
                </CardDescription>
              </div>
              {result?.success && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {result ? (
              result.success ? (
                <Textarea
                  value={result.markdown}
                  readOnly
                  className="min-h-[300px] font-mono text-sm"
                />
              ) : (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 text-destructive">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">{result.error}</p>
                    {result.code && (
                      <p className="text-sm opacity-80">Code: {result.code}</p>
                    )}
                  </div>
                </div>
              )
            ) : (
              <div className="flex items-center justify-center min-h-[300px] text-muted-foreground">
                <div className="text-center space-y-2">
                  <FileText className="h-12 w-12 mx-auto opacity-50" />
                  <p>Enter a URL or upload a PDF to get started</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* API Info */}
      <Card>
        <CardHeader>
          <CardTitle>API Endpoint</CardTitle>
          <CardDescription>
            Use this endpoint to convert PDFs programmatically
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm overflow-x-auto">
            <pre className="text-green-400">
{`curl -X POST https://api.docuprocess.com/v1/convert/pdf-to-markdown \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://example.com/document.pdf"}'`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
