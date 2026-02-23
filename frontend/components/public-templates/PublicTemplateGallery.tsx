"use client";

import { useMemo } from "react";
import { PublicTemplateCard } from "./PublicTemplateCard";
import { TemplateFilters } from "./TemplateFilters";
import {
  getAvailableFilters,
  categoryDescriptions,
  categoryOrder,
  type PublicTemplate,
} from "@/libs/templates";

type PublicTemplateGalleryProps = {
  templates: PublicTemplate[];
};

export function PublicTemplateGallery({ templates }: PublicTemplateGalleryProps) {
  const { categories } = useMemo(
    () => getAvailableFilters(templates),
    [templates]
  );

  // Sort categories by defined order
  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => {
      const aIndex = categoryOrder.indexOf(a.toLowerCase());
      const bIndex = categoryOrder.indexOf(b.toLowerCase());
      // If not in order list, put at end
      const aOrder = aIndex === -1 ? 999 : aIndex;
      const bOrder = bIndex === -1 ? 999 : bIndex;
      return aOrder - bOrder;
    });
  }, [categories]);

  // Group templates by category
  const templatesByCategory = useMemo(() => {
    const grouped: Record<string, PublicTemplate[]> = {};

    for (const template of templates) {
      const category = template.category?.toLowerCase() || "other";

      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(template);
    }

    return grouped;
  }, [templates]);

  return (
    <div className="w-full bg-gray-50 py-12">
      <div className="max-w-[95%] mx-auto px-4">
        <div className="mb-12">
          <TemplateFilters categories={sortedCategories} />
        </div>

        <div className="space-y-16">
          {sortedCategories.map((category) => {
            const categoryTemplates = templatesByCategory[category.toLowerCase()];
            if (!categoryTemplates || categoryTemplates.length === 0) return null;

            const categoryInfo = categoryDescriptions[category.toLowerCase()];

            return (
              <section key={category} id={`category-${category.toLowerCase()}`}>
                <div className="mb-6">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    {categoryInfo?.heading || category}
                  </h2>
                  {categoryInfo?.description && (
                    <p className="text-gray-600 max-w-3xl">
                      {categoryInfo.description}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {categoryTemplates.map((template) => (
                    <PublicTemplateCard key={template.id} template={template} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
