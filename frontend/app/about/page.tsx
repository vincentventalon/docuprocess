import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getSEOTags } from "@/libs/seo";
import config from "@/config";
import { User, Code, Zap, Heart } from "lucide-react";
import Link from "next/link";

export const metadata = getSEOTags({
  title: `About ${config.appName}`,
  description: `Learn about ${config.appName} and the team behind it.`,
  keywords: [
    "about",
    config.appName,
  ],
  canonicalUrlRelative: "/about",
  openGraph: {
    title: `About ${config.appName}`,
    description: `Learn about ${config.appName} and the team behind it.`,
    url: `https://${config.domainName}/about`,
  },
});

export default function AboutPage() {
  return (
    <>
      <Suspense fallback={<div />}>
        <Header />
      </Suspense>

      {/* Hero Section */}
      <section className="bg-slate-50 dark:bg-slate-900 w-full">
        <div className="max-w-4xl mx-auto px-8 py-20 lg:py-28 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
            <User className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-extrabold text-4xl lg:text-5xl tracking-tight mb-4">
            About {config.appName}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Built by developers, for developers.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20 lg:py-28">
        <div className="max-w-4xl mx-auto px-8">
          <div className="flex flex-col gap-12">
            {/* Meet the Team */}
            <div className="border rounded-2xl p-8 hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="font-bold text-2xl tracking-tight pt-1.5">
                  Meet the Team
                </h2>
              </div>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  {config.appName} is built by a passionate team of developers
                  who care about creating great software.
                </p>
                <p>
                  We built {config.appName} to solve a real problem we faced
                  ourselves. Every solution we tried was either too complex,
                  too expensive, or produced inconsistent results.
                </p>
                {/* Add your social links here */}
                {/* <div className="flex gap-3 pt-2">
                  <a href="https://x.com/your_handle" target="_blank" rel="noopener noreferrer">Twitter</a>
                  <a href="https://linkedin.com/in/your-profile" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                </div> */}
              </div>
            </div>

            {/* Why We Built This */}
            <div className="border rounded-2xl p-8 hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-violet-100 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Code className="w-6 h-6 text-violet-600" />
                </div>
                <h2 className="font-bold text-2xl tracking-tight pt-1.5">
                  Why We Built {config.appName}
                </h2>
              </div>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  We identified a gap in the market and decided to build the
                  tool we wished existed: simple, fast, and reliable.
                </p>
                <p>
                  {config.appName} handles the complexity for you. It works with
                  any stack and integrates in minutes.
                </p>
              </div>
            </div>

            {/* What Drives Us */}
            <div className="border rounded-2xl p-8 hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-emerald-100 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-emerald-600" />
                </div>
                <h2 className="font-bold text-2xl tracking-tight pt-1.5">
                  What Drives {config.appName}
                </h2>
              </div>
              <ul className="space-y-3 ml-1">
                {[
                  "**Simplicity first** — If it takes more than 5 minutes to get started, something is wrong.",
                  "**Reliability matters** — Your workflows need to work every time, without fail.",
                  "**Developer experience** — Clear docs, predictable behavior, and an API that works the way you expect.",
                  "**Fair pricing** — Pay for what you use. No surprises, no hidden fees.",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span
                      className="text-muted-foreground leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: item.replace(
                          /\*\*(.*?)\*\*/g,
                          '<strong class="text-foreground">$1</strong>'
                        ),
                      }}
                    />
                  </li>
                ))}
              </ul>
            </div>

            {/* Built With Care */}
            <div className="border rounded-2xl p-8 hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-rose-100 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Heart className="w-6 h-6 text-rose-600" />
                </div>
                <h2 className="font-bold text-2xl tracking-tight pt-1.5">
                  Built With Care
                </h2>
              </div>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  {config.appName} is an independently built product, crafted
                  with attention to detail and a genuine focus on solving real
                  problems.
                </p>
                <p>
                  Every feature exists because a real user needed it. We read
                  every support email and ship improvements constantly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-slate-50 dark:bg-slate-900 py-16">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="font-bold text-2xl tracking-tight mb-4">
            Want to get in touch?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-6">
            Have a question, feedback, or just want to say hi? We&apos;d love to
            hear from you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`mailto:${config.resend.supportEmail}`}
              className="btn btn-primary"
            >
              Send us an email
            </a>
            <Link href="/docs" className="btn btn-outline">
              Read the docs
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
