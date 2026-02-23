import { getSEOTags, renderFAQSchema, renderBreadcrumbSchema, renderSchemaTags } from "@/libs/seo";
import config from "@/config";
import PricingClient from "./PricingClient";

export const metadata = getSEOTags({
  title: `PDF API Pricing - Free to Start | ${config.appName}`,
  description:
    `Start free with ${config.stripe.freeTier.credits} PDFs. Paid plans from $${config.stripe.plans[0].price}/mo with up to ${config.stripe.plans[1].credits?.toLocaleString()} PDFs, unlimited templates, and custom storage. No credit card required. Cancel anytime.`,
  keywords: [
    "pdf api pricing",
    "pdf generation pricing",
    "html to pdf pricing",
    "pdf api plans",
    "pdf template api cost",
    config.appName,
  ],
  canonicalUrlRelative: "/pricing",
  openGraph: {
    title: `PDF API Pricing - Free to Start | ${config.appName}`,
    description:
      `Start free with ${config.stripe.freeTier.credits} PDFs. Flexible plans for every team size. No credit card required.`,
    url: `https://${config.domainName}/pricing`,
  },
});

const pricingFAQ = [
  {
    question: "What is PDF Template API?",
    answer:
      "A simple API to generate PDFs from templates. Design your template once with our visual editor, then generate thousands of PDFs by sending data via API. Perfect for invoices, certificates, reports, shipping labels, and any document you need to automate.",
  },
  {
    question: "Do I need to know how to code?",
    answer:
      "To design templates: No. Our visual drag-and-drop editor requires no coding skills. To generate PDFs: Basic API knowledge helps, but we provide copy-paste examples for cURL, Python, Node.js, and PHP.",
  },
  {
    question: "How does it work?",
    answer:
      "Three simple steps: Design your template with our visual editor, add dynamic variables (like {{customer_name}}), and call our API with your data to generate PDFs.",
  },
  {
    question: "How fast is PDF generation?",
    answer:
      "Most PDFs generate in 1-3 seconds. Speed depends on template complexity and number of pages.",
  },
  {
    question: "What output formats are available?",
    answer:
      "You can get your PDF as a signed URL (link expires after a set time) or binary data (direct download).",
  },
  {
    question: "Do you store my PDFs?",
    answer:
      "PDFs are temporarily stored and accessible via signed URL (you choose the expiration time: 1 minute to 7 days). After expiration, they are automatically deleted.",
  },
  {
    question: "Is there a free plan?",
    answer:
      `Yes! You get ${config.stripe.freeTier.credits} free PDFs at signup. No credit card required to start.`,
  },
  {
    question: "Can I bring my own storage?",
    answer:
      "Yes! You can connect your own S3-compatible storage (AWS S3, Cloudflare R2, etc.) and we'll upload generated PDFs directly there.",
  },
];

export default function PricingPage() {
  return (
    <>
      {renderSchemaTags()}
      {renderFAQSchema(pricingFAQ)}
      {renderBreadcrumbSchema([
        { name: "Home", url: `https://${config.domainName}/` },
        { name: "Pricing", url: `https://${config.domainName}/pricing` },
      ])}
      <PricingClient />
    </>
  );
}
