import React, { useState } from "react";
import { PagePadding } from "@/types/page-settings";
import { ChevronDown, ChevronRight } from "lucide-react";

interface MarginsSectionProps {
  padding: PagePadding;
  onPaddingChange?: (padding: PagePadding) => void;
}

export function MarginsSection({ padding, onPaddingChange }: MarginsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleChange = (key: keyof PagePadding, value: string) => {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed >= 0 && onPaddingChange) {
      onPaddingChange({
        ...padding,
        [key]: parsed,
      });
    }
  };

  return (
    <div className="border-b border-gray-200">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-2 flex items-center justify-between text-sm text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <span className="font-medium">Margins</span>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="px-3 pb-3">
          <div className="grid grid-cols-2 gap-2">
            {(["top", "right", "bottom", "left"] as const).map((key) => (
              <div key={key} className="flex items-center gap-1">
                <label className="text-xs text-gray-500 w-10 capitalize">
                  {key}
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
        </div>
      )}
    </div>
  );
}
