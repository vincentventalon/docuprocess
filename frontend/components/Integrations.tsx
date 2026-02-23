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
          Generate PDFs automatically with Zapier, Airtable, Make and other popular no-code platforms of your choice.
        </p>

        <div className="flex flex-wrap justify-center items-center gap-x-2 gap-y-8 sm:gap-x-6 sm:gap-y-14">
          <a href="/integrations/generate-pdf-with-zapier">
            <img className="h-12 w-44 object-contain" src="/zapierofficial.svg" alt="Automate PDFs in Zapier" loading="lazy" />
          </a>
          <a href="/integrations/generate-pdf-with-airtable">
            <img className="h-12 w-44 object-contain" src="/airtableofficial.svg" alt="Automate PDFs in Airtable" loading="lazy" />
          </a>
          <a href="/integrations/generate-pdf-with-make">
            <img className="h-28 w-44 object-contain" src="/makeofficial.svg" alt="Automate PDFs in Make" loading="lazy" />
          </a>
          <a href="/integrations/generate-pdf-with-bubble">
            <img className="h-36 w-44 object-contain" src="/bubbleofficial.svg" alt="Automate PDFs in Bubble" loading="lazy" />
          </a>
          <a href="/integrations/generate-pdf-with-n8n">
            <img className="h-36 w-44 object-contain" src="/n8nofficial.svg" alt="Automate PDFs in n8n" loading="lazy" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default Integrations;
