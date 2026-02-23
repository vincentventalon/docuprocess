import { Suspense } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { getSEOTags, renderBreadcrumbSchema } from "@/libs/seo";
import config from "@/config";
import BadgePill from "@/components/ui/badge-pill";
import { HeroGradientBlur } from "@/components/decorative/HeroGradientBlur";
import {
  ShoppingCart,
  Truck,
  HeartPulse,
  Landmark,
  Shield,
  ClipboardList,
  Users,
  Scale,
  TrendingUp,
  Building2,
  GraduationCap,
  Calculator,
  Factory,
  Megaphone,
  ArrowRight,
  Blocks,
  Briefcase,
  Rocket,
} from "lucide-react";

export const metadata = getSEOTags({
  title: `Industry Solutions - PDF Generation for Every Industry | ${config.appName}`,
  description:
    "Automate document generation for your industry. Generate invoices, certificates, shipping labels, reports, and more via API or no-code integrations. Solutions for ecommerce, healthcare, logistics, and 11 more industries.",
  keywords: [
    "PDF generation API",
    "document automation",
    "industry solutions",
    "invoice generator",
    "certificate API",
    "shipping label generator",
    "healthcare documents",
    "ecommerce automation",
    config.appName,
  ],
  canonicalUrlRelative: "/for",
  openGraph: {
    title: `Industry Solutions | ${config.appName}`,
    description:
      "Automate document generation for your industry. Solutions for ecommerce, healthcare, logistics, and more.",
    url: `https://${config.domainName}/for`,
  },
});

// Industry data organized by category
const industries = [
  // Commerce & Sales
  {
    name: "Ecommerce",
    slug: "ecommerce",
    icon: ShoppingCart,
    description: "Invoices, packing slips, shipping labels, and receipts for online stores.",
    category: "Commerce & Sales",
  },
  {
    name: "Sales",
    slug: "sales",
    icon: TrendingUp,
    description: "Quotes, proposals, receipts, and order confirmations for sales teams.",
    category: "Commerce & Sales",
  },
  {
    name: "Marketing",
    slug: "marketing",
    icon: Megaphone,
    description: "Campaign reports, proposals, media kits, and client deliverables.",
    category: "Commerce & Sales",
  },
  // Finance
  {
    name: "Fintech",
    slug: "fintech",
    icon: Landmark,
    description: "Transaction receipts, statements, and compliance documents.",
    category: "Finance",
  },
  {
    name: "Insurance",
    slug: "insurance",
    icon: Shield,
    description: "Policy documents, claims forms, and coverage summaries.",
    category: "Finance",
  },
  {
    name: "Accounting",
    slug: "accounting",
    icon: Calculator,
    description: "Invoices, expense reports, financial statements, and tax documents.",
    category: "Finance",
  },
  // Operations
  {
    name: "Logistics & 3PL",
    slug: "logistics",
    icon: Truck,
    description: "Shipping labels, BOLs, packing slips, and warehouse documents.",
    category: "Operations",
  },
  {
    name: "Procurement",
    slug: "procurement",
    icon: ClipboardList,
    description: "Purchase orders, RFQs, vendor contracts, and receiving reports.",
    category: "Operations",
  },
  {
    name: "Manufacturing",
    slug: "manufacturing",
    icon: Factory,
    description: "Bills of materials, work orders, quality reports, and inspection certs.",
    category: "Operations",
  },
  // Professional Services
  {
    name: "Legal",
    slug: "legal",
    icon: Scale,
    description: "Contracts, retainer agreements, invoices, and legal notices.",
    category: "Professional Services",
  },
  {
    name: "Healthcare",
    slug: "healthcare",
    icon: HeartPulse,
    description: "Patient forms, medical certificates, billing statements, and lab reports.",
    category: "Professional Services",
  },
  {
    name: "Human Resources",
    slug: "human-resources",
    icon: Users,
    description: "Offer letters, contracts, payslips, and training certificates.",
    category: "Professional Services",
  },
  {
    name: "Real Estate",
    slug: "real-estate",
    icon: Building2,
    description: "Lease agreements, rent receipts, property reports, and closing docs.",
    category: "Professional Services",
  },
  {
    name: "Education",
    slug: "education",
    icon: GraduationCap,
    description: "Certificates, transcripts, tuition invoices, and enrollment docs.",
    category: "Professional Services",
  },
  // Business Types
  {
    name: "No-Code Builders",
    slug: "nocode",
    icon: Blocks,
    description: "Generate PDFs from Bubble, Webflow, Airtable without code.",
    category: "Business Type",
  },
  {
    name: "Agencies",
    slug: "agency",
    icon: Briefcase,
    description: "White-label proposals, reports, and invoices for clients.",
    category: "Business Type",
  },
  {
    name: "Startups",
    slug: "startup",
    icon: Rocket,
    description: "Scale document generation without building infrastructure.",
    category: "Business Type",
  },
];

// Group industries by category
const categories = [
  { name: "Commerce & Sales", industries: industries.filter((i) => i.category === "Commerce & Sales") },
  { name: "Finance", industries: industries.filter((i) => i.category === "Finance") },
  { name: "Operations", industries: industries.filter((i) => i.category === "Operations") },
  { name: "Professional Services", industries: industries.filter((i) => i.category === "Professional Services") },
  { name: "Business Type", industries: industries.filter((i) => i.category === "Business Type") },
];

export default function IndustriesPage() {
  return (
    <>
      {renderBreadcrumbSchema([
        { name: "Home", url: `https://${config.domainName}/` },
        { name: "Industries", url: `https://${config.domainName}/for` },
      ])}
      <Suspense fallback={<div />}>
        <Header />
      </Suspense>

      {/* Hero Section */}
      <section className="relative w-full overflow-hidden">
        <HeroGradientBlur />
        <div className="relative z-10 max-w-5xl mx-auto px-8 py-16 lg:py-24">
          <div className="text-center mb-8">
            <BadgePill>Industry Solutions</BadgePill>
            <h1 className="font-extrabold text-4xl md:text-5xl lg:text-6xl tracking-tight">
              PDF Generation for<br />
              <span className="text-primary">Every Industry</span>
            </h1>
          </div>

          <p className="text-lg md:text-xl text-muted-foreground text-center max-w-3xl mx-auto mb-8">
            Automate document generation for your business. Invoices, certificates, shipping labels,
            reports — whatever your industry needs, delivered via API or no-code integrations.
          </p>

          <div className="flex flex-col items-center">
            <Button asChild size="xl">
              <Link href="/signin">Get Started for Free</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Industries Grid by Category */}
      <section className="py-20 lg:py-28 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-6xl mx-auto px-8">
          {categories.map((category) => (
            <div key={category.name} className="mb-16 last:mb-0">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-6">
                {category.name}
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.industries.map((industry) => (
                  <Link
                    key={industry.slug}
                    href={`/for/${industry.slug}`}
                    className="group bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 hover:border-primary hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-primary/10 text-primary">
                        <industry.icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors flex items-center gap-2">
                          {industry.name}
                          <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {industry.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="font-bold text-3xl md:text-4xl tracking-tight mb-4">
            Don&apos;t see your industry?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            {config.appName} works with any system that can make API calls. If you can send data,
            we can generate PDFs. Custom templates, dynamic data, any document type.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/signin">Start Building for Free</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/docs">Read the Documentation</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
