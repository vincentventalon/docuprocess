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
  title: `Make Integration | ${config.appName}`,
  description:
    "Convert PDFs to Markdown with Make (formerly Integromat). Visual automation with advanced data transformation. Connect to 1,500+ apps.",
  keywords: [
    "make pdf to markdown",
    "make pdf conversion",
    "integromat pdf automation",
    "make document processing",
    "make workflow automation",
    config.appName,
  ],
  canonicalUrlRelative: "/make",
  openGraph: {
    title: `Make Integration | ${config.appName}`,
    description:
      "Convert PDFs to Markdown with Make. Visual automation with advanced data transformation.",
    url: `https://${config.domainName}/make`,
  },
});

const faqItems = [
  {
    question: `How does the ${config.appName} and Make integration work?`,
    answer:
      `Use Make's HTTP module to call the ${config.appName} API. Send a PDF URL, receive clean Markdown. Chain it with other modules to process documents, transform data, and route results to any app.`,
  },
  {
    question: "Do I need coding experience to set up this integration?",
    answer:
      "No coding required. Make's visual scenario builder lets you drag and drop modules. Configure the HTTP module with your API key and connect it to any trigger.",
  },
  {
    question: "What makes Make different from other automation tools?",
    answer:
      "Make excels at complex data transformations. Its visual builder shows your entire workflow at a glance, and built-in functions let you parse, filter, and reshape the Markdown output before sending it to other apps.",
  },
  {
    question: "What can I do with the converted Markdown?",
    answer:
      "Common use cases: feed documents into AI/LLM pipelines, index content for search, migrate documentation, extract data for analysis, or store in your CMS. The structured Markdown preserves headings, lists, and formatting.",
  },
  {
    question: "How fast is the PDF conversion?",
    answer:
      "Most PDFs convert in 1-3 seconds depending on size and complexity. Your Make scenario continues immediately with the Markdown output.",
  },
  {
    question: "Are there any limits?",
    answer:
      `${config.appName} offers ${config.stripe.freeTier.credits} free conversions/month. Each PDF counts as one conversion. <a href='/pricing' class='text-primary hover:underline'>Check our pricing</a> for higher volumes.`,
  },
];

export default function MakeIntegrationPage() {
  return (
    <>
      {renderBreadcrumbSchema([
        { name: "Home", url: `https://${config.domainName}/` },
        { name: "Make", url: `https://${config.domainName}/make` },
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
              <span className="text-primary">with Make</span>
            </h1>
          </div>

          <p className="text-lg md:text-xl text-muted-foreground text-center max-w-3xl mx-auto mb-8">
            Visual automation with advanced data transformation. Convert PDFs to structured
            Markdown and connect to 1,500+ apps.
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
              <span className="text-gray-400 text-xs ml-2">Make HTTP Module</span>
            </div>
            <pre className="text-green-400 overflow-x-auto">
{`POST https://api.parsedocu.com/v1/convert/pdf-to-markdown

Headers:
  x-api-key: {{your_api_key}}
  Content-Type: application/json

Body:
  { "url": "{{1.pdf_url}}" }

Response:
  {
    "success": true,
    "markdown": "# Document Title\\n\\nContent..."
  }`}
            </pre>
          </div>
        </div>
      </section>

      {/* Why Make */}
      <section className="py-20 lg:py-28 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-4xl mx-auto px-8">
          <div className="text-center mb-12">
            <BadgePill>Why Make</BadgePill>
            <h2 className="font-bold text-3xl md:text-4xl tracking-tight mt-4 mb-4">
              Visual automation, powerful transformations
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Build complex workflows with an intuitive drag-and-drop interface
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Visual Builder</h3>
              <p className="text-sm text-muted-foreground">
                See your entire workflow at a glance. Drag, drop, and connect modules visually.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Advanced Data Transformation</h3>
              <p className="text-sm text-muted-foreground">
                Built-in functions to parse, filter, and reshape data between steps.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">1,500+ Integrations</h3>
              <p className="text-sm text-muted-foreground">
                Connect to Google Workspace, Slack, Airtable, HubSpot, and more.
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
