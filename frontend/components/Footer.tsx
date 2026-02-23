import Link from "next/link";
import Image from "next/image";
import config from "@/config";
import logo from "@/app/icon.png";
import CTA from "@/components/CTA";

// Add the Footer to the bottom of your landing page and more.
// The support link is connected to the config.js file. If there's no config.resend.supportEmail, the link won't be displayed.

const Footer = () => {
  return (
    <>
      <CTA />
      <footer className="bg-[#17153a] text-white bg-grain">
      <div className="relative z-10 max-w-7xl mx-auto px-8 py-12">
        <div className="flex lg:items-start md:flex-row md:flex-nowrap flex-wrap flex-col">
          <div className="w-64 flex-shrink-0 md:mx-0 mx-auto text-center md:text-left">
            <Link
              href="/#"
              aria-current="page"
              className="flex gap-2 justify-center md:justify-start items-center"
            >
              <Image
                src={logo}
                alt={`${config.appName} logo`}
                priority={true}
                className="w-6 h-6"
                width={24}
                height={24}
              />
              <strong className="font-extrabold tracking-tight text-base md:text-lg text-white">
                {config.appName}
              </strong>
            </Link>

            <p className="mt-3 text-sm text-slate-300">
              {config.appDescription}
            </p>
            <p className="mt-3 text-sm text-slate-400">
              Copyright © {new Date().getFullYear()} - All rights reserved
            </p>
          </div>
          <div className="flex-grow grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 md:mt-0 mt-10 text-center md:text-left">
            {/* Column 1: Links + Legal stacked */}
            <div className="space-y-8">
              <div>
                <div className="font-semibold text-white tracking-widest text-sm mb-3">
                  LINKS
                </div>
                <div className="flex flex-col justify-center items-center md:items-start gap-2 text-sm">
                  {config.resend.supportEmail && (
                    <a
                      href={`mailto:${config.resend.supportEmail}`}
                      target="_blank"
                      className="text-slate-300 hover:text-white transition-colors"
                      aria-label="Contact Support"
                    >
                      Support
                    </a>
                  )}
                  <Link href="/pricing" className="text-slate-300 hover:text-white transition-colors">
                    Pricing
                  </Link>
                  <Link href="/templates" className="text-slate-300 hover:text-white transition-colors">
                    Templates
                  </Link>
                  <Link href="/docs" className="text-slate-300 hover:text-white transition-colors">
                    Documentation
                  </Link>
                  <Link href="/about" className="text-slate-300 hover:text-white transition-colors">
                    About
                  </Link>
                  <Link href="/changelog" className="text-slate-300 hover:text-white transition-colors">
                    Changelog
                  </Link>
                </div>
              </div>

              <div>
                <div className="font-semibold text-white tracking-widest text-sm mb-3">
                  LEGAL
                </div>
                <div className="flex flex-col justify-center items-center md:items-start gap-2 text-sm">
                  <Link href="/tos" className="text-slate-300 hover:text-white transition-colors">
                    Terms of services
                  </Link>
                  <Link href="/privacy-policy" className="text-slate-300 hover:text-white transition-colors">
                    Privacy policy
                  </Link>
                  <Link href="/security" className="text-slate-300 hover:text-white transition-colors">
                    Security
                  </Link>
                </div>
              </div>
            </div>

            {/* Column 2: Tools + Free Generators */}
            <div className="space-y-8">
              <div>
                <Link href="/tools" className="font-semibold text-white tracking-widest text-sm mb-3 block hover:text-primary transition-colors">
                  TOOLS
                </Link>
                <div className="flex flex-col justify-center items-center md:items-start gap-2 text-sm">
                  <Link href="/tools/convert-html-to-pdf" className="text-slate-300 hover:text-white transition-colors">
                    Convert HTML to PDF
                  </Link>
                </div>
              </div>

              <div>
                <Link href="/generators" className="font-semibold text-white tracking-widest text-sm mb-3 block hover:text-primary transition-colors">
                  FREE GENERATORS
                </Link>
                <div className="flex flex-col justify-center items-center md:items-start gap-2 text-sm">
                  <Link href="/generators/free-online-invoice-generator" className="text-slate-300 hover:text-white transition-colors">
                    Invoice Generator
                  </Link>
                  <Link href="/generators/free-online-receipt-maker" className="text-slate-300 hover:text-white transition-colors">
                    Receipt Maker
                  </Link>
                  <Link href="/generators/free-online-certificate-maker" className="text-slate-300 hover:text-white transition-colors">
                    Certificate Maker
                  </Link>
                  <Link href="/generators/free-online-packing-slip-generator" className="text-slate-300 hover:text-white transition-colors">
                    Packing Slip Generator
                  </Link>
                  <Link href="/generators/free-online-qr-code-sheet-generator" className="text-slate-300 hover:text-white transition-colors">
                    QR Code Sheet Generator
                  </Link>
                  <Link href="/generators/free-online-barcode-sheet-generator" className="text-slate-300 hover:text-white transition-colors">
                    Barcode Sheet Generator
                  </Link>
                  <Link href="/generators/free-online-shipping-label-maker" className="text-slate-300 hover:text-white transition-colors">
                    Shipping Label Maker
                  </Link>
                </div>
              </div>
            </div>

            {/* Column 3: Industries */}
            <div>
              <Link href="/for" className="font-semibold text-white tracking-widest text-sm mb-3 block hover:text-primary transition-colors">
                INDUSTRIES
              </Link>
              <div className="flex flex-col justify-center items-center md:items-start gap-2 text-sm">
                <Link href="/for/ecommerce" className="text-slate-300 hover:text-white transition-colors">
                  Ecommerce
                </Link>
                <Link href="/for/logistics" className="text-slate-300 hover:text-white transition-colors">
                  Logistics & 3PL
                </Link>
                <Link href="/for/healthcare" className="text-slate-300 hover:text-white transition-colors">
                  Healthcare
                </Link>
                <Link href="/for/fintech" className="text-slate-300 hover:text-white transition-colors">
                  Fintech
                </Link>
                <Link href="/for/insurance" className="text-slate-300 hover:text-white transition-colors">
                  Insurance
                </Link>
                <Link href="/for/procurement" className="text-slate-300 hover:text-white transition-colors">
                  Procurement
                </Link>
                <Link href="/for/human-resources" className="text-slate-300 hover:text-white transition-colors">
                  Human Resources
                </Link>
                <Link href="/for/legal" className="text-slate-300 hover:text-white transition-colors">
                  Legal
                </Link>
                <Link href="/for/sales" className="text-slate-300 hover:text-white transition-colors">
                  Sales
                </Link>
                <Link href="/for/real-estate" className="text-slate-300 hover:text-white transition-colors">
                  Real Estate
                </Link>
                <Link href="/for/education" className="text-slate-300 hover:text-white transition-colors">
                  Education
                </Link>
                <Link href="/for/accounting" className="text-slate-300 hover:text-white transition-colors">
                  Accounting
                </Link>
                <Link href="/for/manufacturing" className="text-slate-300 hover:text-white transition-colors">
                  Manufacturing
                </Link>
                <Link href="/for/marketing" className="text-slate-300 hover:text-white transition-colors">
                  Marketing
                </Link>
                <Link href="/for/nocode" className="text-slate-300 hover:text-white transition-colors">
                  No-Code
                </Link>
                <Link href="/for/agency" className="text-slate-300 hover:text-white transition-colors">
                  Agencies
                </Link>
                <Link href="/for/startup" className="text-slate-300 hover:text-white transition-colors">
                  Startups
                </Link>
              </div>
            </div>

            {/* Column 4: Integrations */}
            <div>
              <Link href="/integrations" className="font-semibold text-white tracking-widest text-sm mb-3 block hover:text-primary transition-colors">
                INTEGRATIONS
              </Link>
              <div className="flex flex-col justify-center items-center md:items-start gap-2 text-sm">
                <Link href="/integrations/generate-pdf-with-zapier" className="text-slate-300 hover:text-white transition-colors">
                  Zapier
                </Link>
                <Link href="/integrations/generate-pdf-with-make" className="text-slate-300 hover:text-white transition-colors">
                  Make
                </Link>
                <Link href="/integrations/generate-pdf-with-bubble" className="text-slate-300 hover:text-white transition-colors">
                  Bubble
                </Link>
                <Link href="/integrations/generate-pdf-with-flutterflow" className="text-slate-300 hover:text-white transition-colors">
                  FlutterFlow
                </Link>
                <Link href="/integrations/generate-pdf-with-n8n" className="text-slate-300 hover:text-white transition-colors">
                  n8n
                </Link>
                <Link href="/integrations/generate-pdf-with-airtable" className="text-slate-300 hover:text-white transition-colors">
                  Airtable
                </Link>
                <Link href="/integrations/generate-pdf-with-postman" className="text-slate-300 hover:text-white transition-colors">
                  Postman
                </Link>
                <Link href="/integrations/generate-pdf-with-rest-api" className="text-slate-300 hover:text-white transition-colors">
                  REST API
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
    </>
  );
};

export default Footer;
