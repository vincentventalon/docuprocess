/**
 * Component resize event handlers
 */

import type { MutableRefObject } from "react";
import { PageSettings } from "@/types/page-settings";
import { ResizeSnapshot } from "../types";
import { decorateResizableOptions } from "./resize";
import {
  applyResizeConstraints,
  type ResizeConstraints,
} from "./resize-constraints";
import {
  isZoneComponent,
  applySoftConstraint,
  showOverflowFeedback,
  clearOverflowFeedback,
  OVERFLOW_CLASSES,
} from "./zone-overflow";
import { isFooterComponent } from "../grapes-components/footer";
import { enforceFooterPosition } from "../grapes-components/footer";
import { getAllDraggableComponents } from "./positioning";
import {
  getPageCenterLines,
  findAlignments,
} from "./alignment-guides";
import { renderAlignmentGuides, clearAlignmentGuides } from "./alignment-renderer";
import { SNAP_THRESHOLD } from "../types/alignment";
import { updateInfiniteModeHeight } from "./canvas";
import { isHeaderComponent } from "../grapes-components/header";
import { resizeLog } from "./debug";
import { isSectionComponent } from "./section-utils";

export interface ResizeHandlerCallbacks {
  scheduleClamp: (component: any) => void;
  latestPageSettings: MutableRefObject<PageSettings>;
  latestInfiniteMode: MutableRefObject<boolean>;
  editorInstance: MutableRefObject<any>;
  isShiftPressedGetter: () => boolean;
  cursorPositionGetter: () => { x: number; y: number };
}

/**
 * Setup resize:init handler
 */
export const setupResizeInitHandler = (
  editor: any,
  activeResizeSessions: WeakMap<any, ResizeSnapshot>,
  callbacks: ResizeHandlerCallbacks
): void => {
  editor.on('component:resize:init', (opts: any) => {
    if (!opts?.component || !opts.resizable) {
      return;
    }
    const isContainer = isSectionComponent(opts.component);

    // Containers: keep simple native resizer (only bottom handle) and skip our constraints
    if (!isContainer) {
      opts.resizable = decorateResizableOptions(
        opts.component,
        opts.resizable,
        activeResizeSessions,
        callbacks.scheduleClamp,
        callbacks.editorInstance.current,
        callbacks.latestPageSettings.current
      );
    }
  });
};

/**
 * Setup resize:update handler
 */
export const setupResizeUpdateHandler = (
  editor: any,
  activeResizeSessions: WeakMap<any, ResizeSnapshot>,
  pendingAlignmentFrames: WeakMap<any, number>,
  callbacks: ResizeHandlerCallbacks
): void => {
  editor.on('component:resize:update', (event: any) => {
    const component = event?.component;

    // Check if this is a zone (header, footer, or container) being resized
    const isZone = isZoneComponent(component);

    // Zone resize path
    if (isZone) {
      const rect = event?.rect;
      const updateStyle = event?.updateStyle;
      if (!rect || typeof updateStyle !== 'function') {
        return;
      }

      const targetHeight = rect.h ?? rect.height ?? 0;
      if (targetHeight <= 0) return;

      // Apply soft constraint to all zones (header, footer, containers)
      // This prevents resizing below the height needed to contain children
      const result = applySoftConstraint(component, targetHeight, callbacks.isShiftPressedGetter());
      let finalHeight = result.finalHeight;

      // Visual feedback when constrained
      if (result.wasConstrained && result.overflow.overflowingElements.length > 0) {
        clearOverflowFeedback(editor);
        const blockingEl = result.overflow.overflowingElements[0]?.component?.getEl?.();
        if (blockingEl) {
          blockingEl.classList.add(OVERFLOW_CLASSES.blockingElement);
        }
      } else if (result.isForced) {
        showOverflowFeedback(editor, component, result.overflow, targetHeight, callbacks.cursorPositionGetter(), true);
      } else {
        clearOverflowFeedback(editor);
      }

      // Apply the height
      rect.h = finalHeight;
      rect.height = finalHeight;

      const finalHeightPx = `${finalHeight}px`;
      updateStyle({ height: finalHeightPx });
      component?.addStyle?.({ height: finalHeightPx });
      if (event.style) {
        event.style.height = finalHeightPx;
      }

      return;
    }

    const session = activeResizeSessions.get(component);
    if (!session) return;

    if (isFooterComponent(component)) {
      return;
    }

    const parent = typeof component?.parent === 'function' ? component.parent() : component?.parent;
    const parentTag = parent?.get?.('tagName')?.toLowerCase?.();

    const rect = event?.rect;
    const style = event?.style;
    const updateStyle = event?.updateStyle;

    // Constrain resize for elements inside table cells
    if (parentTag === 'td' || parentTag === 'th') {
      if (!rect || typeof updateStyle !== 'function') return;

      const cellEl = parent?.getEl?.();
      if (cellEl) {
        const cellStyle = window.getComputedStyle(cellEl);
        const paddingH = (parseFloat(cellStyle.paddingLeft) || 0) + (parseFloat(cellStyle.paddingRight) || 0);
        const paddingV = (parseFloat(cellStyle.paddingTop) || 0) + (parseFloat(cellStyle.paddingBottom) || 0);

        // Use current cell dimensions (not stale locked values)
        const currentCellWidth = parseFloat(cellStyle.width) || cellEl.offsetWidth;
        const currentCellHeight = parseFloat(cellStyle.height) || cellEl.offsetHeight;

        // Update locked dimensions to current values
        parent.set('tableCellLockedWidth', currentCellWidth);
        parent.set('tableCellLockedHeight', currentCellHeight);

        const maxWidth = currentCellWidth - paddingH;
        const maxHeight = currentCellHeight - paddingV;

        rect.w = Math.max(10, Math.min(rect.w, maxWidth));
        rect.h = Math.max(10, Math.min(rect.h, maxHeight));

        updateStyle({ width: `${rect.w}px`, height: `${rect.h}px` });
        component?.addStyle?.({ width: `${rect.w}px`, height: `${rect.h}px` });
      }
      return;
    }

    if (!rect || typeof updateStyle !== 'function' || !style) {
      return;
    }
    // NEW UNIFIED CONSTRAINT SYSTEM
    // Build constraints object
    const constraints: ResizeConstraints = {
      bounds: session.bounds,
      aspectRatio: session.isImage ? session.aspectRatio : undefined,
      lockOppositeEdge: {
        horizontal: session.affectsLeft,
        vertical: session.affectsTop,
      },
      startRect: {
        left: session.startLeft,
        top: session.startTop,
        width: session.startWidth,
        height: session.startHeight,
      },
      isAbsolute: session.isAbsolute,
      startMarginLeft: session.initialMarginLeft,
      startMarginTop: session.initialMarginTop,
      minWidth: session.minWidth,
      minHeight: session.minHeight,
    };

    // Apply all constraints in one unified calculation
    const result = applyResizeConstraints(
      session.handle || 'br',
      { w: rect.w, h: rect.h, x: rect.x, y: rect.y },
      constraints
    );

    // Apply the calculated styles to DOM (for visual feedback during drag)
    updateStyle(result.style);

    // Also persist styles to the component model (same pattern as table cell resize)
    component?.addStyle?.(result.style);

    // Update rect for consistency with GrapesJS
    // GrapesJS uses t, l, w, h (top, left, width, height) not x, y
    rect.w = result.rect.w;
    rect.h = result.rect.h;
    rect.l = result.rect.x;
    rect.t = result.rect.y;
    rect.x = result.rect.x;
    rect.y = result.rect.y;

    // Debug: Log if blocked by margins
    if (result.blocked.left || result.blocked.right || result.blocked.top || result.blocked.bottom) {
      resizeLog.log('Blocked by margins:', result.blocked, 'handle:', session.handle);
    }

    // Alignment guide detection during resize
    // Cancel any pending animation frame for this component
    const pendingFrame = pendingAlignmentFrames.get(component);
    if (pendingFrame) {
      cancelAnimationFrame(pendingFrame);
    }

    const frameId = requestAnimationFrame(() => {
      const wrapper = editor.getWrapper();
      const wrapperEl = wrapper?.getEl?.();
      if (!wrapper || !wrapperEl) return;

      const allDraggable = getAllDraggableComponents(wrapper);
      const otherComponents = allDraggable.filter((c: any) => c !== component);

      const pageCenterLines = getPageCenterLines(wrapper, callbacks.latestPageSettings.current.padding);
      const alignmentState = findAlignments(
        component,
        wrapperEl,
        otherComponents,
        pageCenterLines,
        SNAP_THRESHOLD
      );

      // Render guides (without snap - just visual feedback)
      renderAlignmentGuides(editor, alignmentState);

      // Clear the pending frame from the map
      pendingAlignmentFrames.delete(component);
    });

    // Store the frame ID so we can cancel it if needed
    pendingAlignmentFrames.set(component, frameId);
  });
};

/**
 * Setup resize:end handler
 */
export const setupResizeEndHandler = (
  editor: any,
  activeResizeSessions: WeakMap<any, ResizeSnapshot>,
  pendingAlignmentFrames: WeakMap<any, number>,
  callbacks: ResizeHandlerCallbacks
): void => {
  editor.on('component:resize:end', ({ component }: any) => {
    const isContainer = isSectionComponent(component);

    if (component) {
      activeResizeSessions.delete(component);

      // Cancel any pending alignment frame for this component
      const pendingFrame = pendingAlignmentFrames.get(component);
      if (pendingFrame) {
        cancelAnimationFrame(pendingFrame);
        pendingAlignmentFrames.delete(component);
      }

      if (isFooterComponent(component)) {
        enforceFooterPosition(component, editor, callbacks.latestPageSettings, callbacks.latestInfiniteMode);
      }

      const parent = typeof component?.parent === 'function' ? component.parent() : component?.parent;
      const parentTag = parent?.get?.('tagName')?.toLowerCase?.();
      if (!isContainer && parentTag !== 'td' && parentTag !== 'th') {
        callbacks.scheduleClamp(component);
      }

      // Clear alignment guides and overflow feedback
      clearAlignmentGuides(editor);
      clearOverflowFeedback(editor);

      // Update wrapper height in infinite mode after resize
      if (callbacks.latestInfiniteMode.current && (isContainer || isHeaderComponent(component) || isFooterComponent(component))) {
        requestAnimationFrame(() => {
          if (callbacks.editorInstance.current) {
            updateInfiniteModeHeight(callbacks.editorInstance.current);
          }
        });
      }
    }
  });
};
