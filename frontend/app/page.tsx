import { Suspense } from 'react'
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import FeatureShowcase from '@/components/FeatureShowcase';
import FeatureShowcase2 from '@/components/FeatureShowcase2';
import Integrations from '@/components/Integrations';
import { getSEOTags, renderSchemaTags, renderWebSiteSchema } from "@/libs/seo";
import config from "@/config";

export const metadata = getSEOTags({
  title: `PDF to Markdown API | ${config.appName}`,
  description:
    "Extract text from any PDF while preserving structure, headings, and formatting. One API call, clean Markdown output. Start free with 1,000 conversions.",
  keywords: [
    "PDF to Markdown",
    "PDF API",
    "PDF text extraction",
    "convert PDF to text",
    "PDF parser API",
    "document conversion API",
    "Markdown conversion",
    "PDF processing",
    config.appName,
  ],
  canonicalUrlRelative: "/",
  openGraph: {
    title: `PDF to Markdown API | ${config.appName}`,
    description:
      "Extract text from any PDF while preserving structure. One API call, clean Markdown output.",
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
      </main>
      <Footer />
    </>
  );
}
