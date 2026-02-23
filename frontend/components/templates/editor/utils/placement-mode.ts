/**
 * Element placement mode (click to place)
 */

import type { MutableRefObject } from "react";
import { ElementType } from "../panels/components/NewElementDropdown";
import { ELEMENT_CONTENT } from "../panels/LeftPanel";
import {
  findHeaderComponent,
  findFooterComponent,
  calculateContainerInsertionIndex,
  validateInsertionIndex,
} from "./positioning";
import { enforceSectionPosition } from "../grapes-components/custom-components";
import {
  showPlacementGhost,
  updatePlacementGhostPosition,
  hidePlacementGhost,
  getWrapperRelativePosition,
} from "./placement-ghost";

export interface PlacementModeState {
  isActive: boolean;
  type: ElementType | null;
  cleanup: (() => void) | null;
}

export interface PlacementModeRefs {
  editorInstance: MutableRefObject<any>;
  placementTypeRef: MutableRefObject<ElementType | null>;
  placementCleanupRef: MutableRefObject<(() => void) | null>;
}

/**
 * Create placement state
 */
export const createPlacementState = (): PlacementModeState => ({
  isActive: false,
  type: null,
  cleanup: null,
});

/**
 * Cancel placement mode
 */
export const cancelPlacement = (
  refs: PlacementModeRefs,
  setIsPlacementActive: (active: boolean) => void
): void => {
  if (refs.placementCleanupRef.current) {
    refs.placementCleanupRef.current();
    refs.placementCleanupRef.current = null;
  }
  if (refs.editorInstance.current) {
    hidePlacementGhost(refs.editorInstance.current);
  }
  refs.placementTypeRef.current = null;
  setIsPlacementActive(false);
};

/**
 * Place element at position
 */
export const placeElementAt = (
  refs: PlacementModeRefs,
  x: number,
  y: number,
  cancelPlacementFn: () => void
): void => {
  if (!refs.editorInstance.current || !refs.placementTypeRef.current) return;

  const type = refs.placementTypeRef.current;
  const content = ELEMENT_CONTENT[type];
  if (!content) {
    cancelPlacementFn();
    return;
  }

  const wrapper = refs.editorInstance.current.getWrapper();
  if (!wrapper) {
    cancelPlacementFn();
    return;
  }

  // Add the element
  let component: any;
  if (type === "section") {
    const insertIndex = validateInsertionIndex(
      refs.editorInstance.current,
      calculateContainerInsertionIndex(refs.editorInstance.current, y)
    );
    const newComponents = wrapper.append(content, { at: insertIndex });
    component = newComponents?.[0];
    if (component) {
      enforceSectionPosition(component);
    }
  } else {
    // Find the target section/header/footer at the click position
    const wrapperEl = wrapper.getEl?.();
    if (!wrapperEl) {
      cancelPlacementFn();
      return;
    }
    const wrapperRect = wrapperEl.getBoundingClientRect();
    const clickPoint = { x: wrapperRect.left + x, y: wrapperRect.top + y };

    // Check header first
    const headerComponent = findHeaderComponent(refs.editorInstance.current);
    if (headerComponent) {
      const headerEl = headerComponent.getEl?.();
      if (headerEl) {
        const headerRect = headerEl.getBoundingClientRect();
        if (clickPoint.x >= headerRect.left && clickPoint.x <= headerRect.right &&
            clickPoint.y >= headerRect.top && clickPoint.y <= headerRect.bottom) {
          const newComponents = headerComponent.append(content);
          component = newComponents?.[0];
          if (component) {
            const relX = clickPoint.x - headerRect.left;
            const relY = clickPoint.y - headerRect.top;
            component.addStyle({ position: 'absolute', left: `${relX}px`, top: `${relY}px` });
          }
        }
      }
    }

    // Check footer
    if (!component) {
      const footerComponent = findFooterComponent(refs.editorInstance.current);
      if (footerComponent) {
        const footerEl = footerComponent.getEl?.();
        if (footerEl) {
          const footerRect = footerEl.getBoundingClientRect();
          if (clickPoint.x >= footerRect.left && clickPoint.x <= footerRect.right &&
              clickPoint.y >= footerRect.top && clickPoint.y <= footerRect.bottom) {
            const newComponents = footerComponent.append(content);
            component = newComponents?.[0];
            if (component) {
              const relX = clickPoint.x - footerRect.left;
              const relBottom = footerRect.bottom - clickPoint.y;
              component.addStyle({ position: 'absolute', left: `${relX}px`, bottom: `${relBottom}px` });
            }
          }
        }
      }
    }

    // Check table cells (td/th) - elements dropped in cells should be inline, not absolute
    if (!component) {
      const frame = refs.editorInstance.current?.Canvas?.getFrameEl?.();
      const canvasDoc = frame?.contentDocument;
      if (canvasDoc) {
        // clickPoint is already in iframe viewport coordinates (relative to iframe's viewport)
        // because wrapperRect was obtained via getBoundingClientRect() inside the iframe
        const elementAtPoint = canvasDoc.elementFromPoint(clickPoint.x, clickPoint.y);
        const cellEl = elementAtPoint?.closest('td, th');
        if (cellEl) {
          // Find the GrapesJS component for this cell
          const allCells = refs.editorInstance.current.getWrapper()?.find?.('td, th') || [];
          const cellComponent = allCells.find((c: any) => c.getEl?.() === cellEl);
          if (cellComponent) {
            const newComponents = cellComponent.append(content);
            component = newComponents?.[0];
            if (component) {
              // Disable dragging - element stays in the cell
              component.set('draggable', false);
              // Remove absolute positioning for table cell content
              component.removeStyle('position');
              component.removeStyle('left');
              component.removeStyle('top');
              // Set appropriate styles for cell content (constrain images to cell)
              component.addStyle({
                display: 'inline-block',
                'max-width': '100%',
                'max-height': '100%',
                'object-fit': 'contain',
              });
            }
          }
        }
      }
    }

    // Check sections
    if (!component) {
      const sections = wrapper.components?.()?.models?.filter((c: any) => {
        const cType = c.get?.('type');
        const cClass = String(c.get?.('attributes')?.class || '');
        return cType === 'section' || cClass.includes('pdf-container');
      }) || [];

      for (const section of sections) {
        const sectionEl = section.getEl?.();
        if (sectionEl) {
          const sectionRect = sectionEl.getBoundingClientRect();
          if (clickPoint.x >= sectionRect.left && clickPoint.x <= sectionRect.right &&
              clickPoint.y >= sectionRect.top && clickPoint.y <= sectionRect.bottom) {
            const newComponents = section.append(content);
            component = newComponents?.[0];
            if (component) {
              let relX = clickPoint.x - sectionRect.left;
              const relY = clickPoint.y - sectionRect.top;

              // Constrain to first column for repeating sections
              const sectionAttrs = section.getAttributes?.() || {};
              const repeatCols = parseInt(sectionAttrs['data-repeat-columns'] || '1', 10);
              if (repeatCols > 1) {
                const colWidth = sectionRect.width / repeatCols;
                if (relX > colWidth) {
                  relX = colWidth - 10; // slight inset from edge
                }
              }

              component.addStyle({ position: 'absolute', left: `${relX}px`, top: `${relY}px` });
            }
            break;
          }
        }
      }
    }

    // Fallback: if no valid zone found, place in first section
    if (!component) {
      const sections = wrapper.components?.()?.models?.filter((c: any) => {
        const cType = c.get?.('type');
        const cClass = String(c.get?.('attributes')?.class || '');
        return cType === 'section' || cClass.includes('pdf-container');
      }) || [];

      if (sections.length > 0) {
        const newComponents = sections[0].append(content);
        component = newComponents?.[0];
        if (component) {
          component.addStyle({ position: 'absolute', left: `${x}px`, top: `${y}px` });
        }
      }
    }
  }

  if (component) {
    // Select the new component
    refs.editorInstance.current.select(component);
  }

  cancelPlacementFn();
};

/**
 * Start placement mode
 */
export const startPlacement = (
  refs: PlacementModeRefs,
  type: ElementType,
  setIsPlacementActive: (active: boolean) => void,
  cancelPlacementFn: () => void,
  placeElementAtFn: (x: number, y: number) => void
): void => {
  if (!refs.editorInstance.current) return;

  // Cancel any existing placement
  cancelPlacementFn();

  refs.placementTypeRef.current = type;
  setIsPlacementActive(true);

  // Show ghost preview
  showPlacementGhost(refs.editorInstance.current, type);

  const frame = refs.editorInstance.current.Canvas?.getFrameEl?.() as HTMLIFrameElement;
  const canvasDoc = frame?.contentDocument;
  if (!frame || !canvasDoc) return;

  // Mouse move handler on main document - ghost follows cursor everywhere
  const handleMouseMove = (e: MouseEvent) => {
    if (!refs.editorInstance.current) return;
    updatePlacementGhostPosition(refs.editorInstance.current, e.clientX, e.clientY);
  };

  // Mouse move handler inside canvas iframe - convert to main document coordinates
  const handleCanvasMouseMove = (e: MouseEvent) => {
    if (!refs.editorInstance.current) return;
    const frameRect = frame.getBoundingClientRect();
    // Convert iframe coordinates to main document coordinates
    const mainDocX = e.clientX + frameRect.left;
    const mainDocY = e.clientY + frameRect.top;
    updatePlacementGhostPosition(refs.editorInstance.current, mainDocX, mainDocY);
  };

  // Click handler on canvas iframe - place element
  const handleCanvasClick = (e: MouseEvent) => {
    if (!refs.editorInstance.current) return;

    e.preventDefault();
    e.stopPropagation();

    const pos = getWrapperRelativePosition(refs.editorInstance.current, e.clientX, e.clientY);
    if (pos) {
      placeElementAtFn(pos.x, pos.y);
    }
  };

  // Click handler on main document - cancel if clicking outside canvas
  const handleDocumentClick = (e: MouseEvent) => {
    // Check if click is on the canvas iframe
    const target = e.target as HTMLElement;
    if (target.tagName === 'IFRAME' || target.closest('iframe')) {
      // Let the canvas handle it
      return;
    }
    // Cancel placement if clicking elsewhere
    cancelPlacementFn();
  };

  // Escape key handler - cancel placement
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      cancelPlacementFn();
    }
  };

  // Add event listeners
  document.addEventListener('mousemove', handleMouseMove);
  canvasDoc.addEventListener('mousemove', handleCanvasMouseMove);
  document.addEventListener('click', handleDocumentClick, true);
  canvasDoc.addEventListener('click', handleCanvasClick, true);
  canvasDoc.addEventListener('keydown', handleKeyDown);
  document.addEventListener('keydown', handleKeyDown);

  // Add cursor styling
  document.body.style.cursor = 'crosshair';
  canvasDoc.body.style.cursor = 'crosshair';

  // Store cleanup function
  refs.placementCleanupRef.current = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    canvasDoc.removeEventListener('mousemove', handleCanvasMouseMove);
    document.removeEventListener('click', handleDocumentClick, true);
    canvasDoc.removeEventListener('click', handleCanvasClick, true);
    canvasDoc.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('keydown', handleKeyDown);
    document.body.style.cursor = '';
    canvasDoc.body.style.cursor = '';
  };
};
