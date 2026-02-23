/**
 * Component add/update/remove/mount handlers
 */

import type { MutableRefObject } from "react";
import { PageSettings } from "@/types/page-settings";
import { isHeaderComponent, enforceHeaderPosition } from "../grapes-components/header";
import { isFooterComponent, enforceFooterPosition } from "../grapes-components/footer";
import { enforceSectionPosition } from "../grapes-components/custom-components";
import { renderBarcodeComponent } from "../grapes-components/barcode";
import { autoResizeImageComponent } from "./resize";
import {
  updateFixedModeSectionFlex,
  updateFirstSectionPosition,
  ensureSectionIdSelector,
  isSectionComponent,
} from "./section-utils";
import { updateInfiniteModeHeight } from "./canvas";
import {
  calculateContainerInsertionIndex,
  validateInsertionIndex,
  ensureSectionOrder,
  getAllDraggableComponents,
  clampComponentWithinMargins,
} from "./positioning";
import {
  getPageCenterLines,
  findAlignments,
} from "./alignment-guides";
import { handleComponentZonePlacement, ZonePlacementRefs } from "./zone-placement";
import { positionLog, sectionLog } from "./debug";
import { addTableResizeHandles } from "./table-column-row-handles";
import { renderAlignmentGuides, clearAlignmentGuides } from "./alignment-renderer";
import { SNAP_THRESHOLD } from "../types/alignment";
import type { BlockDragState } from "./block-drag-handlers";
import { assignZIndexToNewComponent, shouldManageZIndex, removeFromZOrderList } from "./z-index";

export interface ComponentLifecycleRefs {
  editorInstance: MutableRefObject<any>;
  latestPageSettings: MutableRefObject<PageSettings>;
  latestInfiniteMode: MutableRefObject<boolean>;
  isClamping: MutableRefObject<boolean>;
  pendingClamp: MutableRefObject<WeakSet<any>>;
  isDraggingRef: MutableRefObject<boolean>;
}

export interface ComponentLifecycleCallbacks {
  scheduleClamp: (component: any) => void;
}

/**
 * Create scheduleClamp function
 */
export const createScheduleClamp = (
  refs: ComponentLifecycleRefs
): ((component: any) => void) => {
  return (component: any) => {
    if (!component) return;
    // Skip clamping during drag - allows elements to visually escape their parent
    if (refs.isDraggingRef.current) return;
    if (refs.pendingClamp.current.has(component)) return;
    refs.pendingClamp.current.add(component);
    requestAnimationFrame(() => {
      // Double-check we're not dragging when the frame fires
      if (refs.isDraggingRef.current) {
        refs.pendingClamp.current.delete(component);
        return;
      }
      clampComponentWithinMargins(component, refs.editorInstance.current, refs.isClamping);
      refs.pendingClamp.current.delete(component);
    });
  };
};

/**
 * Setup component:add handler
 */
export const setupComponentAddHandler = (
  editor: any,
  refs: ComponentLifecycleRefs,
  callbacks: ComponentLifecycleCallbacks,
  blockDragState: BlockDragState
): void => {
  const zonePlacementRefs: ZonePlacementRefs = {
    editorInstance: refs.editorInstance,
    isClamping: refs.isClamping,
  };

  editor.on('component:add', (component: any) => {
    if (!component) return;

    const type = component.get?.('type');
    const tagName = component.get?.('tagName')?.toLowerCase?.();
    const attrs = component.get?.('attributes') || {};
    let isContainer = isSectionComponent(component);

    // Force block text elements (h1-h6, p, etc.) to be non-selectable transparent wrappers
    // This handles pasted content that GrapesJS incorrectly assigns as "text" type
    const transparentBlockTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'blockquote', 'pre', 'li', 'ul', 'ol', 'hr', 'br'];
    const transparentInlineTags = ['b', 'i', 'strong', 'em', 'u', 's', 'sub', 'sup', 'a', 'font'];
    const allTransparentTags = [...transparentBlockTags, ...transparentInlineTags];

    if (tagName && allTransparentTags.includes(tagName)) {
      // Make these elements transparent - not selectable, hoverable, or layerable
      component.set({
        selectable: false,
        hoverable: false,
        layerable: false,
        highlightable: false,
        editable: false,
        draggable: false,
        resizable: false,
      });
      // Remove the incorrect type assignment
      if (type === 'text' || type === 'default') {
        component.set('type', `inline-${tagName}`);
      }
      return; // Skip all other processing for transparent elements
    }

    // Normalize orphan containers coming from saved HTML (ensure correct type/config)
    // This handles cases where the component has pdf-container class but wasn't recognized as a container
    if (!isContainer && !type) {
      const classStr = Array.isArray(attrs.class) ? attrs.class.join(' ') : String(attrs.class || '');
      const classList = typeof component.getClasses === 'function' ? component.getClasses().join(' ') : '';
      if (classStr.includes('pdf-container') || classList.includes('pdf-container')) {
        component.set('type', 'section');
        component.set('tagName', 'div');
        component.set('draggable', '[data-gjs-type="wrapper"]');
        component.set('droppable', true);
        component.set('editable', false);
        component.set('resizable', {
          tl: 0,
          tc: 0,
          tr: 0,
          cl: 0,
          cr: 0,
          bl: 0,
          bc: 1,
          br: 0,
        });
        component.addClass('pdf-container');
        component.set('attributes', {
          ...attrs,
          'data-gjs-type': 'section',
          class: `${classStr} pdf-container`.trim(),
        });

        // Reset positioning to full-width relative
        component.removeStyle('left');
        component.removeStyle('right');
        component.removeStyle('top');
        component.removeStyle('bottom');
        component.removeStyle('margin-top');
        component.addStyle({
          position: 'relative',
          width: '100%',
          'box-sizing': 'border-box',
          'margin-left': '0',
          'margin-right': '0',
          'margin-top': '0',
        });

        // Update isContainer flag since we just converted it
        isContainer = true;

        handleComponentZonePlacement(component, editor, zonePlacementRefs);
      }
    }

    if (isContainer) {
      ensureSectionIdSelector(component, editor);
      component.set('draggable', '[data-gjs-type="wrapper"]');
    }

    // RESTRICTION: Only container/header/footer allowed in wrapper
    // All other elements must be inside containers/header/footer
    const parent = component.parent?.();
    const wrapper = editor.getWrapper();

    // If a raw <body> was saved, unwrap its children into the wrapper
    if (parent === wrapper && tagName === 'body') {
      const bodyChildren = component.components?.()?.models || [];
      bodyChildren.forEach((child: any) => {
        wrapper.append(child);
      });
      component.remove();
      return;
    }

    if (parent === wrapper) {
      // Direct child of wrapper - only allow container, header, footer
      const allowedInWrapper = ['section', 'header', 'footer'];

      if (!allowedInWrapper.includes(type) && !allowedInWrapper.includes(tagName) && !isContainer) {
        requestAnimationFrame(() => handleComponentZonePlacement(component, editor, zonePlacementRefs));
        return;
      }
    }

    // Set draggable restrictions for native components (image) that aren't custom-defined
    // Note: 'text' (span) is excluded - it should remain non-draggable (only its parent div should be draggable)
    if (type === 'image' && !isHeaderComponent(component) && !isFooterComponent(component)) {
      component.set('draggable', '.pdf-container, header, footer, td, th');
    }

    // Configure table cells (td, th) as droppable zones
    if (tagName === 'td' || tagName === 'th') {
      component.set('droppable', true);
    }

    // When element is inside a table cell, lock it there with flow layout
    // Elements in table cells should use flow layout (inline-block), not absolute
    // and should not be draggable (they stay in the cell)
    const parentTag = parent?.get?.('tagName')?.toLowerCase?.();
    if (parentTag === 'td' || parentTag === 'th') {
      // Disable dragging - element stays in the cell
      component.set('draggable', false);
      // Remove absolute positioning and use flow layout
      component.removeStyle('position');
      component.removeStyle('left');
      component.removeStyle('top');
      component.removeStyle('right');
      component.removeStyle('bottom');
      component.addStyle({
        display: 'inline-block',
        'max-width': '100%',
        'max-height': '100%',
        'object-fit': 'contain',
      });

      // Lock cell dimensions to prevent expansion during resize
      requestAnimationFrame(() => {
        const cellEl = parent?.getEl?.();
        if (cellEl) {
          const cellStyle = window.getComputedStyle(cellEl);
          const cellWidth = parseFloat(cellStyle.width) || cellEl.offsetWidth;
          const cellHeight = parseFloat(cellStyle.height) || cellEl.offsetHeight;

          // Store locked dimensions on the cell component
          parent.set('tableCellLockedWidth', cellWidth);
          parent.set('tableCellLockedHeight', cellHeight);

          // Apply fixed dimensions to prevent cell from growing
          parent.addStyle({
            overflow: 'hidden',
            width: `${cellWidth}px`,
            height: `${cellHeight}px`,
          });
        }
      });
    }

    // Exclude table and table structure elements from global drag/resize rules
    const isTableStructure = ['td', 'th', 'tr', 'tbody', 'thead', 'tfoot'].includes(tagName);

    // FIX: Correct drop position when adding from blocks panel
    // Problem: GrapesJS gives coordinates relative to the canvas iframe body,
    // but the wrapper is centered (margin: 0 auto) creating a horizontal offset.
    // Solution: Subtract the canvas centering offset from left coordinate.
    // Note: Top doesn't need correction (no vertical margin on wrapper).
    if (blockDragState.isAddingFromBlockPanel && !isHeaderComponent(component) && !isFooterComponent(component) && !isTableStructure) {
      setTimeout(() => {
        const wrapperEl = wrapper?.getEl?.();
        if (!wrapperEl) return;

        // Calculate horizontal offset caused by wrapper centering (margin: 0 auto)
        const frame = editor?.Canvas?.getFrameEl?.();
        const frameBody = frame?.contentDocument?.body;
        let canvasOffset = 0;

        if (frameBody && wrapperEl.parentElement) {
          const parentWidth = wrapperEl.parentElement.offsetWidth || frameBody.offsetWidth;
          const wrapperWidth = wrapperEl.offsetWidth;
          canvasOffset = (parentWidth - wrapperWidth) / 2;
        }

        // Get current drop coordinates
        const currentStyle = component.getStyle() || {};
        const styleLeft = parseFloat(currentStyle.left || '0');
        const styleTop = parseFloat(currentStyle.top || '0');

        // Apply correction: subtract canvas offset from left only
        const correctedLeft = styleLeft - canvasOffset;
        const correctedTop = styleTop; // No correction needed for top

        positionLog.log('Position fix:', { before: { left: styleLeft, top: styleTop }, canvasOffset, after: { left: correctedLeft, top: correctedTop } });

        component.addStyle({
          left: `${correctedLeft}px`,
          top: `${correctedTop}px`
        });

        // Ensure element stays within page margins
        callbacks.scheduleClamp(component);
      }, 10);
    }

    if (!isTableStructure) {
      // Skip forcing resizable/draggable on inline text (spans)
      const isInlineText = tagName === 'span';

      if (!isInlineText) {
        if (typeof component.get('resizable') === 'undefined') {
          component.set('resizable', true);
        }
        if (typeof component.is === 'function' && component.is('text')) {
          component.set('resizable', true);
        }

        // Only set draggable if not already defined with a selector
        // (to preserve restrictions like '.pdf-container, header, footer')
        const existingDraggable = component.get('draggable');
        if (existingDraggable === undefined || existingDraggable === null) {
          component.set('draggable', true);
        }
      }

      component.set('editable', true);
    }

    const FLOW_LAYOUT_TAGS = ['header', 'footer', 'table', 'tbody', 'thead', 'tfoot', 'tr', 'td', 'th'];

    if (FLOW_LAYOUT_TAGS.includes(tagName)) {
      positionLog.log('Preserving flow layout for:', tagName);
    }

    // Fix width: auto problem - set explicit width for text elements
    if (type === 'text' && !isHeaderComponent(component) && !isFooterComponent(component)) {
      setTimeout(() => {
        const el = component.getEl();
        if (el) {
          const currentStyle = component.getStyle() || {};
          if (!currentStyle.width || currentStyle.width === 'auto') {
            const computedWidth = el.offsetWidth;
            if (computedWidth > 0) {
              component.addStyle({ width: `${computedWidth}px` });
              positionLog.log('Set explicit width for text element:', computedWidth);
            }
          }
        }
      }, 50);
    }

    // Add clamping listener for standard elements (skip header/footer/containers/tables)
    // Tables use their own layout model and should never be clamped - clamping produces bad values
    const TABLE_TAGS = ['table', 'td', 'th', 'tr', 'tbody', 'thead', 'tfoot'];
    const isTableElement = tagName && TABLE_TAGS.includes(tagName);
    if (!isHeaderComponent(component) && !isFooterComponent(component) && !isContainer && !isTableElement) {
      component.on('change:style', () => {
        callbacks.scheduleClamp(component);
      });
    }

    // Auto-assign z-index to new components (places them on top of siblings)
    if (shouldManageZIndex(component)) {
      setTimeout(() => assignZIndexToNewComponent(component), 0);
    }

    if (isHeaderComponent(component)) {
      enforceHeaderPosition(component, editor, refs.latestPageSettings, refs.latestInfiniteMode);
    }

    if (isFooterComponent(component)) {
      enforceFooterPosition(component, editor, refs.latestPageSettings, refs.latestInfiniteMode);
    }

    if (component.get?.('type') === 'section') {
      enforceSectionPosition(component);

      // SMART CONTAINER INSERTION
      // Always ensure correct section order after adding a container
      const currentParent = component.parent?.();

      if (currentParent === wrapper) {
        // Use requestAnimationFrame to ensure DOM is ready
        requestAnimationFrame(() => {
          const currentEditor = refs.editorInstance.current;
          if (!currentEditor) return;

          const currentWrapper = currentEditor.getWrapper();
          if (!currentWrapper) return;

          // Step 1: Ensure correct section order (header → containers → footer)
          ensureSectionOrder(currentEditor);

          // Step 2: In infinite mode with cursor position, do smart insertion
          if (blockDragState.isAddingFromBlockPanel && refs.latestInfiniteMode.current && blockDragState.dropCursorPosition) {
            const insertIndex = calculateContainerInsertionIndex(currentEditor, blockDragState.dropCursorPosition.y);
            const validIndex = validateInsertionIndex(currentEditor, insertIndex);

            const children = currentWrapper.components();
            const currentIndex = children.indexOf(component);

            if (currentIndex !== -1 && currentIndex !== validIndex) {
              component.move(currentWrapper, { at: validIndex });
            }
          }

          // Step 3: Final section order check (safety net)
          ensureSectionOrder(currentEditor);

          // Step 4: Re-enforce positions and update heights
          const headerComp = currentWrapper.find('header')?.[0];
          const footerComp = currentWrapper.find('footer')?.[0];

          if (headerComp) {
            enforceHeaderPosition(headerComp, currentEditor, refs.latestPageSettings, refs.latestInfiniteMode);
          }
          if (footerComp) {
            enforceFooterPosition(footerComp, currentEditor, refs.latestPageSettings, refs.latestInfiniteMode);
          }

          updateFirstSectionPosition(currentEditor, refs.latestInfiniteMode.current);
          if (refs.latestInfiniteMode.current) {
            updateInfiniteModeHeight(currentEditor);
          }
        });
      }
    }

    if (component.get?.('type') === 'barcode') {
      renderBarcodeComponent(component);
    }

    if (component.get?.('type') === 'image') {
      autoResizeImageComponent(component);
      component.on('change:attributes', () => {
        // Call immediately - autoResizeImageComponent now captures dimensions before image loads
        autoResizeImageComponent(component);
      });
    }

    // Update first container position when header/container is added
    if (isHeaderComponent(component) || isContainer) {
      requestAnimationFrame(() => {
        if (refs.editorInstance.current) {
          updateFirstSectionPosition(refs.editorInstance.current, refs.latestInfiniteMode.current);
          // Update wrapper height in infinite mode
          if (refs.latestInfiniteMode.current) {
            updateInfiniteModeHeight(refs.editorInstance.current);
          }
        }
      });
    }
  });
};

/**
 * Setup component:update handler
 */
export const setupComponentUpdateHandler = (
  editor: any,
  refs: ComponentLifecycleRefs
): void => {
  editor.on('component:update', (component: any) => {
    if (component?.get?.('type') === 'section') {
      sectionLog.log('Component updated, new style:', component.getStyle());
    }

    if (component?.get?.('type') === 'barcode') {
      renderBarcodeComponent(component);
    }

    // Clean HTML tags from inside {{ }} template expressions (handles copy-paste issues)
    const cleanTemplateContent = (comp: any) => {
      const content = comp?.get?.('content');
      if (content && typeof content === 'string' && content.includes('{{')) {
        const cleaned = content.replace(/\{\{([^}]+)\}\}/g, (match: string, inner: string) => {
          if (inner.includes('<')) {
            const stripped = inner.replace(/<[^>]*>/g, '').trim();
            return `{{${stripped}}}`;
          }
          return match;
        });
        if (cleaned !== content) {
          comp.set('content', cleaned, { silent: true });
        }
      }
      // Also check children
      comp?.components?.()?.forEach?.((child: any) => cleanTemplateContent(child));
    };
    cleanTemplateContent(component);

    // Update first container position when header/container updates
    if (isHeaderComponent(component) || component?.get?.('type') === 'section') {
      requestAnimationFrame(() => {
        if (refs.editorInstance.current) {
          updateFirstSectionPosition(refs.editorInstance.current, refs.latestInfiniteMode.current);
          // Update flex behavior for fixed mode
          updateFixedModeSectionFlex(refs.editorInstance.current, refs.latestInfiniteMode.current);
          // Update wrapper height in infinite mode
          if (refs.latestInfiniteMode.current) {
            updateInfiniteModeHeight(refs.editorInstance.current);
          }
        }
      });
    }
  });
};

/**
 * Setup component:remove handler
 */
export const setupComponentRemoveHandler = (
  editor: any,
  refs: ComponentLifecycleRefs
): void => {
  editor.on('component:remove', (component: any) => {
    const cleanup = component.get?.('_alignmentCleanup');
    if (typeof cleanup === 'function') {
      cleanup();
    }

    // Remove from z-order list
    // Note: parent might still be accessible even after removal
    const parent = component.parent?.();
    if (parent) {
      removeFromZOrderList(component, parent);
    }

    // Update first container position when header/container is removed
    if (isHeaderComponent(component) || component?.get?.('type') === 'section') {
      requestAnimationFrame(() => {
        if (refs.editorInstance.current) {
          updateFirstSectionPosition(refs.editorInstance.current, refs.latestInfiniteMode.current);
          // Update flex behavior for fixed mode
          updateFixedModeSectionFlex(refs.editorInstance.current, refs.latestInfiniteMode.current);
          // Update wrapper height in infinite mode
          if (refs.latestInfiniteMode.current) {
            updateInfiniteModeHeight(refs.editorInstance.current);
          }
        }
      });
    }
  });
};

/**
 * Setup component:mount handler
 */
export const setupComponentMountHandler = (
  editor: any,
  refs: ComponentLifecycleRefs,
  activeResizeSessions: WeakMap<any, any>,
  currentDragComponentGetter: () => any
): void => {
  editor.on('component:mount', (component: any) => {
    if (isHeaderComponent(component)) {
      enforceHeaderPosition(component, editor, refs.latestPageSettings, refs.latestInfiniteMode);
    }
    if (isFooterComponent(component)) {
      enforceFooterPosition(component, editor, refs.latestPageSettings, refs.latestInfiniteMode);
    }
    if (component?.get?.('type') === 'section') {
      enforceSectionPosition(component);
      ensureSectionIdSelector(component, editor);
      component.set('draggable', '[data-gjs-type="wrapper"]');
    }
    if (component?.get?.('type') === 'barcode') {
      renderBarcodeComponent(component);
    }

    // Add column/row resize handles for tables
    const tagName = component?.get?.('tagName')?.toLowerCase?.();
    if (tagName === 'table') {
      // Add handles when table is mounted
      setTimeout(() => {
        addTableResizeHandles(component, editor);
      }, 100);
    }

    // Add mousedown/mouseup listeners for alignment guides
    const el = component.getEl?.();
    if (el && !isHeaderComponent(component) && !isFooterComponent(component)) {
      const showAlignmentGuidesForComponent = (comp: any) => {
        const wrapper = editor.getWrapper();
        const wrapperEl = wrapper?.getEl?.();
        if (!wrapper || !wrapperEl) return;

        const allDraggable = getAllDraggableComponents(wrapper);
        const otherComponents = allDraggable.filter((c: any) => c !== comp);

        const pageCenterLines = getPageCenterLines(wrapper, refs.latestPageSettings.current.padding);
        const alignmentState = findAlignments(
          comp,
          wrapperEl,
          otherComponents,
          pageCenterLines,
          SNAP_THRESHOLD
        );

        renderAlignmentGuides(editor, alignmentState);
      };

      const handleMouseDown = (e: MouseEvent) => {
        if (e.button !== 0) return; // Only left click
        showAlignmentGuidesForComponent(component);
      };

      const handleMouseUp = () => {
        // Clear guides after a short delay, unless drag/resize is active
        setTimeout(() => {
          const hasActiveResize = component && activeResizeSessions.has(component);
          if (!currentDragComponentGetter() && !hasActiveResize) {
            clearAlignmentGuides(editor);
          }
        }, 100);
      };

      el.addEventListener('mousedown', handleMouseDown);

      const frame = editor?.Canvas?.getFrameEl?.();
      const doc = frame?.contentDocument || document;
      doc.addEventListener('mouseup', handleMouseUp);

      // Store cleanup function
      component.set('_alignmentCleanup', () => {
        el.removeEventListener('mousedown', handleMouseDown);
        doc.removeEventListener('mouseup', handleMouseUp);
      });
    }
  });
};

/**
 * Setup trait:change handler
 */
export const setupTraitChangeHandler = (editor: any): void => {
  editor.on('trait:change', (component: any) => {
    if (component?.get?.('type') === 'barcode') {
      renderBarcodeComponent(component);
    }
  });
};
