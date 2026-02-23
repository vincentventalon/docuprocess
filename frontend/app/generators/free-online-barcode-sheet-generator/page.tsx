import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RelatedGenerators from "@/components/RelatedGenerators";
import { getSEOTags, renderFAQSchema, renderBreadcrumbSchema } from "@/libs/seo";
import config from "@/config";
import BarcodeSheetGeneratorClient from "./barcode-sheet-generator-client";
import BarcodeSheetCarousel from "./barcode-sheet-carousel";
import BarcodesDemo from "./barcodes-demo";
import ColumnsDemo from "./columns-demo";
import { Download, Zap, Barcode, Columns3, ArrowRight, Grid3X3, PenTool } from "lucide-react";
import Link from "next/link";
import { HeroGradientBlur } from "@/components/decorative/HeroGradientBlur";
import { fetchGeneratorTemplates } from "@/lib/generators";

export const revalidate = false; // Pure static generation

export const metadata = getSEOTags({
  title: "Free Barcode Sheet Generator - Create Printable Barcode Labels PDF",
  description:
    "Generate printable barcode sheets for inventory and asset tracking. Support for Code 128, Code 39, EAN-13, and more. Download high-quality PDFs instantly - no signup needed.",
  keywords: [
    "free barcode sheet generator",
    "printable barcode labels",
    "barcode label maker",
    "inventory barcode generator",
    "barcode sheet pdf",
    "bulk barcode creator",
    "asset tag generator",
    "product barcode labels",
  ],
  canonicalUrlRelative: "/generators/free-online-barcode-sheet-generator",
  openGraph: {
    title: "Free Barcode Sheet Generator | Printable Barcode Labels PDF",
    description:
      "Create printable barcode sheets for inventory tracking. Code 128, Code 39, EAN-13 supported. Download PDFs free.",
    url: `https://${config.domainName}/generators/free-online-barcode-sheet-generator`,
  },
});

const features = [
  {
    icon: Zap,
    title: "No Account Required",
    description:
      "Start generating barcode sheets right away. Add your product codes, customize the layout, and download up to 5 free PDFs daily.",
  },
  {
    icon: Barcode,
    title: "Multiple Barcode Formats",
    description:
      "Support for Code 128, Code 39, EAN-13, EAN-8, and ITF-14. Choose the format that works with your scanner.",
  },
  {
    icon: Columns3,
    title: "Flexible Grid Layout",
    description:
      "Arrange barcodes in 1 to 6 columns. Ideal for shelf labels, warehouse bins, or product packaging.",
  },
  {
    icon: Download,
    title: "High-Resolution PDF Output",
    description:
      "Every barcode is rendered crisp and clear for reliable scanning, even after printing on standard label paper.",
  },
];

const barcodeFAQ = [
  {
    question: "Is this barcode generator completely free?",
    answer:
      "Yes! Generate up to 5 barcode sheets daily at no cost, no registration required. Need more? Provide your email for 5 extra downloads or create an account for unlimited access.",
  },
  {
    question: "Which barcode formats are supported?",
    answer:
      "We support Code 128 (general-purpose), Code 39 (industrial), EAN-13 (retail products), EAN-8 (small items), and ITF-14 (shipping cartons).",
  },
  {
    question: "How many barcodes fit on a single sheet?",
    answer:
      "As many as you need. The PDF automatically extends to multiple pages when your barcode list exceeds a single A4 page.",
  },
  {
    question: "Will the barcodes scan correctly when printed?",
    answer:
      "Absolutely. Barcodes are rendered at high resolution specifically for print, ensuring reliable reads from any standard barcode scanner.",
  },
  {
    question: "Can I generate barcode sheets programmatically?",
    answer:
      "Yes! Our API lets you automate barcode sheet generation for warehouse management, inventory systems, and e-commerce platforms.",
  },
];

export default async function FreeBarcodeSheetGeneratorPage() {
  const templatesData = await fetchGeneratorTemplates("barcode-sheet");

  return (
    <>
      {renderFAQSchema(barcodeFAQ)}
      {renderBreadcrumbSchema([
        { name: "Home", url: `https://${config.domainName}/` },
        { name: "Generators", url: `https://${config.domainName}/generators` },
        { name: "Barcode Sheet Generator", url: `https://${config.domainName}/generators/free-online-barcode-sheet-generator` },
      ])}
      <Suspense fallback={<div />}>
        <Header />
      </Suspense>
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="relative border-b border-gray-200 overflow-hidden">
          <HeroGradientBlur />
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center mx-auto">
              <div className="inline-flex items-center gap-3 bg-primary/5 rounded-full pl-1 pr-4 py-1 mb-4 mt-8">
                <span className="bg-white text-primary text-[14px] font-medium px-3 py-1 rounded-full shadow-sm leading-[20px]">Generators</span>
                <span className="text-primary text-[14px] font-medium leading-[20px]">Free Barcode Sheet Generator</span>
              </div>
              <h1 className="font-semibold text-pretty text-4xl sm:text-5xl text-gray-900 mb-4 tracking-[-1.2px] leading-[50.4px]">
                Free Barcode Sheet Maker
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Generate printable barcode labels for inventory, products, and assets.
              </p>
              <Link
                href="#generator"
                className="inline-flex items-center justify-center px-8 py-4 bg-primary text-white text-lg font-semibold rounded-lg hover:bg-primary/90 transition-colors"
              >
                Create a Barcode Sheet Now
              </Link>
            </div>
          </div>
        </section>

        {/* Barcode Sheet Templates Carousel + API Promo */}
        <section className="bg-gray-50 border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Carousel */}
              <div className="flex justify-center lg:order-2">
                <Suspense
                  fallback={
                    <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm w-[500px] max-w-full aspect-[500/707] flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                    </div>
                  }
                >
                  <BarcodeSheetCarousel templates={templatesData?.templates} />
                </Suspense>
              </div>
              {/* Text Content */}
              <div className="lg:order-1">
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  Generate Barcode Sheets Online
                </h2>
                <p className="text-gray-600 mb-3">
                  Create printable barcode sheets for inventory management, asset tagging, warehouse operations, product labels, and more. Enter your codes and generate a professional PDF in seconds.
                </p>
                <p className="text-gray-600 mb-8">
                  <span className="font-medium text-gray-700">Want more templates?</span>{" "}
                  <Link href="/templates" className="text-primary hover:underline">See all our templates</Link>
                </p>
                <p className="text-gray-600 mb-3">
                  Simply add your barcode data, choose how many columns you need, and download your PDF. You can create up to 5 free barcode sheets per day.
                </p>
                <p className="text-gray-600 mb-8">
                  <span className="font-medium text-gray-700">Need more?</span>{" "}
                  <Link href="/signin" className="text-primary hover:underline">Sign up for {config.stripe.freeTier.credits} free PDFs per month</Link>
                </p>
                <p className="text-gray-600 mb-3">
                  Need to automate the process? Use our API or Zapier integration to generate barcode sheets in bulk — perfect for warehouse operations and inventory systems.
                </p>
                <p className="text-gray-600 mb-8">
                  <span className="font-medium text-gray-700">Ready to automate?</span>{" "}
                  <Link href="/docs" className="text-primary hover:underline">View our API docs</Link>{" "}
                  or{" "}
                  <Link href="/integrations/generate-pdf-with-zapier" className="text-primary hover:underline">Connect with Zapier</Link>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-gray-200 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-32">
              {/* Vertical line */}
              <div className="hidden sm:block absolute left-1/2 top-8 bottom-8 w-[3px] bg-gray-200 -translate-x-1/2" />
              {/* Horizontal line */}
              <div className="hidden sm:block absolute top-1/2 left-[10%] right-[10%] h-[3px] bg-gray-200 -translate-y-1/2" />
              {features.map((feature) => (
                <div key={feature.title} className="text-center py-4">
                  <h3 className="text-3xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <svg className="mx-auto mb-4" width="150" height="8" viewBox="0 0 150 8" fill="none">
                    <path d="M0 4C5 0 10 8 15 4C20 0 25 8 30 4C35 0 40 8 45 4C50 0 55 8 60 4C65 0 70 8 75 4C80 0 85 8 90 4C95 0 100 8 105 4C110 0 115 8 120 4C125 0 130 8 135 4C140 0 145 8 150 4" stroke="currentColor" strokeWidth="4" className="text-primary/40" strokeLinecap="round" />
                  </svg>
                  <p className="text-gray-600 text-lg max-w-md mx-auto">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Generator Tool */}
        <section id="generator" className="border-t border-gray-200 bg-gray-50 scroll-mt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Create Your Barcode Sheet
            </h2>
            <Suspense
              fallback={
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              }
            >
              <BarcodeSheetGeneratorClient
                preloadedTemplates={templatesData?.templates}
                defaultTemplateId={templatesData?.default_template_id}
              />
            </Suspense>
          </div>
        </section>

        {/* Extra Features */}
        <section className="border-t border-gray-200 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="space-y-14">
              <div className="flex items-start gap-6 sm:gap-8">
                <Grid3X3 className="w-12 h-12 sm:w-16 sm:h-16 text-gray-900 shrink-0 stroke-[1.5]" />
                <div>
                  <BarcodesDemo />
                  <p className="text-gray-600 text-lg">
                    Add as many barcodes as you need. Our sheets automatically handle multi-page layouts with proper spacing and formatting — no manual adjustments required.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-6 sm:gap-8">
                <Columns3 className="w-12 h-12 sm:w-16 sm:h-16 text-gray-900 shrink-0 stroke-[1.5]" />
                <div>
                  <ColumnsDemo />
                  <p className="text-gray-600 text-lg">
                    Choose between 1 and 6 columns to fit your needs. Perfect for small asset labels with 6 columns, or large scannable codes with 2 columns.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-6 sm:gap-8">
                <PenTool className="w-12 h-12 sm:w-16 sm:h-16 text-gray-900 shrink-0 stroke-[1.5]" />
                <div>
                  <Link href="/signin" className="inline-flex items-center gap-2 bg-primary text-white text-2xl font-semibold px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors mb-4">
                    <h3>Design Your Own</h3>
                    <ArrowRight className="w-6 h-6" />
                  </Link>
                  <p className="text-gray-600 text-lg">
                    Go beyond our pre-built designs. Create your own barcode templates from scratch with complete control over the layout, colors, labels, and every detail of the final result.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-gray-200 bg-gray-50">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {barcodeFAQ.map((faq) => (
                <details key={faq.question} className="group bg-white rounded-lg border border-gray-200">
                  <summary className="flex items-center justify-between p-5 cursor-pointer">
                    <span className="font-medium text-gray-900">{faq.question}</span>
                    <span className="ml-4 text-gray-400 group-open:rotate-180 transition-transform">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </summary>
                  <p className="px-5 pb-5 text-gray-600">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Related Generators */}
        <RelatedGenerators currentSlug="free-online-barcode-sheet-generator" />
      </main>
      <Footer />
    </>
  );
}
