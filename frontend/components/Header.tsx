"use client";

import { useState, useEffect } from "react";
import type { JSX } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Menu } from "lucide-react";
import logo from "@/app/icon.png";
import config from "@/config";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

const ButtonSignin = dynamic(() => import("./ButtonSignin"), {
  ssr: false,
  loading: () => (
    <Button asChild size="lg">
      <Link href="/signin">Get started</Link>
    </Button>
  ),
});

const links: {
  href: string;
  label: string;
}[] = [
  {
    href: "/docs",
    label: "Documentation",
  },
  {
    href: "/pricing",
    label: "Pricing",
  },
];

// A header with a logo on the left, links in the center (like Pricing, etc...), and a CTA (like Get Started or Login) on the right.
// The header is responsive, and on mobile, the links are hidden behind a burger button.
const Header = () => {
  const cta: JSX.Element = <ButtonSignin size="lg" />;
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [hasScrolled, setHasScrolled] = useState<boolean>(false);

  // setIsOpen(false) when the route changes (i.e: when the user clicks on a link on mobile)
  useEffect(() => {
    setIsOpen(false);
  }, [searchParams]);

  // Track scroll position for border visibility
  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b transition-colors duration-200 ${hasScrolled ? "border-slate-200 dark:border-slate-800" : "border-transparent"}`}>
      <nav
        className="container flex items-center justify-between px-8 py-4 mx-auto"
        aria-label="Global"
      >
        {/* Your logo/name on large screens */}
        <div className="flex lg:flex-1">
          <Link
            className="flex items-center gap-2 shrink-0"
            href="/"
            title={`${config.appName} homepage`}
          >
            <Image
              src={logo}
              alt={`${config.appName} logo`}
              className="w-8"
              placeholder="blur"
              priority={true}
              width={32}
              height={32}
            />
            <span className="font-semibold text-lg">{config.appName}</span>
          </Link>
        </div>

        {/* Burger button to open menu on mobile */}
        <div className="flex lg:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="-m-2.5">
                <span className="sr-only">Open main menu</span>
                <Menu className="size-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-sm">
              <SheetHeader>
                <SheetTitle asChild>
                  <Link
                    className="flex items-center gap-2 shrink-0"
                    title={`${config.appName} homepage`}
                    href="/"
                    onClick={() => setIsOpen(false)}
                  >
                    <Image
                      src={logo}
                      alt={`${config.appName} logo`}
                      className="w-8"
                      placeholder="blur"
                      priority={true}
                      width={32}
                      height={32}
                    />
                    <span className="font-semibold text-lg">{config.appName}</span>
                  </Link>
                </SheetTitle>
              </SheetHeader>

              {/* Your links on small screens */}
              <div className="flex flex-col gap-4 px-4">
                {links.map((link) => (
                  <Link
                    href={link.href}
                    key={link.href}
                    className="font-semibold text-foreground/80 hover:text-foreground transition-colors"
                    title={link.label}
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              <Separator className="my-4" />
              {/* Your CTA on small screens */}
              <div className="flex flex-col px-4">{cta}</div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Your links on large screens */}
        <div className="hidden lg:flex lg:justify-center lg:gap-12 lg:items-center">
          {links.map((link) => (
            <Link
              href={link.href}
              key={link.href}
              className="font-semibold text-foreground/80 hover:text-foreground transition-colors"
              title={link.label}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTA on large screens */}
        <div className="hidden lg:flex lg:justify-end lg:flex-1">{cta}</div>
      </nav>
    </header>
  );
};

export default Header;
