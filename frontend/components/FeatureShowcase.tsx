import Link from "next/link";
import { Button } from "@/components/ui/button";
import BadgePill from "@/components/ui/badge-pill";
import { KeyRound, Users, CreditCard, Zap, Database, Plug } from "lucide-react";

const features = [
  {
    icon: KeyRound,
    title: "Authentication & API Keys",
    description: "Supabase Auth with JWT tokens for users, and API key management for programmatic access. Ready to go.",
  },
  {
    icon: Users,
    title: "Team-based multi-tenancy",
    description: "Built-in team management with roles (owner, admin, member). Invite teammates, manage permissions.",
  },
  {
    icon: CreditCard,
    title: "Stripe payments integration",
    description: "Subscriptions, usage-based billing, and credits system. Webhooks configured and ready.",
  },
  {
    icon: Zap,
    title: "FastAPI backend",
    description: "Production-ready Python backend with automatic OpenAPI docs, type safety, and async support.",
  },
  {
    icon: Database,
    title: "Database migrations",
    description: "Supabase PostgreSQL with migration system. Row Level Security policies included.",
  },
  {
    icon: Plug,
    title: "No-code integrations",
    description: "Connect to Zapier, Make, and n8n. Integration templates included in the repo.",
  },
];

const FeatureShowcase = () => {
  return (
    <section className="w-full py-12 lg:py-16 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-12">
          <BadgePill>Everything included</BadgePill>
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">
            Built for API-first products
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Stop rebuilding the same infrastructure. Focus on your core product while we handle auth, payments, and teams.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div key={feature.title} className="p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
              <feature.icon className="w-10 h-10 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button asChild size="lg">
            <Link href="/signin">Get started</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeatureShowcase;
