import React from "react";
import { CollapsibleSection } from "./CollapsibleSection";
import { ColorInput } from "./ColorInput";

interface FillSectionProps {
  styles: Record<string, string>;
  onStyleChange: (property: string, value: string) => void;
}

export function FillSection({ styles, onStyleChange }: FillSectionProps) {
  // Parse opacity (can be 0-1 or 0-100)
  const opacityValue = styles["opacity"];
  let displayOpacity = "100";
  if (opacityValue) {
    const num = parseFloat(opacityValue);
    if (num <= 1) {
      displayOpacity = Math.round(num * 100).toString();
    } else {
      displayOpacity = Math.round(num).toString();
    }
  }

  const handleOpacityChange = (value: string) => {
    const num = parseInt(value) || 0;
    // Convert percentage to 0-1 range
    const normalized = Math.min(100, Math.max(0, num)) / 100;
    onStyleChange("opacity", normalized.toString());
  };

  return (
    <CollapsibleSection title="Fill" defaultOpen={true}>
      {/* Background Color */}
      <ColorInput
        label="Background"
        value={styles["background-color"] || "transparent"}
        onChange={(v) => onStyleChange("background-color", v)}
        showTransparent
      />

      {/* Opacity */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-500 w-16 shrink-0">Opacity</label>
        <div className="flex-1 flex items-center">
          <input
            type="text"
            inputMode="numeric"
            value={displayOpacity}
            onChange={(e) => handleOpacityChange(e.target.value)}
            className="w-full px-2 py-1 text-xs rounded-l border border-gray-200 bg-white text-gray-900 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <span className="px-1.5 py-1 text-xs text-gray-400 bg-gray-100 border border-l-0 border-gray-200 rounded-r">
            %
          </span>
        </div>
      </div>
    </CollapsibleSection>
  );
}
