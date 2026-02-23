/* eslint-disable @next/next/no-img-element */
import BadgePill from "@/components/ui/badge-pill";

const Integrations = () => {
  return (
    <section className="w-full py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
        <BadgePill>Without writing a line of code</BadgePill>
        <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">
          No-code integrations
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-4">
          Connect your API to popular automation platforms. Integration templates included in the repo.
        </p>

        <div className="flex flex-wrap justify-center items-center gap-x-2 gap-y-8 sm:gap-x-6 sm:gap-y-14">
          <a href="/integrations/zapier">
            <img className="h-12 w-44 object-contain" src="/zapierofficial.svg" alt="Zapier integration" loading="lazy" />
          </a>
          <a href="/integrations/airtable">
            <img className="h-12 w-44 object-contain" src="/airtableofficial.svg" alt="Airtable integration" loading="lazy" />
          </a>
          <a href="/integrations/make">
            <img className="h-28 w-44 object-contain" src="/makeofficial.svg" alt="Make integration" loading="lazy" />
          </a>
          <a href="/integrations/bubble">
            <img className="h-36 w-44 object-contain" src="/bubbleofficial.svg" alt="Bubble integration" loading="lazy" />
          </a>
          <a href="/integrations/n8n">
            <img className="h-36 w-44 object-contain" src="/n8nofficial.svg" alt="n8n integration" loading="lazy" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default Integrations;
