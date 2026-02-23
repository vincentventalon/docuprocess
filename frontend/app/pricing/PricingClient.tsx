"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FAQ from "@/components/FAQ";
import BadgePill from "@/components/ui/badge-pill";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ButtonCheckout from "@/components/ButtonCheckout";
import { HeroGradientBlur } from "@/components/decorative/HeroGradientBlur";
import config from "@/config";

const PricingClient = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <>
      <Suspense>
        <Header />
      </Suspense>
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 px-8 overflow-hidden">
          <HeroGradientBlur />
          <div className="relative z-10 max-w-5xl mx-auto text-center">
            <BadgePill>Pricing</BadgePill>
            <h1 className="font-bold text-3xl lg:text-5xl tracking-tight mb-6">
              PDF Generation API{" "}
              <span className="text-primary">Pricing</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12">
              Start free with {config.stripe.freeTier.credits} PDFs. Scale with flexible plans. Cancel anytime.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-2 mb-16">
              <div className="inline-flex items-center bg-muted rounded-full p-1">
                <button
                  onClick={() => setIsAnnual(false)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    !isAnnual
                      ? "bg-white dark:bg-slate-900 text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setIsAnnual(true)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    isAnnual
                      ? "bg-white dark:bg-slate-900 text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Annually
                </button>
              </div>
              {isAnnual && (
                <span className="text-sm text-primary font-medium">
                  Save ~17%
                </span>
              )}
            </div>

            {/* Pricing Cards */}
            <div className="relative flex justify-center flex-col lg:flex-row items-center lg:items-stretch gap-8">
              {/* Free Tier */}
              <div className="relative w-full max-w-sm">
                <div className="relative flex flex-col h-full gap-5 lg:gap-8 z-10 bg-background p-8 rounded-2xl border border-border">
                  <div>
                    <p className="text-lg lg:text-xl font-bold">Free</p>
                    <p className="text-muted-foreground mt-2 text-sm">
                      Try it out, no credit card required
                    </p>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl tracking-tight font-extrabold">
                      $0
                    </span>
                  </div>

                  <ul className="space-y-3 leading-relaxed text-sm flex-1 text-left">
                    {[
                      `${config.stripe.freeTier.credits} PDFs/month`,
                      `${config.stripe.freeTier.templates} Templates`,
                      config.stripe.freeTier.rateLimit,
                      "Pay only for successful requests",
                      "Bring your own storage",
                      "Zapier, Make, Bubble, n8n, etc.",
                      "REST API",
                    ].map((feature, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-white border border-primary flex items-center justify-center shrink-0">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="w-3.5 h-3.5 text-primary"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="space-y-2 mt-auto">
                    <Button asChild size="xl" variant="outline" className="w-full">
                      <Link href="/signin">Start for free</Link>
                    </Button>
                  </div>
                </div>
              </div>

              {config.stripe.plans.map((plan) => (
                <div key={plan.priceId || plan.name} className="relative w-full max-w-sm">
                  {plan.isFeatured && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                      <Badge className="text-xs font-semibold">
                        RECOMMENDED
                      </Badge>
                    </div>
                  )}

                  {plan.isFeatured && (
                    <div className="absolute -inset-[1px] rounded-[17px] bg-primary z-10"></div>
                  )}

                  <div className="relative flex flex-col h-full gap-5 lg:gap-8 z-10 bg-background p-8 rounded-2xl border border-border">
                    <div>
                      <p className="text-lg lg:text-xl font-bold">{plan.name}</p>
                      {plan.description && (
                        <p className="text-muted-foreground mt-2 text-sm">
                          {plan.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-baseline gap-2">
                      {(isAnnual ? plan.yearlyPriceAnchor : plan.priceAnchor) && (
                        <span className="text-lg text-muted-foreground line-through">
                          ${isAnnual ? plan.yearlyPriceAnchor : plan.priceAnchor}
                        </span>
                      )}
                      <span className="text-5xl tracking-tight font-extrabold">
                        ${isAnnual ? plan.yearlyPrice : plan.price}
                      </span>
                      <span className="text-muted-foreground text-sm">
                        /{isAnnual ? "year" : "month"}
                      </span>
                    </div>

                    {plan.features && (
                      <ul className="space-y-3 leading-relaxed text-sm flex-1 text-left">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded-full bg-white border border-primary flex items-center justify-center shrink-0">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                className="w-3.5 h-3.5 text-primary"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                            <span>{feature.name}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="space-y-2 mt-auto">
                      <ButtonCheckout
                        priceId={isAnnual ? plan.yearlyPriceId : plan.priceId}
                        mode="subscription"
                        size="xl"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <FAQ />
      </main>
      <Footer />
    </>
  );
};

export default PricingClient;
