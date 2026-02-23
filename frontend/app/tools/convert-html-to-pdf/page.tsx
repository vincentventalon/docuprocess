import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getSEOTags, renderBreadcrumbSchema } from "@/libs/seo";
import config from "@/config";
import ToolsPageClient from "../tools-page-client";

export const metadata = getSEOTags({
  title: `Convert HTML to PDF | ${config.appName}`,
  description:
    "Convert a URL, an uploaded HTML file, or pasted HTML code into a PDF directly in your browser. Free and client-side.",
  keywords: [
    "convert html to pdf",
    "url to pdf",
    "html file to pdf",
    "online pdf converter",
    config.appName,
  ],
  canonicalUrlRelative: "/tools/convert-html-to-pdf",
  openGraph: {
    title: `Convert HTML to PDF | ${config.appName}`,
    description:
      "A free browser tool to turn URLs or HTML into PDFs with simple options for size, orientation, and margins.",
    url: `https://${config.domainName}/tools/convert-html-to-pdf`,
  },
});

export default function ConvertHtmlToPdfPage() {
  return (
    <>
      {renderBreadcrumbSchema([
        { name: "Home", url: `https://${config.domainName}/` },
        { name: "Tools", url: `https://${config.domainName}/tools` },
        { name: "Convert HTML to PDF", url: `https://${config.domainName}/tools/convert-html-to-pdf` },
      ])}
      <Suspense fallback={<div />}>
        <Header />
      </Suspense>
      <ToolsPageClient />
      <Footer />
    </>
  );
}
