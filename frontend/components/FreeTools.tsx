import Link from "next/link";
import BadgePill from "@/components/ui/badge-pill";
import { FileText, FileCode, FileJson, Table2, FileType, Hash } from "lucide-react";

const tools = [
  {
    icon: FileText,
    title: "PDF to Text",
    description: "Extract raw text from any PDF. Runs in your browser, no upload needed.",
    href: "/tools/pdf-to-text",
    available: true,
  },
  {
    icon: FileCode,
    title: "PDF to Markdown",
    description: "Convert PDF documents into clean Markdown with preserved structure.",
    href: "#",
    available: false,
  },
  {
    icon: FileJson,
    title: "PDF to JSON",
    description: "Extract structured data from PDFs into machine-readable JSON.",
    href: "#",
    available: false,
  },
  {
    icon: Table2,
    title: "Extract Tables",
    description: "Pull tables from PDFs and export them as CSV or JSON.",
    href: "#",
    available: false,
  },
  {
    icon: Hash,
    title: "Word Counter",
    description: "Count words, characters, and pages in any PDF document.",
    href: "#",
    available: false,
  },
  {
    icon: FileType,
    title: "PDF to HTML",
    description: "Convert PDF files into clean, semantic HTML.",
    href: "#",
    available: false,
  },
];

const FreeTools = () => {
  return (
    <section className="w-full py-16 lg:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-12">
          <BadgePill>Free Tools</BadgePill>
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">
            Try it now, no signup required
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Free browser-based tools for common document tasks.
            Everything runs locally — your files never leave your device.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => {
            const content = (
              <div
                key={tool.title}
                className={`p-6 rounded-xl border transition-all ${
                  tool.available
                    ? "border-primary/20 bg-white dark:bg-slate-900 hover:shadow-lg hover:border-primary/40 cursor-pointer"
                    : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 opacity-60"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <tool.icon className={`w-8 h-8 ${tool.available ? "text-primary" : "text-muted-foreground"}`} />
                  {tool.available ? (
                    <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                      Available
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-muted-foreground bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full">
                      Coming soon
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-lg mb-2">{tool.title}</h3>
                <p className="text-sm text-muted-foreground">{tool.description}</p>
              </div>
            );

            if (tool.available) {
              return (
                <Link key={tool.title} href={tool.href}>
                  {content}
                </Link>
              );
            }
            return <div key={tool.title}>{content}</div>;
          })}
        </div>
      </div>
    </section>
  );
};

export default FreeTools;
