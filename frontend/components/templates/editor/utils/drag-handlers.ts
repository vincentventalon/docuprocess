/**
 * Component drag event handlers (multi-select, alignment guides, zone detection)
 */

import type { MutableRefObject } from "react";
import { PageSettings } from "@/types/page-settings";
import {
  findHeaderComponent,
  findFooterComponent,
  getElementCenter,
  getHeaderBounds,
  getFooterBounds,
  isPointInHeader,
  isPointInFooter,
  getAllDraggableComponents,
  calculateContainerInsertionIndex,
  validateInsertionIndex,
  ensureSectionOrder,
} from "./positioning";
import {
  getPageCenterLines,
  findAlignments,
} from "./alignment-guides";
import {
  injectHeaderHighlightStyles,
  injectFooterHighlightStyles,
  showSectionDropIndicator,
  hideSectionDropIndicator,
  calculateDropIndicatorPosition,
  updateInfiniteModeHeight,
} from "./canvas";
import { renderAlignmentGuides, clearAlignmentGuides } from "./alignment-renderer";
import { SNAP_THRESHOLD } from "../types/alignment";
import { OVERFLOW_CLASSES } from "./zone-overflow";
import { getWrapperRelativePosition } from "./placement-ghost";
import { isSectionComponent, updateFirstSectionPosition } from "./section-utils";
import { handleComponentZonePlacement, ZonePlacementRefs } from "./zone-placement";

export interface MultiSelectDragState {
  initialPositions: Map<any, { left: number; top: number }>;
  draggedComponent: any;
  startLeft: number;
  startTop: number;
}

const DRAG_OVERFLOW_CLASS = 'gjs-drag-overflow-visible';
const DRAG_ACTIVE_CLASS = 'gjs-dragging-active';

/**
 * Inject CSS for drag state (overflow fix + hide handles)
 */
const ensureDragStyles = (editor: any) => {
  // Iframe styles for overflow
  const frame = editor?.Canvas?.getFrameEl?.();
  const doc = frame?.contentDocument;
  if (doc && !doc.getElementById('gjs-drag-overflow-style')) {
    const style = doc.createElement('style');
    style.id = 'gjs-drag-overflow-style';
    style.textContent = `.${DRAG_OVERFLOW_CLASS} { overflow: visible !important; }`;
    doc.head.appendChild(style);
  }

  // Main document styles to hide handles during drag
  if (!document.getElementById('gjs-drag-handles-style')) {
    const style = document.createElement('style');
    style.id = 'gjs-drag-handles-style';
    style.textContent = `
      .${DRAG_ACTIVE_CLASS} .gjs-resizer,
      .${DRAG_ACTIVE_CLASS} .gjs-toolbar {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
  }
};

/**
 * Hide resize handles during drag
 */
const hideResizeHandles = (editor: any) => {
  const container = editor?.getContainer?.();
  if (container) {
    container.classList.add(DRAG_ACTIVE_CLASS);
  }
};

/**
 * Show resize handles after drag
 */
const showResizeHandles = (editor: any) => {
  const container = editor?.getContainer?.();
  if (container) {
    container.classList.remove(DRAG_ACTIVE_CLASS);
  }
};

/**
 * Add overflow:visible to ancestors that clip content
 */
const enableDragOverflow = (component: any, editor: any) => {
  const el = component?.getEl?.();
  if (!el) return;

  ensureDragStyles(editor);
  hideResizeHandles(editor);

  const win = el.ownerDocument?.defaultView || window;

  let current = el.parentElement;
  while (current) {
    const style = win.getComputedStyle(current);
    if (style.overflow === 'hidden' || style.overflowX === 'hidden' || style.overflowY === 'hidden') {
      current.classList.add(DRAG_OVERFLOW_CLASS);
    }
    current = current.parentElement;
  }
};

/**
 * Remove overflow:visible and restore handles after drag
 */
const disableDragOverflow = (editor: any) => {
  const frame = editor?.Canvas?.getFrameEl?.();
  const doc = frame?.contentDocument;
  if (doc) {
    doc.querySelectorAll(`.${DRAG_OVERFLOW_CLASS}`).forEach((el: Element) => {
      el.classList.remove(DRAG_OVERFLOW_CLASS);
    });
  }

  showResizeHandles(editor);
};

export interface DragHandlerRefs {
  editorInstance: MutableRefObject<any>;
  latestPageSettings: MutableRefObject<PageSettings>;
  latestInfiniteMode: MutableRefObject<boolean>;
  isClamping: MutableRefObject<boolean>;
  isDraggingRef: MutableRefObject<boolean>;
  draggingContainerRef: MutableRefObject<any>;
  dragPointerRef: MutableRefObject<{ x: number; y: number } | null>;
  dragPointerCleanupRef: MutableRefObject<(() => void) | null>;
  isSectionOrderSyncing: MutableRefObject<boolean>;
}

export interface DragHandlerCallbacks {
  scheduleClamp: (component: any) => void;
  isShiftPressedGetter: () => boolean;
}

/**
 * Check if component is inside a table cell
 */
export const isInTableCell = (comp: any): boolean => {
  const parent = typeof comp?.parent === 'function' ? comp.parent() : comp?.parent;
  const parentTag = parent?.get?.('tagName')?.toLowerCase?.();
  return parentTag === 'td' || parentTag === 'th';
};

/**
 * Ensure drag pointer tracking is active
 */
const ensureDragPointerTracking = (
  editor: any,
  refs: DragHandlerRefs
) => {
  if (refs.dragPointerCleanupRef.current) return;
  const frame = editor?.Canvas?.getFrameEl?.();
  const doc = frame?.contentDocument;
  if (!doc) return;

  const handleMouseMove = (e: MouseEvent) => {
    refs.dragPointerRef.current = { x: e.clientX, y: e.clientY };
    const dragging = refs.draggingContainerRef.current;
    if (!dragging || !refs.editorInstance.current) return;

    const pos = getWrapperRelativePosition(refs.editorInstance.current, e.clientX, e.clientY);
    if (!pos) {
      hideSectionDropIndicator(editor);
      return;
    }

    const insertIndex = validateInsertionIndex(
      refs.editorInstance.current,
      calculateContainerInsertionIndex(refs.editorInstance.current, pos.y, {
        ignoreComponent: dragging,
      })
    );
    const indicatorY = calculateDropIndicatorPosition(refs.editorInstance.current, insertIndex);
    showSectionDropIndicator(refs.editorInstance.current, indicatorY);
  };

  doc.addEventListener('mousemove', handleMouseMove);
  refs.dragPointerCleanupRef.current = () => {
    doc.removeEventListener('mousemove', handleMouseMove);
  };
};

/**
 * Setup drag:start handler
 */
export const setupDragStartHandler = (
  editor: any,
  refs: DragHandlerRefs,
  getDragState: () => MultiSelectDragState | null,
  setDragState: (state: MultiSelectDragState | null) => void
): void => {
  editor.on('component:drag:start', (ev: any) => {
    const component = ev?.model || ev?.component || ev?.target || ev;
    if (!component || isInTableCell(component)) return;

    // Mark as dragging - this prevents clamping during drag
    refs.isDraggingRef.current = true;

    // Allow element to visually escape overflow:hidden parents
    enableDragOverflow(component, editor);

    const allSelected = editor.getSelectedAll?.() || [];
    if (allSelected.length <= 1) {
      setDragState(null);
      return;
    }

    const initialPositions = new Map<any, { left: number; top: number }>();
    for (const comp of allSelected) {
      const style = comp.getStyle?.() || {};
      const left = parseFloat(String(style.left)) || 0;
      const top = parseFloat(String(style.top)) || 0;
      initialPositions.set(comp, { left, top });
    }

    const draggedStyle = component.getStyle?.() || {};
    setDragState({
      initialPositions,
      draggedComponent: component,
      startLeft: parseFloat(draggedStyle.left) || 0,
      startTop: parseFloat(draggedStyle.top) || 0,
    });
  });
};

/**
 * Setup drag handler
 */
export const setupDragHandler = (
  editor: any,
  refs: DragHandlerRefs,
  callbacks: DragHandlerCallbacks,
  getDragState: () => MultiSelectDragState | null,
  setCurrentDragComponent: (component: any) => void
): void => {
  // Debounce alignment guide calculations
  let pendingAlignmentFrame: number | null = null;

  editor.on('component:drag', (ev: any) => {
    const component = ev?.model || ev?.component || ev?.target || ev;
    if (component && !isInTableCell(component)) {
      setCurrentDragComponent(component);

      // Multi-select drag: move all selected components by the same delta
      const multiSelectDragState = getDragState();
      if (multiSelectDragState && multiSelectDragState.draggedComponent === component) {
        const currentStyle = component.getStyle?.() || {};
        const currentLeft = parseFloat(currentStyle.left) || 0;
        const currentTop = parseFloat(currentStyle.top) || 0;

        const deltaX = currentLeft - multiSelectDragState.startLeft;
        const deltaY = currentTop - multiSelectDragState.startTop;

        for (const [comp, initialPos] of multiSelectDragState.initialPositions) {
          if (comp === component) continue;
          comp.setStyle({
            ...comp.getStyle(),
            left: `${initialPos.left + deltaX}px`,
            top: `${initialPos.top + deltaY}px`,
          });
        }
      }

      const isContainer = isSectionComponent(component);

      if (isContainer) {
        refs.draggingContainerRef.current = component;
        ensureDragPointerTracking(editor, refs);

        const dragEvent = ev?.event || ev?.originalEvent || ev?.e;
        let pos = null;
        if (dragEvent && typeof dragEvent.clientX === 'number' && typeof dragEvent.clientY === 'number') {
          pos = getWrapperRelativePosition(refs.editorInstance.current, dragEvent.clientX, dragEvent.clientY);
        }
        if (!pos && refs.dragPointerRef.current) {
          pos = getWrapperRelativePosition(
            refs.editorInstance.current,
            refs.dragPointerRef.current.x,
            refs.dragPointerRef.current.y
          );
        }
        if (!pos) {
          const el = component?.getEl?.();
          const rect = el?.getBoundingClientRect?.();
          if (rect) {
            pos = getWrapperRelativePosition(
              refs.editorInstance.current,
              rect.left + rect.width / 2,
              rect.top + rect.height / 2
            );
          }
        }
        if (pos) {
          const insertIndex = validateInsertionIndex(
            refs.editorInstance.current,
            calculateContainerInsertionIndex(refs.editorInstance.current, pos.y, {
              ignoreComponent: component,
            })
          );
          const indicatorY = calculateDropIndicatorPosition(refs.editorInstance.current, insertIndex);
          showSectionDropIndicator(refs.editorInstance.current, indicatorY);
        } else {
          hideSectionDropIndicator(editor);
        }
      } else {
        hideSectionDropIndicator(editor);
      }

      // Cache component lookups once per drag event (these are expensive)
      const headerComponent = findHeaderComponent(editor);
      const footerComponent = findFooterComponent(editor);

      // NOTE: We intentionally do NOT clamp during drag for ANY elements.
      // This allows them to visually escape their parent and move to a different zone.
      // Clamping is applied only on drag:end via handleComponentZonePlacement().

      // Cache element center calculation once
      const elementCenter = getElementCenter(component, refs.editorInstance.current);

      // Header drop zone detection
      if (headerComponent) {
        const headerBounds = getHeaderBounds(headerComponent, refs.editorInstance.current);
        const isInHeader = isPointInHeader(elementCenter, headerBounds);

        if (isInHeader) {
          injectHeaderHighlightStyles(editor);
          headerComponent.addClass('header-drop-zone-active');

          const headerEl = headerComponent.getEl?.();
          if (headerEl) {
            headerEl.classList.add('header-drop-zone-active');
          }
        } else {
          headerComponent.removeClass('header-drop-zone-active');
          const headerEl = headerComponent.getEl?.();
          if (headerEl) {
            headerEl.classList.remove('header-drop-zone-active');
          }
        }
      }

      // Footer drop zone detection
      if (footerComponent) {
        const footerBounds = getFooterBounds(footerComponent, refs.editorInstance.current);
        let isInFooter = isPointInFooter(elementCenter, footerBounds);

        // Priority: if element is in both header AND footer zones, header takes priority
        if (headerComponent) {
          const headerBounds = getHeaderBounds(headerComponent, refs.editorInstance.current);
          const isInHeader = isPointInHeader(elementCenter, headerBounds);
          if (isInHeader && isInFooter) {
            isInFooter = false;
          }
        }

        if (isInFooter) {
          injectFooterHighlightStyles(editor);
          footerComponent.addClass('footer-drop-zone-active');

          const footerEl = footerComponent.getEl?.();
          if (footerEl) {
            footerEl.classList.add('footer-drop-zone-active');
          }
        } else {
          footerComponent.removeClass('footer-drop-zone-active');
          const footerEl = footerComponent.getEl?.();
          if (footerEl) {
            footerEl.classList.remove('footer-drop-zone-active');
          }
        }
      }

      // Alignment guide detection - debounce with single pending frame
      if (pendingAlignmentFrame !== null) {
        cancelAnimationFrame(pendingAlignmentFrame);
      }
      pendingAlignmentFrame = requestAnimationFrame(() => {
        pendingAlignmentFrame = null;
        const wrapper = editor.getWrapper();
        const wrapperEl = wrapper?.getEl?.();
        if (!wrapper || !wrapperEl) return;

        const allDraggable = getAllDraggableComponents(wrapper);
        const otherComponents = allDraggable.filter((c: any) => c !== component);

        const pageCenterLines = getPageCenterLines(wrapper, refs.latestPageSettings.current.padding);
        const alignmentState = findAlignments(
          component,
          wrapperEl,
          otherComponents,
          pageCenterLines,
          SNAP_THRESHOLD
        );

        // Render guides (without snap - just visual feedback)
        renderAlignmentGuides(editor, alignmentState);
      });
    }
  });
};

/**
 * Setup drag:end handler
 */
export const setupDragEndHandler = (
  editor: any,
  refs: DragHandlerRefs,
  callbacks: DragHandlerCallbacks,
  setCurrentDragComponent: (component: any) => void,
  setDragState: (state: MultiSelectDragState | null) => void
): void => {
  const zonePlacementRefs: ZonePlacementRefs = {
    editorInstance: refs.editorInstance,
    isClamping: refs.isClamping,
  };

  editor.on('component:drag:end', (ev: any) => {
    const component = ev?.model || ev?.component || ev?.target || ev;
    if (component && !isInTableCell(component)) {
      // Mark drag as complete - this re-enables clamping
      refs.isDraggingRef.current = false;

      // Restore overflow:hidden on parents
      disableDragOverflow(editor);

      setCurrentDragComponent(null);
      setDragState(null);

      // Remove visual feedback
      const headerComponent = findHeaderComponent(editor);
      const footerComponent = findFooterComponent(editor);
      headerComponent?.removeClass('header-drop-zone-active');
      footerComponent?.removeClass('footer-drop-zone-active');

      // Clear blocking element feedback
      const el = component.getEl?.();
      if (el) {
        el.classList.remove(OVERFLOW_CLASSES.blockingElement);
      }

      clearAlignmentGuides(editor);
      handleComponentZonePlacement(component, editor, zonePlacementRefs);
      callbacks.scheduleClamp(component);

      const isContainer = isSectionComponent(component);

      if (isContainer) {
        hideSectionDropIndicator(editor);
        refs.draggingContainerRef.current = null;
        if (refs.dragPointerCleanupRef.current) {
          refs.dragPointerCleanupRef.current();
          refs.dragPointerCleanupRef.current = null;
        }

        const dragEvent = ev?.event || ev?.originalEvent || ev?.e;
        if (dragEvent && typeof dragEvent.clientX === 'number' && typeof dragEvent.clientY === 'number') {
          const pos = getWrapperRelativePosition(refs.editorInstance.current, dragEvent.clientX, dragEvent.clientY);
          if (pos) {
            const insertIndex = validateInsertionIndex(
              refs.editorInstance.current,
              calculateContainerInsertionIndex(refs.editorInstance.current, pos.y, {
                ignoreComponent: component,
              })
            );
            const wrapper = editor.getWrapper?.();
            const children = wrapper?.components?.()?.models || [];
            const currentIndex = children.indexOf(component);
            if (wrapper && currentIndex !== -1 && insertIndex !== currentIndex) {
              component.move(wrapper, { at: insertIndex });
            }
          }
        }

        if (!refs.isSectionOrderSyncing.current) {
          refs.isSectionOrderSyncing.current = true;
          requestAnimationFrame(() => {
            try {
              ensureSectionOrder(editor);
            } finally {
              refs.isSectionOrderSyncing.current = false;
            }

            updateFirstSectionPosition(editor, refs.latestInfiniteMode.current);
            if (refs.latestInfiniteMode.current) {
              updateInfiniteModeHeight(editor);
            }
          });
        }
      }
    }
  });
};

/**
 * Setup priority drag for selected component
 * When dragging within a selected component's bounds, drag the selected component
 * instead of potentially selecting/dragging a child element underneath.
 * Clicking (without dragging) still allows selecting children.
 */
export const setupSelectedComponentDragPriority = (editor: any): (() => void) | null => {
  const frame = editor?.Canvas?.getFrameEl?.();
  const doc = frame?.contentDocument;
  if (!doc) return null;

  const DRAG_THRESHOLD = 5; // pixels of movement before considering it a drag
  let pendingAction: {
    selected: any;
    startX: number;
    startY: number;
    targetEl: HTMLElement;
    dragStarted: boolean;
  } | null = null;

  const findComponentForElement = (el: HTMLElement): any => {
    // Walk up to find the GrapesJS component for this element
    let current: HTMLElement | null = el;
    while (current) {
      const component = editor.Components?.getById?.(current.getAttribute?.('data-gjs-id') || '');
      if (component) return component;
      // Try finding via the wrapper
      const wrapper = editor.getWrapper?.();
      if (wrapper) {
        const found = wrapper.find('*').find((c: any) => c.getEl?.() === current);
        if (found) return found;
      }
      current = current.parentElement;
    }
    return null;
  };

  const handleMouseDown = (e: MouseEvent) => {
    // Only handle left click
    if (e.button !== 0) return;

    const selected = editor.getSelected?.();
    if (!selected) return;

    const selectedEl = selected.getEl?.();
    if (!selectedEl) return;

    // Check if click is within the selected component's bounds
    const rect = selectedEl.getBoundingClientRect();
    const isWithinBounds =
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom;

    if (!isWithinBounds) return;

    // Check if the click target is a child of the selected element
    const target = e.target as HTMLElement;
    if (!selectedEl.contains(target)) return;

    // If clicking directly on the selected element, let normal behavior proceed
    if (target === selectedEl) return;

    // Block GrapesJS from handling this mousedown
    e.stopPropagation();
    e.preventDefault();

    // Store pending action - we'll decide on mousemove/mouseup if it's a drag or click
    pendingAction = {
      selected,
      startX: e.clientX,
      startY: e.clientY,
      targetEl: target,
      dragStarted: false,
    };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!pendingAction || pendingAction.dragStarted) return;

    const dx = Math.abs(e.clientX - pendingAction.startX);
    const dy = Math.abs(e.clientY - pendingAction.startY);

    // If moved past threshold, this is a drag - initiate parent drag
    if (dx > DRAG_THRESHOLD || dy > DRAG_THRESHOLD) {
      pendingAction.dragStarted = true;
      const { selected } = pendingAction;

      // Initiate drag on the selected parent component
      editor.runCommand('tlb-move', { target: selected, event: e });
    }
  };

  const handleMouseUp = (e: MouseEvent) => {
    if (!pendingAction) return;

    // If drag didn't start, it was a click - select the child component
    if (!pendingAction.dragStarted) {
      const childComponent = findComponentForElement(pendingAction.targetEl);
      if (childComponent) {
        editor.select(childComponent);
      }
    }

    pendingAction = null;
  };

  // Use capturing phase to intercept before GrapesJS handlers
  doc.addEventListener('mousedown', handleMouseDown, true);
  doc.addEventListener('mousemove', handleMouseMove, true);
  doc.addEventListener('mouseup', handleMouseUp, true);

  return () => {
    doc.removeEventListener('mousedown', handleMouseDown, true);
    doc.removeEventListener('mousemove', handleMouseMove, true);
    doc.removeEventListener('mouseup', handleMouseUp, true);
  };
};
