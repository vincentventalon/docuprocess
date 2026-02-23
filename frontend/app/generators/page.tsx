import { Suspense } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getSEOTags, renderBreadcrumbSchema, renderItemListSchema } from "@/libs/seo";
import config from "@/config";
import { FileText, Award, Package, QrCode, Barcode, Receipt, Tag } from "lucide-react";

export const metadata = getSEOTags({
  title: `Free PDF Generators | ${config.appName}`,
  description:
    "Free online PDF generators for invoices, certificates, packing slips, QR codes, and barcodes. Create professional documents instantly - no signup required.",
  keywords: [
    "free pdf generator",
    "invoice generator",
    "certificate maker",
    "packing slip generator",
    "qr code generator",
    "barcode generator",
    "online document generator",
    config.appName,
  ],
  canonicalUrlRelative: "/generators",
  openGraph: {
    title: `Free PDF Generators | ${config.appName}`,
    description:
      "Free online PDF generators for invoices, certificates, packing slips, QR codes, and barcodes. Create professional documents instantly - no signup required.",
    url: `https://${config.domainName}/generators`,
  },
});

const generators = [
  {
    href: "/generators/free-online-invoice-generator",
    icon: FileText,
    title: "Invoice Generator",
    description: "Create professional invoices for clients and customers. 6 templates available.",
  },
  {
    href: "/generators/free-online-receipt-maker",
    icon: Receipt,
    title: "Receipt Maker",
    description: "Create payment receipts, rent receipts, and donation receipts. 8 templates available.",
  },
  {
    href: "/generators/free-online-certificate-maker",
    icon: Award,
    title: "Certificate Maker",
    description: "Design certificates for courses, achievements, and awards.",
  },
  {
    href: "/generators/free-online-packing-slip-generator",
    icon: Package,
    title: "Packing Slip Generator",
    description: "Generate packing slips for shipments and orders. 7 templates available.",
  },
  {
    href: "/generators/free-online-qr-code-sheet-generator",
    icon: QrCode,
    title: "QR Code Sheet Generator",
    description: "Create printable sheets of QR codes for URLs, text, and more.",
  },
  {
    href: "/generators/free-online-barcode-sheet-generator",
    icon: Barcode,
    title: "Barcode Sheet Generator",
    description: "Generate barcode labels for inventory and products. Multiple formats.",
  },
  {
    href: "/generators/free-online-shipping-label-maker",
    icon: Tag,
    title: "Shipping Label Maker",
    description: "Create shipping labels for A4 and Letter paper. 2 templates available.",
  },
];

export default function GeneratorsPage() {
  return (
    <>
      {renderBreadcrumbSchema([
        { name: "Home", url: `https://${config.domainName}/` },
        { name: "Generators", url: `https://${config.domainName}/generators` },
      ])}
      {renderItemListSchema(
        generators.map((g) => ({
          name: g.title,
          url: `https://${config.domainName}${g.href}`,
          description: g.description,
        }))
      )}
      <Suspense fallback={<div />}>
        <Header />
      </Suspense>

      <main className="min-h-screen">
        <section className="max-w-3xl mx-auto px-6 py-16 lg:py-24">
          <h1 className="font-bold text-3xl lg:text-4xl tracking-tight mb-4">
            Free PDF Generators
          </h1>
          <p className="text-lg text-muted-foreground mb-12">
            Create professional documents instantly. No signup required.
          </p>

          <div className="space-y-4">
            {generators.map((generator) => (
              <Link
                key={generator.href}
                href={generator.href}
                className="flex items-start gap-4 p-6 border rounded-xl hover:border-primary hover:bg-muted/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <generator.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-lg">{generator.title}</h2>
                  <p className="text-muted-foreground">{generator.description}</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-16 pt-12 border-t">
            <h2 className="font-semibold text-lg mb-4">PDF Tools</h2>
            <div className="space-y-3">
              <Link href="/tools/convert-html-to-pdf" className="block text-primary hover:underline">
                Convert HTML to PDF
              </Link>
            </div>

            <h2 className="font-semibold text-lg mt-10 mb-4">Explore more</h2>
            <div className="space-y-3">
              <Link href="/templates" className="block text-primary hover:underline">
                PDF Template Library
              </Link>
              <Link href="/integrations" className="block text-primary hover:underline">
                Integrations
              </Link>
              <Link href="/docs/get-started" className="block text-primary hover:underline">
                Get Started with the API
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
