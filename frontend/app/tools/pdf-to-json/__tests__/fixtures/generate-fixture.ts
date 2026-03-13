/**
 * Run with: npx tsx app/tools/pdf-to-json/__tests__/fixtures/generate-fixture.ts
 *
 * Generates sample-invoice.pdf — a realistic multi-page invoice PDF
 * used as a physical test fixture for the PDF-to-JSON tool.
 */
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { writeFileSync } from "fs";
import { join } from "path";

async function main() {
  const doc = await PDFDocument.create();
  const helvetica = await doc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await doc.embedFont(StandardFonts.HelveticaBold);

  // --- Page 1: Invoice header + line items ---
  const p1 = doc.addPage([595, 842]); // A4
  let y = 790;

  p1.drawText("INVOICE", { x: 50, y, size: 24, font: helveticaBold, color: rgb(0.2, 0.2, 0.2) });
  y -= 30;
  p1.drawText("Invoice #INV-2026-0042", { x: 50, y, size: 11, font: helvetica });
  y -= 16;
  p1.drawText("Date: March 11, 2026", { x: 50, y, size: 11, font: helvetica });
  y -= 16;
  p1.drawText("Due: April 10, 2026", { x: 50, y, size: 11, font: helvetica });

  y -= 40;
  p1.drawText("From:", { x: 50, y, size: 11, font: helveticaBold });
  y -= 16;
  p1.drawText("ParseDocu Inc.", { x: 50, y, size: 11, font: helvetica });
  y -= 14;
  p1.drawText("123 Tech Avenue, San Francisco, CA 94105", { x: 50, y, size: 11, font: helvetica });
  y -= 14;
  p1.drawText("billing@parsedocu.com", { x: 50, y, size: 11, font: helvetica });

  y -= 30;
  p1.drawText("To:", { x: 50, y, size: 11, font: helveticaBold });
  y -= 16;
  p1.drawText("Acme Corporation", { x: 50, y, size: 11, font: helvetica });
  y -= 14;
  p1.drawText("456 Business Blvd, New York, NY 10001", { x: 50, y, size: 11, font: helvetica });

  // Table header
  y -= 40;
  p1.drawText("Description", { x: 50, y, size: 10, font: helveticaBold });
  p1.drawText("Qty", { x: 320, y, size: 10, font: helveticaBold });
  p1.drawText("Unit Price", { x: 380, y, size: 10, font: helveticaBold });
  p1.drawText("Amount", { x: 480, y, size: 10, font: helveticaBold });

  y -= 4;
  p1.drawLine({ start: { x: 50, y }, end: { x: 545, y }, thickness: 0.5, color: rgb(0.7, 0.7, 0.7) });

  const items = [
    ["API Pro Plan - Monthly", "1", "$39.00", "$39.00"],
    ["Extra credits (10,000)", "3", "$15.00", "$45.00"],
    ["Priority support add-on", "1", "$19.99", "$19.99"],
    ["Custom template setup", "2", "$50.00", "$100.00"],
  ];

  for (const [desc, qty, unit, amount] of items) {
    y -= 20;
    p1.drawText(desc, { x: 50, y, size: 10, font: helvetica });
    p1.drawText(qty, { x: 330, y, size: 10, font: helvetica });
    p1.drawText(unit, { x: 380, y, size: 10, font: helvetica });
    p1.drawText(amount, { x: 480, y, size: 10, font: helvetica });
  }

  y -= 8;
  p1.drawLine({ start: { x: 350, y }, end: { x: 545, y }, thickness: 0.5, color: rgb(0.7, 0.7, 0.7) });

  y -= 20;
  p1.drawText("Subtotal:", { x: 380, y, size: 10, font: helvetica });
  p1.drawText("$203.99", { x: 480, y, size: 10, font: helvetica });
  y -= 16;
  p1.drawText("Tax (8.5%):", { x: 380, y, size: 10, font: helvetica });
  p1.drawText("$17.34", { x: 480, y, size: 10, font: helvetica });
  y -= 20;
  p1.drawText("Total:", { x: 380, y, size: 11, font: helveticaBold });
  p1.drawText("$221.33", { x: 480, y, size: 11, font: helveticaBold });

  y -= 60;
  p1.drawText("Payment terms: Net 30. Please reference invoice number on payment.", {
    x: 50, y, size: 9, font: helvetica, color: rgb(0.4, 0.4, 0.4),
  });

  // --- Page 2: Terms & conditions ---
  const p2 = doc.addPage([595, 842]);
  let y2 = 790;

  p2.drawText("Terms & Conditions", { x: 50, y: y2, size: 18, font: helveticaBold });
  y2 -= 30;

  const terms = [
    "1. Payment is due within 30 days of the invoice date.",
    "2. Late payments may incur a fee of 1.5% per month.",
    "3. All prices are in USD unless otherwise stated.",
    "4. Services are provided as-is without warranty.",
    "5. Refunds are available within 14 days of purchase.",
    "6. This invoice is generated automatically by ParseDocu.",
  ];

  for (const line of terms) {
    p2.drawText(line, { x: 50, y: y2, size: 10, font: helvetica });
    y2 -= 18;
  }

  y2 -= 20;
  p2.drawText("Thank you for your business!", {
    x: 50, y: y2, size: 12, font: helveticaBold, color: rgb(0.2, 0.4, 0.8),
  });

  // Set PDF metadata
  doc.setTitle("Invoice INV-2026-0042");
  doc.setAuthor("ParseDocu Inc.");
  doc.setSubject("Monthly invoice for Acme Corporation");
  doc.setCreationDate(new Date("2026-03-11T00:00:00Z"));

  const bytes = await doc.save();
  const outPath = join(__dirname, "sample-invoice.pdf");
  writeFileSync(outPath, bytes);
  console.log(`Generated: ${outPath} (${bytes.length} bytes)`);
}

main().catch(console.error);
