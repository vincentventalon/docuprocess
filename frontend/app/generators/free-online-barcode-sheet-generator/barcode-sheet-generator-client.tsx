"use client";

import React, { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, Loader2, Mail, AlertCircle, CheckCircle, Check, Plus, Trash2 } from "lucide-react";
import Script from "next/script";
import Link from "next/link";
import Image from "next/image";

interface TemplateMeta {
  id: string;
  name: string;
  thumbnail_url: string;
}

interface TemplateData extends TemplateMeta {
  sample_data: Record<string, unknown>;
  paper_format: string;
  page_orientation: string;
}

interface BarcodeSheetGeneratorClientProps {
  preloadedTemplates?: TemplateData[];
  defaultTemplateId?: string;
}

interface FormField {
  key: string;
  label: string;
  type: "text" | "date" | "email" | "url" | "number";
  value: string;
}

interface LineItem {
  [key: string]: string | number;
}

const DEFAULT_TEMPLATE_ID = "bf466686-77a3-4838-a43d-73bb837f659e";

// Hardcoded template metadata — avoids API calls on every page load.
// Only sample_data is fetched on demand when a template is selected.
const TEMPLATE_LIST: TemplateMeta[] = [
  {
    id: "bf466686-77a3-4838-a43d-73bb837f659e",
    name: "Barcode Sheet",
    thumbnail_url:
      "https://xipyoqrqbhnypwuhonoh.supabase.co/storage/v1/object/public/thumbnails/example-templates/bf466686-77a3-4838-a43d-73bb837f659e.png?v=1770486815440",
  },
];

// Convert snake_case/camelCase to Title Case
function keyToLabel(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Infer field type from key name and value
function inferFieldType(key: string, value?: unknown): "text" | "date" | "email" | "url" | "number" {
  const lowerKey = key.toLowerCase();
  if (lowerKey.includes("date")) return "date";
  if (lowerKey.includes("email")) return "email";
  if (lowerKey.includes("url") || lowerKey.includes("website")) return "url";
  if (typeof value === "number") return "number";
  return "text";
}

export default function BarcodeSheetGeneratorClient({
  preloadedTemplates,
  defaultTemplateId,
}: BarcodeSheetGeneratorClientProps = {}) {
  // Cache fetched sample_data by template id so we don't re-fetch
  const sampleDataCache = useRef<Record<string, Record<string, unknown>>>({});
  const initialTemplateId = defaultTemplateId || DEFAULT_TEMPLATE_ID;
  const [selectedTemplateId, setSelectedTemplateId] = useState(initialTemplateId);
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [lineItemKeys, setLineItemKeys] = useState<string[]>([]);
  const [lineItemArrayKey, setLineItemArrayKey] = useState<string>("items");
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadsRemaining, setDownloadsRemaining] = useState<number | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const turnstileRef = useRef<HTMLDivElement>(null);
  const turnstileWidgetId = useRef<string | null>(null);

  function buildFormFields(sampleData: Record<string, unknown>) {
    const fields: FormField[] = [];
    const initialData: Record<string, string> = {};

    for (const [key, value] of Object.entries(sampleData)) {
      if (Array.isArray(value)) {
        setLineItemArrayKey(key);
        setLineItems(value.map((item) => ({ ...item })));
        if (value.length > 0) {
          setLineItemKeys(Object.keys(value[0]));
        }
      } else {
        const field: FormField = {
          key,
          label: keyToLabel(key),
          type: inferFieldType(key, value),
          value: String(value),
        };
        fields.push(field);
        initialData[key] = String(value);
      }
    }

    setFormFields(fields);
    setFormData(initialData);
  }

  // Fetch sample_data for a single template (with cache)
  const fetchSampleData = async (templateId: string) => {
    if (sampleDataCache.current[templateId]) {
      return sampleDataCache.current[templateId];
    }
    const response = await fetch(`/api/generators/barcode-sheet/template?id=${templateId}`);
    if (!response.ok) throw new Error("Failed to fetch template");
    const data = await response.json();
    sampleDataCache.current[templateId] = data.sample_data;
    return data.sample_data as Record<string, unknown>;
  };

  // Fetch default template on mount (only if not preloaded)
  useEffect(() => {
    const loadDefault = async () => {
      try {
        // If preloaded and has sample_data, use it directly
        if (preloadedTemplates && preloadedTemplates.length > 0) {
          const defaultTemplate = preloadedTemplates.find(t => t.id === initialTemplateId) || preloadedTemplates[0];
          if (defaultTemplate.sample_data) {
            sampleDataCache.current[defaultTemplate.id] = defaultTemplate.sample_data;
            buildFormFields(defaultTemplate.sample_data);
            return;
          }
        }

        // Fallback: fetch client-side
        const sampleData = await fetchSampleData(initialTemplateId);
        buildFormFields(sampleData);
      } catch (err) {
        console.error("Error fetching default template:", err);
        setError("Failed to load barcode sheet template. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    loadDefault();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initialize Turnstile
  useEffect(() => {
    const initTurnstile = () => {
      const turnstile = (window as any).turnstile;
      if (turnstileRef.current && turnstile && turnstileWidgetId.current === null) {
        turnstileWidgetId.current = turnstile.render(turnstileRef.current, {
          sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "",
          callback: (token: string) => setTurnstileToken(token),
          "expired-callback": () => setTurnstileToken(null),
          "error-callback": () => setTurnstileToken(null),
        });
      }
    };

    initTurnstile();

    const checkInterval = setInterval(() => {
      if ((window as any).turnstile) {
        initTurnstile();
        clearInterval(checkInterval);
      }
    }, 100);

    return () => clearInterval(checkInterval);
  }, []);

  const handleTemplateSelect = async (templateId: string) => {
    setSelectedTemplateId(templateId);
    setIsLoading(true);
    try {
      const sampleData = await fetchSampleData(templateId);
      buildFormFields(sampleData);
    } catch (err) {
      console.error("Error fetching template:", err);
      setError("Failed to load template. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleLineItemChange = (rowIndex: number, key: string, value: string) => {
    setLineItems((prev) => {
      const updated = [...prev];
      // Detect if this key was originally numeric from cached sample_data
      const cachedData = sampleDataCache.current[selectedTemplateId];
      const sampleItems = cachedData?.[lineItemArrayKey];
      const isNumeric =
        Array.isArray(sampleItems) &&
        sampleItems.length > 0 &&
        typeof (sampleItems[0] as Record<string, unknown>)[key] === "number";

      updated[rowIndex] = {
        ...updated[rowIndex],
        [key]: isNumeric ? (value === "" ? "" : Number(value)) : value,
      };
      return updated;
    });
  };

  const addLineItem = () => {
    const emptyItem: LineItem = {};
    lineItemKeys.forEach((key) => {
      emptyItem[key] = "";
    });
    setLineItems((prev) => [...prev, emptyItem]);
  };

  const removeLineItem = (index: number) => {
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  const turnstileEnabled = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  const handleDownload = async (useEmail = false) => {
    if (turnstileEnabled && !turnstileToken) {
      setError("Please complete the security verification");
      return;
    }

    setIsDownloading(true);
    setError(null);

    try {
      const fullData: Record<string, unknown> = { ...formData };
      if (lineItems.length > 0) {
        fullData[lineItemArrayKey] = lineItems;
      }

      const response = await fetch("/api/generators/barcode-sheet/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: fullData,
          template_id: selectedTemplateId,
          turnstileToken,
          email: useEmail ? email : undefined,
        }),
      });

      if (response.status === 429) {
        const errorData = await response.json();
        if (errorData.requires_email) {
          setShowEmailModal(true);
        } else {
          setError("Daily download limit reached. Please try again tomorrow or sign up for unlimited access.");
        }
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to generate PDF");
      }

      const remaining = response.headers.get("X-Downloads-Remaining");
      if (remaining !== null) {
        setDownloadsRemaining(parseInt(remaining, 10));
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "barcode-sheet.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      const turnstile = (window as any).turnstile;
      if (turnstile && turnstileWidgetId.current) {
        turnstile.reset(turnstileWidgetId.current);
        setTurnstileToken(null);
      }

      if (useEmail) {
        setShowEmailModal(false);
        setEmailSubmitted(true);
      }
    } catch (err) {
      console.error("Error downloading PDF:", err);
      setError(err instanceof Error ? err.message : "Failed to download PDF");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    await handleDownload(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (error && formFields.length === 0 && lineItems.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-3" />
        <p className="text-red-600">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <>
      {turnstileEnabled && (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          strategy="afterInteractive"
        />
      )}

      {/* Two Column Layout: Form + Templates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Form + Download */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              Enter Barcode Sheet Details
            </h3>
            <div className="space-y-4">
              {formFields.map((field) => (
                <div key={field.key} className="space-y-1.5">
                  <Label htmlFor={field.key} className="text-sm text-gray-700">
                    {field.label}
                  </Label>
                  <Input
                    id={field.key}
                    type={field.type}
                    value={formData[field.key] || ""}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                    className="h-10"
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                  />
                </div>
              ))}
            </div>

            {/* Line Items Section */}
            {lineItemKeys.length > 0 && (
              <div className="mt-6 border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Barcodes</h4>
                  <Button variant="outline" size="sm" onClick={addLineItem}>
                    <Plus className="h-3 w-3 mr-1" /> Add Item
                  </Button>
                </div>

                {/* Column Headers */}
                <div
                  className="grid gap-2 mb-2"
                  style={{
                    gridTemplateColumns: `repeat(${lineItemKeys.length}, 1fr) 36px`,
                  }}
                >
                  {lineItemKeys.map((key) => (
                    <Label key={key} className="text-xs text-gray-500 uppercase tracking-wide">
                      {keyToLabel(key)}
                    </Label>
                  ))}
                  <div />
                </div>

                {/* Item Rows */}
                {lineItems.map((item, index) => (
                  <div
                    key={index}
                    className="grid gap-2 mb-2"
                    style={{
                      gridTemplateColumns: `repeat(${lineItemKeys.length}, 1fr) 36px`,
                    }}
                  >
                    {lineItemKeys.map((key) => (
                      <Input
                        key={key}
                        type={typeof item[key] === "number" ? "number" : "text"}
                        value={String(item[key] ?? "")}
                        onChange={(e) =>
                          handleLineItemChange(index, key, e.target.value)
                        }
                        className="h-9 text-sm"
                        placeholder={keyToLabel(key)}
                      />
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLineItem(index)}
                      disabled={lineItems.length <= 1}
                      className="h-9 w-9 p-0"
                    >
                      <Trash2 className="h-4 w-4 text-gray-400" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {turnstileEnabled && (
              <div className="mt-6">
                <div
                  ref={turnstileRef}
                  className="cf-turnstile"
                  data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                />
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </p>
              </div>
            )}

            {emailSubmitted && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700 text-sm flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  5 more downloads unlocked!
                </p>
              </div>
            )}

            <Button
              onClick={() => handleDownload(false)}
              disabled={isDownloading || (turnstileEnabled && !turnstileToken)}
              className="w-full mt-6"
              size="lg"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating PDF...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download Barcode Sheet PDF
                </>
              )}
            </Button>

            {downloadsRemaining !== null && (
              <p className="text-center text-sm text-gray-500 mt-3">
                {downloadsRemaining} free download{downloadsRemaining !== 1 ? "s" : ""} remaining today
              </p>
            )}

            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 text-center">
                Need unlimited downloads?{" "}
                <Link href="/signin" className="text-primary hover:underline font-medium">
                  Sign up free
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Right: Template Selection */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Choose a Template
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {TEMPLATE_LIST.map((tmpl) => (
              <button
                key={tmpl.id}
                onClick={() => handleTemplateSelect(tmpl.id)}
                className={`relative group rounded-lg overflow-hidden border-2 transition-all ${
                  selectedTemplateId === tmpl.id
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="aspect-[210/297] bg-gray-100 relative">
                  <Image
                    src={tmpl.thumbnail_url}
                    alt={tmpl.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 30vw, 150px"
                  />
                  {selectedTemplateId === tmpl.id && (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <div className="p-2 bg-white">
                  <p className="font-medium text-gray-900 text-xs truncate">
                    {tmpl.name}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Email Capture Modal */}
      <Dialog open={showEmailModal} onOpenChange={setShowEmailModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Daily Limit Reached
            </DialogTitle>
            <DialogDescription>
              You&apos;ve used your 5 free downloads for today. Enter your email to
              unlock 5 more downloads instantly.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEmailSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email-modal">Email address</Label>
                <Input
                  id="email-modal"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10"
                />
                {emailError && (
                  <p className="text-red-500 text-sm">{emailError}</p>
                )}
              </div>
              <p className="text-xs text-gray-500">
                We&apos;ll only use this to send you occasional product updates. No
                spam, unsubscribe anytime.
              </p>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEmailModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isDownloading}>
                {isDownloading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Unlock 5 More Downloads"
                )}
              </Button>
            </DialogFooter>
          </form>
          <div className="pt-4 border-t border-gray-100">
            <p className="text-sm text-center text-gray-500">
              Or{" "}
              <Link href="/signin" className="text-primary hover:underline font-medium">
                sign up for unlimited access
              </Link>
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
