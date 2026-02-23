import Link from "next/link";
import Image from "next/image";
import config from "@/config";
import logo from "@/app/icon.png";
import CTA from "@/components/CTA";

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
          <div className="flex-grow grid grid-cols-2 md:grid-cols-3 gap-8 md:mt-0 mt-10 text-center md:text-left">
            {/* Column 1: Links */}
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

            {/* Column 2: Legal */}
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

            {/* Column 3: Integrations */}
            <div>
              <Link href="/integrations" className="font-semibold text-white tracking-widest text-sm mb-3 block hover:text-primary transition-colors">
                INTEGRATIONS
              </Link>
              <div className="flex flex-col justify-center items-center md:items-start gap-2 text-sm">
                <Link href="/integrations/zapier" className="text-slate-300 hover:text-white transition-colors">
                  Zapier
                </Link>
                <Link href="/integrations/make" className="text-slate-300 hover:text-white transition-colors">
                  Make
                </Link>
                <Link href="/integrations/n8n" className="text-slate-300 hover:text-white transition-colors">
                  n8n
                </Link>
                <Link href="/integrations/rest-api" className="text-slate-300 hover:text-white transition-colors">
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
