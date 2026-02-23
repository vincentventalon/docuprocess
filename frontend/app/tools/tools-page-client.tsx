"use client";

import { useCallback, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

type Mode = "html-file" | "html-code";

const pageSizes = [
  "Letter",
  "A4",
  "A3",
  "A2",
  "A1",
  "A0",
  "A5",
  "Legal",
  "Tabloid",
  "Executive",
  "Statement",
];
const orientations = ["Portrait", "Landscape"];

const ToolsPageClient = () => {
  const [mode, setMode] = useState<Mode>("html-code");
  const [htmlInput, setHtmlInput] = useState<string>("<h1>Hello PDF</h1><p>Made in the browser.</p>");
  const [htmlFileName, setHtmlFileName] = useState<string>("");
  const [htmlFileContent, setHtmlFileContent] = useState<string>("");
  const [pageSize, setPageSize] = useState<string>("Letter");
  const [orientation, setOrientation] = useState<string>("Portrait");
  const [margin, setMargin] = useState<string>("12");
  const [usePrintStylesheet, setUsePrintStylesheet] = useState<boolean>(false);
  const [status, setStatus] = useState<string>("");
  const [hasPrefilled, setHasPrefilled] = useState<boolean>(false);

  const iframeHolderRef = useRef<HTMLDivElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const cleanupIframe = useCallback(() => {
    if (iframeRef.current && iframeHolderRef.current?.contains(iframeRef.current)) {
      iframeHolderRef.current.removeChild(iframeRef.current);
    }
    iframeRef.current = null;
  }, []);

  const pageCss = useMemo(() => {
    const marginValue = Number.isFinite(Number(margin)) ? `${margin}mm` : "12mm";
    return `
      <style>
        @page {
          size: ${pageSize} ${orientation.toLowerCase()};
          margin: ${marginValue};
        }
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          font-family: "Inter", system-ui, -apple-system, sans-serif;
        }
      </style>
    `;
  }, [margin, orientation, pageSize]);

  const buildDocFromHtml = useCallback(
    (html: string, baseHref?: string) => {
      const printCSS = usePrintStylesheet
        ? `<style media="print">body { color: #2c2c2c; }</style>`
        : "";
      const baseTag = baseHref ? `<base href="${baseHref}">` : "";
      return `<!doctype html><html><head>${baseTag}${pageCss}${printCSS}</head><body>${html}</body></html>`;
    },
    [pageCss, usePrintStylesheet]
  );

  const openPrintForHtml = useCallback(
    (html: string, baseHref?: string) => {
      cleanupIframe();
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      iframe.referrerPolicy = "no-referrer";
      iframe.srcdoc = buildDocFromHtml(html, baseHref);
      iframe.onload = () => {
        setStatus("Print dialog opened. Use 'Save as PDF'.");
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      };
      iframeHolderRef.current?.appendChild(iframe);
      iframeRef.current = iframe;
    },
    [buildDocFromHtml, cleanupIframe]
  );

  const onFileChange = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setHtmlFileName("");
      setHtmlFileContent("");
      return;
    }
    const text = await file.text();
    setHtmlFileName(file.name);
    setHtmlFileContent(text);
    setStatus(`Loaded ${file.name}. Ready to convert.`);
  }, []);

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setStatus("");

      if (mode === "html-file") {
        if (!htmlFileContent.trim()) {
          setStatus("Upload an HTML file first.");
          return;
        }
        openPrintForHtml(htmlFileContent);
        return;
      }

      if (!htmlInput.trim()) {
        setStatus("Paste some HTML to convert.");
        return;
      }
      openPrintForHtml(htmlInput);
    },
    [htmlFileContent, htmlInput, mode, openPrintForHtml]
  );

  const handlePrefill = useCallback(() => {
    setHtmlInput(
      `<html>
  <head><style>body{font-family:Inter,Arial,sans-serif;margin:24px;}h1{color:#16a34a;}table{width:100%;border-collapse:collapse;}td,th{border:1px solid #e5e7eb;padding:8px;text-align:left;}</style></head>
  <body>
    <h1>Order summary</h1>
    <p>Customer: Jane Doe</p>
    <table>
      <thead><tr><th>Item</th><th>Qty</th><th>Price</th></tr></thead>
      <tbody>
        <tr><td>T-shirt</td><td>2</td><td>$24</td></tr>
        <tr><td>Shipping</td><td>1</td><td>$5</td></tr>
      </tbody>
    </table>
    <p style="margin-top:12px;"><strong>Total:</strong> $53</p>
  </body>
</html>`
    );
    setHasPrefilled(true);
    setStatus("Sample HTML loaded. Click Convert to PDF.");
  }, []);

  return (
    <main className="bg-gradient-to-b from-muted via-background to-muted text-foreground min-h-screen">
      <section className="max-w-5xl mx-auto px-6 pt-14 pb-10">
        <Card className="backdrop-blur bg-white/80 text-center">
          <CardContent className="space-y-4 pt-6">
            <Badge variant="secondary" className="text-xs font-semibold uppercase tracking-[0.18em]">
              Free browser tools
            </Badge>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
              Convert HTML to PDF online instantly
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Paste HTML or upload an HTML file. Minimal options just like the classic
              converter: page size, orientation, margin, and print stylesheet toggle.
            </p>
            <div className="flex flex-col md:flex-row md:items-center md:justify-center gap-3 text-sm text-muted-foreground">
              <span>Opens your browser print dialog</span>
              <span className="hidden md:inline">•</span>
              <span>Best for quick checks before using the API</span>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-8">
        <Card>
          <CardContent className="space-y-6 pt-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={mode === "html-file" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMode("html-file")}
                  type="button"
                >
                  HTML File to PDF
                </Button>
                <Button
                  variant={mode === "html-code" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMode("html-code")}
                  type="button"
                >
                  HTML Code to PDF
                </Button>
              </div>
              <Link href="/dashboard" className="text-sm text-primary hover:underline">
                Need API access? Go to dashboard →
              </Link>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {mode === "html-code" && (
                <div className="space-y-3">
                  <Label className="font-semibold text-lg">Paste HTML code</Label>
                  <Textarea
                    className="w-full min-h-48 font-mono text-sm"
                    value={htmlInput}
                    onChange={(e) => setHtmlInput(e.target.value)}
                    placeholder="<html>...</html>"
                  />
                  <div className="flex flex-wrap gap-2 items-center text-xs text-muted-foreground">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handlePrefill}
                      disabled={hasPrefilled}
                    >
                      Load sample HTML
                    </Button>
                    <span>Use the sample to see a styled invoice in PDF.</span>
                  </div>
                </div>
              )}

              {mode === "html-file" && (
                <div className="space-y-3">
                  <Label className="font-semibold text-lg">Upload HTML file</Label>
                  <Input
                    type="file"
                    accept=".html,.htm,text/html"
                    className="w-full"
                    onChange={onFileChange}
                  />
                  {htmlFileName && (
                    <div className="text-sm text-muted-foreground">
                      Loaded: <strong>{htmlFileName}</strong>
                    </div>
                  )}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-semibold text-sm">Page size</Label>
                  <Select value={pageSize} onValueChange={setPageSize}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select page size" />
                    </SelectTrigger>
                    <SelectContent>
                      {pageSizes.map((size) => (
                        <SelectItem key={size} value={size}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold text-sm">Page orientation</Label>
                  <Select value={orientation} onValueChange={setOrientation}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select orientation" />
                    </SelectTrigger>
                    <SelectContent>
                      {orientations.map((value) => (
                        <SelectItem key={value} value={value}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-semibold text-sm">Margin (mm)</Label>
                  <Input
                    type="number"
                    className="w-full"
                    value={margin}
                    onChange={(e) => setMargin(e.target.value)}
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold text-sm">Options</Label>
                  <div className="flex items-center gap-2 pt-2">
                    <Checkbox
                      id="print-stylesheet"
                      checked={usePrintStylesheet}
                      onCheckedChange={(checked) => setUsePrintStylesheet(checked === true)}
                    />
                    <Label htmlFor="print-stylesheet" className="text-sm font-normal cursor-pointer">
                      Use print stylesheet
                    </Label>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 items-center">
                <Button type="submit">
                  Convert to PDF
                </Button>
                {status && <div className="text-sm text-muted-foreground">{status}</div>}
              </div>
            </form>
          </CardContent>
        </Card>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-16 grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="space-y-2 pt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">HTML code</p>
            <h3 className="font-semibold">Test templates fast</h3>
            <p className="text-sm text-muted-foreground">
              Paste raw HTML with inline CSS. Perfect for quick previews before you store templates in
              your API workflow.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-2 pt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">HTML file</p>
            <h3 className="font-semibold">Upload and print</h3>
            <p className="text-sm text-muted-foreground">
              Drag an .html file, keep your existing styles, and export to PDF with only the essentials
              (size, orientation, margin).
            </p>
          </CardContent>
        </Card>
      </section>
      <div
        ref={iframeHolderRef}
        aria-hidden
        style={{ position: "fixed", width: 0, height: 0, overflow: "hidden", opacity: 0 }}
      />
    </main>
  );
};

export default ToolsPageClient;
