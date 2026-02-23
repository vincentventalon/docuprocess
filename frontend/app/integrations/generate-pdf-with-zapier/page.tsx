import { Suspense } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { getSEOTags, renderBreadcrumbSchema, renderFAQSchema } from "@/libs/seo";
import config from "@/config";
import {
  PlatformComparison,
  FAQCards,
} from "@/components/integration-pages";
import { ZapierWorkflowAnimation } from "@/components/zapier-workflow-animation";
import FeatureShowcase from "@/components/FeatureShowcase";
import FeatureShowcase2 from "@/components/FeatureShowcase2";
import BadgePill from "@/components/ui/badge-pill";
import { HeroGradientBlur } from "@/components/decorative/HeroGradientBlur";

export const metadata = getSEOTags({
  title: `Automate PDF Generation with Zapier | ${config.appName}`,
  description:
    "Automate PDF generation with Zapier and YourApp. Native integration, no code required. Connect to 7,000+ apps and create PDFs from form submissions, CRM updates, and more.",
  keywords: [
    "generate pdf with zapier",
    "zapier pdf generation",
    "zapier pdf automation",
    "automate pdf no code",
    "zapier document automation",
    "no code pdf api",
    config.appName,
  ],
  canonicalUrlRelative: "/integrations/generate-pdf-with-zapier",
  openGraph: {
    title: `Automate PDF Generation with Zapier | ${config.appName}`,
    description:
      "Automate PDF generation with Zapier and YourApp. Native integration, no code required. Connect to 7,000+ apps and create PDFs.",
    url: `https://${config.domainName}/integrations/generate-pdf-with-zapier`,
  },
});

const ZAPIER_INVITE_URL =
  "https://zapier.com/developer/public-invite/235058/a299dc7567a3209dc36bdc3d4262d0f8/";

// Platform comparison data
const recommendations = [
  { text: "Native integration — no HTTP setup" },
  { text: "Simple 1:1 trigger-to-PDF workflows" },
  { text: "Easiest setup for non-technical users" },
  { text: "7,000+ app connections out of the box" },
];

const alternatives = [
  {
    platform: "Make",
    href: "/integrations/generate-pdf-with-make",
    logo: "/makeofficial.svg",
    reasons: [
      "Iteration for bulk PDF generation",
      "More cost-effective at scale",
    ],
  },
  {
    platform: "n8n",
    href: "/integrations/generate-pdf-with-n8n",
    logo: "/n8nofficial.svg",
    logoScale: "scale-150",
    reasons: [
      "Self-hosted for compliance",
      "Most technical, full control",
    ],
  },
];

// FAQ items
const faqItems = [
  {
    question: "How does the YourApp and Zapier integration work?",
    answer:
      "YourApp has a native Zapier integration. Once you connect your account, you can add YourApp as an action in any Zap. When your trigger fires (form submission, new order, etc.), Zapier automatically calls YourApp to generate a PDF based on your template.",
  },
  {
    question: "Do I need any coding experience to set up this integration?",
    answer:
      "No coding required at all. Zapier provides a simple point-and-click interface. Just select your trigger app, add YourApp as an action, map your fields, and you're done. The entire setup takes about 5 minutes.",
  },
  {
    question: "How do I connect YourApp to Zapier?",
    answer:
      `First, <a href='${ZAPIER_INVITE_URL}' target='_blank' class='text-primary hover:underline'>accept the Zapier invite</a> to add YourApp to your account. Then create a new Zap, search for "YourApp" as your action, and authenticate with your API key from your <a href='/dashboard/api' class='text-primary hover:underline'>Dashboard</a>.`,
  },
  {
    question: "Can I generate images as well as PDFs with Zapier?",
    answer:
      "Yes! YourApp supports both PDF and PNG output formats. In your Zap configuration, simply select the output format you need — perfect for generating social media graphics, product labels, or document thumbnails.",
  },
  {
    question: "What triggers can I use to start PDF generation?",
    answer:
      "Any Zapier trigger works: new Google Sheets row, Typeform submission, Shopify order, HubSpot deal update, Slack message, webhook, scheduled time, and 7,000+ more. If it's in Zapier, it can trigger your PDF generation.",
  },
  {
    question: "Can I send the generated PDF somewhere automatically?",
    answer:
      "Absolutely. After YourApp generates your PDF, you can add more actions to your Zap: email it via Gmail, save to Google Drive or Dropbox, attach to a Slack message, update a CRM record, or any other Zapier action.",
  },
  {
    question: "What are common use cases for YourApp with Zapier?",
    answer:
      "Popular use cases include: <strong>Invoice Generation</strong> (create invoices when orders come in), <strong>Contract Automation</strong> (generate contracts when deals close), <strong>Certificate Creation</strong> (produce certificates on course completion), <strong>Receipt Emails</strong> (send PDF receipts after purchases), and <strong>Report Distribution</strong> (generate and email weekly reports).",
  },
  {
    question: "How fast is PDF generation with YourApp?",
    answer:
      "Most PDFs generate in under 2 seconds. Your Zap continues immediately with the PDF URL, so you can chain additional actions without delays. Complex multi-page documents may take slightly longer.",
  },
  {
    question: "Are there any limits or additional costs?",
    answer:
      `Your costs include your Zapier plan and YourApp subscription. YourApp offers ${config.stripe.freeTier.credits} free PDFs/month, then paid plans based on volume. Zapier charges based on tasks — each PDF generation counts as one task. <a href='/pricing' class='text-primary hover:underline'>Check our pricing</a> for details.`,
  },
];

export default function ZapierIntegrationPage() {
  return (
    <>
      {renderBreadcrumbSchema([
        { name: "Home", url: `https://${config.domainName}/` },
        {
          name: "Integrations",
          url: `https://${config.domainName}/integrations`,
        },
        {
          name: "Zapier",
          url: `https://${config.domainName}/integrations/generate-pdf-with-zapier`,
        },
      ])}
      {renderFAQSchema(faqItems)}
      <Suspense fallback={<div />}>
        <Header />
      </Suspense>

      {/* Hero Section */}
      <section className="relative w-full overflow-hidden">
        <HeroGradientBlur />
        <div className="relative z-10 max-w-5xl mx-auto px-8 py-16 lg:py-24">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="font-extrabold text-4xl md:text-5xl lg:text-6xl tracking-tight">
              Automate PDF Generation<br />
              <span className="text-primary">with Zapier</span>
            </h1>
          </div>

          {/* Description */}
          <p className="text-lg md:text-xl text-muted-foreground text-center max-w-3xl mx-auto mb-8">
            Connect {config.appName} to 7,000+ apps with our native Zapier integration.
            No code required — just point, click, and automate your PDF workflows.
          </p>

          {/* CTA */}
          <div className="flex flex-col items-center mb-12">
            <Button asChild size="xl">
              <Link href="/signin">Get Started for Free</Link>
            </Button>
          </div>

          {/* Workflow Animation */}
          <div>
            <ZapierWorkflowAnimation />
          </div>
        </div>
      </section>

      {/* Feature Showcases */}
      <FeatureShowcase />
      <FeatureShowcase2 />

      {/* S3 Integration */}
      <section className="py-20 lg:py-28 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-4xl mx-auto px-8">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
              {/* Icon */}
              <div className="flex-shrink-0">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center shadow-lg">
                  <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                    <path d="M2 17l10 5 10-5"/>
                    <path d="M2 12l10 5 10-5"/>
                  </svg>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 text-center md:text-left">
                <BadgePill>Cloud storage</BadgePill>
                <h2 className="font-bold text-2xl md:text-3xl tracking-tight mb-3">
                  Built-in S3 Integration
                </h2>
                <p className="text-muted-foreground mb-4">
                  Save your generated PDFs directly to Amazon S3 or any S3-compatible storage (Cloudflare R2, MinIO, DigitalOcean Spaces). No extra Zapier steps needed.
                </p>
                <Link href="/docs/integrations/upload-to-s3" className="text-primary hover:underline font-medium inline-flex items-center gap-1">
                  Learn how to bring your own storage
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Comparison */}
      <section className="py-20 lg:py-28">
        <div className="max-w-4xl mx-auto px-8">
          <div className="text-center mb-12">
            <h2 className="font-bold text-3xl md:text-4xl tracking-tight mb-4">
              Is Zapier right for you?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Zapier is the easiest way to automate PDFs. Here&apos;s how to decide.
            </p>
          </div>

          <PlatformComparison
            currentPlatform="Zapier"
            currentLogo="/zapierofficial.svg"
            recommendations={recommendations}
            alternatives={alternatives}
          />
        </div>
      </section>

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
