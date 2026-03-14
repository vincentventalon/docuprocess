import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getSEOTags } from "@/libs/seo";
import config from "@/config";
import { History, Plus, Sparkles, Wrench } from "lucide-react";

export const metadata = getSEOTags({
  title: `Changelog | ${config.appName}`,
  description: `See what's new in ${config.appName}. Track product updates, new features, improvements, and bug fixes to our PDF to Markdown conversion API.`,
  keywords: [
    "changelog",
    "release notes",
    "updates",
    "new features",
    "PDF to Markdown updates",
    config.appName,
  ],
  canonicalUrlRelative: "/changelog",
  openGraph: {
    title: `Changelog | ${config.appName}`,
    description: `See what's new in ${config.appName}. Track product updates, new features, improvements, and bug fixes to our PDF to Markdown conversion API.`,
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
}

const changelog: WeekEntry[] = [
  {
    dateRange: "Mar 14, 2026",
    productUpdates: [
      { type: "added", text: "**[PDF to Markdown API](/docs/api-reference)** - Convert any PDF document to clean, structured Markdown via REST API" },
      { type: "added", text: "**[Free PDF to JSON tool](/tools/pdf-to-json)** - Try PDF conversion directly in the browser" },
      { type: "added", text: "**Team workspaces** with roles (owner/admin/member) and API key management" },
      { type: "added", text: "**[Documentation site](/docs)** with API reference, guides, and quickstart" },
      { type: "added", text: "**Credit-based billing** with Stripe integration" },
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
