import { PageSettings, PAGE_DIMENSIONS_MM } from "@/types/page-settings";
import {
  MARGIN_GUIDE_STYLE_ID,
  MARGIN_GUIDE_ELEMENT_ID,
  HEADER_HIGHLIGHT_STYLE_ID,
  FOOTER_HIGHLIGHT_STYLE_ID,
  SECTION_DROP_INDICATOR_STYLE_ID,
  SECTION_DROP_INDICATOR_ELEMENT_ID,
} from "../types";

const IMAGE_OUTLINE_STYLE_ID = 'gjs-image-outline-styles';

export const updateMarginGuides = (editor: any, settings: PageSettings) => {
  const frame = editor?.Canvas?.getFrameEl?.();
  const doc = frame?.contentDocument;
  const wrapperComponent = editor?.getWrapper?.();
  const wrapperEl = wrapperComponent?.getEl?.();

  if (!doc || !wrapperEl) return;

  const { top, right, bottom, left } = settings.padding;

  // Make sure wrapper can position the overlay
  wrapperEl.style.position = wrapperEl.style.position || "relative";

  let styleEl = doc.getElementById(MARGIN_GUIDE_STYLE_ID) as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = doc.createElement("style");
    styleEl.id = MARGIN_GUIDE_STYLE_ID;
    doc.head.appendChild(styleEl);
  }

  styleEl.textContent = `
    #${MARGIN_GUIDE_ELEMENT_ID} {
      position: absolute;
      top: ${top}mm;
      right: ${right}mm;
      bottom: ${bottom}mm;
      left: ${left}mm;
      border: 1px dashed rgba(156, 163, 175, 0.6);
      pointer-events: none;
      box-sizing: border-box;
      z-index: 9999;
      user-select: none;
      mix-blend-mode: multiply;
    }
  `;

  let guideEl = doc.getElementById(MARGIN_GUIDE_ELEMENT_ID) as HTMLDivElement | null;
  if (!guideEl) {
    guideEl = doc.createElement("div");
    guideEl.id = MARGIN_GUIDE_ELEMENT_ID;
    wrapperEl.appendChild(guideEl);
  }
};

export const injectHeaderHighlightStyles = (editor: any) => {
  const frame = editor?.Canvas?.getFrameEl?.();
  const doc = frame?.contentDocument;
  if (!doc) return;

  let styleEl = doc.getElementById(HEADER_HIGHLIGHT_STYLE_ID) as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = doc.createElement("style");
    styleEl.id = HEADER_HIGHLIGHT_STYLE_ID;
    doc.head.appendChild(styleEl);
  }

  styleEl.textContent = `
    .header-drop-zone-active {
      background-color: rgba(34, 197, 94, 0.15) !important;
      outline: 2px dashed rgb(34, 197, 94) !important;
      outline-offset: -2px !important;
      box-shadow: inset 0 0 0 4px rgba(34, 197, 94, 0.2) !important;
      transition: all 0.2s ease-in-out !important;
    }
  `;
};

export const injectFooterHighlightStyles = (editor: any) => {
  const frame = editor?.Canvas?.getFrameEl?.();
  const doc = frame?.contentDocument;
  if (!doc) return;

  let styleEl = doc.getElementById(FOOTER_HIGHLIGHT_STYLE_ID) as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = doc.createElement("style");
    styleEl.id = FOOTER_HIGHLIGHT_STYLE_ID;
    doc.head.appendChild(styleEl);
  }

  styleEl.textContent = `
    .footer-drop-zone-active {
      background-color: rgba(168, 85, 247, 0.15) !important;
      outline: 2px dashed rgb(168, 85, 247) !important;
      outline-offset: -2px !important;
      box-shadow: inset 0 0 0 4px rgba(168, 85, 247, 0.2) !important;
      transition: all 0.2s ease-in-out !important;
    }
  `;
};

export const injectImageOutlineStyles = (editor: any) => {
  const frame = editor?.Canvas?.getFrameEl?.();
  const doc = frame?.contentDocument;
  if (!doc) return;

  let styleEl = doc.getElementById(IMAGE_OUTLINE_STYLE_ID) as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = doc.createElement("style");
    styleEl.id = IMAGE_OUTLINE_STYLE_ID;
    doc.head.appendChild(styleEl);
  }

  // When GrapesJS sw-visibility is active, the body gets the 'gjs-dashed' class
  // Make sure images also show outlines in this mode
  styleEl.textContent = `
    body.gjs-dashed img {
      outline: 1px dashed rgba(139, 92, 246, 0.5) !important;
      outline-offset: -1px !important;
    }

    body.gjs-dashed [data-gjs-type="image"] {
      outline: 1px dashed rgba(139, 92, 246, 0.5) !important;
      outline-offset: -1px !important;
    }

    /* Broken/template image placeholder */
    img.gjs-image-broken {
      background:
        url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpolyline points='21 15 16 10 5 21'/%3E%3C/svg%3E") center 35% no-repeat,
        linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      background-size: 32px 32px, 100% 100%;
      border: 1px dashed #cbd5e1;
      border-radius: 4px;
    }

    .gjs-image-placeholder-wrapper {
      position: relative;
      display: inline-block;
    }

    .gjs-image-placeholder-overlay {
      position: absolute;
      bottom: 8px;
      left: 4px;
      right: 4px;
      text-align: center;
      font-size: 11px;
      font-family: ui-monospace, monospace;
      color: #64748b;
      background: rgba(255, 255, 255, 0.9);
      padding: 4px 8px;
      border-radius: 4px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      pointer-events: none;
    }

    /* Hide text overflow in table cells */
    td, th {
      overflow: hidden;
    }
  `;
};

export const applyPageSettings = (editor: any, settings: PageSettings, infiniteMode: boolean = false) => {
  const wrapper = editor?.getWrapper?.();
  if (!wrapper) return;

  // Preserve user-set background-color before setStyle replaces everything
  const existingStyle = wrapper.getStyle() || {};
  const savedBgColor = existingStyle['background-color'];

  const dimensions = PAGE_DIMENSIONS_MM[settings.format] ?? PAGE_DIMENSIONS_MM.A4;
  const isPortrait = settings.orientation === "portrait";
  const width = isPortrait ? dimensions.width : dimensions.height;
  const fixedHeight = isPortrait ? dimensions.height : dimensions.width;
  const { top, right, bottom, left } = settings.padding;

  if (infiniteMode) {
    // In infinite mode, height is auto (content-driven)
    wrapper.setStyle({
      width: `${width}mm`,
      height: "auto",
      "min-height": "200px",
      margin: "0 auto",
      background: "#ffffff",
      "box-sizing": "border-box",
      "padding-top": `${top}mm`,
      "padding-right": `${right}mm`,
      "padding-bottom": `${bottom}mm`,
      "padding-left": `${left}mm`,
      "box-shadow": "0 10px 30px rgba(15, 23, 42, 0.12)",
      overflow: "visible",
      position: "relative",
      ...(savedBgColor ? { "background-color": savedBgColor } : {}),
    });
  } else {
    // Fixed mode - standard page dimensions
    wrapper.setStyle({
      width: `${width}mm`,
      height: `${fixedHeight}mm`,
      margin: "0 auto",
      background: "#ffffff",
      "box-sizing": "border-box",
      "padding-top": `${top}mm`,
      "padding-right": `${right}mm`,
      "padding-bottom": `${bottom}mm`,
      "padding-left": `${left}mm`,
      "box-shadow": "0 10px 30px rgba(15, 23, 42, 0.12)",
      overflow: "hidden",
      position: "relative",
      // Flexbox for footer positioning (footer uses margin-top: auto)
      display: "flex",
      "flex-direction": "column",
      ...(savedBgColor ? { "background-color": savedBgColor } : {}),
    });
  }

  updateMarginGuides(editor, settings);
};

/**
 * Recalculate wrapper height in infinite mode based on content
 * Call this when containers are added, removed, or resized
 */
export const updateInfiniteModeHeight = (editor: any) => {
  if (!editor || typeof editor.getWrapper !== 'function') return;

  const wrapper = editor.getWrapper();
  if (!wrapper) return;

  const wrapperEl = wrapper.getEl?.();
  if (!wrapperEl) return;

  // Get all direct children components (header, containers, footer)
  const children = wrapper.components?.()?.models || [];
  if (children.length === 0) return;

  const wrapperRect = wrapperEl.getBoundingClientRect();

  // Find the lowest point of all children (including their margins)
  let maxBottom = 0;

  children.forEach((child: any) => {
    const childEl = child.getEl?.();
    if (childEl) {
      const rect = childEl.getBoundingClientRect();
      const style = window.getComputedStyle(childEl);
      const marginBottom = parseFloat(style.marginBottom) || 0;

      // Position of the bottom of the child relative to the wrapper top
      const bottom = (rect.bottom - wrapperRect.top) + marginBottom;
      maxBottom = Math.max(maxBottom, bottom);
    }
  });

  // Add the wrapper's padding-bottom
  const wrapperStyle = window.getComputedStyle(wrapperEl);
  const paddingBottom = parseFloat(wrapperStyle.paddingBottom) || 0;

  const contentHeight = maxBottom + paddingBottom;

  // Apply minimum height
  const minHeight = 200;
  const finalHeight = Math.max(contentHeight, minHeight);

  // Apply height directly to the wrapper element
  wrapperEl.style.minHeight = `${finalHeight}px`;
};

export const applyExternalCssToCanvas = (editor: any, css: string, externalCssId: string) => {
  const frame = editor?.Canvas?.getFrameEl?.();
  const doc = frame?.contentDocument;
  if (!doc) {
    return false;
  }

  let styleEl = doc.getElementById(externalCssId) as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = doc.createElement("style");
    styleEl.id = externalCssId;
    doc.head.appendChild(styleEl);
  }

  styleEl.innerHTML = css || "";
  return true;
};

/**
 * Inject CSS styles for the section drop indicator
 */
export const injectSectionDropIndicatorStyles = (editor: any) => {
  const frame = editor?.Canvas?.getFrameEl?.();
  const doc = frame?.contentDocument;
  if (!doc) return;

  let styleEl = doc.getElementById(SECTION_DROP_INDICATOR_STYLE_ID) as HTMLStyleElement | null;
  if (styleEl) return; // Already injected

  styleEl = doc.createElement("style");
  styleEl.id = SECTION_DROP_INDICATOR_STYLE_ID;
  doc.head.appendChild(styleEl);

  styleEl.textContent = `
    #${SECTION_DROP_INDICATOR_ELEMENT_ID} {
      position: absolute;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #8b5cf6 0%, #a78bfa 50%, #8b5cf6 100%);
      border-radius: 2px;
      pointer-events: none;
      z-index: 10000;
      box-shadow: 0 0 8px rgba(139, 92, 246, 0.6);
      animation: dropIndicatorPulse 1s ease-in-out infinite;
      transition: top 0.15s ease-out;
    }

    @keyframes dropIndicatorPulse {
      0%, 100% { opacity: 0.8; transform: scaleY(1); }
      50% { opacity: 1; transform: scaleY(1.2); }
    }
  `;
};

/**
 * Show the section drop indicator at a specific Y position
 */
export const showSectionDropIndicator = (editor: any, topPosition: number) => {
  const frame = editor?.Canvas?.getFrameEl?.();
  const doc = frame?.contentDocument;
  const wrapper = editor?.getWrapper?.();
  const wrapperEl = wrapper?.getEl?.();

  if (!doc || !wrapperEl) return;

  // Ensure styles are injected
  injectSectionDropIndicatorStyles(editor);

  // Get or create the indicator element
  let indicator = doc.getElementById(SECTION_DROP_INDICATOR_ELEMENT_ID) as HTMLDivElement | null;
  if (!indicator) {
    indicator = doc.createElement("div");
    indicator.id = SECTION_DROP_INDICATOR_ELEMENT_ID;
    wrapperEl.appendChild(indicator);
  }

  // Position the indicator
  indicator.style.top = `${topPosition}px`;
  indicator.style.display = "block";
};

/**
 * Hide the section drop indicator
 */
export const hideSectionDropIndicator = (editor: any) => {
  const frame = editor?.Canvas?.getFrameEl?.();
  const doc = frame?.contentDocument;

  if (!doc) return;

  const indicator = doc.getElementById(SECTION_DROP_INDICATOR_ELEMENT_ID);
  if (indicator) {
    indicator.style.display = "none";
  }
};

/**
 * Calculate the Y position where the drop indicator should appear
 * based on the insertion index
 */
export const calculateDropIndicatorPosition = (
  editor: any,
  insertionIndex: number
): number => {
  const wrapper = editor?.getWrapper?.();
  if (!wrapper) return 0;

  const wrapperEl = wrapper.getEl?.();
  if (!wrapperEl) return 0;

  const wrapperRect = wrapperEl.getBoundingClientRect();
  const children = wrapper.components?.()?.models || [];

  if (children.length === 0) {
    // Empty wrapper - show at top (after padding)
    const style = window.getComputedStyle(wrapperEl);
    return parseFloat(style.paddingTop) || 0;
  }

  // If insertion index is 0 or at the start
  if (insertionIndex <= 0) {
    const firstChild = children[0];
    const firstEl = firstChild?.getEl?.();
    if (firstEl) {
      const rect = firstEl.getBoundingClientRect();
      return rect.top - wrapperRect.top - 2; // 2px above the first element
    }
    return 0;
  }

  // If insertion index is at or beyond the end
  if (insertionIndex >= children.length) {
    const lastChild = children[children.length - 1];
    const lastEl = lastChild?.getEl?.();
    if (lastEl) {
      const rect = lastEl.getBoundingClientRect();
      return rect.bottom - wrapperRect.top + 2; // 2px below the last element
    }
    return 0;
  }

  // Insert between two elements - show at the boundary
  const prevChild = children[insertionIndex - 1];
  const nextChild = children[insertionIndex];

  const prevEl = prevChild?.getEl?.();
  const nextEl = nextChild?.getEl?.();

  if (prevEl && nextEl) {
    const prevRect = prevEl.getBoundingClientRect();
    const nextRect = nextEl.getBoundingClientRect();
    // Position in the middle of the gap between the two elements
    const gap = nextRect.top - prevRect.bottom;
    return prevRect.bottom - wrapperRect.top + gap / 2;
  }

  if (prevEl) {
    const prevRect = prevEl.getBoundingClientRect();
    return prevRect.bottom - wrapperRect.top + 2;
  }

  return 0;
};
