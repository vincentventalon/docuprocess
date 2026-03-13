import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { PDFDocument, StandardFonts } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { convertToJson } from "../PdfToJsonClient";

interface TextItem {
  str: string;
  transform: number[];
  fontName: string;
  hasEOL: boolean;
}

/** Helper: extract pages from PDF bytes in the format convertToJson expects */
async function extractPages(pdfBytes: Uint8Array): Promise<{
  pages: { items: TextItem[]; width: number; height: number }[];
  metadata: Record<string, any>;
}> {
  const pdf = await pdfjsLib.getDocument({ data: pdfBytes }).promise;
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

  return {
    pages,
    metadata: {
      title: pdfInfo?.Title || null,
      author: pdfInfo?.Author || null,
      subject: pdfInfo?.Subject || null,
      creator: pdfInfo?.Creator || null,
      producer: pdfInfo?.Producer || null,
      creationDate: pdfInfo?.CreationDate || null,
      modificationDate: pdfInfo?.ModDate || null,
    },
  };
}

/** Helper: create a PDF with the given text on one page */
async function createPdfWithText(text: string): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const page = doc.addPage([600, 400]);
  page.drawText(text, { x: 50, y: 350, size: 12, font });
  return doc.save();
}

describe("PDF to JSON conversion", () => {
  it("converts a single-page PDF to structured JSON", async () => {
    const pdfBytes = await createPdfWithText("Hello World");
    const { pages, metadata } = await extractPages(pdfBytes);
    const result = convertToJson(pages, { fileName: "test.pdf", ...metadata });

    expect(result.metadata.fileName).toBe("test.pdf");
    expect(result.metadata.pageCount).toBe(1);
    expect(result.metadata.wordCount).toBeGreaterThanOrEqual(2);
    expect(result.pages).toHaveLength(1);
    expect(result.pages[0].pageNumber).toBe(1);
    expect(result.pages[0].width).toBe(600);
    expect(result.pages[0].height).toBe(400);
    expect(result.pages[0].text).toContain("Hello World");
    expect(result.pages[0].lines.length).toBeGreaterThanOrEqual(1);
  });

  it("converts a multi-page PDF", async () => {
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    for (const text of ["Page one", "Page two", "Page three"]) {
      const page = doc.addPage([600, 400]);
      page.drawText(text, { x: 50, y: 350, size: 12, font });
    }
    const pdfBytes = await doc.save();
    const { pages, metadata } = await extractPages(pdfBytes);
    const result = convertToJson(pages, { fileName: "multi.pdf", ...metadata });

    expect(result.metadata.pageCount).toBe(3);
    expect(result.pages[0].text).toContain("Page one");
    expect(result.pages[1].text).toContain("Page two");
    expect(result.pages[2].text).toContain("Page three");
    expect(result.pages[0].pageNumber).toBe(1);
    expect(result.pages[2].pageNumber).toBe(3);
  });

  it("handles an empty page", async () => {
    const doc = await PDFDocument.create();
    doc.addPage([600, 400]);
    const pdfBytes = await doc.save();
    const { pages, metadata } = await extractPages(pdfBytes);
    const result = convertToJson(pages, { fileName: "empty.pdf", ...metadata });

    expect(result.metadata.pageCount).toBe(1);
    expect(result.metadata.wordCount).toBe(0);
    expect(result.pages[0].lines).toHaveLength(0);
  });

  it("includes line coordinates", async () => {
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const page = doc.addPage([600, 400]);
    page.drawText("Line one", { x: 50, y: 350, size: 12, font });
    page.drawText("Line two", { x: 50, y: 330, size: 12, font });
    const pdfBytes = await doc.save();
    const { pages, metadata } = await extractPages(pdfBytes);
    const result = convertToJson(pages, { fileName: "coords.pdf", ...metadata });

    expect(result.pages[0].lines.length).toBeGreaterThanOrEqual(2);
    const line1 = result.pages[0].lines.find((l) => l.text.includes("Line one"));
    const line2 = result.pages[0].lines.find((l) => l.text.includes("Line two"));
    expect(line1).toBeDefined();
    expect(line2).toBeDefined();
    // Line one should have a higher Y than line two (PDF coords: bottom-up)
    expect(line1!.y).toBeGreaterThan(line2!.y);
  });

  it("preserves PDF metadata", async () => {
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const page = doc.addPage([600, 400]);
    page.drawText("With metadata", { x: 50, y: 350, size: 12, font });
    doc.setTitle("Test Document");
    doc.setAuthor("Test Author");
    doc.setSubject("Test Subject");
    const pdfBytes = await doc.save();
    const { pages, metadata } = await extractPages(pdfBytes);
    const result = convertToJson(pages, { fileName: "meta.pdf", ...metadata });

    expect(result.metadata.title).toBe("Test Document");
    expect(result.metadata.author).toBe("Test Author");
    expect(result.metadata.subject).toBe("Test Subject");
  });

  it("outputs valid JSON when stringified", async () => {
    const pdfBytes = await createPdfWithText("JSON test: special chars $99 & <tag>");
    const { pages, metadata } = await extractPages(pdfBytes);
    const result = convertToJson(pages, { fileName: "special.pdf", ...metadata });

    const jsonString = JSON.stringify(result, null, 2);
    const parsed = JSON.parse(jsonString);
    expect(parsed.metadata.fileName).toBe("special.pdf");
    expect(parsed.pages[0].text).toContain("$99");
  });

  it("extracts from physical sample-invoice.pdf fixture", async () => {
    const fixturePath = join(__dirname, "fixtures", "sample-invoice.pdf");
    const pdfBytes = new Uint8Array(readFileSync(fixturePath));
    const { pages, metadata } = await extractPages(pdfBytes);
    const result = convertToJson(pages, { fileName: "sample-invoice.pdf", ...metadata });

    expect(result.metadata.pageCount).toBe(2);
    expect(result.metadata.title).toBe("Invoice INV-2026-0042");
    expect(result.metadata.author).toBe("ParseDocu Inc.");
    expect(result.pages[0].text).toContain("INVOICE");
    expect(result.pages[0].text).toContain("INV-2026-0042");
    expect(result.pages[0].text).toContain("$221.33");
    expect(result.pages[1].text).toContain("Terms & Conditions");
    expect(result.pages[0].lines.length).toBeGreaterThan(5);
  });
});
