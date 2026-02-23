import React from "react";
import { NumericInput } from "./NumericInput";

interface DimensionsSectionProps {
  styles: Record<string, string>;
  onStyleChange: (property: string, value: string) => void;
}

export function DimensionsSection({
  styles,
  onStyleChange,
}: DimensionsSectionProps) {
  const getValue = (prop: string): string => {
    const value = styles[prop] || "";
    return value.replace(/px$/, "");
  };

  return (
    <div className="px-3 py-3 border-b border-gray-200 space-y-2">
      {/* Width & Height */}
      <div className="grid grid-cols-2 gap-2">
        <NumericInput
          label="W"
          value={getValue("width")}
          onChange={(v) => onStyleChange("width", v)}
        />
        <NumericInput
          label="H"
          value={getValue("height")}
          onChange={(v) => onStyleChange("height", v)}
        />
      </div>

      {/* X & Y (top/left for positioned elements) */}
      <div className="grid grid-cols-2 gap-2">
        <NumericInput
          label="X"
          value={getValue("left")}
          onChange={(v) => onStyleChange("left", v)}
        />
        <NumericInput
          label="Y"
          value={getValue("top")}
          onChange={(v) => onStyleChange("top", v)}
        />
      </div>
    </div>
  );
}
