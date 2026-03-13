import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getSEOTags } from "@/libs/seo";
import config from "@/config";
import { FileText, Shield, Zap, Globe } from "lucide-react";
import Link from "next/link";
import PdfToMarkdownClient from "./PdfToMarkdownClient";

export const metadata = getSEOTags({
  title: "PDF to Markdown Online Free",
  description:
    "Convert PDF files to clean Markdown instantly in your browser. Free, private, no upload needed. Headings, lists, and formatting detected automatically.",
  keywords: [
    "pdf to markdown",
    "convert pdf to markdown",
    "pdf to md",
    "pdf markdown converter",
    "extract markdown from pdf",
    "free pdf to markdown",
    "online pdf to markdown",
    config.appName,
  ],
  canonicalUrlRelative: "/tools/pdf-to-markdown",
  openGraph: {
    title: "PDF to Markdown — Free Online Tool",
    description:
      "Convert PDF files to clean Markdown instantly in your browser. 100% private — your file never leaves your device.",
    url: `https://${config.domainName}/tools/pdf-to-markdown`,
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
    title: "Smart Formatting",
    description: "Headings, bold text, and lists are detected automatically using font-size heuristics.",
  },
  {
    icon: Globe,
    title: "Works Everywhere",
    description: "Runs on any modern browser — desktop, tablet, or mobile. No software to install.",
  },
];

export default function PdfToMarkdownPage() {
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
            name: "PDF to Markdown — Free Online Tool",
            description:
              "Convert PDF files to clean Markdown instantly in your browser. Free, private, no upload needed.",
            url: `https://${config.domainName}/tools/pdf-to-markdown`,
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
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-extrabold text-4xl lg:text-5xl tracking-tight mb-4">
            PDF to Markdown
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Convert any PDF to clean Markdown — headings, lists, and formatting detected automatically.
            Instantly, for free, right in your browser.
          </p>
        </div>
      </section>

      {/* Tool */}
      <section className="py-12 lg:py-16">
        <div className="max-w-4xl mx-auto px-8">
          <PdfToMarkdownClient />
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
              { step: "2", title: "Markdown is generated", description: "Our client-side engine reads every page and converts content to Markdown with smart formatting." },
              { step: "3", title: "Copy or download", description: "Copy the Markdown to your clipboard or download it as a .md file." },
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
                q: "Is my PDF uploaded to a server?",
                a: "No. The entire conversion happens in your browser using JavaScript. Your file never leaves your device.",
              },
              {
                q: "How are headings detected?",
                a: "The tool analyzes font sizes in your PDF. Text significantly larger than the body font is converted to Markdown headings (H1, H2, H3). Bold text is wrapped in **bold** markers.",
              },
              {
                q: "Does it work with scanned PDFs?",
                a: "This tool works with digital PDFs that have embedded text. For scanned PDFs (images), you need OCR — check out our OCR tools (coming soon).",
              },
              {
                q: "Can I use this for bulk conversion?",
                a: `For converting many PDFs programmatically, use the ${config.appName} API. It handles thousands of documents with consistent, high-quality Markdown output.`,
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
              href="/tools/pdf-to-json"
              className="inline-flex items-center px-3 py-1.5 rounded-full bg-slate-100 text-sm text-muted-foreground hover:bg-slate-200 transition-colors"
            >
              PDF to JSON
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
