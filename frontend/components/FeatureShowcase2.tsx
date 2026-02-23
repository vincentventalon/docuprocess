import Link from "next/link";
import { Button } from "@/components/ui/button";
import BadgePill from "@/components/ui/badge-pill";

const techStack = [
  {
    name: "Next.js 15",
    description: "React 19 with App Router, TypeScript, and Tailwind CSS",
    category: "Frontend",
  },
  {
    name: "FastAPI",
    description: "Python 3.11 with automatic OpenAPI docs and type hints",
    category: "Backend",
  },
  {
    name: "Supabase",
    description: "PostgreSQL database, Auth, and Storage",
    category: "Database",
  },
  {
    name: "Stripe",
    description: "Subscriptions and usage-based billing",
    category: "Payments",
  },
  {
    name: "Vercel",
    description: "Frontend hosting with edge functions",
    category: "Hosting",
  },
  {
    name: "Cloud Run",
    description: "Serverless backend deployment",
    category: "Hosting",
  },
];

const FeatureShowcase2 = () => {
  return (
    <section className="w-full py-12 lg:py-16 overflow-hidden bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-12">
          <BadgePill>Modern stack</BadgePill>
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">
            Built with the best tools
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Production-ready tech stack that scales. No vendor lock-in, full source code access.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
          {techStack.map((tech) => (
            <div
              key={tech.name}
              className="p-6 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            >
              <span className="text-xs font-medium text-primary uppercase tracking-wider">
                {tech.category}
              </span>
              <h3 className="font-semibold text-lg mt-2 mb-1">{tech.name}</h3>
              <p className="text-sm text-muted-foreground">{tech.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button asChild size="lg">
            <Link href="/signin">Start building</Link>
          </Button>
          <p className="text-sm text-muted-foreground mt-3">No credit card required</p>
        </div>
      </div>
    </section>
  );
};

export default FeatureShowcase2;
