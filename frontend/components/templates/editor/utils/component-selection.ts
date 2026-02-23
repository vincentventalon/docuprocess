/**
 * Component selection/deselection logic
 */

import {
  refreshStyleManagerControls,
  setupTableStyleSectors,
  handleTableSelected,
  handleTableDeselected,
  exitCellEditMode,
  CellEditModeState,
} from "./table-editing";

export interface SelectionHandlerState {
  lastSelectedComponentForPadding: any;
  cellEditMode: CellEditModeState | null;
  tableDragMouseDownMap: WeakMap<any, (e: MouseEvent) => void>;
}

/**
 * Create selection handler state
 */
export const createSelectionState = (): SelectionHandlerState => ({
  lastSelectedComponentForPadding: null,
  cellEditMode: null,
  tableDragMouseDownMap: new WeakMap(),
});

/**
 * Setup component:selected handler
 */
export const setupSelectionHandler = (
  editor: any,
  state: SelectionHandlerState,
  enterCellEditModeFn: (cellComponent: any, cellEl: HTMLElement) => void,
  ensureTableDraggableFn: (tableComponent: any) => void
): void => {
  editor.on('component:selected', (component: any) => {
    const tagName = component?.get?.('tagName')?.toLowerCase?.();

    // IMPORTANT: Manual refresh of custom StyleManager property controls.
    // GrapesJS doesn't call the `update` method of custom property types when
    // a component is selected - only when the style actually changes.
    // For inline styles, we must manually refresh the UI controls here.
    // See documentation in border-toggle-property.ts and padding-toggle-property.ts.
    const styleManager = editor.StyleManager;
    if (styleManager && component && component !== state.lastSelectedComponentForPadding) {
      state.lastSelectedComponentForPadding = component;
      const selected = editor.getSelected();

      // Refresh padding and border controls
      refreshStyleManagerControls(styleManager, selected);

      // Toggle sectors dynamically based on component type using addSector/removeSector
      const isTable = tagName === 'table';
      setupTableStyleSectors(styleManager, isTable, selected);
    }

    if (tagName === 'table') {
      handleTableSelected(
        component,
        editor,
        () => state.cellEditMode,
        enterCellEditModeFn,
        state.tableDragMouseDownMap
      );
    }

    // Exit cell edit mode if selecting something other than the current cell
    if (state.cellEditMode && component !== state.cellEditMode.cellComponent) {
      exitCellEditMode(
        editor,
        state.cellEditMode,
        (newState) => { state.cellEditMode = newState; },
        ensureTableDraggableFn
      );
    }
  });
};

/**
 * Setup component:deselected handler
 */
export const setupDeselectionHandler = (editor: any, state: SelectionHandlerState): void => {
  editor.on('component:deselected', (component: any) => {
    const tagName = component?.get?.('tagName')?.toLowerCase?.();
    if (tagName === 'table') {
      handleTableDeselected(component, state.tableDragMouseDownMap);
    }

    // Unwrap spans inside divs (handles copy-paste adding spans)
    // Runs on deselect so it doesn't interfere with RTE during editing
    unwrapSpansInDiv(component);

    // Clean HTML tags from inside {{ }} template expressions on deselect
    cleanComponentTemplates(component);
  });
};

/**
 * Unwrap spans inside divs (handles copy-paste adding spans)
 */
export const unwrapSpansInDiv = (component: any): void => {
  const compType = component?.get?.('type');
  const tagName = component?.get?.('tagName')?.toLowerCase?.();
  const isDiv = compType === 'div' || tagName === 'div';

  if (isDiv) {
    const el = component.getEl?.();

    // Skip processing for PDF-imported containers - they use absolute positioning
    const classes = el?.className || '';
    if (classes.includes('pdf-container') || classes.includes('container-imported')) {
      // Still recurse into children but don't unwrap this element's spans
      component?.components?.()?.forEach?.((child: any) => unwrapSpansInDiv(child));
      return;
    }

    // Only process if there are span tags to remove
    if (el && el.querySelector('span')) {
      // Walk DOM tree, preserving formatting tags but unwrapping span/font
      const processNode = (node: Node): string => {
        let result = '';
        node.childNodes.forEach((child) => {
          if (child.nodeType === Node.TEXT_NODE) {
            result += child.textContent || '';
          } else if (child.nodeType === Node.ELEMENT_NODE) {
            const element = child as Element;
            const tag = element.tagName.toLowerCase();
            if (tag === 'br') {
              result += '<br>';
            } else if (['div', 'p'].includes(tag)) {
              const blockContent = processNode(element);
              if (blockContent) {
                if (result && !result.endsWith('<br>') && !result.endsWith('\n')) {
                  result += '<br>';
                }
                result += blockContent;
              }
            } else if (['b', 'strong', 'i', 'em', 'u'].includes(tag)) {
              // Preserve formatting tags
              const innerContent = processNode(element);
              if (innerContent) {
                result += `<${tag}>${innerContent}</${tag}>`;
              }
            } else {
              // Unwrap span, font, and other non-formatting tags (keep content only)
              result += processNode(element);
            }
          }
        });
        return result;
      };

      const cleanedContent = processNode(el).trim().replace(/\n/g, '<br>');
      if (cleanedContent) {
        const children = component?.components?.();
        if (children?.length > 0) {
          [...children.models].forEach((child: any) => child.remove());
        }
        component.set('content', cleanedContent);
        el.innerHTML = cleanedContent;
      }
    }
  }
  component?.components?.()?.forEach?.((child: any) => unwrapSpansInDiv(child));
};

/**
 * Clean HTML tags from inside {{ }} template expressions on deselect
 */
export const cleanComponentTemplates = (component: any): void => {
  if (!component) return;
  const innerHtml = component.toHTML?.();
  if (innerHtml && typeof innerHtml === 'string' && innerHtml.includes('{{') && innerHtml.includes('<')) {
    const cleaned = innerHtml.replace(/\{\{([^}]+)\}\}/g, (match: string, inner: string) => {
      if (inner.includes('<')) {
        return `{{${inner.replace(/<[^>]*>/g, '').trim()}}}`;
      }
      return match;
    });
    if (cleaned !== innerHtml) {
      // Replace component content with cleaned version
      component.components(cleaned);
    }
  }
};

/**
 * Setup Escape key listener for cell edit mode
 */
export const setupEscapeKeyHandler = (
  editor: any,
  state: SelectionHandlerState,
  ensureTableDraggableFn: (tableComponent: any) => void
): { canvasDoc: Document | null; handleEscapeKey: ((e: KeyboardEvent) => void) | null } => {
  const frame = editor?.Canvas?.getFrameEl?.();
  const canvasDoc = frame?.contentDocument || document;

  const handleEscapeKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && state.cellEditMode) {
      e.preventDefault();
      e.stopPropagation();
      exitCellEditMode(
        editor,
        state.cellEditMode,
        (newState) => { state.cellEditMode = newState; },
        ensureTableDraggableFn
      );
    }
  };

  // Attach to both canvas document and main document
  canvasDoc.addEventListener('keydown', handleEscapeKey);
  document.addEventListener('keydown', handleEscapeKey);

  return { canvasDoc, handleEscapeKey };
};

/**
 * Cleanup Escape key listeners
 */
export const cleanupEscapeKeyHandler = (
  canvasDoc: Document | null,
  handleEscapeKey: ((e: KeyboardEvent) => void) | null
): void => {
  if (handleEscapeKey) {
    if (canvasDoc && canvasDoc !== document) {
      canvasDoc.removeEventListener('keydown', handleEscapeKey);
    }
    document.removeEventListener('keydown', handleEscapeKey);
  }
};
