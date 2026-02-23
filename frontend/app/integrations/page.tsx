import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getSEOTags, renderBreadcrumbSchema, renderItemListSchema } from "@/libs/seo";
import config from "@/config";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata = getSEOTags({
  title: `PDF Generation Integrations - No-Code & API | ${config.appName}`,
  description:
    "Automate PDF generation with no-code platforms and REST API. Connect YourApp to your workflow and generate invoices, certificates, and documents automatically.",
  keywords: [
    "pdf api integrations",
    "zapier pdf",
    "make pdf",
    "bubble pdf",
    "flutterflow pdf",
    "n8n pdf",
    "airtable pdf",
    "automate pdf generation",
    "no-code pdf",
    config.appName,
  ],
  canonicalUrlRelative: "/integrations",
  openGraph: {
    title: `PDF Generation Integrations - No-Code & API | ${config.appName}`,
    description:
      "Automate PDF generation with no-code platforms and REST API. Connect YourApp to your workflow and generate invoices, certificates, and documents automatically.",
    url: `https://${config.domainName}/integrations`,
  },
});

const integrations = [
  {
    name: "Zapier",
    description: "Connect to 8,000+ apps and automate PDF generation without code.",
    href: "/integrations/generate-pdf-with-zapier",
    logo: (
      <svg className="w-10 h-10" viewBox="0 0 32 32" fill="none">
        <path d="M16 0C7.163 0 0 7.163 0 16s7.163 16 16 16 16-7.163 16-16S24.837 0 16 0z" fill="#FF4A00"/>
        <path d="M21.5 14.5h-4v-4a1.5 1.5 0 00-3 0v4h-4a1.5 1.5 0 000 3h4v4a1.5 1.5 0 003 0v-4h4a1.5 1.5 0 000-3z" fill="#fff"/>
      </svg>
    ),
  },
  {
    name: "Make",
    description: "Visual automation platform with advanced data transformation and 1,500+ apps.",
    href: "/integrations/generate-pdf-with-make",
    logo: (
      <svg className="w-10 h-10" viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#6D00CC"/>
        <path d="M16 6L8 11v10l8 5 8-5V11l-8-5zM8 16l8 5 8-5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    name: "Bubble",
    description: "Build web apps visually and generate PDFs with API Connector.",
    href: "/integrations/generate-pdf-with-bubble",
    logo: (
      <svg className="w-10 h-10" viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#0D0D0D"/>
        <circle cx="12" cy="12" r="5" fill="#3B82F6"/>
        <circle cx="20" cy="12" r="5" fill="#8B5CF6"/>
        <circle cx="16" cy="20" r="5" fill="#EC4899"/>
      </svg>
    ),
  },
  {
    name: "FlutterFlow",
    description: "Add PDF generation to your mobile and web apps built with FlutterFlow.",
    href: "/integrations/generate-pdf-with-flutterflow",
    logo: (
      <svg className="w-10 h-10" viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#5925DC"/>
        <path d="M12 24L16 20L20 24H16L12 20L16 16L20 12H12L16 16L12 20V24Z" fill="white"/>
      </svg>
    ),
  },
  {
    name: "n8n",
    description: "Self-hosted workflow automation with 400+ integrations. Open-source.",
    href: "/integrations/generate-pdf-with-n8n",
    logo: (
      <svg className="w-10 h-10" viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#EA4B71"/>
        <text x="16" y="21" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">n8n</text>
      </svg>
    ),
  },
  {
    name: "Airtable",
    description: "Generate PDFs from Airtable records using Automations and Scripts.",
    href: "/integrations/generate-pdf-with-airtable",
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
    name: "Google Sheets & Excel",
    description: "Generate PDFs from spreadsheet data via Make, Zapier, or REST API.",
    href: "/integrations/generate-pdf-with-google-sheets-excel",
    logo: (
      <svg className="w-10 h-10" viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#0F9D58"/>
        <rect x="8" y="8" width="16" height="16" rx="2" fill="white"/>
        <rect x="10" y="11" width="5" height="2" fill="#0F9D58"/>
        <rect x="17" y="11" width="5" height="2" fill="#0F9D58"/>
        <rect x="10" y="15" width="5" height="2" fill="#0F9D58"/>
        <rect x="17" y="15" width="5" height="2" fill="#0F9D58"/>
        <rect x="10" y="19" width="5" height="2" fill="#0F9D58"/>
        <rect x="17" y="19" width="5" height="2" fill="#0F9D58"/>
      </svg>
    ),
  },
  {
    name: "Postman",
    description: "Test and explore our PDF API with Postman. Generate code snippets.",
    href: "/integrations/generate-pdf-with-postman",
    logo: (
      <svg className="w-10 h-10" viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#FF6C37"/>
        <circle cx="16" cy="16" r="8" fill="white"/>
        <path d="M16 10L20 16L16 22L12 16L16 10Z" fill="#FF6C37"/>
      </svg>
    ),
  },
  {
    name: "REST API",
    description: "Integrate directly with our API for full control and flexibility.",
    href: "/integrations/generate-pdf-with-rest-api",
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
            <h1 className="text-4xl font-bold text-gray-900 mb-4">PDF Generation Integrations</h1>
            <p className="text-lg text-gray-600">
              Connect {config.appName} with your favorite tools to automate PDF generation.
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
