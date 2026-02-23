import React, { useState, useEffect, useCallback } from "react";
import { MousePointer } from "lucide-react";
import { useSelectedComponent } from "./hooks/useSelectedComponent";
import { DimensionsSection } from "./components/DimensionsSection";
import { TypographySection } from "./components/TypographySection";
import { FillSection } from "./components/FillSection";
import { BorderSection } from "./components/BorderSection";
import { PaddingSection } from "./components/PaddingSection";
import { PageMarginsSection } from "./components/PageMarginsSection";
import { BodyTypographySection } from "./components/BodyTypographySection";
import { PageSettings, PagePadding } from "@/types/page-settings";
import { TraitsSection } from "./components/TraitsSection";
import { ImageSourceSection } from "./components/ImageSourceSection";
import { RepeatSection } from "./components/RepeatSection";

// Helper to get all cells from a table component
function getAllCellsFromTable(tableComponent: any): any[] {
  if (!tableComponent) return [];
  const cells: any[] = [];
  const findCells = (component: any) => {
    const tagName = component?.get?.("tagName")?.toLowerCase?.();
    if (tagName === "td" || tagName === "th") {
      cells.push(component);
    }
    const children = component?.components?.();
    if (children?.models) {
      children.models.forEach((child: any) => findCells(child));
    }
  };
  findCells(tableComponent);
  return cells;
}

// Get styles from the first cell of a table
function getCellStyles(tableComponent: any): Record<string, string> {
  const cells = getAllCellsFromTable(tableComponent);
  if (cells.length === 0) return {};

  const firstCell = cells[0];
  const modelStyles = firstCell.getStyle?.() || {};
  const el = firstCell.getEl?.();
  const computedStyles: Record<string, string> = {};

  if (el) {
    const computed = window.getComputedStyle(el);
    const props = [
      "font-family",
      "font-size",
      "font-weight",
      "color",
      "text-align",
      "vertical-align",
      "background-color",
      "border-width",
      "border-color",
      "border-style",
      "padding-top",
      "padding-right",
      "padding-bottom",
      "padding-left",
    ];
    props.forEach((prop) => {
      const value = computed.getPropertyValue(prop);
      if (value) computedStyles[prop] = value;
    });
  }

  return { ...computedStyles, ...modelStyles };
}

interface StylePanelProps {
  editor: any;
  pageSettings?: PageSettings;
  onPaddingChange?: (padding: PagePadding) => void;
  customCss?: string;
  onCustomCssChange?: (css: string) => void;
}

// Define which sections are visible for each component type
const VISIBLE_SECTIONS: Record<string, string[]> = {
  wrapper: ["bodyTypography", "fill", "pageMargins", "border"], // Page - special sections
  text: ["dimensions", "typography", "fill", "border", "padding"],
  div: ["dimensions", "typography", "fill", "border", "padding"],
  image: ["imageSource", "dimensions", "fill", "border"],
  table: ["dimensions", "fill", "border"],
  "table-cell": ["typography", "fill", "border", "padding"], // Single cell
  "table-cells": ["typography", "fill", "border", "padding"], // All cells (bulk edit)
  section: ["repeat", "dimensions", "fill", "border", "padding"],
  header: ["dimensions", "fill", "border", "padding"],
  footer: ["dimensions", "fill", "border", "padding"],
  barcode: ["traits", "dimensions"],
  qrcode: ["traits", "dimensions"],
  "shape-line": ["traits", "dimensions"],
  "shape-circle": ["traits", "dimensions"],
  "shape-rectangle": ["traits", "dimensions"],
  default: ["dimensions", "fill", "border"],
};

function getVisibleSections(type: string): string[] {
  return VISIBLE_SECTIONS[type] || VISIBLE_SECTIONS.default;
}

// Sub-element selector options for specific component types
type SubElement = "table" | "table-cells";
const SUB_ELEMENT_OPTIONS: Record<string, { value: SubElement; label: string }[]> = {
  table: [
    { value: "table", label: "Table" },
    { value: "table-cells", label: "All cells" },
  ],
};

export function StylePanel({
  editor,
  pageSettings,
  onPaddingChange,
  customCss = "",
  onCustomCssChange,
}: StylePanelProps) {
  const { component, type, name, styles, updateStyle, updateStyles, attributes, updateAttribute } =
    useSelectedComponent(editor);
  const [selectedSubElement, setSelectedSubElement] = useState<SubElement | null>(null);
  const [cellStyles, setCellStyles] = useState<Record<string, string>>({});

  // Reset sub-element when component changes
  useEffect(() => {
    if (type === "table") {
      setSelectedSubElement("table");
      setCellStyles(getCellStyles(component));
    } else {
      setSelectedSubElement(null);
      setCellStyles({});
    }
  }, [component, type]);

  // Update cell styles function - applies to all cells
  const updateCellStyle = useCallback(
    (property: string, value: string) => {
      if (!component || selectedSubElement !== "table-cells") return;

      const needsUnit = [
        "font-size",
        "border-width",
        "border-radius",
        "border-top-width",
        "border-right-width",
        "border-bottom-width",
        "border-left-width",
        "padding",
        "padding-top",
        "padding-right",
        "padding-bottom",
        "padding-left",
      ].includes(property);

      let finalValue = value;
      if (needsUnit && value && !value.includes("px") && !isNaN(Number(value))) {
        finalValue = `${value}px`;
      }

      const cells = getAllCellsFromTable(component);
      cells.forEach((cell) => {
        cell.addStyle({ [property]: finalValue });
      });

      setCellStyles((prev) => ({ ...prev, [property]: finalValue }));
    },
    [component, selectedSubElement]
  );

  // Update multiple cell styles at once
  const updateCellStyles = useCallback(
    (newStyles: Record<string, string>) => {
      if (!component || selectedSubElement !== "table-cells") return;

      const processedStyles: Record<string, string> = {};
      Object.entries(newStyles).forEach(([property, value]) => {
        const needsUnit = [
          "font-size",
          "border-width",
          "border-radius",
          "padding",
          "padding-top",
          "padding-right",
          "padding-bottom",
          "padding-left",
        ].includes(property);

        if (needsUnit && value && !value.includes("px") && !isNaN(Number(value))) {
          processedStyles[property] = `${value}px`;
        } else {
          processedStyles[property] = value;
        }
      });

      const cells = getAllCellsFromTable(component);
      cells.forEach((cell) => {
        cell.addStyle(processedStyles);
      });

      setCellStyles((prev) => ({ ...prev, ...processedStyles }));
    },
    [component, selectedSubElement]
  );

  // Empty state
  if (!component) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-4 py-8 text-center text-gray-400">
        <MousePointer className="w-8 h-8 mb-3 text-gray-300" />
        <span className="text-sm font-medium">Select an element</span>
        <span className="text-xs mt-1 text-gray-400">
          to edit its properties
        </span>
      </div>
    );
  }

  // Determine effective type and styles based on sub-element selection
  const hasSubElements = SUB_ELEMENT_OPTIONS[type];
  const effectiveType = selectedSubElement === "table-cells" ? "table-cells" : type;
  const effectiveStyles = selectedSubElement === "table-cells" ? cellStyles : styles;
  const effectiveUpdateStyle = selectedSubElement === "table-cells" ? updateCellStyle : updateStyle;
  const effectiveUpdateStyles = selectedSubElement === "table-cells" ? updateCellStyles : updateStyles;

  const visibleSections = getVisibleSections(effectiveType);

  return (
    <div className="flex flex-col h-full">
      {/* Header with component name and sub-element selector */}
      <div className="px-3 py-2 border-b border-gray-200 bg-white">
        <h3 className="text-sm font-medium text-gray-900 truncate">{name}</h3>
        {hasSubElements && (
          <div className="flex gap-1 mt-2">
            {SUB_ELEMENT_OPTIONS[type].map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setSelectedSubElement(option.value);
                  if (option.value === "table-cells") {
                    setCellStyles(getCellStyles(component));
                  }
                }}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  selectedSubElement === option.value
                    ? "bg-blue-100 text-blue-700 font-medium"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="pb-4">
          {/* Body Typography - only for wrapper/page */}
          {visibleSections.includes("bodyTypography") && onCustomCssChange && (
            <BodyTypographySection
              customCss={customCss}
              onCustomCssChange={onCustomCssChange}
            />
          )}

          {/* Traits - for barcode and qrcode */}
          {visibleSections.includes("traits") && (
            <TraitsSection component={component} />
          )}

          {/* Image Source - for images */}
          {visibleSections.includes("imageSource") && (
            <ImageSourceSection component={component} />
          )}

          {/* Repeat - for sections */}
          {visibleSections.includes("repeat") && (
            <RepeatSection component={component} />
          )}

          {/* Dimensions - always first, no collapsible wrapper */}
          {visibleSections.includes("dimensions") && (
            <DimensionsSection styles={effectiveStyles} onStyleChange={effectiveUpdateStyle} />
          )}

          {/* Typography - only for text-like components */}
          {visibleSections.includes("typography") && (
            <TypographySection
              styles={effectiveStyles}
              onStyleChange={effectiveUpdateStyle}
              onStylesChange={effectiveUpdateStyles}
              attributes={selectedSubElement === "table-cells" ? undefined : attributes}
              onAttributeChange={selectedSubElement === "table-cells" ? undefined : updateAttribute}
            />
          )}

          {/* Fill */}
          {visibleSections.includes("fill") && (
            <FillSection styles={effectiveStyles} onStyleChange={effectiveUpdateStyle} />
          )}

          {/* Page Margins - only for wrapper/page (above border) */}
          {visibleSections.includes("pageMargins") &&
            pageSettings &&
            onPaddingChange && (
              <PageMarginsSection
                padding={pageSettings.padding}
                onPaddingChange={onPaddingChange}
              />
            )}

          {/* Border */}
          {visibleSections.includes("border") && (
            <BorderSection
              key={`border-${effectiveType}`}
              styles={effectiveStyles}
              onStyleChange={effectiveUpdateStyle}
              onStylesChange={effectiveUpdateStyles}
            />
          )}

          {/* Padding - for regular components */}
          {visibleSections.includes("padding") && (
            <PaddingSection
              key={`padding-${effectiveType}`}
              styles={effectiveStyles}
              onStyleChange={effectiveUpdateStyle}
              onStylesChange={effectiveUpdateStyles}
            />
          )}

        </div>
      </div>
    </div>
  );
}
