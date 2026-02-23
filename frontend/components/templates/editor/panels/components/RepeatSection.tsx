import React, { useState, useEffect } from "react";
import { CollapsibleSection } from "./CollapsibleSection";

interface RepeatSectionProps {
  component: any;
}

export function RepeatSection({ component }: RepeatSectionProps) {
  const [isRepeating, setIsRepeating] = useState(false);
  const [arrayName, setArrayName] = useState("");
  const [columns, setColumns] = useState(1);

  // Load current values from component attributes
  useEffect(() => {
    if (component) {
      const attrs = component.getAttributes();
      const source = attrs["data-repeat-source"] || "";
      const cols = parseInt(attrs["data-repeat-columns"] || "1", 10);
      setIsRepeating(!!source || cols > 1);
      setArrayName(source);
      setColumns(cols);
    }
  }, [component]);

  const updateAttributes = (
    repeating: boolean,
    source: string,
    cols: number
  ) => {
    if (!component) return;
    const attrs = { ...component.getAttributes() };

    if (repeating) {
      if (source) {
        attrs["data-repeat-source"] = source;
      } else {
        delete attrs["data-repeat-source"];
      }
      attrs["data-repeat-columns"] = String(cols);
    } else {
      delete attrs["data-repeat-source"];
      delete attrs["data-repeat-columns"];
    }

    component.setAttributes(attrs);
  };

  const handleToggle = (checked: boolean) => {
    setIsRepeating(checked);
    if (!checked) {
      setArrayName("");
      setColumns(1);
      updateAttributes(false, "", 1);
    } else {
      updateAttributes(true, arrayName, columns);
    }
  };

  const handleArrayNameChange = (value: string) => {
    // Strip {{ }} — users may type template syntax but we need the bare name
    const clean = value.replace(/^\{\{|\}\}$/g, "").trim();
    setArrayName(clean);
    updateAttributes(true, clean, columns);
  };

  const handleColumnsChange = (value: number) => {
    const clamped = Math.max(1, Math.min(10, value));
    setColumns(clamped);
    updateAttributes(true, arrayName, clamped);
  };

  return (
    <CollapsibleSection title="Repeating" defaultOpen>
      <div className="space-y-3">
        {/* Toggle */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isRepeating}
            onChange={(e) => handleToggle(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-xs font-medium text-gray-600">
            Repeating section
          </span>
        </label>

        {isRepeating && (
          <>
            {/* Array name */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Array name
              </label>
              <input
                type="text"
                value={arrayName}
                onChange={(e) => handleArrayNameChange(e.target.value)}
                placeholder="e.g. items"
                className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Columns */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Columns
              </label>
              <input
                type="number"
                value={columns}
                onChange={(e) => handleColumnsChange(parseInt(e.target.value, 10) || 1)}
                min={1}
                max={10}
                className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </>
        )}
      </div>
    </CollapsibleSection>
  );
}
