import React, { useState, useMemo, useEffect } from "react";
import { CollapsibleSection } from "./CollapsibleSection";
import { NumericInput } from "./NumericInput";
import { ColorInput } from "./ColorInput";
import { Square, LayoutGrid } from "lucide-react";

interface BorderSectionProps {
  styles: Record<string, string>;
  onStyleChange: (property: string, value: string) => void;
  onStylesChange: (styles: Record<string, string>) => void;
  defaultOpen?: boolean;
}

type Side = "top" | "right" | "bottom" | "left";

const BORDER_STYLES = [
  { value: "solid", label: "Solid" },
  { value: "dashed", label: "Dashed" },
  { value: "dotted", label: "Dotted" },
  { value: "double", label: "Double" },
  { value: "groove", label: "Groove" },
  { value: "ridge", label: "Ridge" },
  { value: "none", label: "None" },
];

function parseBorderValue(value: string | undefined): string {
  if (!value) return "0";
  // Extract width from "1px solid #000" or just "1px"
  const match = value.match(/^(\d+)/);
  return match ? match[1] : "0";
}

function parseBorderColor(value: string | undefined): string | null {
  if (!value) return null;
  // Extract color from "1px solid #000"
  const match = value.match(/#[0-9a-fA-F]{3,6}/);
  return match ? match[0] : null;
}

export function BorderSection({
  styles,
  onStyleChange,
  onStylesChange,
  defaultOpen = true,
}: BorderSectionProps) {
  // Detect if all sides are equal
  const allEqual = useMemo(() => {
    const top = parseBorderValue(styles["border-top-width"]);
    const right = parseBorderValue(styles["border-right-width"]);
    const bottom = parseBorderValue(styles["border-bottom-width"]);
    const left = parseBorderValue(styles["border-left-width"]);

    // If we have individual sides defined with different values, it's per-side
    const hasIndividualSides = styles["border-top-width"] || styles["border-right-width"] ||
                               styles["border-bottom-width"] || styles["border-left-width"];

    if (hasIndividualSides) {
      // Check if all are truly equal
      return top === right && right === bottom && bottom === left;
    }

    // If only shorthand exists, it's all-equal
    if (styles["border-width"]) {
      return true;
    }

    // No borders defined, default to all mode
    return true;
  }, [styles]);

  const [mode, setMode] = useState<"all" | "per">(allEqual ? "all" : "per");

  // Update mode when allEqual changes (e.g., when selecting a different component)
  useEffect(() => {
    setMode(allEqual ? "all" : "per");
  }, [allEqual]);

  // Get values
  const getValue = (prop: string): string => {
    const value = styles[prop] || "";
    return value.replace(/px$/, "");
  };

  const getBorderWidth = (side?: Side): string => {
    if (side) {
      return parseBorderValue(
        styles[`border-${side}-width`] || styles["border-width"]
      );
    }
    return parseBorderValue(styles["border-width"]);
  };

  // Get border color - handle both single color and per-side colors
  const getBorderColor = (): string => {
    // First check for explicit border-color
    const bc = styles["border-color"];
    if (bc) {
      // If it's a multi-value like "rgb(x) rgb(y) rgb(z)", take the first one
      const match = bc.match(/^(#[0-9a-fA-F]{3,6}|rgb\([^)]+\)|rgba\([^)]+\))/);
      if (match) return match[1];
      return bc;
    }
    // Check individual sides
    const topColor = styles["border-top-color"];
    if (topColor) return topColor;
    // Check shorthand
    const shorthand = parseBorderColor(styles["border"]);
    if (shorthand) return shorthand;
    return "#e5e7eb";
  };

  const borderColor = getBorderColor();

  // Get border style
  const getBorderStyle = (): string => {
    const bs = styles["border-style"];
    if (bs) {
      // If multi-value, take the first one
      const first = bs.split(" ")[0];
      return first || "solid";
    }
    const topStyle = styles["border-top-style"];
    if (topStyle) return topStyle;
    return "solid";
  };

  const borderStyle = getBorderStyle();
  const borderRadius = getValue("border-radius");

  const handleModeChange = (newMode: "all" | "per") => {
    // Just change the mode, don't apply any styles
    // Styles will only be applied when user changes values
    setMode(newMode);
  };

  const handleStyleChange = (newStyle: string) => {
    onStylesChange({
      "border-style": newStyle,
      "border-top-style": newStyle,
      "border-right-style": newStyle,
      "border-bottom-style": newStyle,
      "border-left-style": newStyle,
    });
  };

  const handleAllWidthChange = (value: string) => {
    onStylesChange({
      "border-width": `${value}px`,
      "border-style": borderStyle,
      "border-color": borderColor,
    });
  };

  const handleSideWidthChange = (side: Side, value: string) => {
    onStyleChange(`border-${side}-width`, value);
    onStyleChange(`border-${side}-style`, borderStyle);
    onStyleChange(`border-${side}-color`, borderColor);
  };

  return (
    <CollapsibleSection title="Border" defaultOpen={defaultOpen}>
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

      {/* Width */}
      {mode === "all" ? (
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 w-12 shrink-0">Width</label>
          <NumericInput
            value={getBorderWidth()}
            onChange={handleAllWidthChange}
            className="flex-1"
          />
        </div>
      ) : (
        <div className="space-y-1">
          <label className="text-xs text-gray-500">Width</label>
          <div className="grid grid-cols-2 gap-2">
            {(["top", "right", "bottom", "left"] as Side[]).map((side) => (
              <NumericInput
                key={side}
                label={side[0].toUpperCase()}
                value={getBorderWidth(side)}
                onChange={(v) => handleSideWidthChange(side, v)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Style */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-500 w-12 shrink-0">Style</label>
        <select
          value={borderStyle}
          onChange={(e) => handleStyleChange(e.target.value)}
          className="flex-1 px-2 py-1 text-xs rounded border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
        >
          {BORDER_STYLES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Color */}
      <ColorInput
        label="Color"
        value={borderColor}
        onChange={(v) => {
          // Set both global and per-side colors to ensure consistency
          onStylesChange({
            "border-color": v,
            "border-top-color": v,
            "border-right-color": v,
            "border-bottom-color": v,
            "border-left-color": v,
          });
        }}
      />

      {/* Radius */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-500 w-12 shrink-0">Radius</label>
        <NumericInput
          value={borderRadius}
          onChange={(v) => onStyleChange("border-radius", v)}
          className="flex-1"
        />
      </div>
    </CollapsibleSection>
  );
}
