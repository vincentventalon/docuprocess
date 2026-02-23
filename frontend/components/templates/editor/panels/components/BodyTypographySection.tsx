import React, { useMemo, useCallback, useState, useEffect } from "react";
import { CollapsibleSection } from "./CollapsibleSection";
import { NumericInput } from "./NumericInput";
import { ColorInput } from "./ColorInput";

interface BodyTypographySectionProps {
  customCss: string;
  onCustomCssChange: (css: string) => void;
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

interface BodyStyles {
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  letterSpacing: string;
  color: string;
  background: string;
}

export const DEFAULT_BODY_STYLES: BodyStyles = {
  fontFamily: "Inter",
  fontSize: "12",
  fontWeight: "400",
  lineHeight: "1.6",
  letterSpacing: "0.015",
  color: "#1f2937",
  background: "#ffffff",
};

// Parse body styles from CSS string
function parseBodyStyles(css: string): BodyStyles {
  const styles = { ...DEFAULT_BODY_STYLES };

  // Extract body block
  const bodyMatch = css.match(/body\s*\{([^}]*)\}/i);
  if (!bodyMatch) return styles;

  const bodyBlock = bodyMatch[1];

  // Parse individual properties
  const fontFamilyMatch = bodyBlock.match(/font-family:\s*["']?([^;,"']+)/i);
  if (fontFamilyMatch) styles.fontFamily = fontFamilyMatch[1].trim();

  const fontSizeMatch = bodyBlock.match(/font-size:\s*(\d+(?:\.\d+)?)/i);
  if (fontSizeMatch) styles.fontSize = fontSizeMatch[1];

  const fontWeightMatch = bodyBlock.match(/font-weight:\s*(\d+)/i);
  if (fontWeightMatch) styles.fontWeight = fontWeightMatch[1];

  const lineHeightMatch = bodyBlock.match(/line-height:\s*(\d+(?:\.\d+)?)/i);
  if (lineHeightMatch) styles.lineHeight = lineHeightMatch[1];

  const letterSpacingMatch = bodyBlock.match(/letter-spacing:\s*(\d+(?:\.\d+)?)/i);
  if (letterSpacingMatch) styles.letterSpacing = letterSpacingMatch[1];

  const colorMatch = bodyBlock.match(/(?:^|[^-])color:\s*(#[0-9a-fA-F]{3,8}|rgb[a]?\([^)]+\)|[a-z]+)/i);
  if (colorMatch) styles.color = colorMatch[1].trim();

  const backgroundMatch = bodyBlock.match(/background(?:-color)?:\s*(#[0-9a-fA-F]{3,8}|rgb[a]?\([^)]+\)|[a-z]+)/i);
  if (backgroundMatch) styles.background = backgroundMatch[1].trim();

  return styles;
}

// Generate CSS string from body styles
function generateBodyCss(styles: BodyStyles): string {
  return `body {
  font-family: "${styles.fontFamily}";
  font-size: ${styles.fontSize}px;
  font-weight: ${styles.fontWeight};
  line-height: ${styles.lineHeight};
  letter-spacing: ${styles.letterSpacing}em;
  color: ${styles.color};
  background: ${styles.background};
}`;
}

// Generate default body CSS string for use outside this component
export function getDefaultBodyCss(): string {
  return generateBodyCss(DEFAULT_BODY_STYLES);
}

// Update CSS string with new body styles, preserving other rules
function updateCssWithBodyStyles(originalCss: string, newStyles: BodyStyles): string {
  const newBodyCss = generateBodyCss(newStyles);

  // Check if there's an existing body block
  if (/body\s*\{[^}]*\}/i.test(originalCss)) {
    // Replace existing body block
    return originalCss.replace(/body\s*\{[^}]*\}/i, newBodyCss);
  } else {
    // Add body block at the beginning
    return originalCss ? `${newBodyCss}\n\n${originalCss}` : newBodyCss;
  }
}

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
      className={`w-full px-2 py-1 text-xs ${unit ? "rounded-l" : "rounded"} border border-gray-200 bg-white text-gray-900 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500`}
    />
  );

  if (unit) {
    return (
      <div className="flex-1 flex items-center">
        {input}
        <span className="px-1.5 py-1 text-xs text-gray-400 bg-gray-100 border border-l-0 border-gray-200 rounded-r">
          {unit}
        </span>
      </div>
    );
  }

  return input;
}

export function BodyTypographySection({
  customCss,
  onCustomCssChange,
}: BodyTypographySectionProps) {
  const bodyStyles = useMemo(() => parseBodyStyles(customCss), [customCss]);

  const updateStyle = useCallback((property: keyof BodyStyles, value: string) => {
    const newStyles = { ...bodyStyles, [property]: value };
    const newCss = updateCssWithBodyStyles(customCss, newStyles);
    onCustomCssChange(newCss);
  }, [bodyStyles, customCss, onCustomCssChange]);

  return (
    <CollapsibleSection title="Body Typography" defaultOpen={true}>
      {/* Font Family */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-500 w-12 shrink-0">Font</label>
        <select
          value={bodyStyles.fontFamily}
          onChange={(e) => updateStyle("fontFamily", e.target.value)}
          className="flex-1 px-2 py-1 text-xs rounded border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
        >
          {FONTS.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </div>

      {/* Size & Weight */}
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-1">
          <label className="text-xs text-gray-500 w-8 shrink-0">Size</label>
          <NumericInput
            value={bodyStyles.fontSize}
            onChange={(v) => updateStyle("fontSize", v)}
            className="flex-1"
          />
        </div>
        <div className="flex items-center gap-1">
          <label className="text-xs text-gray-500 w-6 shrink-0">Wt</label>
          <select
            value={bodyStyles.fontWeight}
            onChange={(e) => updateStyle("fontWeight", e.target.value)}
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

      {/* Line Height & Letter Spacing */}
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-1">
          <label className="text-xs text-gray-500 w-8 shrink-0">Line</label>
          <DecimalInput
            value={bodyStyles.lineHeight}
            onChange={(v) => updateStyle("lineHeight", v)}
            placeholder="1.6"
          />
        </div>
        <div className="flex items-center gap-1">
          <label className="text-xs text-gray-500 w-8 shrink-0">Spc</label>
          <DecimalInput
            value={bodyStyles.letterSpacing}
            onChange={(v) => updateStyle("letterSpacing", v)}
            placeholder="0.015"
            unit="em"
          />
        </div>
      </div>

      {/* Text Color */}
      <ColorInput
        label="Text"
        value={bodyStyles.color}
        onChange={(v) => updateStyle("color", v)}
      />

      {/* Background */}
      <ColorInput
        label="Background"
        value={bodyStyles.background}
        onChange={(v) => updateStyle("background", v)}
      />
    </CollapsibleSection>
  );
}
