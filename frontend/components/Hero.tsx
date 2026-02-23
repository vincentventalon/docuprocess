import Link from "next/link";
import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section className="bg-white dark:bg-slate-950 w-full overflow-hidden">
      <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row items-center lg:items-stretch gap-12 lg:gap-16 px-8 lg:pl-8 lg:pr-0 py-16 lg:py-24">
        <div className="flex flex-col gap-10 lg:gap-14 items-center justify-center text-center lg:text-left lg:items-start lg:justify-start lg:w-[40%] lg:pl-20">
          <h1 className="font-extrabold text-4xl lg:[font-size:clamp(2rem,3vw,3rem)] tracking-tight leading-[1.15]">
            PDF to Markdown
            <br />
            in Seconds
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Extract text from any PDF while preserving structure, headings, and
            formatting. One API call, clean Markdown output.
          </p>
          <div className="flex flex-col gap-3 items-center lg:items-start">
            <div className="flex flex-col xl:flex-row gap-3 items-center lg:items-start">
              <Button asChild size="xl">
                <Link href="/signin">Get Started</Link>
              </Button>
              <Button asChild size="xl" variant="outline">
                <Link href="/docs">View Documentation</Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              1,000 free conversions to start.
            </p>
          </div>
        </div>
        <div className="w-full lg:flex-1 lg:min-w-0 flex items-center justify-center min-h-[400px] lg:min-h-[500px] xl:min-h-[600px]">
          <div className="w-full max-w-2xl bg-slate-900 rounded-xl shadow-2xl p-6 font-mono text-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <pre className="text-green-400 overflow-x-auto">
{`$ curl -X POST https://api.docuprocess.com/v1/convert/pdf-to-markdown \\
  -H "x-api-key: sk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://example.com/document.pdf"}'

{
  "success": true,
  "markdown": "# Introduction\\n\\nThis document...",
  "page_count": 12,
  "credits_used": 1,
  "remaining_credits": 999
}`}
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
