import { PageSettings, PageFormat, PageOrientation, PagePadding } from "@/types/page-settings";
import { ResizeBounds } from "./utils/resize-constraints";

export interface GrapesJSEditorProps {
  htmlContent: string;
  cssContent?: string;
  onChange: (html: string) => void;
  onCssChange?: (css: string) => void;
  onDirty?: () => void;
  pageSettings?: PageSettings;
  externalCss?: string;
  infiniteMode?: boolean;
  // External panel control
  rightPanelVisible?: boolean;
  // Expose editor ref for external actions (undo, redo, toggle borders)
  onEditorReady?: (editor: any) => void;
  // Template info for left panel
  templateName?: string;
  onTemplateNameChange?: (name: string) => void;
  onFormatChange?: (format: PageFormat) => void;
  onOrientationChange?: (orientation: PageOrientation) => void;
  onPaddingChange?: (padding: PagePadding) => void;
  customCss?: string;
  onCustomCssChange?: (css: string) => void;
}

export type ResizeSnapshot = {
  handle?: string;
  affectsLeft: boolean;
  affectsTop: boolean;
  isAbsolute: boolean;
  startWidth: number;
  startHeight: number;
  startLeft: number;
  startTop: number;
  initialMarginLeft: number;
  initialMarginTop: number;
  aspectRatio: number;
  isImage: boolean;
  bounds: ResizeBounds;
  minWidth?: number;
  minHeight?: number;
};

export const MARGIN_GUIDE_STYLE_ID = "gjs-margin-guides";
export const MARGIN_GUIDE_ELEMENT_ID = "gjs-margin-guides-box";
export const HEADER_HIGHLIGHT_STYLE_ID = "gjs-header-drop-zone-highlight";
export const FOOTER_HIGHLIGHT_STYLE_ID = "gjs-footer-drop-zone-highlight";
export const SECTION_DROP_INDICATOR_STYLE_ID = "gjs-section-drop-indicator-styles";
export const SECTION_DROP_INDICATOR_ELEMENT_ID = "gjs-section-drop-indicator";
export const PLACEMENT_GHOST_ELEMENT_ID = "gjs-placement-ghost";
