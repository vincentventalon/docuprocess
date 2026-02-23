import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getSEOTags } from "@/libs/seo";
import config from "@/config";
import { History, Plus, Sparkles, Wrench } from "lucide-react";

export const metadata = getSEOTags({
  title: `Changelog | ${config.appName}`,
  description: `See what's new in ${config.appName}. Track product updates, new features, improvements, and bug fixes to our PDF generation API and template editor.`,
  keywords: [
    "changelog",
    "release notes",
    "updates",
    "new features",
    "PDF API updates",
    config.appName,
  ],
  canonicalUrlRelative: "/changelog",
  openGraph: {
    title: `Changelog | ${config.appName}`,
    description: `See what's new in ${config.appName}. Track product updates, new features, improvements, and bug fixes to our PDF generation API and template editor.`,
    url: `https://${config.domainName}/changelog`,
  },
});

type ChangeType = "added" | "improved" | "fixed";

interface Change {
  type: ChangeType;
  text: string;
}

interface WeekEntry {
  dateRange: string;
  productUpdates: Change[];
  templates?: string[];
}

const changelog: WeekEntry[] = [
  {
    dateRange: "Feb 10-15, 2026",
    productUpdates: [
      { type: "added", text: "**Organisations** - Multi-user support with roles (owner/admin/member) and email invitations" },
      { type: "added", text: "**Multiple API Keys** - Manage multiple API keys per organisation" },
      { type: "added", text: "**[Async PDF Generation](/docs/api-reference)** - Background generation with real-time status tracking" },
      { type: "added", text: "**[n8n Community Node](/integrations/generate-pdf-with-n8n)** - Official node with AI Agent compatibility" },
      { type: "improved", text: "**[Make.com](/integrations/generate-pdf-with-make)** - Enhanced universal module" },
      { type: "added", text: "**[S3 Integration](/docs/integrations/upload-to-s3)** now available for all users" },
      { type: "added", text: "**Mobile navigation** in dashboard" },
      { type: "improved", text: "**Unsaved changes indicator** in template editor" },
      { type: "added", text: "**Rate limiting headers** on API endpoints to help manage your quotas" },
    ],
    templates: [
      "6 Purchase Order templates",
    ],
  },
  {
    dateRange: "Jan 31 - Feb 9, 2026",
    productUpdates: [
      { type: "added", text: "**[Official SDKs](/docs/sdks/typescript)** for 7 languages: TypeScript, Python, Java, Go, PHP, Ruby, C#" },
      { type: "added", text: "**S3 Storage Integration** infrastructure for enterprise storage" },
      { type: "added", text: "**Auto-generated Postman Collection** from API schema" },
      { type: "fixed", text: "Table pagination for multi-page PDF rendering" },
    ],
    templates: [
      "4 Purchase Order templates (Simple, Discounts/Taxes, Grouped Category, Professional)",
      "8 Receipt templates (Rent, Professional, Payment, Donation, Sales, Deposit, Cafe, Retail)",
      "2 Shipping Label templates (A4, Letter)",
    ],
  },
  {
    dateRange: "Jan 24-30, 2026",
    productUpdates: [
      { type: "added", text: "**Rich Text Editor toolbar** with inline formatting (bold, italic, underline, links)" },
      { type: "added", text: "**[About page](/about)** and **[Security page](/security)**" },
      { type: "added", text: "**[Homepage pricing section](/pricing)** with plan comparisons" },
      { type: "fixed", text: "Table cell editing when table is inside a container div" },
    ],
  },
  {
    dateRange: "Jan 17-23, 2026",
    productUpdates: [
      { type: "added", text: "**Onboarding flow** with live preview and optimized PDF generation" },
      { type: "added", text: "**Zoom controls** in the template designer" },
      { type: "added", text: "**Multi-select drag** - select and move multiple elements together" },
      { type: "added", text: "**[Integration pages](/integrations)** for Airtable, Bubble, FlutterFlow, Make, N8n, Postman, REST API, Zapier" },
      { type: "fixed", text: "PDF import coordinate conversion (points to mm) for proper scaling" },
    ],
  },
  {
    dateRange: "Jan 10-16, 2026",
    productUpdates: [
      { type: "added", text: "**[A6 page format](/docs/designer/page-settings)** option for templates" },
      { type: "improved", text: "**Self-hosted variable fonts** for consistent rendering across frontend and backend" },
      { type: "improved", text: "CSS-based shapes replacing SVG for better PDF rendering" },
    ],
  },
  {
    dateRange: "Jan 3-9, 2026",
    productUpdates: [
      { type: "added", text: "**[Templates API](/docs/api-reference)** (`/v1/templates`) for template management" },
      { type: "added", text: "**[Account API](/docs/api-reference)** (`/v1/account`) for account operations" },
      { type: "added", text: "**[QR Code & Barcode support](/docs/guides/barcodes-qrcodes)** in templates with system variable injection" },
      { type: "added", text: "**[Public Template Library](/templates)** at `/templates` with category filters" },
      { type: "added", text: "**Analytics Dashboard** with credits chart and transactions table" },
      { type: "added", text: "**[Zapier integration](/integrations/generate-pdf-with-zapier)** with PDF file output for email attachments" },
      { type: "added", text: "**[Documentation site](/docs)** with Nextra v4" },
      { type: "improved", text: "Backend async performance - eliminated ~100ms overhead per request" },
      { type: "improved", text: "Centralized Supabase client with singleton pattern" },
    ],
    templates: [
      "2 Invoice templates (Standard, Professional)",
      "2 Certificate templates (Achievement, Completion)",
    ],
  },
  {
    dateRange: "Dec 27 - Jan 2, 2026",
    productUpdates: [
      { type: "added", text: "**Custom StylePanel** replacing GrapesJS native panel with cleaner UI" },
      { type: "added", text: "**Custom LeftPanel** with template info, layer management, and element dropdown" },
      { type: "added", text: "**[Shape elements](/docs/designer/components)** - lines, rectangles, and circles for visual design" },
      { type: "added", text: "**Transparent color option** with checkerboard pattern preview" },
      { type: "added", text: "**[Page margins](/docs/designer/page-settings)** moved to StylePanel for better UX" },
      { type: "added", text: "**Add missing key** button in Template Data panel" },
      { type: "improved", text: "UI translations fixed to English (Landscape, Layers, etc.)" },
    ],
  },
  {
    dateRange: "Dec 20-26, 2025",
    productUpdates: [
      { type: "added", text: "**Infinite mode** - templates can extend beyond single page boundaries" },
      { type: "added", text: "**Template rename** endpoint without creating new version" },
      { type: "improved", text: "Border property detection when switching between elements" },
      { type: "fixed", text: "Table column resize - now uses percentage widths for responsiveness" },
      { type: "fixed", text: "Border mode switching bug when toggling configurations" },
    ],
  },
  {
    dateRange: "Dec 13-19, 2025",
    productUpdates: [
      { type: "added", text: "**[Container/Section component](/docs/designer/sections)** for organizing template sections" },
      { type: "added", text: "**[Table column resize handles](/docs/designer/tables)** for manual width adjustment" },
      { type: "added", text: "**Custom editor toolbar**" },
      { type: "improved", text: "Table row and column manipulation" },
      { type: "fixed", text: "Table resize constraints - columns maintain proportions" },
      { type: "fixed", text: "Padding and border UI controls" },
    ],
  },
  {
    dateRange: "Dec 6-12, 2025",
    productUpdates: [
      { type: "added", text: "**Alignment guides** with visual snapping system" },
      { type: "improved", text: "Header and footer positioning detection and spacing" },
      { type: "improved", text: "Element drop behavior between page sections" },
      { type: "improved", text: "Initial table layout behavior in editor" },
    ],
  },
  {
    dateRange: "Nov 29 - Dec 5, 2025",
    productUpdates: [
      { type: "added", text: "**[Example Templates Gallery](/templates)** - browse and instantiate pre-made templates" },
      { type: "added", text: "**Admin Templates System** with versioning and history tracking" },
      { type: "added", text: "`instantiate_template_from_example()` database function" },
      { type: "improved", text: "Template designer with better element handling" },
      { type: "improved", text: "Admin sidebar navigation with example templates option" },
    ],
  },
  {
    dateRange: "Nov 22-28, 2025",
    productUpdates: [
      { type: "added", text: "**[System variables](/docs/guides/system-variables)** - `{{page_number}}`, `{{total_pages}}`, `{{current_date}}`, date components" },
      { type: "added", text: "**[Page settings](/docs/designer/page-settings)** - A0-A5 formats, portrait/landscape, custom margins" },
      { type: "improved", text: "PDF generation refactored into modular pipeline" },
      { type: "fixed", text: "Header/footer spacing and margin handling on multi-page layouts" },
    ],
  },
  {
    dateRange: "Nov 15-21, 2025",
    productUpdates: [
      { type: "added", text: "**[Template Designer](/docs/designer/overview)** with GrapesJS drag-and-drop editor" },
      { type: "added", text: "**[Templates API](/docs/api-reference)** - create, save, import, clone, delete templates" },
      { type: "added", text: "**API Key Management** - reset keys and view usage logs" },
      { type: "added", text: "**Account Management** - account settings and deletion" },
      { type: "added", text: "**Dashboard Pages** - templates, API docs, settings" },
      { type: "added", text: "Template storage with versioning and metadata support" },
    ],
  },
];

// Helper to create anchor ID from date range
function toAnchorId(dateRange: string): string {
  return dateRange.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "");
}

const badgeStyles: Record<ChangeType, { bg: string; text: string; icon: typeof Plus }> = {
  added: { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-400", icon: Plus },
  improved: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-400", icon: Sparkles },
  fixed: { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-400", icon: Wrench },
};

function Badge({ type }: { type: ChangeType }) {
  const style = badgeStyles[type];
  const Icon = style.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${style.bg} ${style.text}`}
    >
      <Icon className="w-3 h-3" />
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </span>
  );
}

export default function ChangelogPage() {
  return (
    <>
      <Suspense fallback={<div />}>
        <Header />
      </Suspense>

      {/* Hero Section */}
      <section className="bg-slate-50 dark:bg-slate-900 w-full">
        <div className="max-w-4xl mx-auto px-8 py-20 lg:py-28 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
            <History className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-extrabold text-4xl lg:text-5xl tracking-tight mb-4">
            Changelog
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Track all the updates, new features, and improvements to {config.appName}.
            We ship fast and iterate based on your feedback.
          </p>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 lg:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-8">
          <div className="relative">
            {/* Continuous vertical line */}
            <div className="hidden sm:block absolute left-[7.5rem] lg:left-[9.5rem] top-8 bottom-8 w-0.5 bg-border" />

            {changelog.map((entry, index) => (
              <div
                key={entry.dateRange}
                id={toAnchorId(entry.dateRange)}
                className="relative flex gap-6 lg:gap-10 scroll-mt-24 pb-12 last:pb-0"
              >
                {/* Timeline - Left Side */}
                <div className="hidden sm:flex flex-col items-start w-32 lg:w-40 flex-shrink-0">
                  {/* Date */}
                  <a
                    href={`#${toAnchorId(entry.dateRange)}`}
                    className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors text-right w-full pr-6"
                  >
                    {entry.dateRange.split(" - ")[0]}
                  </a>
                  {/* Dot */}
                  <div className="absolute left-[7rem] lg:left-[9rem] mt-6 w-4 h-4 rounded-full bg-primary ring-4 ring-primary/20 ring-offset-2 ring-offset-white dark:ring-offset-slate-950" />
                </div>

                {/* Content Card - Right Side */}
                <div className="flex-1 max-w-xl">
                  {/* Mobile Date */}
                  <a
                    href={`#${toAnchorId(entry.dateRange)}`}
                    className="sm:hidden text-sm font-semibold text-muted-foreground hover:text-foreground mb-3 block"
                  >
                    {entry.dateRange}
                  </a>

                  <div className="border rounded-2xl p-6 hover:shadow-lg transition-shadow duration-300 bg-white dark:bg-slate-900/50">
                    {/* Product Updates */}
                    <div>
                      <h3 className="font-semibold text-base mb-4 text-foreground">
                        Product Updates
                      </h3>
                      <ul className="space-y-3">
                        {entry.productUpdates.map((change, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Badge type={change.type} />
                            <span
                              className="text-muted-foreground leading-relaxed flex-1 text-sm [&_a]:text-primary [&_a]:hover:underline"
                              dangerouslySetInnerHTML={{
                                __html: change.text
                                  .replace(
                                    /\*\*\[(.*?)\]\((.*?)\)\*\*/g,
                                    '<strong><a href="$2" class="text-foreground">$1</a></strong>'
                                  )
                                  .replace(
                                    /\*\*(.*?)\*\*/g,
                                    '<strong class="text-foreground">$1</strong>'
                                  )
                                  .replace(
                                    /\[(.*?)\]\((.*?)\)/g,
                                    '<a href="$2">$1</a>'
                                  ),
                              }}
                            />
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Templates Section */}
                    {entry.templates && entry.templates.length > 0 && (
                      <div className="pt-4 mt-4 border-t">
                        <h3 className="font-semibold text-base mb-3 text-foreground">
                          New Templates
                        </h3>
                        <ul className="space-y-2">
                          {entry.templates.map((template, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                              <span className="text-muted-foreground leading-relaxed text-sm">
                                {template}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-slate-50 dark:bg-slate-900 py-16">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="font-bold text-2xl tracking-tight mb-4">
            Have a feature request?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            We&apos;re always looking to improve. If you have ideas for new features
            or improvements, let us know at{" "}
            <a
              href={`mailto:${config.resend.supportEmail}`}
              className="text-primary hover:underline"
            >
              {config.resend.supportEmail}
            </a>
            .
          </p>
        </div>
      </section>

      <Footer />
    </>
  );
}
