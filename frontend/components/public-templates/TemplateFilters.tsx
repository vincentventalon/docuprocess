"use client";

import { formatCategoryLabel } from "@/libs/templates";

type TemplateFiltersProps = {
  categories: string[];
};

export function TemplateFilters({ categories }: TemplateFiltersProps) {
  const handleClick = (category: string) => {
    const element = document.getElementById(`category-${category.toLowerCase()}`);
    if (element) {
      const offset = 80; // Account for any sticky header
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: "smooth",
      });
    }
  };

  return (
    <nav className="flex flex-wrap gap-2 justify-center" aria-label="Template categories">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => handleClick(category)}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-purple-300 rounded-full hover:bg-purple-50 hover:border-purple-400 transition-colors"
        >
          {formatCategoryLabel(category)}
        </button>
      ))}
    </nav>
  );
}
