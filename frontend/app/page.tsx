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
  title: `API Starter Kit | FastAPI + Next.js + Supabase | ${config.appName}`,
  description:
    "Ship your API product faster with this production-ready SaaS starter kit. FastAPI backend, Next.js frontend, Supabase auth & database, Stripe payments, and team management included.",
  keywords: [
    "API starter kit",
    "FastAPI template",
    "SaaS boilerplate",
    "Next.js starter",
    "Supabase template",
    "API-first SaaS",
    "developer tools",
    "API development",
    config.appName,
  ],
  canonicalUrlRelative: "/",
  openGraph: {
    title: `API Starter Kit | FastAPI + Next.js + Supabase | ${config.appName}`,
    description:
      "Ship your API product faster with this production-ready SaaS starter kit. Auth, payments, teams, and database included.",
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
