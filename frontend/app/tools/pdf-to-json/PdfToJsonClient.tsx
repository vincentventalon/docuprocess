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
}

interface JsonLine {
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontName: string;
}

interface JsonPage {
  pageNumber: number;
  width: number;
  height: number;
  text: string;
  lines: JsonLine[];
}

export interface PdfJsonOutput {
  metadata: {
    fileName: string;
    pageCount: number;
    wordCount: number;
    title: string | null;
    author: string | null;
    subject: string | null;
    creator: string | null;
    producer: string | null;
    creationDate: string | null;
    modificationDate: string | null;
  };
  pages: JsonPage[];
}

/**
 * Group raw text items into lines by Y-coordinate proximity,
 * then build a structured JSON representation of the PDF.
 */
export function convertToJson(
  pages: { items: TextItem[]; width: number; height: number }[],
  metadata: Partial<PdfJsonOutput["metadata"]>
): PdfJsonOutput {
  const jsonPages: JsonPage[] = [];
  let totalWords = 0;

  for (let pageIdx = 0; pageIdx < pages.length; pageIdx++) {
    const { items, width, height } = pages[pageIdx];

    // Group items into lines by Y coordinate (items within 2px are same line)
    const lines: { x: number; y: number; fontSize: number; fontName: string; text: string }[] = [];
    let currentLine: (typeof lines)[0] | null = null;

    for (const item of items) {
      const x = Math.round(item.transform[4]);
      const y = Math.round(item.transform[5]);
      const fontSize = Math.round(item.transform[0] || item.transform[3]);

      if (!currentLine || Math.abs(currentLine.y - y) > 2) {
        if (currentLine) lines.push(currentLine);
        currentLine = { x, y, fontSize, fontName: item.fontName, text: item.str };
      } else {
        if (item.str && currentLine.text && !currentLine.text.endsWith(" ")) {
          currentLine.text += " ";
        }
        currentLine.text += item.str;
        if (fontSize > currentLine.fontSize) {
          currentLine.fontSize = fontSize;
          currentLine.fontName = item.fontName;
        }
      }
    }
    if (currentLine) lines.push(currentLine);

    const pageText = lines.map((l) => l.text).join("\n");
    totalWords += pageText.split(/\s+/).filter(Boolean).length;

    jsonPages.push({
      pageNumber: pageIdx + 1,
      width: Math.round(width),
      height: Math.round(height),
      text: pageText,
      lines: lines
        .filter((l) => l.text.trim())
        .map((l) => ({
          text: l.text,
          x: l.x,
          y: l.y,
          fontSize: l.fontSize,
          fontName: l.fontName,
        })),
    });
  }

  return {
    metadata: {
      fileName: metadata.fileName || "",
      pageCount: jsonPages.length,
      wordCount: totalWords,
      title: metadata.title || null,
      author: metadata.author || null,
      subject: metadata.subject || null,
      creator: metadata.creator || null,
      producer: metadata.producer || null,
      creationDate: metadata.creationDate || null,
      modificationDate: metadata.modificationDate || null,
    },
    pages: jsonPages,
  };
}

export default function PdfToJsonClient() {
  const [json, setJson] = useState("");
  const [state, setState] = useState<ExtractionState>("idle");
  const [fileName, setFileName] = useState("");
  const [pageCount, setPageCount] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const extractJson = useCallback(async (file: File) => {
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

      // Extract metadata
      const info = await pdf.getMetadata();
      const pdfInfo = info?.info as Record<string, any> | undefined;

      const pages: { items: TextItem[]; width: number; height: number }[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1 });
        const content = await page.getTextContent();

        pages.push({
          width: viewport.width,
          height: viewport.height,
          items: content.items
            .filter((item: any) => "str" in item)
            .map((item: any) => ({
              str: item.str,
              transform: item.transform,
              fontName: item.fontName || "",
              hasEOL: item.hasEOL || false,
            })),
        });
      }

      const result = convertToJson(pages, {
        fileName: file.name,
        title: pdfInfo?.Title || null,
        author: pdfInfo?.Author || null,
        subject: pdfInfo?.Subject || null,
        creator: pdfInfo?.Creator || null,
        producer: pdfInfo?.Producer || null,
        creationDate: pdfInfo?.CreationDate || null,
        modificationDate: pdfInfo?.ModDate || null,
      });

      const jsonString = JSON.stringify(result, null, 2);
      setJson(jsonString);
      setWordCount(result.metadata.wordCount);
      setState("done");
    } catch (err) {
      console.error("PDF to JSON error:", err);
      setError("Failed to extract JSON from this PDF. The file may be corrupted or password-protected.");
      setState("error");
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) extractJson(file);
    },
    [extractJson]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) extractJson(file);
    },
    [extractJson]
  );

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [json]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName.replace(/\.pdf$/i, "") + ".json";
    a.click();
    URL.revokeObjectURL(url);
  }, [json, fileName]);

  const handleReset = useCallback(() => {
    setJson("");
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
          <p className="font-semibold">Converting {fileName} to JSON...</p>
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
                Download .json
              </Button>
              <Button variant="ghost" size="sm" onClick={handleReset}>
                <X className="w-4 h-4 mr-1.5" />
                New file
              </Button>
            </div>
          </div>

          {/* JSON output */}
          <div className="border rounded-xl bg-slate-50 p-6 max-h-[600px] overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm leading-relaxed font-mono text-slate-800">
              {json}
            </pre>
          </div>

          {/* Upsell */}
          <div className="border rounded-xl p-4 bg-primary/5 flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="font-medium text-sm">Need to extract JSON at scale?</p>
              <p className="text-xs text-muted-foreground">
                Use the {config.appName} API to convert thousands of PDFs to structured JSON programmatically.
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
