import React, { useState } from "react";
import { PagePadding } from "@/types/page-settings";
import { CollapsibleSection } from "./CollapsibleSection";

interface PageMarginsSectionProps {
  padding: PagePadding;
  onPaddingChange: (padding: PagePadding) => void;
}

export function PageMarginsSection({
  padding,
  onPaddingChange,
}: PageMarginsSectionProps) {
  const handleChange = (key: keyof PagePadding, value: string) => {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed >= 0) {
      onPaddingChange({
        ...padding,
        [key]: parsed,
      });
    }
  };

  return (
    <CollapsibleSection title="Safe Margins" defaultOpen={true}>
      <div className="grid grid-cols-2 gap-2">
        {(["top", "right", "bottom", "left"] as const).map((key) => (
          <div key={key} className="flex items-center gap-1">
            <label className="text-xs text-gray-500 w-6 shrink-0 text-center capitalize">
              {key[0].toUpperCase()}
            </label>
            <div className="flex-1 flex items-center">
              <input
                type="text"
                inputMode="numeric"
                value={padding[key]}
                onChange={(e) => handleChange(key, e.target.value)}
                className="w-full px-2 py-1 text-xs rounded-l border border-gray-200 bg-white text-gray-900 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <span className="px-1.5 py-1 text-xs text-gray-400 bg-gray-100 border border-l-0 border-gray-200 rounded-r">
                mm
              </span>
            </div>
          </div>
        ))}
      </div>
    </CollapsibleSection>
  );
}
