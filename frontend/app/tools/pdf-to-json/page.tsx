import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getSEOTags } from "@/libs/seo";
import config from "@/config";
import { FileJson, Shield, Zap, Globe } from "lucide-react";
import Link from "next/link";
import PdfToJsonClient from "./PdfToJsonClient";

export const metadata = getSEOTags({
  title: "PDF to JSON Online Free",
  description:
    "Extract structured JSON from PDF files instantly in your browser. Free, private, no upload needed. Get page content, metadata, and text lines as machine-readable JSON.",
  keywords: [
    "pdf to json",
    "convert pdf to json",
    "pdf json extractor",
    "extract json from pdf",
    "pdf to structured data",
    "free pdf to json",
    "online pdf to json",
    config.appName,
  ],
  canonicalUrlRelative: "/tools/pdf-to-json",
  openGraph: {
    title: "PDF to JSON — Free Online Tool",
    description:
      "Extract structured JSON from PDF files instantly in your browser. 100% private — your file never leaves your device.",
    url: `https://${config.domainName}/tools/pdf-to-json`,
  },
});

const features = [
  {
    icon: Shield,
    title: "100% Private",
    description: "Your PDF is processed entirely in your browser. Nothing is uploaded to any server.",
  },
  {
    icon: Zap,
    title: "Structured Output",
    description: "Get clean JSON with metadata, page dimensions, text content, and individual lines with coordinates.",
  },
  {
    icon: Globe,
    title: "Works Everywhere",
    description: "Runs on any modern browser — desktop, tablet, or mobile. No software to install.",
  },
];

export default function PdfToJsonPage() {
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
            "@type": "SoftwareApplication",
            name: "PDF to JSON — Free Online Tool",
            description:
              "Extract structured JSON from PDF files instantly in your browser. Free, private, no upload needed.",
            url: `https://${config.domainName}/tools/pdf-to-json`,
            applicationCategory: "UtilitiesApplication",
            operatingSystem: "Any",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
            <FileJson className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-extrabold text-4xl lg:text-5xl tracking-tight mb-4">
            PDF to JSON
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Extract structured JSON from any PDF — metadata, page content, and text lines with coordinates.
            Instantly, for free, right in your browser.
          </p>
        </div>
      </section>

      {/* Tool */}
      <section className="py-12 lg:py-16">
        <div className="max-w-4xl mx-auto px-8">
          <PdfToJsonClient />
        </div>
      </section>

      {/* Features */}
      <section className="py-12 lg:py-16 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-4xl mx-auto px-8">
          <h2 className="font-bold text-2xl tracking-tight text-center mb-10">
            Why use this tool?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white dark:bg-slate-800 border rounded-xl p-6 text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-12 lg:py-16">
        <div className="max-w-4xl mx-auto px-8">
          <h2 className="font-bold text-2xl tracking-tight text-center mb-10">
            How it works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Upload your PDF", description: "Drag and drop or click to select a PDF file from your device." },
              { step: "2", title: "JSON is generated", description: "Our client-side engine reads every page and structures the content into clean, machine-readable JSON." },
              { step: "3", title: "Copy or download", description: "Copy the JSON to your clipboard or download it as a .json file." },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-10 h-10 rounded-full bg-primary text-white font-bold text-lg flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 lg:py-16 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-3xl mx-auto px-8">
          <h2 className="font-bold text-2xl tracking-tight text-center mb-10">
            Frequently asked questions
          </h2>
          <div className="space-y-6">
            {[
              {
                q: "What does the JSON output include?",
                a: "The output includes PDF metadata (title, author, dates), and for each page: dimensions, full text, and individual lines with position coordinates and font information.",
              },
              {
                q: "Is my PDF uploaded to a server?",
                a: "No. The entire extraction happens in your browser using JavaScript. Your file never leaves your device.",
              },
              {
                q: "Does it work with scanned PDFs?",
                a: "This tool extracts embedded text from digital PDFs. For scanned PDFs (images), you need OCR — check out our OCR tools (coming soon).",
              },
              {
                q: "Can I use this for bulk extraction?",
                a: `For extracting JSON from many PDFs programmatically, use the ${config.appName} API. It handles thousands of documents with consistent, structured output.`,
              },
            ].map((item) => (
              <div key={item.q} className="border-b pb-5">
                <h3 className="font-semibold mb-2">{item.q}</h3>
                <p className="text-sm text-muted-foreground">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related tools */}
      <section className="py-12 lg:py-16">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="font-bold text-2xl tracking-tight mb-6">
            Related tools
          </h2>
          <p className="text-muted-foreground mb-8">
            More free document parsing tools.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/tools/pdf-to-text"
              className="inline-flex items-center px-3 py-1.5 rounded-full bg-slate-100 text-sm text-muted-foreground hover:bg-slate-200 transition-colors"
            >
              PDF to Text
            </Link>
            <Link
              href="/tools/pdf-to-markdown"
              className="inline-flex items-center px-3 py-1.5 rounded-full bg-slate-100 text-sm text-muted-foreground hover:bg-slate-200 transition-colors"
            >
              PDF to Markdown
            </Link>
            {[
              "PDF to HTML",
              "Extract Tables from PDF",
              "PDF Word Counter",
            ].map((tool) => (
              <span
                key={tool}
                className="inline-flex items-center px-3 py-1.5 rounded-full bg-slate-100 text-sm text-muted-foreground"
              >
                {tool}
              </span>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
