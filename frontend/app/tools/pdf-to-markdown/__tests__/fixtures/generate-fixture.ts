/**
 * Run with: npx tsx app/tools/pdf-to-markdown/__tests__/fixtures/generate-fixture.ts
 *
 * Generates sample-document.pdf — a multi-page document with headings,
 * lists, bold text, and body paragraphs for testing Markdown conversion.
 */
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { writeFileSync } from "fs";
import { join } from "path";

async function main() {
  const doc = await PDFDocument.create();
  const helvetica = await doc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await doc.embedFont(StandardFonts.HelveticaBold);

  // --- Page 1: Title, headings, body text, lists ---
  const p1 = doc.addPage([595, 842]); // A4
  let y = 790;

  // H1 — large title
  p1.drawText("Getting Started with ParseDocu", {
    x: 50, y, size: 26, font: helveticaBold, color: rgb(0.1, 0.1, 0.1),
  });
  y -= 40;

  // Body paragraph
  p1.drawText("ParseDocu is a powerful API for converting PDF documents into structured", {
    x: 50, y, size: 11, font: helvetica,
  });
  y -= 16;
  p1.drawText("data formats like Markdown, JSON, and CSV. This guide covers the basics.", {
    x: 50, y, size: 11, font: helvetica,
  });
  y -= 35;

  // H2 — section heading
  p1.drawText("Installation", {
    x: 50, y, size: 18, font: helveticaBold, color: rgb(0.15, 0.15, 0.15),
  });
  y -= 28;

  // Body text
  p1.drawText("Install the SDK using your preferred package manager:", {
    x: 50, y, size: 11, font: helvetica,
  });
  y -= 30;

  // H3 — sub-section
  p1.drawText("Requirements", {
    x: 50, y, size: 14, font: helveticaBold, color: rgb(0.2, 0.2, 0.2),
  });
  y -= 22;

  // Bullet list
  const bullets = [
    "\u2022 Node.js 18 or later",
    "\u2022 A ParseDocu API key",
    "\u2022 At least 512 MB of RAM",
  ];
  for (const bullet of bullets) {
    p1.drawText(bullet, { x: 60, y, size: 11, font: helvetica });
    y -= 18;
  }
  y -= 15;

  // Bold label
  p1.drawText("Important:", {
    x: 50, y, size: 11, font: helveticaBold,
  });
  y -= 18;
  p1.drawText("Make sure your API key has the correct permissions before proceeding.", {
    x: 50, y, size: 11, font: helvetica,
  });
  y -= 35;

  // Numbered list section
  p1.drawText("Quick Start Steps", {
    x: 50, y, size: 18, font: helveticaBold, color: rgb(0.15, 0.15, 0.15),
  });
  y -= 28;

  const steps = [
    "1. Create an account at parsedocu.com",
    "2. Generate an API key from the dashboard",
    "3. Install the SDK with npm install parsedocu",
    "4. Initialize the client with your API key",
    "5. Upload your first PDF document",
  ];
  for (const step of steps) {
    p1.drawText(step, { x: 60, y, size: 11, font: helvetica });
    y -= 18;
  }

  // --- Page 2: More content ---
  const p2 = doc.addPage([595, 842]);
  let y2 = 790;

  p2.drawText("API Reference", {
    x: 50, y: y2, size: 22, font: helveticaBold, color: rgb(0.1, 0.1, 0.1),
  });
  y2 -= 35;

  p2.drawText("Endpoints", {
    x: 50, y: y2, size: 18, font: helveticaBold, color: rgb(0.15, 0.15, 0.15),
  });
  y2 -= 25;

  p2.drawText("The API provides the following endpoints for document processing:", {
    x: 50, y: y2, size: 11, font: helvetica,
  });
  y2 -= 28;

  // Dash list
  const endpoints = [
    "- POST /v1/convert — Convert a document to the target format",
    "- GET /v1/status/:id — Check conversion status",
    "- GET /v1/result/:id — Download the conversion result",
  ];
  for (const ep of endpoints) {
    p2.drawText(ep, { x: 60, y: y2, size: 11, font: helvetica });
    y2 -= 18;
  }

  y2 -= 20;
  p2.drawText("Rate Limits", {
    x: 50, y: y2, size: 14, font: helveticaBold, color: rgb(0.2, 0.2, 0.2),
  });
  y2 -= 22;

  p2.drawText("Free tier: 100 requests per day. Pro tier: 10,000 requests per day.", {
    x: 50, y: y2, size: 11, font: helvetica,
  });
  y2 -= 16;
  p2.drawText("Enterprise tier: unlimited requests with dedicated infrastructure.", {
    x: 50, y: y2, size: 11, font: helvetica,
  });

  // Set PDF metadata
  doc.setTitle("Getting Started with ParseDocu");
  doc.setAuthor("ParseDocu Inc.");
  doc.setSubject("SDK documentation and API reference");
  doc.setCreationDate(new Date("2026-03-11T00:00:00Z"));

  const bytes = await doc.save();
  const outPath = join(__dirname, "sample-document.pdf");
  writeFileSync(outPath, bytes);
  console.log(`Generated: ${outPath} (${bytes.length} bytes)`);
}

main().catch(console.error);
