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
import Integrations from "@/components/Integrations";
import TemplateShowcase, { STARTUP_TEMPLATE_IDS } from "@/components/TemplateShowcase";
import FeatureShowcase from "@/components/FeatureShowcase";
import FeatureShowcase2 from "@/components/FeatureShowcase2";
import {
  BarChart3,
  FileSignature,
  FileText,
  Receipt,
  Shield,
  Users,
} from "lucide-react";

export const metadata = getSEOTags({
  title: `PDF Generation for Startups - Scale Without Building Infrastructure | ${config.appName}`,
  description:
    "Scale your document workflows without building PDF infrastructure. Generate invoices, receipts, reports, and contracts via API. Ship faster, not PDFs.",
  keywords: [
    "startup PDF API",
    "SaaS invoice generator",
    "startup document automation",
    "scalable PDF generation",
    "API-first PDF",
    "startup billing documents",
    "developer PDF API",
    "payment receipt generator",
    config.appName,
  ],
  canonicalUrlRelative: "/for/startup",
  openGraph: {
    title: `PDF Generation for Startups | ${config.appName}`,
    description:
      "Scale your document workflows without building PDF infrastructure. Ship faster, not PDFs.",
    url: `https://${config.domainName}/for/startup`,
  },
});

// Use cases for startups
const useCases = [
  {
    icon: Receipt,
    title: "Customer Invoices",
    description: "Automated billing at scale for your SaaS or marketplace.",
  },
  {
    icon: FileText,
    title: "Payment Receipts",
    description: "Transaction confirmations for every payment processed.",
  },
  {
    icon: Users,
    title: "Onboarding Documents",
    description: "Welcome kits, user guides, and getting-started docs.",
  },
  {
    icon: BarChart3,
    title: "Reports & Analytics",
    description: "Customer-facing dashboards and usage summaries.",
  },
  {
    icon: FileSignature,
    title: "Contracts & Agreements",
    description: "Terms, SLAs, and sign-off documents.",
  },
  {
    icon: Shield,
    title: "Compliance Documents",
    description: "Audit trails, records, and regulatory filings.",
  },
];

const platforms = ["Stripe", "Segment", "Intercom", "Notion", "Linear", "Slack"];

// FAQ items
const faqItems = [
  {
    question: "How do I integrate YourApp with Stripe?",
    answer:
      `Connect Stripe to ${config.appName} via <a href="/integrations/generate-pdf-with-zapier" class="text-primary hover:underline">Zapier</a> or <a href="/integrations/generate-pdf-with-make" class="text-primary hover:underline">Make</a>. When payments succeed, subscriptions renew, or invoices are finalized, trigger PDF generation with all the transaction details.`,
  },
  {
    question: "Can I generate invoices automatically for my SaaS?",
    answer:
      `Yes. Set up a webhook from your billing system (Stripe, Paddle, etc.) to trigger PDF generation via our <a href="/docs/api-reference" class="text-primary hover:underline">REST API</a>. Each invoice includes customer details, line items, totals, and payment information pulled from your system.`,
  },
  {
    question: "How do I scale to thousands of documents?",
    answer:
      `Our API handles high volume out of the box. Generate PDFs in parallel — each request takes ~2 seconds. For batch processing, use our <a href="/docs/api-reference" class="text-primary hover:underline">REST API</a> with concurrent requests. No infrastructure to manage.`,
  },
  {
    question: "Can I use this for customer-facing reports?",
    answer:
      "Yes. Create report templates with your branding and dynamic data fields. Generate usage reports, analytics summaries, or any customer-facing document when users request exports or on scheduled intervals.",
  },
  {
    question: "How do I handle multi-tenant documents?",
    answer:
      "Pass tenant-specific data (logo, colors, company name) with each request. One template serves all customers with dynamic branding. No need to create separate templates per customer.",
  },
  {
    question: "Can I embed PDFs in my product?",
    answer:
      "Yes. Our API returns a URL to the generated PDF. Embed it in your product, email it to customers, or store it in S3/GCS. You control the delivery — we handle the generation.",
  },
  {
    question: "How reliable is the API?",
    answer:
      `${config.appName} runs on Google Cloud with automatic scaling. The API is designed for production workloads with sub-3-second response times and 99.9% uptime.`,
  },
  {
    question: "Can I customize templates without designers?",
    answer:
      `Yes. Our <a href="/templates" class="text-primary hover:underline">template editor</a> is visual and requires no design skills. Start from a template, adjust colors and text, add your logo, and you're ready to generate.`,
  },
  {
    question: "How much does it cost to get started?",
    answer:
      `${config.appName} offers <strong>${config.stripe.freeTier.credits} free PDFs per month</strong> — enough to build and ship your integration. Paid plans start at $${config.stripe.plans[0].price}/month and scale with your usage. <a href="/pricing" class="text-primary hover:underline">View pricing</a> for details.`,
  },
];

export default function StartupPage() {
  return (
    <>
      {renderBreadcrumbSchema([
        { name: "Home", url: `https://${config.domainName}/` },
        { name: "Industries", url: `https://${config.domainName}/for` },
        { name: "Startups", url: `https://${config.domainName}/for/startup` },
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
            <BadgePill>Startups</BadgePill>
            <h1 className="font-extrabold text-4xl md:text-5xl lg:text-6xl tracking-tight">
              PDF Generation for<br />
              <span className="text-primary">Startups</span>
            </h1>
          </div>

          <p className="text-lg md:text-xl text-muted-foreground text-center max-w-3xl mx-auto mb-8">
            Scale your document workflows without building PDF infrastructure.
            Ship faster, not PDFs.
          </p>

          <div className="flex flex-col items-center">
            <Button asChild size="xl">
              <Link href="/signin">Get Started for Free</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 lg:py-28 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-6xl mx-auto px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div>
              <h2 className="font-bold text-3xl md:text-4xl tracking-tight mb-8">
                Every document your product needs
              </h2>
              <ul className="space-y-4">
                {useCases.map((useCase) => (
                  <li key={useCase.title} className="flex items-start gap-3">
                    <useCase.icon className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">{useCase.title}</span>
                      <span className="text-muted-foreground"> — {useCase.description}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: Image */}
            <div className="relative">
              <div className="aspect-[3/4] rounded-xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700 bg-white max-w-sm mx-auto">
                <img
                  src="https://xipyoqrqbhnypwuhonoh.supabase.co/storage/v1/object/public/thumbnails/example-templates/127eb43b-7b9e-4a0b-8dd6-0a64f0786ca3.png"
                  alt="American Invoice with ACH Details template"
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcases */}
      <FeatureShowcase />
      <FeatureShowcase2 />

      {/* Integration Showcase */}
      <div className="bg-slate-50 dark:bg-slate-900">
        <Integrations />

        {/* Works With Platforms */}
        <div className="max-w-4xl mx-auto px-8 pb-20 lg:pb-28">
          <p className="text-sm font-medium text-muted-foreground text-center mb-6">WORKS WITH</p>
          <div className="flex flex-wrap justify-center items-center gap-4">
            {platforms.map((platform) => (
              <span
                key={platform}
                className="text-sm font-medium text-muted-foreground bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-4 py-2"
              >
                {platform}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Template Showcase */}
      <TemplateShowcase
        templateIds={STARTUP_TEMPLATE_IDS}
        badge="Startup templates"
        title="Sample templates"
        description="Professional PDF templates for invoices, receipts, and customer documents.
Fully customizable and ready for API integration."
        browseUrl="/templates"
        browseLabel="Browse all templates"
      />

      {/* FAQ */}
      <section className="bg-slate-50 dark:bg-slate-900 py-20 lg:py-28">
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
