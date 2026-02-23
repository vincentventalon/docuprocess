import { Suspense } from 'react'
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import FeatureShowcase from '@/components/FeatureShowcase';
import FeatureShowcase2 from '@/components/FeatureShowcase2';
import TemplateShowcase from '@/components/TemplateShowcase';
import Integrations from '@/components/Integrations';
import { getSEOTags, renderSchemaTags, renderWebSiteSchema } from "@/libs/seo";
import config from "@/config";

export const metadata = getSEOTags({
  title: `Free PDF Generator & API for Developers | ${config.appName}`,
  description:
    "Design PDF templates with our visual drag-and-drop editor, then generate thousands via API. Free invoice, certificate, and label generators. No coding required. Start free with 100 PDFs/month.",
  keywords: [
    "free PDF generator",
    "PDF API",
    "PDF template editor",
    "PDF generation API",
    "invoice generator",
    "certificate maker",
    "no-code PDF tool",
    "document automation",
    "visual PDF designer",
    config.appName,
  ],
  canonicalUrlRelative: "/",
  openGraph: {
    title: `Free PDF Generator & API for Developers | ${config.appName}`,
    description:
      "Design PDF templates visually, generate thousands via API. Free invoice, certificate, and label generators included.",
    url: `https://${config.domainName}/`,
  },
});

export default function Home() {
  return (
    <>
      <Suspense>
        <Header />
      </Suspense>
      <main>
        {renderSchemaTags()}
        {renderWebSiteSchema()}
        <Hero />
        <FeatureShowcase />
        <FeatureShowcase2 />
        <Integrations />
        <TemplateShowcase />
      </main>
      <Footer />
    </>
  );
}