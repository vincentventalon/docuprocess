import { Suspense } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getSEOTags, renderBreadcrumbSchema, renderItemListSchema } from "@/libs/seo";
import config from "@/config";
import { FileCode } from "lucide-react";

export const metadata = getSEOTags({
  title: `Free PDF Tools | ${config.appName}`,
  description:
    "Free online PDF tools to convert HTML to PDF. Works in your browser with no signup or installation required.",
  keywords: [
    "free pdf tools",
    "html to pdf",
    "online pdf tools",
    config.appName,
  ],
  canonicalUrlRelative: "/tools",
  openGraph: {
    title: `Free PDF Tools | ${config.appName}`,
    description:
      "Free online PDF tools to convert HTML to PDF. Works in your browser with no signup or installation required.",
    url: `https://${config.domainName}/tools`,
  },
});

const tools = [
  {
    href: "/tools/convert-html-to-pdf",
    icon: FileCode,
    title: "Convert HTML to PDF",
    description: "Convert HTML code or upload an HTML file to PDF directly in your browser.",
  },
];

export default function ToolsPage() {
  return (
    <>
      {renderBreadcrumbSchema([
        { name: "Home", url: `https://${config.domainName}/` },
        { name: "Tools", url: `https://${config.domainName}/tools` },
      ])}
      {renderItemListSchema(
        tools.map((t) => ({
          name: t.title,
          url: `https://${config.domainName}${t.href}`,
          description: t.description,
        }))
      )}
      <Suspense fallback={<div />}>
        <Header />
      </Suspense>

      <main className="min-h-screen">
        <section className="max-w-3xl mx-auto px-6 py-16 lg:py-24">
          <h1 className="font-bold text-3xl lg:text-4xl tracking-tight mb-4">
            Free PDF Tools
          </h1>
          <p className="text-lg text-muted-foreground mb-12">
            Simple, free tools to work with PDFs. No signup required.
          </p>

          <div className="space-y-4">
            {tools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="flex items-start gap-4 p-6 border rounded-xl hover:border-primary hover:bg-muted/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <tool.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-lg">{tool.title}</h2>
                  <p className="text-muted-foreground">{tool.description}</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-16 pt-12 border-t">
            <h2 className="font-semibold text-lg mb-4">Free document generators</h2>
            <p className="text-muted-foreground mb-3">
              Create invoices, certificates, packing slips, QR code sheets, and barcode labels.
            </p>
            <Link href="/generators" className="inline-flex items-center text-primary hover:underline font-medium">
              View all generators &rarr;
            </Link>

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
