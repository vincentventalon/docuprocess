import Link from "next/link";
import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section className="bg-white dark:bg-slate-950 w-full overflow-hidden">
      <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row items-center lg:items-stretch gap-12 lg:gap-16 px-8 lg:pl-8 lg:pr-0 py-16 lg:py-24">
        <div className="flex flex-col gap-10 lg:gap-14 items-center justify-center text-center lg:text-left lg:items-start lg:justify-start lg:w-[40%] lg:pl-20">
          <h1 className="font-extrabold text-4xl lg:[font-size:clamp(2rem,3vw,3rem)] tracking-tight leading-[1.15]">
            PDF Generation API
            <br />
            for Developers
            <br />
            and No-Code
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Design templates visually, then generate thousands of PDFs with a
            simple API call or Zapier automation. Perfect for invoices,
            certificates, reports, and more.
          </p>
          <div className="flex flex-col gap-3 items-center lg:items-start">
            <div className="flex flex-col xl:flex-row gap-3 items-center lg:items-start">
              <Button asChild size="xl">
                <Link href="/signin">Get Started for Free</Link>
              </Button>
              <Button asChild size="xl" variant="outline">
                <Link href="/docs">API & Designer Documentation</Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              No credit card required.
            </p>
          </div>
        </div>
        <div className="w-full lg:flex-1 lg:min-w-0 flex items-start min-h-[400px] lg:min-h-[500px] xl:min-h-[600px]">
          <video
            src="/hero-video.webm"
            poster="/hero-poster.webp"
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            className="w-auto h-[400px] lg:h-[500px] xl:h-[600px] max-w-none rounded-l-xl shadow-2xl"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
