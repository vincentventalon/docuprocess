import Link from "next/link";
import BadgePill from "@/components/ui/badge-pill";
import ButtonLead from "@/components/ButtonLead";
import { FileText, ArrowRight } from "lucide-react";

const Hero = () => {
  return (
    <section className="bg-white dark:bg-slate-950 w-full overflow-hidden">
      <div className="max-w-5xl mx-auto flex flex-col items-center gap-10 lg:gap-14 px-8 py-20 lg:py-32 text-center">
        <BadgePill>Document Parsing for AI</BadgePill>

        <h1 className="font-extrabold text-4xl lg:text-6xl tracking-tight leading-[1.1]">
          Turn any document into
          <br />
          <span className="text-primary">AI-ready data</span>
        </h1>

        <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-2xl">
          Extract clean, structured text from PDFs and documents.
          Built for LLMs, RAG pipelines, and AI workflows.
        </p>

        <div className="flex flex-col items-center gap-4">
          <p className="text-sm font-medium text-foreground">
            API launching soon. Join the waitlist:
          </p>
          <ButtonLead />
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="w-4 h-4" />
          <span>Or try our</span>
          <Link
            href="/tools/pdf-to-text"
            className="text-primary font-medium hover:underline inline-flex items-center gap-1"
          >
            free tools
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
