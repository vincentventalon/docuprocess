/**
 * Block panel drag events (drag:start/drag/stop)
 * Handles tracking when elements are being added from the blocks panel
 */

import type { MutableRefObject } from "react";
import {
  calculateContainerInsertionIndex,
  validateInsertionIndex,
} from "./positioning";
import {
  showSectionDropIndicator,
  hideSectionDropIndicator,
  calculateDropIndicatorPosition,
} from "./canvas";

export interface BlockDragState {
  isAddingFromBlockPanel: boolean;
  isDraggingSectionBlock: boolean;
  dropCursorPosition: { x: number; y: number } | null;
}

/**
 * Create initial block drag state
 */
export const createBlockDragState = (): BlockDragState => ({
  isAddingFromBlockPanel: false,
  isDraggingSectionBlock: false,
  dropCursorPosition: null,
});

/**
 * Setup block drag event handlers
 * @returns cleanup function
 */
export const setupBlockDragHandlers = (
  editor: any,
  state: BlockDragState,
  infiniteModeRef: MutableRefObject<boolean>
): (() => void) => {
  const handleDragStart = (block: any) => {
    state.isAddingFromBlockPanel = true;
    state.dropCursorPosition = null;

    // Check if we're dragging a container block
    const blockContent = block?.get?.('content');
    state.isDraggingSectionBlock = blockContent?.type === 'section';
  };

  const handleDrag = (block: any, ev: any) => {
    if (!state.isDraggingSectionBlock || !infiniteModeRef.current) return;

    const event = ev?.event || ev;
    if (!event?.clientY) return;

    const wrapper = editor.getWrapper();
    const wrapperEl = wrapper?.getEl?.();
    if (!wrapperEl) return;

    const wrapperRect = wrapperEl.getBoundingClientRect();

    // Store cursor position relative to wrapper
    state.dropCursorPosition = {
      x: event.clientX - wrapperRect.left,
      y: event.clientY - wrapperRect.top,
    };

    // Calculate and show the drop indicator
    const insertIndex = calculateContainerInsertionIndex(editor, state.dropCursorPosition.y);
    const validIndex = validateInsertionIndex(editor, insertIndex);
    const indicatorY = calculateDropIndicatorPosition(editor, validIndex);
    showSectionDropIndicator(editor, indicatorY);
  };

  const handleDragStop = () => {
    // Hide drop indicator
    hideSectionDropIndicator(editor);

    // Reset flags after a short delay to let component:add fire
    setTimeout(() => {
      state.isAddingFromBlockPanel = false;
      state.isDraggingSectionBlock = false;
      // Keep dropCursorPosition until component:add uses it
    }, 100);

    // Reset cursor position after component:add has had time to use it
    setTimeout(() => {
      state.dropCursorPosition = null;
    }, 200);
  };

  // Register event handlers
  editor.on('block:drag:start', handleDragStart);
  editor.on('block:drag', handleDrag);
  editor.on('block:drag:stop', handleDragStop);

  // Return cleanup function
  return () => {
    editor.off('block:drag:start', handleDragStart);
    editor.off('block:drag', handleDrag);
    editor.off('block:drag:stop', handleDragStop);
  };
};
