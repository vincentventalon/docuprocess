"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExternalLink, Copy, Check } from "lucide-react";
import Link from "next/link";

type Template = {
  id: string;
  short_id: string;
  name: string;
  sample_data: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

type ZapierIntegrationProps = {
  templates: Template[];
  apiKey: string | null;
};

const ZAPIER_INVITE_URL = "https://zapier.com/developer/public-invite/235058/a299dc7567a3209dc36bdc3d4262d0f8/";

export function ZapierIntegration({ templates, apiKey }: ZapierIntegrationProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [copiedTemplateId, setCopiedTemplateId] = useState(false);
  const [copiedApiKey, setCopiedApiKey] = useState(false);

  const handleCopyApiKey = async () => {
    if (!apiKey) return;
    await navigator.clipboard.writeText(apiKey);
    setCopiedApiKey(true);
    setTimeout(() => setCopiedApiKey(false), 2000);
  };

  const selectedTemplate = templates.find(t => t.short_id === selectedTemplateId);

  const handleCopyPayload = async () => {
    if (!selectedTemplate?.sample_data) return;
    await navigator.clipboard.writeText(JSON.stringify(selectedTemplate.sample_data, null, 2));
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const handleCopyTemplateId = async () => {
    if (!selectedTemplateId) return;
    await navigator.clipboard.writeText(selectedTemplateId);
    setCopiedTemplateId(true);
    setTimeout(() => setCopiedTemplateId(false), 2000);
  };

  return (
    <div className="max-w-2xl">
      {/* Header with Zapier logo */}
      <div className="flex items-center gap-3 mb-8">
        <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
          <path d="M16 0C7.163 0 0 7.163 0 16s7.163 16 16 16 16-7.163 16-16S24.837 0 16 0z" fill="#FF4A00"/>
          <path d="M21.5 14.5h-4v-4a1.5 1.5 0 00-3 0v4h-4a1.5 1.5 0 000 3h4v4a1.5 1.5 0 003 0v-4h4a1.5 1.5 0 000-3z" fill="#fff"/>
        </svg>
        <h2 className="text-2xl font-bold">Zapier</h2>
      </div>

      {/* Steps */}
      <ol className="space-y-4 text-gray-700 mb-10">
        <li className="flex items-center gap-2 flex-wrap">
          <span className="text-gray-400">1.</span>
          <span>Get API Key</span>
          {apiKey ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyApiKey}
              className="h-7 text-xs"
            >
              {copiedApiKey ? (
                <><Check className="h-3 w-3 mr-1" /> Copied!</>
              ) : (
                <><Copy className="h-3 w-3 mr-1" /> Copy API Key</>
              )}
            </Button>
          ) : (
            <Link href="/dashboard/api" className="text-blue-600 hover:underline text-sm">
              Generate one →
            </Link>
          )}
        </li>
        <li className="flex items-center gap-2">
          <span className="text-gray-400">2.</span>
          <span>Add the PDF Template Fast app in Zapier</span>
          <a
            href={ZAPIER_INVITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline inline-flex items-center gap-1"
          >
            Accept Invite <ExternalLink className="h-3 w-3" />
          </a>
        </li>
        <li>
          <span className="text-gray-400">3.</span>
          <span> Use your API Key to connect</span>
        </li>
        <li>
          <span className="text-gray-400">4.</span>
          <span> Select a template (use Template ID below)</span>
        </li>
        <li>
          <span className="text-gray-400">5.</span>
          <span> Map your data to template variables</span>
        </li>
      </ol>

      {/* Template Quick Access */}
      <div className="border-t pt-8">
        <h3 className="font-semibold mb-4">Quick Access - Template ID & Payload</h3>

        {templates.length === 0 ? (
          <p className="text-gray-500">
            No templates yet.{" "}
            <Link href="/dashboard/templates/designer" className="text-blue-600 hover:underline">
              Create one
            </Link>
          </p>
        ) : (
          <div className="space-y-4">
            <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a template..." />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.short_id} value={template.short_id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedTemplate && (
              <div className="space-y-4 bg-gray-50 rounded-lg p-4">
                {/* Template ID */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-600">Template ID</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyTemplateId}
                      className="h-7 text-xs"
                    >
                      {copiedTemplateId ? (
                        <><Check className="h-3 w-3 mr-1" /> Copied</>
                      ) : (
                        <><Copy className="h-3 w-3 mr-1" /> Copy</>
                      )}
                    </Button>
                  </div>
                  <code className="block bg-white border rounded px-3 py-2 text-sm font-mono">
                    {selectedTemplateId}
                  </code>
                </div>

                {/* Payload */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-600">Sample Payload</span>
                    {selectedTemplate.sample_data && Object.keys(selectedTemplate.sample_data).length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopyPayload}
                        className="h-7 text-xs"
                      >
                        {copiedPayload ? (
                          <><Check className="h-3 w-3 mr-1" /> Copied</>
                        ) : (
                          <><Copy className="h-3 w-3 mr-1" /> Copy</>
                        )}
                      </Button>
                    )}
                  </div>
                  {selectedTemplate.sample_data && Object.keys(selectedTemplate.sample_data).length > 0 ? (
                    <pre className="bg-white border rounded p-3 text-xs font-mono overflow-auto max-h-48">
                      {JSON.stringify(selectedTemplate.sample_data, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-sm text-gray-500 bg-white border rounded px-3 py-2">
                      No sample data.{" "}
                      <Link
                        href={`/dashboard/templates/designer?template_id=${selectedTemplateId}`}
                        className="text-blue-600 hover:underline"
                      >
                        Edit template
                      </Link>
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
