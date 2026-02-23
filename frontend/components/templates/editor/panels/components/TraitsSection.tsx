import React, { useEffect, useState, useCallback } from "react";
import { CollapsibleSection } from "./CollapsibleSection";
import { ColorInput } from "./ColorInput";

interface Trait {
  name: string;
  label: string;
  type: string;
  value: string;
  options?: { id: string; name: string }[];
  placeholder?: string;
}

interface TraitsSectionProps {
  component: any;
  onTraitChange?: () => void;
}

export function TraitsSection({ component, onTraitChange }: TraitsSectionProps) {
  const [traits, setTraits] = useState<Trait[]>([]);

  // Get traits from component
  const loadTraits = useCallback(() => {
    if (!component) return;

    const traitModels = component.get("traits")?.models || [];
    const traitData: Trait[] = traitModels.map((trait: any) => ({
      name: trait.get("name"),
      label: trait.get("label") || trait.get("name"),
      type: trait.get("type") || "text",
      value: trait.getTargetValue?.() || component.getAttributes()[trait.get("name")] || "",
      options: trait.get("options"),
      placeholder: trait.get("placeholder"),
    }));

    setTraits(traitData);
  }, [component]);

  useEffect(() => {
    loadTraits();

    // Listen for attribute changes
    if (component) {
      component.on("change:attributes", loadTraits);
      return () => {
        component.off("change:attributes", loadTraits);
      };
    }
  }, [component, loadTraits]);

  const handleTraitChange = (traitName: string, value: string) => {
    if (!component) return;

    const attrs = { ...component.getAttributes(), [traitName]: value };
    component.setAttributes(attrs);
    onTraitChange?.();
  };

  if (traits.length === 0) return null;

  return (
    <CollapsibleSection title="Properties" defaultOpen>
      <div className="space-y-3">
        {traits.map((trait) => (
          <div key={trait.name}>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              {trait.label}
            </label>

            {trait.type === "text" && (
              <input
                type="text"
                value={trait.value}
                onChange={(e) => handleTraitChange(trait.name, e.target.value)}
                placeholder={trait.placeholder}
                className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            )}

            {trait.type === "select" && trait.options && (
              <select
                value={trait.value}
                onChange={(e) => handleTraitChange(trait.name, e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              >
                {trait.options.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            )}

            {trait.type === "color" && (
              <ColorInput
                value={trait.value}
                onChange={(value) => handleTraitChange(trait.name, value)}
              />
            )}

            {trait.type === "checkbox" && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={trait.value === "true"}
                  onChange={(e) => handleTraitChange(trait.name, e.target.checked ? "true" : "false")}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Enabled</span>
              </label>
            )}
          </div>
        ))}
      </div>
    </CollapsibleSection>
  );
}
