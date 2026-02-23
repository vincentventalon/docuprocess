import Link from "next/link";
import BadgePill from "@/components/ui/badge-pill";

const integrations = [
  {
    name: "n8n",
    href: "/integrations/n8n",
    color: "#EA4B71",
  },
  {
    name: "Make",
    href: "/integrations/make",
    color: "#6D00CC",
  },
  {
    name: "Zapier",
    href: "/integrations/zapier",
    color: "#FF4A00",
  },
  {
    name: "Airtable",
    href: "/integrations/airtable",
    color: "#18BFFF",
  },
];

const Integrations = () => {
  return (
    <section className="w-full py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
        <BadgePill>Without writing a line of code</BadgePill>
        <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">
          No-code integrations
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Connect to popular automation platforms and start processing PDFs in minutes.
        </p>

        <div className="flex flex-wrap justify-center items-center gap-4">
          {integrations.map((integration) => (
            <Link
              key={integration.name}
              href={integration.href}
              className="px-6 py-3 rounded-lg border bg-white hover:shadow-md transition-shadow flex items-center gap-2"
            >
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: integration.color }}
              />
              <span className="font-medium text-gray-900">{integration.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Integrations;
