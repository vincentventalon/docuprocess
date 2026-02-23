import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import BadgePill from "@/components/ui/badge-pill";
import config from "@/config";

const features = [
  {
    number: "1",
    title: "Headers & footers that just work",
    description: "Define once, repeat on every page automatically. Perfect for logos, page numbers, and legal mentions.",
    // Positions on image (percentage) - supports multiple positions
    positions: [
      { top: "4%", left: "50%" },   // Header
      // { top: "96%", left: "50%" },  // Footer
    ],
  },
  {
    number: "2",
    title: "Dynamic data binding",
    description: "Inject any data into your templates. Names, addresses, prices, etc. — everything updates automatically.",
    positions: [{ top: "25%", left: "15%" }],
  },
  {
    number: "3",
    title: "Tables that grow with your data",
    description: "Rows grow automatically with your data. 3 items or 300, the table adapts and spans multiple pages if needed.",
    positions: [{ top: "40%", left: "15%" }],
  },
  {
    number: "4",
    title: "Built-in QR codes & barcodes",
    description: "Generated on the fly from your data. Supports Code128, EAN-13, QR codes and more — all scanner-ready.",
    positions: [{ top: "14.5%", left: "84%" }],
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

const FeatureShowcase = () => {
  return (
    <section className="w-full py-12 lg:py-16 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          <div className="hidden lg:block lg:w-1/2 flex-shrink-0"></div>
          <div className="lg:w-1/2">
            <BadgePill>Looks great</BadgePill>
          </div>
        </div>
        <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-16">
          {/* Image with numbered markers */}
          <div className="relative w-full lg:w-1/2 flex-shrink-0">
            <div className="relative aspect-[210/297] max-w-md mx-auto lg:mx-0 rounded-xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700">
              <Image
                src="/packing-slip-1.png"
                alt="PDF template example - Packing Slip"
                fill
                className="object-cover object-top"
                sizes="(max-width: 768px) 100vw, 50vw"
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

          {/* Text content */}
          <div className="w-full lg:w-1/2">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">
              Built for real-world documents
            </h2>
            <p className="text-lg text-muted-foreground mb-10">
              Everything you need to create professional business documents, from invoices to packing slips.
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
                <Link href="/signin">Try it free</Link>
              </Button>
              <p className="text-sm text-muted-foreground">{config.stripe.freeTier.credits} free PDFs/month</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureShowcase;
