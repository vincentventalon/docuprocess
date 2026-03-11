import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { PDFDocument, StandardFonts } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

/** Helper: create a PDF with the given text on one page */
async function createPdfWithText(text: string): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const page = doc.addPage([600, 400]);
  page.drawText(text, { x: 50, y: 350, size: 12, font });
  return doc.save();
}

/** Helper: create a multi-page PDF */
async function createMultiPagePdf(
  pages: string[]
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  for (const text of pages) {
    const page = doc.addPage([600, 400]);
    page.drawText(text, { x: 50, y: 350, size: 12, font });
  }
  return doc.save();
}

/** Extract text from PDF bytes using pdfjs-dist (same lib as the tool) */
async function extractText(pdfBytes: Uint8Array): Promise<{
  text: string;
  pageCount: number;
  wordCount: number;
}> {
  const pdf = await pdfjsLib.getDocument({ data: pdfBytes }).promise;
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
  return {
    text: fullText,
    pageCount: pdf.numPages,
    wordCount: fullText.split(/\s+/).filter(Boolean).length,
  };
}

describe("PDF to Text extraction", () => {
  it("extracts text from a simple single-page PDF", async () => {
    const pdfBytes = await createPdfWithText("Hello World");
    const result = await extractText(pdfBytes);

    expect(result.text).toContain("Hello World");
    expect(result.pageCount).toBe(1);
    expect(result.wordCount).toBeGreaterThanOrEqual(2);
  });

  it("extracts text from a multi-page PDF", async () => {
    const pdfBytes = await createMultiPagePdf([
      "Page one content",
      "Page two content",
      "Page three content",
    ]);
    const result = await extractText(pdfBytes);

    expect(result.pageCount).toBe(3);
    expect(result.text).toContain("Page one content");
    expect(result.text).toContain("Page two content");
    expect(result.text).toContain("Page three content");
  });

  it("handles a PDF with no text (empty page)", async () => {
    const doc = await PDFDocument.create();
    doc.addPage([600, 400]); // blank page
    const pdfBytes = await doc.save();
    const result = await extractText(pdfBytes);

    expect(result.pageCount).toBe(1);
    expect(result.text.trim()).toBe("");
    expect(result.wordCount).toBe(0);
  });

  it("preserves special characters", async () => {
    const pdfBytes = await createPdfWithText(
      "Price: $99.99 | Discount: 20%"
    );
    const result = await extractText(pdfBytes);

    expect(result.text).toContain("$99.99");
    expect(result.text).toContain("20%");
  });

  it("extracts text from physical sample-invoice.pdf fixture", async () => {
    const fixturePath = join(__dirname, "fixtures", "sample-invoice.pdf");
    const pdfBytes = new Uint8Array(readFileSync(fixturePath));
    const result = await extractText(pdfBytes);

    // Page count
    expect(result.pageCount).toBe(2);

    // Page 1 — invoice header
    expect(result.text).toContain("INVOICE");
    expect(result.text).toContain("INV-2026-0042");
    expect(result.text).toContain("March 11, 2026");

    // Page 1 — sender / recipient
    expect(result.text).toContain("ParseDocu Inc.");
    expect(result.text).toContain("Acme Corporation");
    expect(result.text).toContain("billing@parsedocu.com");

    // Page 1 — line items & amounts
    expect(result.text).toContain("API Pro Plan - Monthly");
    expect(result.text).toContain("Extra credits (10,000)");
    expect(result.text).toContain("$39.00");
    expect(result.text).toContain("$221.33");
    expect(result.text).toContain("8.5%");

    // Page 2 — terms & conditions
    expect(result.text).toContain("Terms & Conditions");
    expect(result.text).toContain("Payment is due within 30 days");
    expect(result.text).toContain("1.5% per month");
    expect(result.text).toContain("Thank you for your business!");
  });

  it("handles multi-line text content", async () => {
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const page = doc.addPage([600, 400]);
    const lines = [
      "Lorem ipsum dolor sit amet",
      "consectetur adipiscing elit",
      "Sed do eiusmod tempor",
      "ut labore et dolore magna aliqua",
    ];
    lines.forEach((line, i) => {
      page.drawText(line, { x: 50, y: 350 - i * 20, size: 12, font });
    });
    const pdfBytes = await doc.save();
    const result = await extractText(pdfBytes);

    expect(result.text).toContain("Lorem ipsum");
    expect(result.text).toContain("magna aliqua");
    expect(result.wordCount).toBeGreaterThanOrEqual(15);
  });
});
