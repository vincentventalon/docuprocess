import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import logo from "@/app/icon.png";

const CTA = () => {
  return (
    <section>
      {/* White area with card */}
      <div className="bg-background pt-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="relative z-10 mb-[-60px]">
            {/* Border layer */}
            <div
              className="absolute inset-0 bg-slate-200"
              style={{ clipPath: 'polygon(3% 0, 100% 0, 97% 100%, 0 100%)' }}
            />
            {/* Content layer */}
            <div
              className="relative bg-white py-10 pr-8 pl-16 md:py-12 md:pr-10 md:pl-20 lg:py-14 lg:pr-12 lg:pl-24"
              style={{ clipPath: 'polygon(calc(3% + 1px) 1px, calc(100% - 1px) 1px, calc(97% - 1px) calc(100% - 1px), 1px calc(100% - 1px))' }}
            >
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                {/* Text content */}
                <div className="max-w-xl">
                  <h2 className="font-bold text-3xl md:text-4xl tracking-tight text-slate-900 mb-4">
                    Ship your API product faster
                  </h2>
                  <p className="text-lg text-slate-600 mb-8">
                    Complete documentation, production-ready infrastructure, and a modern tech stack. Focus on your product, not boilerplate.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Button asChild size="lg">
                      <Link href="/signin">
                        Get started
                        <span className="ml-2">→</span>
                      </Link>
                    </Button>
                    <Button asChild size="lg" variant="outline">
                      <Link href="/docs">
                        Read the docs
                      </Link>
                    </Button>
                  </div>
                </div>

                {/* Logo */}
                <div className="hidden lg:flex items-center justify-center">
                  <Image
                    src={logo}
                    alt="YourApp logo"
                    width={200}
                    height={200}
                    className="opacity-100"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dark section with grain */}
      <div className="bg-[#17153a] h-16 bg-grain">&nbsp;</div>
    </section>
  );
};

export default CTA;
