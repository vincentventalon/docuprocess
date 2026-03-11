import { Suspense } from 'react'
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import FeatureShowcase from '@/components/FeatureShowcase';
import FreeTools from '@/components/FreeTools';
import { getSEOTags, renderSchemaTags, renderWebSiteSchema } from "@/libs/seo";
import config from "@/config";

export const metadata = getSEOTags({
  title: `Document Parsing for AI | ${config.appName}`,
  description:
    "Turn PDFs and documents into clean, structured data for LLMs, RAG pipelines, and AI workflows. Free tools available, API launching soon.",
  keywords: [
    "document parsing",
    "document parsing API",
    "PDF to text",
    "PDF to Markdown",
    "AI document processing",
    "RAG pipeline",
    "LLM document extraction",
    "PDF parser",
    "document extraction API",
    "AI-ready data",
    config.appName,
  ],
  canonicalUrlRelative: "/",
  openGraph: {
    title: `Document Parsing for AI | ${config.appName}`,
    description:
      "Turn any document into AI-ready data. Free tools available, API launching soon.",
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
        <FreeTools />
        <FeatureShowcase />
      </main>
      <Footer />
    </>
  );
}
