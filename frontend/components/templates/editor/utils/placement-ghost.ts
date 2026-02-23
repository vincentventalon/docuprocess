import { ElementType } from "../panels/components/NewElementDropdown";
import {
  PLACEMENT_GHOST_ELEMENT_ID,
} from "../types";

// Ghost preview HTML for each element type
const GHOST_PREVIEWS: Record<ElementType, string> = {
  text: `
    <div style="
      padding: 10px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      font-size: 14px;
      color: #64748b;
      min-width: 120px;
    ">Your text here</div>
  `,
  image: `
    <div style="
      width: 200px;
      height: 150px;
      background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21 15 16 10 5 21"/>
      </svg>
    </div>
  `,
  table: `
    <div style="
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      overflow: hidden;
      width: 200px;
    ">
      <div style="display: flex; background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
        <div style="flex: 1; padding: 6px 8px; font-size: 11px; color: #64748b; border-right: 1px solid #e2e8f0;">Header 1</div>
        <div style="flex: 1; padding: 6px 8px; font-size: 11px; color: #64748b;">Header 2</div>
      </div>
      <div style="display: flex;">
        <div style="flex: 1; padding: 6px 8px; font-size: 11px; color: #94a3b8; border-right: 1px solid #e2e8f0;">Cell 1</div>
        <div style="flex: 1; padding: 6px 8px; font-size: 11px; color: #94a3b8;">Cell 2</div>
      </div>
    </div>
  `,
  barcode: `
    <div style="
      padding: 12px 16px;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    ">
      <div style="display: flex; gap: 1px;">
        ${Array(20).fill(0).map((_, i) => `<div style="width: ${i % 3 === 0 ? 2 : 1}px; height: 32px; background: #334155;"></div>`).join('')}
      </div>
      <div style="font-size: 10px; color: #64748b; font-family: monospace;">123456789012</div>
    </div>
  `,
  qrcode: `
    <div style="
      width: 100px;
      height: 100px;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 8px;
    ">
      <svg viewBox="0 0 100 100" width="80" height="80">
        <rect fill="#334155" x="0" y="0" width="30" height="30"/>
        <rect fill="white" x="5" y="5" width="20" height="20"/>
        <rect fill="#334155" x="10" y="10" width="10" height="10"/>
        <rect fill="#334155" x="70" y="0" width="30" height="30"/>
        <rect fill="white" x="75" y="5" width="20" height="20"/>
        <rect fill="#334155" x="80" y="10" width="10" height="10"/>
        <rect fill="#334155" x="0" y="70" width="30" height="30"/>
        <rect fill="white" x="5" y="75" width="20" height="20"/>
        <rect fill="#334155" x="10" y="80" width="10" height="10"/>
        <rect fill="#334155" x="40" y="0" width="10" height="10"/>
        <rect fill="#334155" x="40" y="20" width="10" height="10"/>
        <rect fill="#334155" x="40" y="40" width="20" height="10"/>
        <rect fill="#334155" x="0" y="40" width="10" height="20"/>
        <rect fill="#334155" x="70" y="40" width="10" height="10"/>
        <rect fill="#334155" x="90" y="50" width="10" height="10"/>
        <rect fill="#334155" x="40" y="70" width="10" height="10"/>
        <rect fill="#334155" x="60" y="60" width="10" height="10"/>
        <rect fill="#334155" x="70" y="70" width="30" height="10"/>
        <rect fill="#334155" x="80" y="80" width="20" height="20"/>
      </svg>
    </div>
  `,
  section: `
    <div style="
      width: 200px;
      height: 100px;
      border: 2px dashed #94a3b8;
      border-radius: 6px;
      background: rgba(148, 163, 184, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #64748b;
      font-size: 12px;
    ">Section</div>
  `,
  "shape-line": `
    <div style="
      width: 200px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <svg width="100%" height="100%" viewBox="0 0 200 20" preserveAspectRatio="none">
        <line x1="0" y1="10" x2="200" y2="10" stroke="#334155" stroke-width="2" stroke-linecap="round" />
      </svg>
    </div>
  `,
  "shape-circle": `
    <div style="
      width: 100px;
      height: 100px;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <svg width="100%" height="100%" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="48" fill="transparent" stroke="#334155" stroke-width="2" />
      </svg>
    </div>
  `,
  "shape-rectangle": `
    <div style="
      width: 200px;
      height: 100px;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <svg width="100%" height="100%" viewBox="0 0 200 100" preserveAspectRatio="none">
        <rect x="1" y="1" width="198" height="98" fill="transparent" stroke="#334155" stroke-width="2" />
      </svg>
    </div>
  `,
};

/**
 * Show the placement ghost for a given element type
 * Ghost lives in the main document so it's visible everywhere
 */
export const showPlacementGhost = (_editor: any, elementType: ElementType) => {
  // Remove existing ghost if any
  hidePlacementGhost();

  // Create new ghost in main document
  const ghost = document.createElement("div");
  ghost.id = PLACEMENT_GHOST_ELEMENT_ID;
  ghost.innerHTML = GHOST_PREVIEWS[elementType];

  // Style the ghost container
  ghost.style.cssText = `
    position: fixed;
    pointer-events: none;
    z-index: 99999;
    opacity: 0.7;
    transform: translate(-50%, -50%);
    filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15));
    display: none;
  `;

  document.body.appendChild(ghost);
};

/**
 * Update the ghost position to follow the cursor
 * Uses main document coordinates
 */
export const updatePlacementGhostPosition = (_editor: any, x: number, y: number) => {
  const ghost = document.getElementById(PLACEMENT_GHOST_ELEMENT_ID);
  if (!ghost) return;

  ghost.style.left = `${x}px`;
  ghost.style.top = `${y}px`;
  ghost.style.display = "block";
};

/**
 * Hide and remove the placement ghost
 */
export const hidePlacementGhost = (_editor?: any) => {
  const ghost = document.getElementById(PLACEMENT_GHOST_ELEMENT_ID);
  if (ghost) {
    ghost.remove();
  }
};

/**
 * Get the wrapper-relative position from canvas iframe coordinates
 */
export const getWrapperRelativePosition = (
  editor: any,
  clientX: number,
  clientY: number
): { x: number; y: number } | null => {
  const frame = editor?.Canvas?.getFrameEl?.();
  if (!frame) return null;

  const wrapper = editor?.getWrapper?.();
  const wrapperEl = wrapper?.getEl?.();
  if (!wrapperEl) return null;

  const wrapperRect = wrapperEl.getBoundingClientRect();

  // clientX/clientY are relative to the iframe viewport
  // We need to convert to wrapper-relative coordinates
  const x = clientX - wrapperRect.left;
  const y = clientY - wrapperRect.top;

  return { x, y };
};

/**
 * Get position relative to a component's parent element
 * This is needed for pasted elements which are positioned relative to their parent (container/header/footer)
 */
export const getParentRelativePosition = (
  editor: any,
  component: any,
  clientX: number,
  clientY: number
): { x: number; y: number } | null => {
  const frame = editor?.Canvas?.getFrameEl?.();
  if (!frame) return null;

  // Get the parent component
  const parent = typeof component?.parent === 'function' ? component.parent() : component?.parent;
  const parentEl = parent?.getEl?.();

  if (!parentEl) {
    // Fallback to wrapper if no parent
    return getWrapperRelativePosition(editor, clientX, clientY);
  }

  const parentRect = parentEl.getBoundingClientRect();

  // clientX/clientY are relative to the iframe viewport
  // Convert to parent-relative coordinates
  const x = clientX - parentRect.left;
  const y = clientY - parentRect.top;

  return { x, y };
};
