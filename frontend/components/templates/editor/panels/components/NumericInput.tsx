import React, { useState, useEffect } from "react";

interface NumericInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  unit?: string;
  placeholder?: string;
  className?: string;
}

export function NumericInput({
  label,
  value,
  onChange,
  unit = "px",
  placeholder = "0",
  className = "",
}: NumericInputProps) {
  // Parse the incoming value (remove px suffix if present)
  const rawValue = value?.replace?.(/px$/, "") || "";
  const externalValue = rawValue === "0" ? "" : rawValue;

  // Local state for editing - allows empty values while typing
  const [localValue, setLocalValue] = useState(externalValue);
  const [isFocused, setIsFocused] = useState(false);

  // Sync local state when external value changes (but not while focused)
  useEffect(() => {
    if (!isFocused) {
      setLocalValue(externalValue);
    }
  }, [externalValue, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Allow numbers, negative sign, and decimal point
    const cleaned = raw.replace(/[^0-9.-]/g, "");
    setLocalValue(cleaned);

    // Only call onChange with valid numeric values
    if (cleaned !== "" && !isNaN(Number(cleaned))) {
      onChange(cleaned);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    // On blur, if empty or invalid, treat as 0
    if (localValue === "" || isNaN(Number(localValue))) {
      onChange("0");
      setLocalValue("");
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {label && (
        <label className="text-xs text-gray-500 w-6 shrink-0 text-center">
          {label}
        </label>
      )}
      <div className="flex-1 flex items-center">
        <input
          type="text"
          inputMode="numeric"
          value={localValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="w-full px-2 py-1 text-xs rounded-l border border-gray-200 bg-white text-gray-900 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <span className="px-1.5 py-1 text-xs text-gray-400 bg-gray-100 border border-l-0 border-gray-200 rounded-r">
          {unit}
        </span>
      </div>
    </div>
  );
}
