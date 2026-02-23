import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import BadgePill from "@/components/ui/badge-pill";

const features = [
  {
    number: "1",
    title: "Use system variables",
    description: "Access page numbers, total pages, and current date and more automatically with {{sys.page_number}} and friends.",
    positions: [{ top: "12%", left: "44%" }],
  },
  {
    number: "2",
    title: "Customize every component",
    description: "Fine-tune content, borders, colors, sizes, positions, and more. Each element has its own properties panel.",
    positions: [{ top: "18%", left: "90%" }],
  },
  {
    number: "3",
    title: "Built-in functions",
    description: "Format dates, calculate totals, round numbers, and more. Use 100+ built-in functions or create your own.",
    positions: [{ top: "79%", left: "40%" }],
  },
];

const NumberBadge = ({
  number,
  className = "",
}: {
  number: string;
  className?: string;
}) => (
  <span
    className={`inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-primary text-xs font-bold border border-slate-200 dark:border-slate-700 ${className}`}
  >
    {number}
  </span>
);

const FeatureShowcase2 = () => {
  return (
    <section className="w-full py-12 lg:py-16 overflow-hidden">
      <div className="max-w-[90rem] mx-auto pl-6 lg:pl-8 pr-6 lg:pr-0">
        <div className="lg:pl-20">
          <BadgePill>Easy to use</BadgePill>
        </div>
        <div className="flex flex-col-reverse lg:flex-row items-start gap-12 lg:gap-24">
          {/* Text content */}
          <div className="w-full lg:w-2/5 lg:pl-20">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">
              Documents that adapt to your data
            </h2>
            <p className="text-lg text-muted-foreground mb-10">
              Go beyond simple placeholders. Use expressions to format, calculate, and control your content.
            </p>

            <div className="space-y-6">
              {features.map((feature) => (
                <div key={feature.number}>
                  <div className="flex items-center gap-3 mb-2">
                    <NumberBadge number={feature.number} className="flex-shrink-0" />
                    <h3 className="font-semibold text-lg">{feature.title}</h3>
                  </div>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 flex items-center gap-4">
              <Button asChild size="lg">
                <Link href="/signin">Start building</Link>
              </Button>
              <p className="text-sm text-muted-foreground">No credit card required</p>
            </div>
          </div>

          {/* Image */}
          <div className="w-full lg:w-1/2">
            <div className="relative aspect-[16/10] rounded-xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700">
              <Image
                src="/section2.png"
                alt="Template editor with expressions"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 60vw"
              />
              {/* Numbered markers */}
              {features.flatMap((feature) =>
                feature.positions.map((pos, idx) => (
                  <div
                    key={`${feature.number}-${idx}`}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
                    style={{ top: pos.top, left: pos.left }}
                  >
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-primary text-xs font-bold border border-slate-200 dark:border-slate-700">
                      {feature.number}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureShowcase2;
