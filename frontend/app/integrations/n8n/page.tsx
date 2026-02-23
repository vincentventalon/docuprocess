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
  title: `n8n Integration | ${config.appName}`,
  description:
    "Convert PDFs to Markdown with n8n workflows. Self-hosted automation, full control. Extract text from documents and integrate with 400+ apps.",
  keywords: [
    "n8n pdf to markdown",
    "n8n pdf conversion",
    "n8n document processing",
    "self-hosted pdf automation",
    "n8n workflow automation",
    config.appName,
  ],
  canonicalUrlRelative: "/integrations/n8n",
  openGraph: {
    title: `n8n Integration | ${config.appName}`,
    description:
      "Convert PDFs to Markdown with n8n workflows. Self-hosted automation, full control.",
    url: `https://${config.domainName}/integrations/n8n`,
  },
});

const faqItems = [
  {
    question: `How does the ${config.appName} and n8n integration work?`,
    answer:
      `Use n8n's HTTP Request node to call the ${config.appName} API. Send a PDF URL, receive clean Markdown. Chain it with other nodes to process documents, update databases, or trigger notifications.`,
  },
  {
    question: "Do I need coding experience to set up this integration?",
    answer:
      "Basic familiarity with n8n helps, but no coding is required. You'll configure an HTTP Request node with your API key and the PDF URL. n8n's visual interface makes it straightforward.",
  },
  {
    question: "Can I self-host this integration?",
    answer:
      "Yes! n8n can be self-hosted, giving you full control over your data and workflows. Your PDF conversion requests go directly from your n8n instance to our API.",
  },
  {
    question: "What can I do with the converted Markdown?",
    answer:
      "Common use cases: feed documents into AI/LLM pipelines, index content for search, migrate documentation, extract data for analysis, or store in your CMS. The structured Markdown preserves headings, lists, and formatting.",
  },
  {
    question: "How fast is the PDF conversion?",
    answer:
      "Most PDFs convert in 1-3 seconds depending on size and complexity. Your n8n workflow continues immediately with the Markdown output.",
  },
  {
    question: "Are there any limits?",
    answer:
      `${config.appName} offers ${config.stripe.freeTier.credits} free conversions/month. Each PDF counts as one conversion. <a href='/pricing' class='text-primary hover:underline'>Check our pricing</a> for higher volumes.`,
  },
];

export default function N8nIntegrationPage() {
  return (
    <>
      {renderBreadcrumbSchema([
        { name: "Home", url: `https://${config.domainName}/` },
        { name: "Integrations", url: `https://${config.domainName}/integrations` },
        { name: "n8n", url: `https://${config.domainName}/integrations/n8n` },
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
              <span className="text-primary">with n8n</span>
            </h1>
          </div>

          <p className="text-lg md:text-xl text-muted-foreground text-center max-w-3xl mx-auto mb-8">
            Self-hosted workflow automation with full control. Convert PDFs to structured
            Markdown and integrate with 400+ apps.
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
              <span className="text-gray-400 text-xs ml-2">n8n HTTP Request Node</span>
            </div>
            <pre className="text-green-400 overflow-x-auto">
{`POST https://api.parsedocu.com/v1/convert/pdf-to-markdown

Headers:
  x-api-key: {{ $credentials.parsedocuApi }}
  Content-Type: application/json

Body:
  { "url": "{{ $json.pdf_url }}" }

Response:
  {
    "success": true,
    "markdown": "# Document Title\\n\\nContent..."
  }`}
            </pre>
          </div>
        </div>
      </section>

      {/* Why n8n */}
      <section className="py-20 lg:py-28 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-4xl mx-auto px-8">
          <div className="text-center mb-12">
            <BadgePill>Why n8n</BadgePill>
            <h2 className="font-bold text-3xl md:text-4xl tracking-tight mt-4 mb-4">
              Self-hosted, open-source automation
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Full control over your data and workflows
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Data Privacy</h3>
              <p className="text-sm text-muted-foreground">
                Self-host n8n on your infrastructure. Your documents never touch third-party servers.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Open Source</h3>
              <p className="text-sm text-muted-foreground">
                Inspect, modify, and extend. No vendor lock-in.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">400+ Integrations</h3>
              <p className="text-sm text-muted-foreground">
                Connect to databases, APIs, AI tools, and more.
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
