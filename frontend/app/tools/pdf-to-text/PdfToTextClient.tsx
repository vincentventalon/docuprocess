"use client";

import React, { useState, useCallback, useRef } from "react";
import { Upload, Copy, Download, FileText, X, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import config from "@/config";

type ExtractionState = "idle" | "loading" | "done" | "error";

export default function PdfToTextClient() {
  const [text, setText] = useState("");
  const [state, setState] = useState<ExtractionState>("idle");
  const [fileName, setFileName] = useState("");
  const [pageCount, setPageCount] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const extractText = useCallback(async (file: File) => {
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

      const pages: string[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items
          .map((item: any) => item.str)
          .join(" ");
        pages.push(pageText);
      }

      const fullText = pages.join("\n\n");
      setText(fullText);
      setWordCount(fullText.split(/\s+/).filter(Boolean).length);
      setState("done");
    } catch (err) {
      console.error("PDF extraction error:", err);
      setError("Failed to extract text from this PDF. The file may be corrupted or password-protected.");
      setState("error");
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) extractText(file);
    },
    [extractText]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) extractText(file);
    },
    [extractText]
  );

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName.replace(/\.pdf$/i, "") + ".txt";
    a.click();
    URL.revokeObjectURL(url);
  }, [text, fileName]);

  const handleReset = useCallback(() => {
    setText("");
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
          <p className="font-semibold">Extracting text from {fileName}...</p>
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
                Download .txt
              </Button>
              <Button variant="ghost" size="sm" onClick={handleReset}>
                <X className="w-4 h-4 mr-1.5" />
                New file
              </Button>
            </div>
          </div>

          {/* Text output */}
          <div className="border rounded-xl bg-slate-50 p-6 max-h-[600px] overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm leading-relaxed font-mono text-slate-800">
              {text}
            </pre>
          </div>

          {/* Upsell */}
          <div className="border rounded-xl p-4 bg-primary/5 flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="font-medium text-sm">Need to extract text at scale?</p>
              <p className="text-xs text-muted-foreground">
                Use the {config.appName} API to process thousands of PDFs programmatically.
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
