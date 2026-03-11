import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { convertToMarkdown } from "../PdfToMarkdownClient";

/** Extract text items from PDF bytes using pdfjs-dist */
async function extractItems(pdfBytes: Uint8Array) {
  const pdf = await pdfjsLib.getDocument({ data: pdfBytes }).promise;
  const pages = [];

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
          // skip
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

  return { pages, pageCount: pdf.numPages };
}

describe("PDF to Markdown conversion", () => {
  it("converts a heading to markdown H1", async () => {
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.HelveticaBold);
    const bodyFont = await doc.embedFont(StandardFonts.Helvetica);
    const page = doc.addPage([600, 400]);

    // Large heading (24pt)
    page.drawText("Main Title", { x: 50, y: 350, size: 24, font });
    // Body text (12pt) — repeated so it's the most common size
    page.drawText("Body paragraph one.", { x: 50, y: 310, size: 12, font: bodyFont });
    page.drawText("Body paragraph two.", { x: 50, y: 290, size: 12, font: bodyFont });
    page.drawText("Body paragraph three.", { x: 50, y: 270, size: 12, font: bodyFont });

    const pdfBytes = await doc.save();
    const { pages } = await extractItems(pdfBytes);
    const md = convertToMarkdown(pages);

    expect(md).toContain("# Main Title");
  });

  it("converts H2 headings (medium font size)", async () => {
    const doc = await PDFDocument.create();
    const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);
    const bodyFont = await doc.embedFont(StandardFonts.Helvetica);
    const page = doc.addPage([600, 400]);

    page.drawText("Section Heading", { x: 50, y: 350, size: 18, font: boldFont });
    page.drawText("Body text line one.", { x: 50, y: 320, size: 12, font: bodyFont });
    page.drawText("Body text line two.", { x: 50, y: 300, size: 12, font: bodyFont });
    page.drawText("Body text line three.", { x: 50, y: 280, size: 12, font: bodyFont });

    const pdfBytes = await doc.save();
    const { pages } = await extractItems(pdfBytes);
    const md = convertToMarkdown(pages);

    expect(md).toContain("## Section Heading");
  });

  it("converts H3 headings (slightly larger font)", async () => {
    const doc = await PDFDocument.create();
    const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);
    const bodyFont = await doc.embedFont(StandardFonts.Helvetica);
    const page = doc.addPage([600, 400]);

    page.drawText("Sub Section", { x: 50, y: 350, size: 14, font: boldFont });
    page.drawText("Body one.", { x: 50, y: 320, size: 12, font: bodyFont });
    page.drawText("Body two.", { x: 50, y: 300, size: 12, font: bodyFont });
    page.drawText("Body three.", { x: 50, y: 280, size: 12, font: bodyFont });

    const pdfBytes = await doc.save();
    const { pages } = await extractItems(pdfBytes);
    const md = convertToMarkdown(pages);

    expect(md).toContain("### Sub Section");
  });

  it("detects bold text", async () => {
    const doc = await PDFDocument.create();
    const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);
    const bodyFont = await doc.embedFont(StandardFonts.Helvetica);
    const page = doc.addPage([600, 400]);

    page.drawText("Important Note:", { x: 50, y: 350, size: 12, font: boldFont });
    page.drawText("This is regular text one.", { x: 50, y: 330, size: 12, font: bodyFont });
    page.drawText("This is regular text two.", { x: 50, y: 310, size: 12, font: bodyFont });
    page.drawText("This is regular text three.", { x: 50, y: 290, size: 12, font: bodyFont });

    const pdfBytes = await doc.save();
    const { pages } = await extractItems(pdfBytes);
    const md = convertToMarkdown(pages);

    expect(md).toContain("**Important Note:**");
  });

  it("converts bullet list items", async () => {
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const page = doc.addPage([600, 400]);

    page.drawText("\u2022 First item", { x: 60, y: 350, size: 12, font });
    page.drawText("\u2022 Second item", { x: 60, y: 330, size: 12, font });
    page.drawText("\u2022 Third item", { x: 60, y: 310, size: 12, font });

    const pdfBytes = await doc.save();
    const { pages } = await extractItems(pdfBytes);
    const md = convertToMarkdown(pages);

    expect(md).toContain("- First item");
    expect(md).toContain("- Second item");
    expect(md).toContain("- Third item");
  });

  it("converts numbered list items", async () => {
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const page = doc.addPage([600, 400]);

    page.drawText("1. First step", { x: 60, y: 350, size: 12, font });
    page.drawText("2. Second step", { x: 60, y: 330, size: 12, font });
    page.drawText("3. Third step", { x: 60, y: 310, size: 12, font });

    const pdfBytes = await doc.save();
    const { pages } = await extractItems(pdfBytes);
    const md = convertToMarkdown(pages);

    expect(md).toContain("1. First step");
    expect(md).toContain("2. Second step");
    expect(md).toContain("3. Third step");
  });

  it("handles empty pages", async () => {
    const doc = await PDFDocument.create();
    doc.addPage([600, 400]);
    const pdfBytes = await doc.save();
    const { pages } = await extractItems(pdfBytes);
    const md = convertToMarkdown(pages);

    expect(md).toBe("");
  });

  it("separates multi-page content with horizontal rules", async () => {
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);

    const p1 = doc.addPage([600, 400]);
    p1.drawText("Page one content", { x: 50, y: 350, size: 12, font });

    const p2 = doc.addPage([600, 400]);
    p2.drawText("Page two content", { x: 50, y: 350, size: 12, font });

    const pdfBytes = await doc.save();
    const { pages } = await extractItems(pdfBytes);
    const md = convertToMarkdown(pages);

    expect(md).toContain("Page one content");
    expect(md).toContain("---");
    expect(md).toContain("Page two content");
  });

  it("preserves special characters", async () => {
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const page = doc.addPage([600, 400]);
    page.drawText("Price: $99.99 | Discount: 20%", { x: 50, y: 350, size: 12, font });

    const pdfBytes = await doc.save();
    const { pages } = await extractItems(pdfBytes);
    const md = convertToMarkdown(pages);

    expect(md).toContain("$99.99");
    expect(md).toContain("20%");
  });

  it("converts the physical sample-document.pdf fixture", async () => {
    const fixturePath = join(__dirname, "fixtures", "sample-document.pdf");
    const pdfBytes = new Uint8Array(readFileSync(fixturePath));
    const { pages, pageCount } = await extractItems(pdfBytes);
    const md = convertToMarkdown(pages);

    expect(pageCount).toBe(2);

    // Page 1 — H1 title
    expect(md).toContain("# Getting Started with ParseDocu");

    // Page 1 — H2 headings
    expect(md).toContain("## Installation");
    expect(md).toContain("## Quick Start Steps");

    // Page 1 — H3 heading
    expect(md).toContain("### Requirements");

    // Page 1 — bullet list items
    expect(md).toContain("- Node.js 18 or later");
    expect(md).toContain("- A ParseDocu API key");

    // Page 1 — numbered list
    expect(md).toContain("1. Create an account at parsedocu.com");
    expect(md).toContain("5. Upload your first PDF document");

    // Page 1 — body text
    expect(md).toContain("ParseDocu is a powerful API");

    // Page 2 — headings
    expect(md).toContain("# API Reference");
    expect(md).toContain("## Endpoints");

    // Page 2 — dash list
    expect(md).toContain("- POST /v1/convert");

    // Page separator
    expect(md).toContain("---");
  });
});
