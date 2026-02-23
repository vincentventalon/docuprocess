/**
 * Zone Overflow Detection & Soft Constraints
 *
 * Implements "soft constraint" system for zone resizing:
 * - Calculates minimum required height based on child elements
 * - Provides resistance when resize would cut off elements
 * - Supports force override with Shift key
 * - Provides visual feedback for overflow state
 */

/**
 * Get the bottom padding of a zone element
 * Uses the zone's own padding-bottom as the safe margin
 * No fallback - if user sets padding to 0, we respect that
 */
function getZonePaddingBottom(zoneComponent: any): number {
  const zoneEl = zoneComponent?.getEl?.();
  if (!zoneEl) return 0;

  const view = zoneEl.ownerDocument?.defaultView ?? window;
  const computed = view.getComputedStyle(zoneEl);
  return parseFloat(computed.paddingBottom) || 0;
}

export interface ZoneOverflowInfo {
  /** Minimum height required to contain all children */
  minRequiredHeight: number;
  /** Elements that would overflow if zone is resized to target height */
  overflowingElements: OverflowingElement[];
  /** Number of elements that would be cut off */
  overflowCount: number;
  /** Whether the target height would cause overflow */
  wouldOverflow: boolean;
}

export interface OverflowingElement {
  component: any;
  /** How much the element extends beyond the zone (px) */
  overflowAmount: number;
  /** Element's bottom edge position relative to zone top */
  elementBottom: number;
}

export interface SoftConstraintResult {
  /** The height to apply (either snapped or forced) */
  finalHeight: number;
  /** Whether we snapped to min height (resistance applied) */
  wasConstrained: boolean;
  /** Whether user is forcing past the constraint */
  isForced: boolean;
  /** Info about overflow state */
  overflow: ZoneOverflowInfo;
}

/**
 * Get all child components of a zone (non-recursive, direct children only)
 */
function getZoneChildren(zoneComponent: any): any[] {
  const components = zoneComponent?.components?.();
  if (!components || typeof components.models === 'undefined') {
    return Array.isArray(components) ? components : [];
  }
  return components.models || [];
}

/**
 * Calculate the bottom position of an element relative to its parent zone
 * Handles both absolute and relative positioning
 */
function getElementBottomPosition(component: any, zoneElement: HTMLElement): number {
  const el = component?.getEl?.();
  // Ensure el is a valid DOM element with getBoundingClientRect
  if (!el || !zoneElement || typeof el.getBoundingClientRect !== 'function') return 0;

  const zoneRect = zoneElement.getBoundingClientRect();
  const elRect = el.getBoundingClientRect();

  // Calculate bottom relative to zone's top
  return (elRect.top - zoneRect.top) + elRect.height;
}

/**
 * Detect which elements would overflow at a given height
 * Uses the zone's padding-bottom as the safe margin
 */
export function detectOverflow(
  zoneComponent: any,
  targetHeight: number
): ZoneOverflowInfo {
  const zoneEl = zoneComponent?.getEl?.();
  const children = getZoneChildren(zoneComponent);

  if (!zoneEl || children.length === 0) {
    return {
      minRequiredHeight: 0,
      overflowingElements: [],
      overflowCount: 0,
      wouldOverflow: false,
    };
  }

  const safeMargin = getZonePaddingBottom(zoneComponent);
  const overflowingElements: OverflowingElement[] = [];
  let maxBottom = 0;

  for (const child of children) {
    const elementBottom = getElementBottomPosition(child, zoneEl);

    if (elementBottom > maxBottom) {
      maxBottom = elementBottom;
    }
  }

  // Calculate min required height FIRST (includes padding)
  const minRequiredHeight = maxBottom + safeMargin;

  // Check overflow against minRequiredHeight, NOT just elementBottom
  // This ensures padding is accounted for in the blocking logic
  const wouldOverflow = targetHeight < minRequiredHeight;

  // If we would overflow, find which elements are closest to the bottom (blocking)
  if (wouldOverflow) {
    for (const child of children) {
      const elementBottom = getElementBottomPosition(child, zoneEl);
      // Elements that would be cut off OR are causing the min height constraint
      if (elementBottom + safeMargin > targetHeight) {
        overflowingElements.push({
          component: child,
          overflowAmount: (elementBottom + safeMargin) - targetHeight,
          elementBottom,
        });
      }
    }
  }

  return {
    minRequiredHeight,
    overflowingElements,
    overflowCount: overflowingElements.length,
    wouldOverflow,
  };
}

/**
 * Apply soft constraint logic to zone resize
 *
 * @param zoneComponent - The zone being resized (header, footer, container)
 * @param targetHeight - The height the user is trying to resize to
 * @param isForceOverride - Whether user is holding Shift to force
 */
export function applySoftConstraint(
  zoneComponent: any,
  targetHeight: number,
  isForceOverride: boolean = false
): SoftConstraintResult {
  const overflow = detectOverflow(zoneComponent, targetHeight);

  // No overflow - allow the resize
  if (!overflow.wouldOverflow) {
    return {
      finalHeight: targetHeight,
      wasConstrained: false,
      isForced: false,
      overflow,
    };
  }

  // Would overflow, but user is forcing
  if (isForceOverride) {
    return {
      finalHeight: targetHeight,
      wasConstrained: false,
      isForced: true,
      overflow,
    };
  }

  // Would overflow - BLOCK at minimum required height (hard constraint)
  // Don't allow going below, period.
  return {
    finalHeight: overflow.minRequiredHeight,
    wasConstrained: true,
    isForced: false,
    overflow,
  };
}

/**
 * CSS class names for overflow visual feedback
 */
export const OVERFLOW_CLASSES = {
  zoneWithOverflow: 'zone-has-overflow',
  overflowingElement: 'element-overflowing',
  blockingElement: 'element-blocking-resize',
  overflowOverlay: 'zone-overflow-overlay',
  constraintTooltip: 'zone-constraint-tooltip',
} as const;

/**
 * Inject CSS styles for overflow visualization
 */
export function injectOverflowStyles(editor: any): void {
  const doc = editor?.Canvas?.getDocument?.() || document;

  // Check if styles already injected
  if (doc.getElementById('zone-overflow-styles')) return;

  const style = doc.createElement('style');
  style.id = 'zone-overflow-styles';
  style.textContent = `
    /* Zone with overflowing elements */
    .${OVERFLOW_CLASSES.zoneWithOverflow} {
      position: relative;
    }

    /* Overlay showing the "cut off" area */
    .${OVERFLOW_CLASSES.overflowOverlay} {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(239, 68, 68, 0.15);
      border-top: 2px dashed #ef4444;
      pointer-events: none;
      z-index: 1000;
    }

    /* Overflowing element indicator (forced mode) */
    .${OVERFLOW_CLASSES.overflowingElement} {
      outline: 2px dashed #ef4444 !important;
      outline-offset: -1px;
    }

    /* Blocking element indicator (blocked mode) - subtle red tint */
    .${OVERFLOW_CLASSES.blockingElement} {
      outline: 2px solid rgba(239, 68, 68, 0.6) !important;
      outline-offset: -1px;
      background-color: rgba(239, 68, 68, 0.08) !important;
    }

    /* Constraint tooltip */
    .${OVERFLOW_CLASSES.constraintTooltip} {
      position: fixed;
      background: #1f2937;
      color: white;
      padding: 6px 10px;
      border-radius: 4px;
      font-size: 12px;
      font-family: system-ui, -apple-system, sans-serif;
      white-space: nowrap;
      z-index: 10000;
      pointer-events: none;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }

    .${OVERFLOW_CLASSES.constraintTooltip} .hint {
      color: #9ca3af;
      font-size: 11px;
      margin-top: 2px;
    }
  `;

  doc.head.appendChild(style);
}

/**
 * Show visual feedback during constrained resize
 * @param showFullOverflow - If true, show overlay and element markers (for forced mode).
 *                           If false, just show tooltip (for blocked mode).
 */
export function showOverflowFeedback(
  editor: any,
  zoneComponent: any,
  overflow: ZoneOverflowInfo,
  targetHeight: number,
  cursorPosition?: { x: number; y: number },
  showFullOverflow: boolean = true
): void {
  const doc = editor?.Canvas?.getDocument?.() || document;
  const zoneEl = zoneComponent?.getEl?.();
  if (!zoneEl) return;

  // Remove any existing feedback
  clearOverflowFeedback(editor);

  // Add class to zone
  zoneEl.classList.add(OVERFLOW_CLASSES.zoneWithOverflow);

  // Only show overlay and element markers in full overflow mode (forced with Shift)
  if (showFullOverflow) {
    // Create overlay for the "cut off" area
    const overlayHeight = overflow.minRequiredHeight - targetHeight;
    if (overlayHeight > 0) {
      const overlay = doc.createElement('div');
      overlay.className = OVERFLOW_CLASSES.overflowOverlay;
      overlay.style.height = `${overlayHeight}px`;
      overlay.dataset.overflowOverlay = 'true';
      zoneEl.appendChild(overlay);
    }

    // Mark overflowing elements
    for (const { component } of overflow.overflowingElements) {
      const el = component?.getEl?.();
      if (el) {
        el.classList.add(OVERFLOW_CLASSES.overflowingElement);
      }
    }
  }

  // Show tooltip near cursor (always shown when constrained)
  if (cursorPosition) {
    showConstraintTooltip(editor, cursorPosition, overflow, showFullOverflow);
  }
}

/**
 * Show tooltip with constraint info
 */
function showConstraintTooltip(
  editor: any,
  position: { x: number; y: number },
  overflow: ZoneOverflowInfo,
  isForced: boolean
): void {
  const doc = editor?.Canvas?.getDocument?.() || document;

  // Remove existing tooltip
  const existing = doc.querySelector(`.${OVERFLOW_CLASSES.constraintTooltip}`);
  if (existing) existing.remove();

  const tooltip = doc.createElement('div');
  tooltip.className = OVERFLOW_CLASSES.constraintTooltip;

  if (isForced) {
    // Forced mode - show what's being cut off
    tooltip.innerHTML = `
      <div>${overflow.overflowCount} élément${overflow.overflowCount > 1 ? 's' : ''} masqué${overflow.overflowCount > 1 ? 's' : ''}</div>
      <div class="hint">Relâcher Shift pour annuler</div>
    `;
  } else {
    // Blocked mode - show min height
    tooltip.innerHTML = `
      <div>Hauteur min: ${Math.round(overflow.minRequiredHeight)}px</div>
      <div class="hint">Shift pour forcer</div>
    `;
  }

  tooltip.style.left = `${position.x + 15}px`;
  tooltip.style.top = `${position.y - 10}px`;

  doc.body.appendChild(tooltip);
}

/**
 * Clear all overflow visual feedback
 */
export function clearOverflowFeedback(editor: any): void {
  const doc = editor?.Canvas?.getDocument?.() || document;

  // Remove zone class
  const zones = doc.querySelectorAll(`.${OVERFLOW_CLASSES.zoneWithOverflow}`);
  zones.forEach((el: Element) => el.classList.remove(OVERFLOW_CLASSES.zoneWithOverflow));

  // Remove overlays
  const overlays = doc.querySelectorAll(`[data-overflow-overlay="true"]`);
  overlays.forEach((el: Element) => el.remove());

  // Remove element markers (both overflowing and blocking)
  const overflowing = doc.querySelectorAll(`.${OVERFLOW_CLASSES.overflowingElement}`);
  overflowing.forEach((el: Element) => el.classList.remove(OVERFLOW_CLASSES.overflowingElement));

  const blocking = doc.querySelectorAll(`.${OVERFLOW_CLASSES.blockingElement}`);
  blocking.forEach((el: Element) => el.classList.remove(OVERFLOW_CLASSES.blockingElement));

  // Remove tooltip
  const tooltip = doc.querySelector(`.${OVERFLOW_CLASSES.constraintTooltip}`);
  if (tooltip) tooltip.remove();
}

/**
 * Check if a component is a zone (header, footer, or container)
 */
export function isZoneComponent(component: any): boolean {
  const type = component?.get?.('type');
  const tagName = component?.get?.('tagName')?.toLowerCase?.();

  return (
    type === 'header' ||
    type === 'footer' ||
    type === 'section' ||
    tagName === 'header' ||
    tagName === 'footer' ||
    component?.get?.('attributes')?.class?.includes?.('pdf-container')
  );
}
