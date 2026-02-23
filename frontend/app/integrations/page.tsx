import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getSEOTags, renderBreadcrumbSchema, renderItemListSchema } from "@/libs/seo";
import config from "@/config";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata = getSEOTags({
  title: `Integrations | ${config.appName}`,
  description:
    "Integrate PDF to Markdown conversion with your workflow. Connect to n8n, Make, Zapier, and more. Automate document processing with our REST API.",
  keywords: [
    "pdf api integrations",
    "n8n pdf",
    "make pdf",
    "zapier pdf",
    "automate pdf conversion",
    "document processing api",
    config.appName,
  ],
  canonicalUrlRelative: "/integrations",
  openGraph: {
    title: `Integrations | ${config.appName}`,
    description:
      "Integrate PDF to Markdown conversion with your workflow. Connect to n8n, Make, Zapier, and more.",
    url: `https://${config.domainName}/integrations`,
  },
});

const integrations = [
  {
    name: "n8n",
    description: "Self-hosted workflow automation with 400+ integrations. Open-source and privacy-focused.",
    href: "/integrations/n8n",
    logo: (
      <svg className="w-10 h-10" viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#EA4B71"/>
        <text x="16" y="21" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">n8n</text>
      </svg>
    ),
  },
  {
    name: "Make",
    description: "Visual automation platform with advanced data transformation and 1,500+ apps.",
    href: "/integrations/make",
    logo: (
      <svg className="w-10 h-10" viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#6D00CC"/>
        <path d="M16 6L8 11v10l8 5 8-5V11l-8-5zM8 16l8 5 8-5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    name: "Zapier",
    description: "Connect to 8,000+ apps and automate document processing without code.",
    href: "/integrations/zapier",
    logo: (
      <svg className="w-10 h-10" viewBox="0 0 32 32" fill="none">
        <path d="M16 0C7.163 0 0 7.163 0 16s7.163 16 16 16 16-7.163 16-16S24.837 0 16 0z" fill="#FF4A00"/>
        <path d="M21.5 14.5h-4v-4a1.5 1.5 0 00-3 0v4h-4a1.5 1.5 0 000 3h4v4a1.5 1.5 0 003 0v-4h4a1.5 1.5 0 000-3z" fill="#fff"/>
      </svg>
    ),
  },
  {
    name: "Airtable",
    description: "Process documents from Airtable records using Automations and Scripts.",
    href: "/integrations/airtable",
    logo: (
      <svg className="w-10 h-10" viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#FCBF49"/>
        <path d="M16 8L26 14V22L16 28L6 22V14L16 8Z" fill="#18BFFF"/>
        <path d="M16 8L26 14L16 18L6 14L16 8Z" fill="#FF6F2C"/>
        <path d="M16 18V28L6 22V14L16 18Z" fill="#F82B60"/>
      </svg>
    ),
  },
  {
    name: "REST API",
    description: "Integrate directly with our API for full control and flexibility.",
    href: "/docs/api-reference",
    logo: (
      <svg className="w-10 h-10" viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#0F172A"/>
        <path d="M10 12l-3 4 3 4M22 12l3 4-3 4M18 10l-4 12" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

export default function IntegrationsPage() {
  return (
    <>
      {renderBreadcrumbSchema([
        { name: "Home", url: `https://${config.domainName}/` },
        { name: "Integrations", url: `https://${config.domainName}/integrations` },
      ])}
      {renderItemListSchema(
        integrations.map((i) => ({
          name: i.name,
          url: `https://${config.domainName}${i.href}`,
          description: i.description,
        }))
      )}
      <Suspense fallback={<div />}>
        <Header />
      </Suspense>
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Integrations</h1>
            <p className="text-lg text-gray-600">
              Connect {config.appName} with your favorite tools to automate PDF conversion.
            </p>
          </div>

          <div className="space-y-4">
            {integrations.map((integration) => (
              <Link
                key={integration.name}
                href={integration.href}
                className="flex items-center gap-5 bg-white rounded-xl border p-6 hover:shadow-md hover:border-gray-300 transition-all group"
              >
                <div className="flex-shrink-0">{integration.logo}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900">
                    {integration.name}
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {integration.description}
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </Link>
            ))}
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
