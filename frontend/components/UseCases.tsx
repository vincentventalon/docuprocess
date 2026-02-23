import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import BadgePill from "@/components/ui/badge-pill";

const useCases = [
  "Contracts",
  "PDF reports",
  "Sales reports",
  "Invoices",
  "Packing slips",
  "Label sheets",
  "Certifications",
  "Agreements",
  "Purchase orders",
  "Delivery notes",
  "Payslips",
  "Coupons",
  "Credit notes",
  "Dispatch labels",
  "Shipping labels",
];

const UseCases = () => {
  return (
    <section className="w-full py-12 lg:py-16 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          <div className="lg:w-1/2">
            <BadgePill>Build literally anything</BadgePill>
          </div>
          <div className="hidden lg:block lg:w-1/2 flex-shrink-0"></div>
        </div>
        <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-16">
          {/* Text content */}
          <div className="w-full lg:w-1/2">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">
              Use cases for PDF generation
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              YourApp makes it simple to design PDF templates and generate beautiful documents using JSON data via REST API or no-code tools.
            </p>

            <ul className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3">
              {useCases.map((useCase) => (
                <li key={useCase} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                  <span className="text-muted-foreground">{useCase}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex items-center gap-4">
              <Button asChild size="lg">
                <Link href="/signin">Start building yours</Link>
              </Button>
              <p className="text-sm text-muted-foreground">No credit card required</p>
            </div>
          </div>

          {/* Image */}
          <div className="relative w-full lg:w-1/2 flex-shrink-0">
            <div className="relative aspect-[210/297] max-w-md mx-auto rounded-xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700">
              <Image
                src="/european_invoice_with_tva.png"
                alt="PDF template example - Invoice"
                fill
                className="object-cover object-top"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UseCases;
