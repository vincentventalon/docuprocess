import { Suspense } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { getSEOTags, renderBreadcrumbSchema, renderFAQSchema } from "@/libs/seo";
import config from "@/config";
import { FAQCards } from "@/components/integration-pages";
import BadgePill from "@/components/ui/badge-pill";
import { HeroGradientBlur } from "@/components/decorative/HeroGradientBlur";

export const metadata = getSEOTags({
  title: `Zapier Integration | ${config.appName}`,
  description:
    "Convert PDFs to Markdown with Zapier. No-code automation connecting 8,000+ apps. Extract text from documents and integrate with your existing tools.",
  keywords: [
    "zapier pdf to markdown",
    "zapier pdf conversion",
    "zapier document processing",
    "no-code pdf automation",
    "zapier workflow automation",
    config.appName,
  ],
  canonicalUrlRelative: "/zapier",
  openGraph: {
    title: `Zapier Integration | ${config.appName}`,
    description:
      "Convert PDFs to Markdown with Zapier. No-code automation connecting 8,000+ apps.",
    url: `https://${config.domainName}/zapier`,
  },
});

const faqItems = [
  {
    question: `How does the ${config.appName} and Zapier integration work?`,
    answer:
      `Use Zapier's Webhooks action to call the ${config.appName} API. Send a PDF URL, receive clean Markdown. Connect it with any of Zapier's 8,000+ apps to automate your document workflows.`,
  },
  {
    question: "Do I need coding experience to set up this integration?",
    answer:
      "No coding required. Zapier's visual builder lets you configure the API call in minutes. Just add a Webhooks action, paste your API key, and connect it to your trigger.",
  },
  {
    question: "What triggers can I use with this integration?",
    answer:
      "Any Zapier trigger works: new email attachments, files uploaded to Google Drive or Dropbox, form submissions, Slack messages with files, and thousands more. Whenever a PDF appears, convert it automatically.",
  },
  {
    question: "What can I do with the converted Markdown?",
    answer:
      "Common use cases: feed documents into AI/LLM pipelines, index content for search, migrate documentation, extract data for analysis, or store in your CMS. The structured Markdown preserves headings, lists, and formatting.",
  },
  {
    question: "How fast is the PDF conversion?",
    answer:
      "Most PDFs convert in 1-3 seconds depending on size and complexity. Your Zap continues immediately with the Markdown output.",
  },
  {
    question: "Are there any limits?",
    answer:
      `${config.appName} offers ${config.stripe.freeTier.credits} free conversions/month. Each PDF counts as one conversion. <a href='/pricing' class='text-primary hover:underline'>Check our pricing</a> for higher volumes.`,
  },
];

export default function ZapierIntegrationPage() {
  return (
    <>
      {renderBreadcrumbSchema([
        { name: "Home", url: `https://${config.domainName}/` },
        { name: "Zapier", url: `https://${config.domainName}/zapier` },
      ])}
      {renderFAQSchema(faqItems)}
      <Suspense fallback={<div />}>
        <Header />
      </Suspense>

      {/* Hero Section */}
      <section className="relative w-full overflow-hidden">
        <HeroGradientBlur />
        <div className="relative z-10 max-w-5xl mx-auto px-8 py-16 lg:py-24">
          <div className="text-center mb-8">
            <h1 className="font-extrabold text-4xl md:text-5xl lg:text-6xl tracking-tight">
              PDF to Markdown<br />
              <span className="text-primary">with Zapier</span>
            </h1>
          </div>

          <p className="text-lg md:text-xl text-muted-foreground text-center max-w-3xl mx-auto mb-8">
            No-code automation connecting 8,000+ apps. Convert PDFs to structured
            Markdown and integrate with your entire stack.
          </p>

          <div className="flex flex-col items-center mb-12">
            <Button asChild size="xl">
              <Link href="/signin">Get Started for Free</Link>
            </Button>
          </div>

          {/* Code Example */}
          <div className="max-w-2xl mx-auto bg-slate-900 rounded-xl shadow-2xl p-6 font-mono text-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-gray-400 text-xs ml-2">Zapier Webhooks Action</span>
            </div>
            <pre className="text-green-400 overflow-x-auto">
{`POST https://api.parsedocu.com/v1/convert/pdf-to-markdown

Headers:
  x-api-key: {{your_api_key}}
  Content-Type: application/json

Body:
  { "url": "{{trigger.pdf_url}}" }

Response:
  {
    "success": true,
    "markdown": "# Document Title\\n\\nContent..."
  }`}
            </pre>
          </div>
        </div>
      </section>

      {/* Why Zapier */}
      <section className="py-20 lg:py-28 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-4xl mx-auto px-8">
          <div className="text-center mb-12">
            <BadgePill>Why Zapier</BadgePill>
            <h2 className="font-bold text-3xl md:text-4xl tracking-tight mt-4 mb-4">
              The easiest way to automate PDF conversion
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Connect to thousands of apps without writing code
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">8,000+ Apps</h3>
              <p className="text-sm text-muted-foreground">
                Connect to Gmail, Slack, Google Drive, Notion, and thousands more.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">No-Code</h3>
              <p className="text-sm text-muted-foreground">
                Visual builder, no programming required. Set up in minutes.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Triggers & Actions</h3>
              <p className="text-sm text-muted-foreground">
                React to events automatically. Convert PDFs the moment they arrive.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 lg:py-28">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center mb-12">
            <h2 className="font-bold text-3xl md:text-4xl tracking-tight mb-4">
              Frequently asked questions
            </h2>
          </div>
          <FAQCards items={faqItems} />
        </div>
      </section>

      <Footer />
    </>
  );
}
