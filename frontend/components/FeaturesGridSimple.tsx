import React from "react";
import {
  Palette,
  Zap,
  RefreshCw,
  Download,
  CreditCard,
  Workflow,
} from "lucide-react";
import config from "@/config";

const features = [
  {
    icon: Palette,
    title: "Visual Template Editor",
    description:
      "Design your PDF templates with our drag-and-drop editor. No HTML/CSS knowledge required.",
    iconBg: "bg-violet-100 dark:bg-violet-900/30",
    iconColor: "text-violet-600 dark:text-violet-400",
  },
  {
    icon: Zap,
    title: "Simple REST API",
    description:
      "One API call to generate a PDF. Integrate in 5 minutes with any language.",
    iconBg: "bg-amber-100 dark:bg-amber-900/30",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  {
    icon: RefreshCw,
    title: "Dynamic Data",
    description:
      "Pass JSON data to your templates. Perfect for invoices, reports, certificates with dynamic content.",
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    icon: Download,
    title: "URL or Binary Export",
    description:
      "Get a signed URL or download the PDF directly. Choose what fits your workflow.",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    icon: CreditCard,
    title: "Affordable Plans",
    description:
      `Start free with ${config.stripe.freeTier.credits} PDFs/month. Upgrade to ${config.stripe.plans[0].name} ($${config.stripe.plans[0].price}) or ${config.stripe.plans[1].name} ($${config.stripe.plans[1].price}) as you grow.`,
    iconBg: "bg-rose-100 dark:bg-rose-900/30",
    iconColor: "text-rose-600 dark:text-rose-400",
  },
  {
    icon: Workflow,
    title: "Zapier Integration",
    description:
      "Connect to 8,000+ apps with Zapier. Generate PDFs automatically from forms, CRMs, and more. No code required.",
    iconBg: "bg-orange-100 dark:bg-orange-900/30",
    iconColor: "text-orange-600 dark:text-orange-400",
  },
];

const FeaturesGrid = () => {
  return (
    <section
      id="features"
      className="flex justify-center items-center w-full py-20 lg:py-32"
    >
      <div className="flex flex-col max-w-[82rem] gap-16 md:gap-20 px-4">
        <div className="space-y-6">
          <h2 className="max-w-3xl font-black text-4xl md:text-6xl tracking-[-0.01em]">
            Design once.{" "}
            <span className="underline decoration-dashed underline-offset-8 decoration-muted-foreground/30">
              Generate forever.
            </span>
          </h2>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Create your template with our visual editor, then generate thousands
            of PDFs with a simple API call. No design skills required.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group bg-background border border-border rounded-2xl p-8 flex flex-col gap-4 transition-all duration-300 hover:shadow-lg hover:shadow-black/5 hover:border-border/80 hover:-translate-y-1"
            >
              <div
                className={`${feature.iconBg} w-12 h-12 rounded-xl flex items-center justify-center`}
              >
                <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
              </div>
              <h3 className="font-semibold text-xl tracking-tight">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;
