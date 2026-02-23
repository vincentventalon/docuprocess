import Link from "next/link";
import { Button } from "@/components/ui/button";
import BadgePill from "@/components/ui/badge-pill";
import { FileText, Layout, Table2, Zap, DollarSign, Code } from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Accurate Text Extraction",
    description:
      "Extract text from any PDF with high accuracy. Handles scanned documents, multi-column layouts, and complex formatting.",
  },
  {
    icon: Layout,
    title: "Layout Preservation",
    description:
      "Maintains document structure including headings, paragraphs, lists, and indentation. Your Markdown looks like the original.",
  },
  {
    icon: Table2,
    title: "Table Recognition",
    description:
      "Automatically detects and converts tables to Markdown format. Perfect for data-heavy documents and reports.",
  },
  {
    icon: Zap,
    title: "Fast Processing",
    description:
      "Convert PDFs in seconds, not minutes. Our optimized pipeline handles large documents with ease.",
  },
  {
    icon: DollarSign,
    title: "Simple Pricing",
    description:
      "Pay per conversion with no monthly minimums. Start free with 1,000 credits, then pay as you grow.",
  },
  {
    icon: Code,
    title: "API-First Design",
    description:
      "Built for developers. Clean REST API, comprehensive docs, and SDKs for popular languages.",
  },
];

const FeatureShowcase = () => {
  return (
    <section className="w-full py-12 lg:py-16 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-12">
          <BadgePill>Why DocuProcess</BadgePill>
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">
            Built for developers who need clean text
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Stop wrestling with PDF parsing libraries. Our API handles the
            complexity so you can focus on your product.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            >
              <feature.icon className="w-10 h-10 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button asChild size="lg">
            <Link href="/signin">Start converting for free</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeatureShowcase;
