import React, { useState, useMemo, useEffect } from "react";
import { CollapsibleSection } from "./CollapsibleSection";
import { NumericInput } from "./NumericInput";
import { Square, LayoutGrid } from "lucide-react";

interface PaddingSectionProps {
  styles: Record<string, string>;
  onStyleChange: (property: string, value: string) => void;
  onStylesChange: (styles: Record<string, string>) => void;
  defaultOpen?: boolean;
}

type Side = "top" | "right" | "bottom" | "left";

function parsePaddingValue(value: string | undefined): string {
  if (!value) return "0";
  const match = value.match(/^(\d+)/);
  return match ? match[1] : "0";
}

export function PaddingSection({
  styles,
  onStyleChange,
  onStylesChange,
  defaultOpen = true,
}: PaddingSectionProps) {
  // Parse padding values
  const getPaddingValue = (side?: Side): string => {
    if (side) {
      return parsePaddingValue(
        styles[`padding-${side}`] || styles["padding"]
      );
    }
    // For "all" mode: use shorthand, or fall back to padding-top (all  
    return parsePaddingValue(styles["padding"] ||  styles["padding-top"]);     };

  // Detect if all sides are equal
  const allEqual = useMemo(() => {
    // If we have individual sides defined, check if they're different
    const hasIndividualSides = styles["padding-top"] || styles["padding-right"] ||
                               styles["padding-bottom"] || styles["padding-left"];

    if (hasIndividualSides) {
      const top = getPaddingValue("top");
      const right = getPaddingValue("right");
      const bottom = getPaddingValue("bottom");
      const left = getPaddingValue("left");
      return top === right && right === bottom && bottom === left;
    }

    // Check shorthand padding (single value)
    if (styles["padding"] && !styles["padding"].includes(" ")) {
      return true;
    }

    // No padding defined, default to all mode
    return true;
  }, [styles]);

  const [mode, setMode] = useState<"all" | "per">(allEqual ? "all" : "per");

  // Update mode when allEqual changes (e.g., when selecting a different component)
  useEffect(() => {
    setMode(allEqual ? "all" : "per");
  }, [allEqual]);

  const handleModeChange = (newMode: "all" | "per") => {
    // Just change the mode, don't apply any styles
    // Styles will only be applied when user changes values
    setMode(newMode);
  };

  const handleAllPaddingChange = (value: string) => {
    onStylesChange({
      padding: `${value}px`,
      "padding-top": "",
      "padding-right": "",
      "padding-bottom": "",
      "padding-left": "",
    });
  };

  const handleSidePaddingChange = (side: Side, value: string) => {
    onStyleChange(`padding-${side}`, value);
  };

  return (
    <CollapsibleSection title="Padding" defaultOpen={defaultOpen}>
      {/* Mode toggle */}
      <div className="flex items-center gap-2 mb-2">
        <label className="text-xs text-gray-500 w-12 shrink-0">Mode</label>
        <div className="flex gap-1">
          <button
            onClick={() => handleModeChange("all")}
            className={`p-1.5 rounded transition-colors ${
              mode === "all"
                ? "bg-blue-100 text-blue-600"
                : "hover:bg-gray-100 text-gray-500"
            }`}
            title="All sides"
          >
            <Square className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleModeChange("per")}
            className={`p-1.5 rounded transition-colors ${
              mode === "per"
                ? "bg-blue-100 text-blue-600"
                : "hover:bg-gray-100 text-gray-500"
            }`}
            title="Per side"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Padding inputs */}
      {mode === "all" ? (
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 w-12 shrink-0">Value</label>
          <NumericInput
            value={getPaddingValue()}
            onChange={handleAllPaddingChange}
            className="flex-1"
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {(["top", "right", "bottom", "left"] as Side[]).map((side) => (
            <NumericInput
              key={side}
              label={side[0].toUpperCase()}
              value={getPaddingValue(side)}
              onChange={(v) => handleSidePaddingChange(side, v)}
            />
          ))}
        </div>
      )}
    </CollapsibleSection>
  );
}
