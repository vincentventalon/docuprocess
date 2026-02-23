/**
 * Paste-and-drag mode for pasted elements
 * Elements follow cursor until click to place
 */

import { getParentRelativePosition } from "./placement-ghost";

export interface PasteDropModeState {
  components: any[];
  initialOffsets: Map<any, { x: number; y: number }>;
  cleanup: (() => void) | null;
}

/**
 * Start paste-drop mode: pasted elements follow cursor until click
 */
export const startPasteDropMode = (
  editor: any,
  pastedComponents: any[],
  onStateChange: (state: PasteDropModeState | null) => void
): void => {
  if (pastedComponents.length === 0) return;

  // Find top-left of the group (reference point that follows the mouse)
  let minX = Infinity, minY = Infinity;
  for (const comp of pastedComponents) {
    const style = comp.getStyle?.() || {};
    const left = parseFloat(style.left) || 0;
    const top = parseFloat(style.top) || 0;
    if (left < minX) minX = left;
    if (top < minY) minY = top;
  }

  // Store each element's offset from the group's top-left
  const initialOffsets = new Map<any, { x: number; y: number }>();
  for (const comp of pastedComponents) {
    const style = comp.getStyle?.() || {};
    const left = parseFloat(style.left) || 0;
    const top = parseFloat(style.top) || 0;
    initialOffsets.set(comp, { x: left - minX, y: top - minY });

    // Add visual feedback - make slightly transparent
    const el = comp.getEl?.();
    if (el?.style) {
      el.style.opacity = '0.7';
      el.style.pointerEvents = 'none';
    }
  }

  const canvasFrame = editor.Canvas?.getFrameEl?.();
  const canvasDoc = canvasFrame?.contentDocument || document;
  const canvasBody = canvasDoc?.body;

  let pasteDropMode: PasteDropModeState = {
    components: pastedComponents,
    initialOffsets,
    cleanup: null,
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!pasteDropMode) return;

    for (const comp of pasteDropMode.components) {
      const offset = pasteDropMode.initialOffsets.get(comp);
      if (!offset) continue;
      // Calculate position relative to each component's parent (container/header/footer)
      const pos = getParentRelativePosition(editor, comp, e.clientX, e.clientY);
      if (!pos) continue;
      comp.setStyle({
        ...comp.getStyle(),
        left: `${pos.x + offset.x}px`,
        top: `${pos.y + offset.y}px`,
      });
    }
  };

  const handleClick = (e: MouseEvent) => {
    if (!pasteDropMode) return;
    e.preventDefault();
    e.stopPropagation();

    // Finalize positions and restore opacity
    for (const comp of pasteDropMode.components) {
      const el = comp.getEl?.();
      if (el?.style) {
        el.style.opacity = '';
        el.style.pointerEvents = '';
      }
    }

    // Select the pasted components
    editor.select(pasteDropMode.components);

    // Cleanup
    if (pasteDropMode.cleanup) {
      pasteDropMode.cleanup();
    }
    onStateChange(null);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && pasteDropMode) {
      // Cancel paste - remove components
      for (const comp of pasteDropMode.components) {
        comp.remove();
      }
      if (pasteDropMode.cleanup) {
        pasteDropMode.cleanup();
      }
      onStateChange(null);
    }
  };

  // Add listeners to both canvas and main document
  canvasBody?.addEventListener('mousemove', handleMouseMove);
  canvasBody?.addEventListener('click', handleClick, { capture: true, once: true });
  document.addEventListener('keydown', handleKeyDown);

  const cleanup = () => {
    canvasBody?.removeEventListener('mousemove', handleMouseMove);
    canvasBody?.removeEventListener('click', handleClick, { capture: true });
    document.removeEventListener('keydown', handleKeyDown);
  };

  pasteDropMode.cleanup = cleanup;
  onStateChange(pasteDropMode);

  // Deselect all to hide selection UI during placement
  editor.select(null);
};

/**
 * Setup paste command override to start drop mode
 * @returns cleanup function
 */
export const setupPasteCommandOverride = (
  editor: any,
  startPasteDropModeFn: (pastedComponents: any[]) => void
): void => {
  const basePaste = editor.Commands.get('core:paste');
  if (!basePaste) return;

  editor.Commands.add('core:paste', {
    ...basePaste,
    run(ed: any, sender: any, opts: any = {}) {
      const componentsBefore = new Set<any>();
      const wrapper = ed.getWrapper?.();
      if (wrapper) {
        wrapper.onAll((c: any) => componentsBefore.add(c));
      }

      const result = basePaste.run(ed, sender, opts);

      // Find newly added components (with delay to ensure DOM is ready)
      setTimeout(() => {
        const newComponents: any[] = [];
        if (wrapper) {
          wrapper.onAll((c: any) => {
            if (!componentsBefore.has(c)) {
              const style = c.getStyle?.() || {};
              // Only include positioned elements, not containers
              if (style.position === 'absolute') {
                newComponents.push(c);
              }
            }
          });
        }

        if (newComponents.length > 0) {
          startPasteDropModeFn(newComponents);
        }
      }, 50);

      return result;
    },
  });
};
