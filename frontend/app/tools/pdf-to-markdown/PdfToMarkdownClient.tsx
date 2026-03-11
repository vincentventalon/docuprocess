"use client";

import React, { useState, useCallback, useRef } from "react";
import { Upload, Copy, Download, FileText, X, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import config from "@/config";

type ExtractionState = "idle" | "loading" | "done" | "error";

interface TextItem {
  str: string;
  transform: number[];
  fontName: string;
  hasEOL: boolean;
  isBold: boolean;
}

interface TextLine {
  y: number;
  fontSize: number;
  isBold: boolean;
  text: string;
}

/**
 * Group text items into lines based on Y-coordinate proximity,
 * then convert to Markdown using font-size heuristics for headings.
 */
export function convertToMarkdown(pages: TextItem[][]): string {
  const markdownPages: string[] = [];

  for (const pageItems of pages) {
    if (pageItems.length === 0) {
      markdownPages.push("");
      continue;
    }

    // Group items into lines by Y coordinate (items within 2px are same line)
    const lines: TextLine[] = [];
    let currentLine: TextLine | null = null;

    for (const item of pageItems) {
      const y = Math.round(item.transform[5]);
      const fontSize = Math.round(item.transform[0] || item.transform[3]);
      const isBold = item.isBold;

      if (!currentLine || Math.abs(currentLine.y - y) > 2) {
        if (currentLine) lines.push(currentLine);
        currentLine = { y, fontSize, isBold, text: item.str };
      } else {
        // Same line — append with space if needed
        if (item.str && currentLine.text && !currentLine.text.endsWith(" ")) {
          currentLine.text += " ";
        }
        currentLine.text += item.str;
        // Use the largest font size on the line
        if (fontSize > currentLine.fontSize) {
          currentLine.fontSize = fontSize;
          currentLine.isBold = isBold;
        }
      }
    }
    if (currentLine) lines.push(currentLine);

    // Determine the body font size (most common)
    const fontSizeCounts = new Map<number, number>();
    for (const line of lines) {
      if (line.text.trim()) {
        fontSizeCounts.set(line.fontSize, (fontSizeCounts.get(line.fontSize) || 0) + 1);
      }
    }
    let bodyFontSize = 12;
    let maxCount = 0;
    for (const [size, count] of fontSizeCounts) {
      if (count > maxCount) {
        maxCount = count;
        bodyFontSize = size;
      }
    }

    // Convert lines to markdown
    const mdLines: string[] = [];
    for (const line of lines) {
      const trimmed = line.text.trim();
      if (!trimmed) {
        mdLines.push("");
        continue;
      }

      // Heading detection: significantly larger than body text
      const sizeRatio = line.fontSize / bodyFontSize;
      if (sizeRatio >= 1.8) {
        mdLines.push(`# ${trimmed}`);
      } else if (sizeRatio >= 1.4) {
        mdLines.push(`## ${trimmed}`);
      } else if (sizeRatio >= 1.15) {
        mdLines.push(`### ${trimmed}`);
      } else if (line.isBold && trimmed.length < 100) {
        // Bold short lines that aren't headings by size — treat as bold text
        mdLines.push(`**${trimmed}**`);
      } else {
        // Check for list patterns
        const bulletMatch = trimmed.match(/^[\u2022\u2023\u25E6\u2043\u2219]\s*(.+)/);
        const dashListMatch = trimmed.match(/^[-\u2013\u2014]\s+(.+)/);
        const numberedMatch = trimmed.match(/^(\d+)[.)]\s+(.+)/);

        if (bulletMatch) {
          mdLines.push(`- ${bulletMatch[1]}`);
        } else if (dashListMatch) {
          mdLines.push(`- ${dashListMatch[1]}`);
        } else if (numberedMatch) {
          mdLines.push(`${numberedMatch[1]}. ${numberedMatch[2]}`);
        } else {
          mdLines.push(trimmed);
        }
      }
    }

    // Clean up: collapse 3+ blank lines into 2
    const cleaned = mdLines.join("\n").replace(/\n{3,}/g, "\n\n");
    markdownPages.push(cleaned);
  }

  return markdownPages.join("\n\n---\n\n").trim();
}

export default function PdfToMarkdownClient() {
  const [markdown, setMarkdown] = useState("");
  const [state, setState] = useState<ExtractionState>("idle");
  const [fileName, setFileName] = useState("");
  const [pageCount, setPageCount] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const extractMarkdown = useCallback(async (file: File) => {
    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file.");
      setState("error");
      return;
    }

    setState("loading");
    setError("");
    setFileName(file.name);

    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      setPageCount(pdf.numPages);

      const pages: TextItem[][] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);

        // getOperatorList() triggers font loading into commonObjs
        await page.getOperatorList();
        const content = await page.getTextContent();

        // Resolve bold font names through commonObjs
        const boldFontNames = new Set<string>();
        for (const item of content.items) {
          if ("str" in item && (item as any).fontName) {
            try {
              const fontObj = (page as any).commonObjs.get((item as any).fontName);
              if (fontObj?.name && /bold/i.test(fontObj.name)) {
                boldFontNames.add((item as any).fontName);
              }
            } catch {
              // Font not resolved, skip
            }
          }
        }

        pages.push(
          content.items
            .filter((item: any) => "str" in item)
            .map((item: any) => ({
              str: item.str,
              transform: item.transform,
              fontName: item.fontName || "",
              hasEOL: item.hasEOL || false,
              isBold: boldFontNames.has(item.fontName),
            }))
        );
      }

      const md = convertToMarkdown(pages);
      setMarkdown(md);
      setWordCount(md.split(/\s+/).filter(Boolean).length);
      setState("done");
    } catch (err) {
      console.error("PDF to Markdown error:", err);
      setError("Failed to convert this PDF. The file may be corrupted or password-protected.");
      setState("error");
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) extractMarkdown(file);
    },
    [extractMarkdown]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) extractMarkdown(file);
    },
    [extractMarkdown]
  );

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [markdown]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName.replace(/\.pdf$/i, "") + ".md";
    a.click();
    URL.revokeObjectURL(url);
  }, [markdown, fileName]);

  const handleReset = useCallback(() => {
    setMarkdown("");
    setState("idle");
    setFileName("");
    setPageCount(0);
    setWordCount(0);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Drop zone */}
      {state === "idle" || state === "error" ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 ${
            dragOver
              ? "border-primary bg-primary/5 scale-[1.01]"
              : "border-slate-300 hover:border-primary/50 hover:bg-slate-50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-lg">
                Drop your PDF here or click to browse
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                100% client-side. Your file never leaves your browser.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Loading state */}
      {state === "loading" && (
        <div className="border rounded-2xl p-12 text-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
          <p className="font-semibold">Converting {fileName} to Markdown...</p>
          <p className="text-sm text-muted-foreground mt-1">
            Processing entirely in your browser
          </p>
        </div>
      )}

      {/* Error state */}
      {state === "error" && error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Result */}
      {state === "done" && (
        <div className="space-y-4">
          {/* Stats bar */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <FileText className="w-4 h-4 text-primary" />
                {fileName}
              </div>
              <span className="text-xs text-muted-foreground">
                {pageCount} page{pageCount !== 1 ? "s" : ""} &middot; {wordCount.toLocaleString()} words
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? (
                  <Check className="w-4 h-4 mr-1.5" />
                ) : (
                  <Copy className="w-4 h-4 mr-1.5" />
                )}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-1.5" />
                Download .md
              </Button>
              <Button variant="ghost" size="sm" onClick={handleReset}>
                <X className="w-4 h-4 mr-1.5" />
                New file
              </Button>
            </div>
          </div>

          {/* Markdown output */}
          <div className="border rounded-xl bg-slate-50 p-6 max-h-[600px] overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm leading-relaxed font-mono text-slate-800">
              {markdown}
            </pre>
          </div>

          {/* Upsell */}
          <div className="border rounded-xl p-4 bg-primary/5 flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="font-medium text-sm">Need to convert PDFs at scale?</p>
              <p className="text-xs text-muted-foreground">
                Use the {config.appName} API to convert thousands of PDFs to Markdown programmatically.
              </p>
            </div>
            <Button asChild size="sm">
              <Link href="/pricing">View API plans</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
