import React, { useState, useEffect } from "react";
import { CollapsibleSection } from "./CollapsibleSection";
import { NumericInput } from "./NumericInput";
import { ColorInput } from "./ColorInput";
import { AlignLeft, AlignCenter, AlignRight, AlignJustify, Italic } from "lucide-react";

// Decimal input with local state for smooth editing
function DecimalInput({
  value,
  onChange,
  placeholder,
  unit,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  unit?: string;
}) {
  const [localValue, setLocalValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setLocalValue(value);
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.replace(/[^0-9.-]/g, "");
    setLocalValue(cleaned);
    // Only update if it's a valid number
    if (cleaned !== "" && !isNaN(Number(cleaned))) {
      onChange(cleaned);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (localValue === "" || isNaN(Number(localValue))) {
      onChange(placeholder);
      setLocalValue(placeholder);
    }
  };

  const input = (
    <input
      type="text"
      inputMode="decimal"
      value={localValue}
      onChange={handleChange}
      onFocus={() => setIsFocused(true)}
      onBlur={handleBlur}
      placeholder={placeholder}
      className="w-full px-2 py-1 text-xs rounded border border-gray-200 bg-white text-gray-900 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
    />
  );

  if (unit) {
    return (
      <div className="flex-1 flex items-center">
        <input
          type="text"
          inputMode="decimal"
          value={localValue}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="w-full px-2 py-1 text-xs rounded-l border border-gray-200 bg-white text-gray-900 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <span className="px-1.5 py-1 text-xs text-gray-400 bg-gray-100 border border-l-0 border-gray-200 rounded-r">
          {unit}
        </span>
      </div>
    );
  }

  return input;
}

interface TypographySectionProps {
  styles: Record<string, string>;
  onStyleChange: (property: string, value: string) => void;
  onStylesChange?: (styles: Record<string, string>) => void;
  attributes?: Record<string, string>;
  onAttributeChange?: (name: string, value: string | null) => void;
}

const FONTS = [
  // Self-hosted fonts (consistent rendering frontend/backend)
  "Inter",
  "Roboto",
  "Open Sans",
  "Lato",
  "Montserrat",
  "Source Sans Pro",
  "IBM Plex Sans",
  "Playfair Display",
  "Merriweather",
  // Signature fonts (for certificates, invitations)
  "Great Vibes",
  "Dancing Script",
  "Pacifico",
  "Allura",
  // Web-safe system fonts
  "Arial",
  "Helvetica",
  "Times New Roman",
  "Georgia",
  "Courier New",
  "Verdana",
  "Tahoma",
];

const WEIGHTS = [
  { value: "300", label: "Light" },
  { value: "400", label: "Regular" },
  { value: "500", label: "Medium" },
  { value: "600", label: "Semibold" },
  { value: "700", label: "Bold" },
];

export function TypographySection({
  styles,
  onStyleChange,
  onStylesChange,
  attributes,
  onAttributeChange,
}: TypographySectionProps) {
  const getValue = (prop: string): string => {
    const value = styles[prop] || "";
    return value.replace(/px$/, "");
  };

  const getDecimalValue = (prop: string): string => {
    const value = styles[prop] || "";
    // Remove common units (px, em, rem)
    return value.replace(/(px|em|rem)$/, "");
  };

  const currentAlign = styles["text-align"] || "left";
  const currentWeight = styles["font-weight"] || "400";
  const currentFont = styles["font-family"]?.replace(/['"]/g, "") || "Inter";
  const isItalic = styles["font-style"] === "italic";

  return (
    <CollapsibleSection title="Typography" defaultOpen={true}>
      {/* Font Family */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-500 w-12 shrink-0">Font</label>
        <select
          value={currentFont}
          onChange={(e) => onStyleChange("font-family", e.target.value)}
          className="flex-1 px-2 py-1 text-xs rounded border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
        >
          {FONTS.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
        <button
          onClick={() => onStyleChange("font-style", isItalic ? "normal" : "italic")}
          className={`p-1.5 rounded border transition-colors ${
            isItalic
              ? "bg-blue-100 text-blue-600 border-blue-200"
              : "hover:bg-gray-100 text-gray-500 border-gray-200"
          }`}
          title="Italic"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Size & Weight */}
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-1">
          <label className="text-xs text-gray-500 w-8 shrink-0">Size</label>
          <NumericInput
            value={getValue("font-size")}
            onChange={(v) => onStyleChange("font-size", v)}
            className="flex-1"
          />
        </div>
        <div className="flex items-center gap-1">
          <label className="text-xs text-gray-500 w-6 shrink-0">Wt</label>
          <select
            value={currentWeight}
            onChange={(e) => onStyleChange("font-weight", e.target.value)}
            className="flex-1 px-2 py-1 text-xs rounded border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            {WEIGHTS.map((w) => (
              <option key={w.value} value={w.value}>
                {w.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Color */}
      <ColorInput
        label="Color"
        value={styles["color"] || "#1f2937"}
        onChange={(v) => onStyleChange("color", v)}
      />

      {/* Line Height & Letter Spacing */}
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-1">
          <label className="text-xs text-gray-500 w-8 shrink-0">Line</label>
          <DecimalInput
            value={getDecimalValue("line-height")}
            onChange={(v) => onStyleChange("line-height", v)}
            placeholder="1.6"
          />
        </div>
        <div className="flex items-center gap-1">
          <label className="text-xs text-gray-500 w-8 shrink-0">Spc</label>
          <DecimalInput
            value={getDecimalValue("letter-spacing")}
            onChange={(v) => onStyleChange("letter-spacing", `${v}em`)}
            placeholder="0"
            unit="em"
          />
        </div>
      </div>

      {/* Text Align */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-500 w-12 shrink-0">Align</label>
        <div className="flex gap-1">
          {[
            { value: "left", Icon: AlignLeft },
            { value: "center", Icon: AlignCenter },
            { value: "right", Icon: AlignRight },
            { value: "justify", Icon: AlignJustify },
          ].map(({ value, Icon }) => (
            <button
              key={value}
              onClick={() => onStyleChange("text-align", value)}
              className={`p-1.5 rounded transition-colors ${
                currentAlign === value
                  ? "bg-blue-100 text-blue-600"
                  : "hover:bg-gray-100 text-gray-500"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
            </button>
          ))}
        </div>
      </div>

      {/* Autoscale Down - only show if attribute handling is available */}
      {onAttributeChange && (
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 flex-1">Autoscale down</label>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={attributes?.["data-autoscale-down"] === "true"}
              onChange={(e) => {
                onAttributeChange("data-autoscale-down", e.target.checked ? "true" : null);
              }}
            />
            <div className="w-8 h-4 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-500"></div>
          </label>
        </div>
      )}
    </CollapsibleSection>
  );
}
