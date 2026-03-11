import BadgePill from "@/components/ui/badge-pill";
import { Brain, FileText, Table2, Zap, Lock, Code } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Optimized Output",
    description:
      "Get clean Markdown and structured data that LLMs can process directly. No post-processing needed for your RAG pipeline.",
  },
  {
    icon: FileText,
    title: "Complex Layout Handling",
    description:
      "Multi-column layouts, headers, footers, sidebars — we parse them all and preserve the logical reading order.",
  },
  {
    icon: Table2,
    title: "Table & Structure Extraction",
    description:
      "Tables, lists, and hierarchical data are detected and converted into structured formats your AI can understand.",
  },
  {
    icon: Zap,
    title: "Fast & Scalable",
    description:
      "Process thousands of documents in minutes. Built for production workloads, not just demos.",
  },
  {
    icon: Lock,
    title: "Privacy-First",
    description:
      "Your documents are processed and deleted. No data retention, no training on your files. SOC 2 compliance on the roadmap.",
  },
  {
    icon: Code,
    title: "Simple API",
    description:
      "One endpoint, one API call. Send a PDF, get structured text back. SDKs for Python, TypeScript, and more.",
  },
];

const FeatureShowcase = () => {
  return (
    <section className="w-full py-16 lg:py-24 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-12">
          <BadgePill>Why ParseDocu</BadgePill>
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">
            Document parsing that AI teams actually need
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Stop wrestling with PDF libraries and regex.
            Get structured, AI-ready output from any document.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            >
              <feature.icon className="w-10 h-10 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureShowcase;
