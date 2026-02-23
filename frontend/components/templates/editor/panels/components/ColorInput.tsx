import React, { useMemo } from "react";

interface ColorInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  showTransparent?: boolean;
}

function isTransparent(value: string): boolean {
  if (!value) return false;
  if (value === "transparent") return true;
  // Check rgba with alpha 0
  const match = value.match(/rgba\(\d+,\s*\d+,\s*\d+,\s*([\d.]+)\)/);
  if (match && parseFloat(match[1]) === 0) return true;
  return false;
}

function rgbToHex(rgb: string): string {
  // Handle rgb(r, g, b) format
  const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (match) {
    const r = parseInt(match[1]).toString(16).padStart(2, "0");
    const g = parseInt(match[2]).toString(16).padStart(2, "0");
    const b = parseInt(match[3]).toString(16).padStart(2, "0");
    return `#${r}${g}${b}`;
  }

  // Handle rgba(r, g, b, a) format
  const matchA = rgb.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/);
  if (matchA) {
    const r = parseInt(matchA[1]).toString(16).padStart(2, "0");
    const g = parseInt(matchA[2]).toString(16).padStart(2, "0");
    const b = parseInt(matchA[3]).toString(16).padStart(2, "0");
    return `#${r}${g}${b}`;
  }

  return rgb;
}

export function ColorInput({
  label,
  value,
  onChange,
  className = "",
  showTransparent = false,
}: ColorInputProps) {
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handlePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const transparent = showTransparent && isTransparent(value);

  // Convert color to hex for the picker
  const hexValue = useMemo(() => {
    if (!value || (showTransparent && isTransparent(value))) return "#ffffff";
    if (value.startsWith("#")) return value.slice(0, 7);
    if (value.startsWith("rgb")) return rgbToHex(value);
    return "#ffffff";
  }, [value, showTransparent]);

  // Display value - show "transparent" for transparent colors
  const displayValue = transparent ? "transparent" : (value || "");

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {label && (
        <label className="text-xs text-gray-500 w-16 shrink-0">{label}</label>
      )}
      <div className="flex-1 flex items-center gap-1">
        {/* Checkerboard for transparent - only when showTransparent is true */}
        {showTransparent && (
          <div
            className={`w-7 h-7 border rounded cursor-pointer relative overflow-hidden shrink-0 ${
              transparent ? "border-blue-500 ring-1 ring-blue-500" : "border-gray-200"
            }`}
            onClick={() => onChange("transparent")}
            title="Set transparent"
            style={{
              backgroundImage: `linear-gradient(45deg, #ccc 25%, transparent 25%),
                               linear-gradient(-45deg, #ccc 25%, transparent 25%),
                               linear-gradient(45deg, transparent 75%, #ccc 75%),
                               linear-gradient(-45deg, transparent 75%, #ccc 75%)`,
              backgroundSize: "8px 8px",
              backgroundPosition: "0 0, 0 4px, 4px -4px, -4px 0px",
            }}
          />
        )}
        {/* Color picker */}
        <input
          type="color"
          value={hexValue}
          onChange={handlePickerChange}
          className={`w-7 h-7 p-0 border rounded cursor-pointer bg-white shrink-0 ${
            showTransparent && !transparent ? "border-blue-500 ring-1 ring-blue-500" : showTransparent ? "border-gray-200" : ""
          }`}
          style={{ padding: "2px" }}
        />
        <input
          type="text"
          value={displayValue}
          onChange={handleTextChange}
          className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded bg-white text-gray-900 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="#000000"
        />
      </div>
    </div>
  );
}
