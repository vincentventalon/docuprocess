import { useCallback, useEffect, useState } from "react";
import { PageSettings, PageFormat, PageOrientation } from "@/types/page-settings";
import { TemplateInfo } from "./components/TemplateInfo";
import { SectionToggles } from "./components/SectionToggles";
import { NewElementDropdown, ElementType } from "./components/NewElementDropdown";
import { LayersList } from "./components/LayersList";
import { isHeaderComponent } from "../grapes-components/header";
import { isFooterComponent } from "../grapes-components/footer";
import { ChevronLeft } from "lucide-react";

interface LeftPanelProps {
  editor: any;
  templateName: string;
  pageSettings: PageSettings;
  onTemplateNameChange?: (name: string) => void;
  onFormatChange?: (format: PageFormat) => void;
  onOrientationChange?: (orientation: PageOrientation) => void;
  onCollapse?: () => void;
  onStartPlacement?: (type: ElementType) => void;
  infiniteMode?: boolean;
}

// Block content definitions (matching blocks.ts)
const HEADER_CONTENT = {
  type: "header",
  style: {
    position: "relative",
    width: "100%",
    height: "60px",
    padding: "12px 0",
    "box-sizing": "border-box",
    "background-color": "transparent",
    "border-bottom": "1px solid #e5e7eb",
    "margin-top": "0",
    "margin-left": "0",
    "margin-right": "0",
    "margin-bottom": "0",
  },
};

const FOOTER_CONTENT = {
  type: "footer",
  style: {
    position: "relative",
    width: "100%",
    height: "60px",
    padding: "12px 0",
    "box-sizing": "border-box",
    "background-color": "transparent",
    "border-top": "1px solid #e5e7eb",
    "margin-top": "0",
    "margin-left": "0",
    "margin-right": "0",
    "margin-bottom": "0",
  },
};

export const ELEMENT_CONTENT: Record<ElementType, any> = {
  text: {
    type: "div",
    content: "Your text here",
    resizable: true,
    style: {
      width: "120px",
      height: "40px",
      "padding-top": "0",
      "padding-right": "0",
      "padding-bottom": "0",
      "padding-left": "0",
      overflow: "hidden",
    },
  },
  image: {
    type: "image",
    resizable: true,
    style: {
      width: "200px",
      height: "150px",
    },
  },
  table: `
    <table style="width: 500px; height: 64px; table-layout: fixed; margin-left: auto; margin-right: auto; border-collapse: separate; border-spacing: 0;">
      <tr style="height: 32px;">
        <th style="border: 1px solid #ddd; padding: 0; width: 50%; text-align: center; vertical-align: middle;">Header 1</th>
        <th style="border: 1px solid #ddd; padding: 0; width: 50%; text-align: center; vertical-align: middle;">Header 2</th>
      </tr>
      <tr style="height: 32px;">
        <td style="border: 1px solid #ddd; padding: 0; width: 50%; text-align: center; vertical-align: middle;">Cell 1</td>
        <td style="border: 1px solid #ddd; padding: 0; width: 50%; text-align: center; vertical-align: middle;">Cell 2</td>
      </tr>
    </table>
  `,
  barcode: {
    type: "barcode",
    attributes: {
      "data-barcode-value": "123456789012",
      "data-format": "code128",
      "data-display-value": "true",
      "data-line-color": "#111827",
    },
  },
  qrcode: {
    type: "qrcode",
    attributes: {
      "data-qrcode-value": "https://example.com",
      "data-qrcode-fg-color": "#111827",
      "data-qrcode-bg-color": "#ffffff",
      "data-qrcode-error-level": "M",
    },
  },
  section: {
    type: "section",
  },
  "shape-line": {
    type: "shape-line",
    attributes: {
      "data-shape-type": "line",
      "data-shape-stroke": "#111827",
      "data-shape-stroke-width": "2",
      "data-shape-opacity": "1",
    },
    style: {
      position: "absolute",
      width: "200px",
      height: "20px",
    },
  },
  "shape-circle": {
    type: "shape-circle",
    attributes: {
      "data-shape-type": "circle",
      "data-shape-fill": "transparent",
      "data-shape-stroke": "#111827",
      "data-shape-stroke-width": "2",
      "data-shape-opacity": "1",
    },
    style: {
      position: "absolute",
      width: "100px",
      height: "100px",
    },
  },
  "shape-rectangle": {
    type: "shape-rectangle",
    attributes: {
      "data-shape-type": "rectangle",
      "data-shape-fill": "transparent",
      "data-shape-stroke": "#111827",
      "data-shape-stroke-width": "2",
      "data-shape-opacity": "1",
    },
    style: {
      position: "absolute",
      width: "200px",
      height: "100px",
    },
  },
};

export function LeftPanel({
  editor,
  templateName,
  pageSettings,
  onTemplateNameChange,
  onFormatChange,
  onOrientationChange,
  onCollapse,
  onStartPlacement,
  infiniteMode = true,
}: LeftPanelProps) {
  const [hasHeader, setHasHeader] = useState(false);
  const [hasFooter, setHasFooter] = useState(false);

  // Sync header/footer state with GrapesJS
  const syncSections = useCallback(() => {
    if (!editor) return;

    const wrapper = editor.getWrapper();
    if (!wrapper) return;

    const components = wrapper.components?.()?.models || [];

    setHasHeader(components.some((c: any) => isHeaderComponent(c)));
    setHasFooter(components.some((c: any) => isFooterComponent(c)));
  }, [editor]);

  useEffect(() => {
    if (!editor) return;

    // Initial sync
    syncSections();

    // Subscribe to events
    editor.on("component:add", syncSections);
    editor.on("component:remove", syncSections);

    return () => {
      editor.off("component:add", syncSections);
      editor.off("component:remove", syncSections);
    };
  }, [editor, syncSections]);

  const handleHeaderToggle = useCallback(
    (enabled: boolean) => {
      if (!editor) return;

      const wrapper = editor.getWrapper();
      if (!wrapper) return;

      if (enabled) {
        // Add header at the beginning
        wrapper.append(HEADER_CONTENT, { at: 0 });
      } else {
        // Remove header
        const components = wrapper.components?.()?.models || [];
        const header = components.find((c: any) => isHeaderComponent(c));
        if (header) {
          header.remove();
        }
      }
    },
    [editor]
  );

  const handleFooterToggle = useCallback(
    (enabled: boolean) => {
      if (!editor) return;

      const wrapper = editor.getWrapper();
      if (!wrapper) return;

      if (enabled) {
        // Add footer at the end
        wrapper.append(FOOTER_CONTENT);
      } else {
        // Remove footer
        const components = wrapper.components?.()?.models || [];
        const footer = components.find((c: any) => isFooterComponent(c));
        if (footer) {
          footer.remove();
        }
      }
    },
    [editor]
  );

  const handleAddElement = useCallback(
    (type: ElementType) => {
      if (onStartPlacement) {
        // Use click-to-place mode
        onStartPlacement(type);
      } else if (editor) {
        // Fallback: add directly to wrapper
        const content = ELEMENT_CONTENT[type];
        if (!content) return;
        const wrapper = editor.getWrapper();
        if (wrapper) {
          wrapper.append(content);
        }
      }
    },
    [editor, onStartPlacement]
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header with collapse button */}
      {onCollapse && (
        <div className="flex items-center justify-end px-2 py-1.5 border-b border-gray-200 bg-gray-50">
          <button
            onClick={onCollapse}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
            title="Collapse panel"
          >
            <ChevronLeft className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      )}

      <TemplateInfo
        name={templateName}
        format={pageSettings.format}
        orientation={pageSettings.orientation}
        onNameChange={onTemplateNameChange}
        onFormatChange={onFormatChange}
        onOrientationChange={onOrientationChange}
      />

      <SectionToggles
        hasHeader={hasHeader}
        hasFooter={hasFooter}
        onHeaderToggle={handleHeaderToggle}
        onFooterToggle={handleFooterToggle}
        onAddSection={() => handleAddElement("section")}
      />

      <NewElementDropdown onAddElement={handleAddElement} />

      <LayersList editor={editor} />
    </div>
  );
}
