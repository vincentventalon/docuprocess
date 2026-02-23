import Link from "next/link";
import { CheckCircle2, ChevronDown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CategorySEOContent } from "@/libs/seo/category-content";

type TemplateSEOSectionsProps = {
  category: CategorySEOContent;
  categoryKey: string;
  categorySlug: string;
  templateSlug: string;
};

export function TemplateSEOSections({ category, categorySlug, templateSlug }: TemplateSEOSectionsProps) {
  return (
    <>
      {/* What is a [Category]? */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
          {category.whatIs.heading}
        </h2>
        <div className="space-y-4">
          {category.whatIs.paragraphs.map((paragraph, i) => (
            <p key={i} className="text-gray-600 leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>
      </section>

      {/* What should a [Category] include? */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
            {category.whatToInclude.heading}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {category.whatToInclude.items.map((item, i) => (
              <div key={i} className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-gray-600 mb-4">
              This template includes all the essential elements. Try it now and customize it to your needs.
            </p>
            <Link href={`/templates/${categorySlug}/${templateSlug}/editor`}>
              <Button variant="outline">
                Customize this template
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why use a [Category] template? */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
          {category.whyUse.heading}
        </h2>
        <div className="space-y-6">
          {category.whyUse.items.map((item, i) => (
            <div key={i}>
              <h3 className="font-semibold text-gray-900">{item.title}</h3>
              <p className="text-gray-600 mt-1">{item.description}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4 p-6 bg-primary/5 rounded-lg">
          <div className="flex-1">
            <p className="font-medium text-gray-900">Ready to get started?</p>
            <p className="text-sm text-gray-600">Create your first {category.singularName.toLowerCase()} in minutes.</p>
          </div>
          <Link href="/signin?redirect=/dashboard/browse-examples">
            <Button>
              Start for free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
            Frequently Asked Questions
          </h2>
          <div className="w-full">
            {category.faq.map((item, i) => (
              <details
                key={i}
                className="border-b last:border-b-0 group"
              >
                <summary className="flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-base font-medium cursor-pointer list-none [&::-webkit-details-marker]:hidden hover:underline">
                  {item.question}
                  <ChevronDown className="text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200 group-open:rotate-180" />
                </summary>
                <div className="overflow-hidden text-sm text-gray-600 pb-4">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
