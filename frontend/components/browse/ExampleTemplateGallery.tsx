"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { ExampleTemplateCard } from "./ExampleTemplateCard";

type ExampleTemplate = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  thumbnail_url: string | null;
  thumbnail_sm_url: string | null;
  sample_data: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

type ExampleTemplateGalleryProps = {
  templates: ExampleTemplate[];
};

const CATEGORIES = [
  { value: "all", label: "All Templates" },
  { value: "invoice", label: "Invoices" },
  { value: "receipt", label: "Receipts" },
  { value: "certificate", label: "Certificates" },
  { value: "letter", label: "Letters" },
  { value: "packing_slip", label: "Packing Slips" },
  { value: "label", label: "Labels" },
];

export function ExampleTemplateGallery({ templates }: ExampleTemplateGalleryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Filter templates based on search and category
  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      // Category filter
      if (selectedCategory !== "all" && template.category !== selectedCategory) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = template.name.toLowerCase().includes(query);
        const matchesDescription = template.description?.toLowerCase().includes(query);
        return matchesName || matchesDescription;
      }

      return true;
    });
  }, [templates, searchQuery, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((category) => (
            <Badge
              key={category.value}
              variant={selectedCategory === category.value ? "default" : "outline"}
              className="cursor-pointer hover:bg-gray-100"
              onClick={() => setSelectedCategory(category.value)}
            >
              {category.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-600">
        {filteredTemplates.length} template{filteredTemplates.length !== 1 ? "s" : ""} found
      </div>

      {/* Template Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No templates found</p>
          <p className="text-gray-400 text-sm mt-2">
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <ExampleTemplateCard key={template.id} template={template} />
          ))}
        </div>
      )}
    </div>
  );
}
