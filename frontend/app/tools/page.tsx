import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getSEOTags } from "@/libs/seo";
import config from "@/config";
import Link from "next/link";
import { FileText, FileCode, FileJson, Table2, FileType, Hash } from "lucide-react";

export const metadata = getSEOTags({
  title: "Free Online Document Tools",
  description:
    "Free browser-based tools to extract text, convert PDFs to Markdown, JSON, HTML, and more. 100% private — your files never leave your device.",
  keywords: [
    "free pdf tools",
    "pdf to text",
    "pdf to markdown",
    "document parser",
    "free online tools",
    "pdf converter",
    "extract text from pdf",
    config.appName,
  ],
  canonicalUrlRelative: "/tools",
  openGraph: {
    title: "Free Online Document Tools",
    description:
      "Free browser-based tools to extract text, convert PDFs to Markdown, and more. 100% private.",
    url: `https://${config.domainName}/tools`,
  },
});

const tools = [
  {
    icon: FileText,
    title: "PDF to Text",
    description: "Extract raw text from any PDF file. Runs entirely in your browser — no upload, no server.",
    href: "/tools/pdf-to-text",
    available: true,
  },
  {
    icon: FileCode,
    title: "PDF to Markdown",
    description: "Convert PDF documents into clean Markdown with headings, bold text, and lists detected automatically.",
    href: "/tools/pdf-to-markdown",
    available: true,
  },
  {
    icon: FileJson,
    title: "PDF to JSON",
    description: "Extract structured data from PDFs into machine-readable JSON.",
    href: "#",
    available: false,
  },
  {
    icon: Table2,
    title: "Extract Tables from PDF",
    description: "Detect and extract tables from PDFs, export as CSV or JSON.",
    href: "#",
    available: false,
  },
  {
    icon: Hash,
    title: "PDF Word Counter",
    description: "Count words, characters, and pages in any PDF document.",
    href: "#",
    available: false,
  },
  {
    icon: FileType,
    title: "PDF to HTML",
    description: "Convert PDF files into clean, semantic HTML.",
    href: "#",
    available: false,
  },
];

export default function ToolsPage() {
  return (
    <>
      <Suspense fallback={<div />}>
        <Header />
      </Suspense>

      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Free Online Document Tools",
            description:
              "Free browser-based tools for document parsing and conversion.",
            url: `https://${config.domainName}/tools`,
            publisher: {
              "@type": "Organization",
              name: config.appName,
              url: `https://${config.domainName}`,
            },
          }),
        }}
      />

      {/* Hero */}
      <section className="bg-slate-50 dark:bg-slate-900 w-full">
        <div className="max-w-4xl mx-auto px-8 py-16 lg:py-20 text-center">
          <h1 className="font-extrabold text-4xl lg:text-5xl tracking-tight mb-4">
            Free Document Tools
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Browser-based tools for parsing and converting documents.
            100% private — your files never leave your device.
          </p>
        </div>
      </section>

      {/* Tools grid */}
      <section className="py-12 lg:py-16">
        <div className="max-w-5xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => {
              const card = (
                <div
                  className={`p-6 rounded-xl border transition-all h-full ${
                    tool.available
                      ? "border-primary/20 bg-white dark:bg-slate-900 hover:shadow-lg hover:border-primary/40 cursor-pointer"
                      : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 opacity-60"
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <tool.icon
                      className={`w-8 h-8 ${
                        tool.available ? "text-primary" : "text-muted-foreground"
                      }`}
                    />
                    {tool.available ? (
                      <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                        Available
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-muted-foreground bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full">
                        Coming soon
                      </span>
                    )}
                  </div>
                  <h2 className="font-semibold text-lg mb-2">{tool.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    {tool.description}
                  </p>
                </div>
              );

              if (tool.available) {
                return (
                  <Link key={tool.title} href={tool.href}>
                    {card}
                  </Link>
                );
              }
              return <div key={tool.title}>{card}</div>;
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 lg:py-16 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-3xl mx-auto px-8 text-center">
          <h2 className="font-bold text-2xl tracking-tight mb-4">
            Need to process documents at scale?
          </h2>
          <p className="text-muted-foreground mb-6">
            The {config.appName} API lets you convert thousands of documents programmatically
            with consistent, high-quality output.
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
          >
            View API plans
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
