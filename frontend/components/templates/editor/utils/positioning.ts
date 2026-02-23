import React from "react";

export const parsePixelValue = (value: string) => {
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const calculateMinimumSize = (el: HTMLElement): { minWidth: number; minHeight: number } => {
  const view = el.ownerDocument?.defaultView ?? window;
  const computed = view.getComputedStyle(el);

  // 1. Min CSS explicites
  let minWidth = parsePixelValue(computed.minWidth);
  let minHeight = parsePixelValue(computed.minHeight);

  // 2. Padding qui force une taille minimale
  const paddingLeft = parsePixelValue(computed.paddingLeft);
  const paddingRight = parsePixelValue(computed.paddingRight);
  const paddingTop = parsePixelValue(computed.paddingTop);
  const paddingBottom = parsePixelValue(computed.paddingBottom);

  const minWidthFromPadding = paddingLeft + paddingRight;
  const minHeightFromPadding = paddingTop + paddingBottom;

  minWidth = Math.max(minWidth, minWidthFromPadding);
  minHeight = Math.max(minHeight, minHeightFromPadding);

  // 3. Border qui compte aussi
  const borderLeft = parsePixelValue(computed.borderLeftWidth);
  const borderRight = parsePixelValue(computed.borderRightWidth);
  const borderTop = parsePixelValue(computed.borderTopWidth);
  const borderBottom = parsePixelValue(computed.borderBottomWidth);

  minWidth = Math.max(minWidth, minWidthFromPadding + borderLeft + borderRight);
  minHeight = Math.max(minHeight, minHeightFromPadding + borderTop + borderBottom);

  return { minWidth, minHeight };
};

export const getRelativeOffsets = (el: HTMLElement) => {
  const rect = el.getBoundingClientRect();
  const reference =
    (el.offsetParent as HTMLElement | null)?.getBoundingClientRect() ??
    el.parentElement?.getBoundingClientRect();

  if (!reference) {
    return { left: rect.left, top: rect.top };
  }

  return {
    left: rect.left - reference.left,
    top: rect.top - reference.top,
  };
};

// Helper: Find the header component in the editor
export const findHeaderComponent = (editor: any) => {
  if (!editor) return null;
  const wrapper = editor.getWrapper();
  if (!wrapper) return null;
  const headers = wrapper.find('header');
  return headers && headers.length > 0 ? headers[0] : null;
};

// Helper: Find the footer component in the editor
export const findFooterComponent = (editor: any) => {
  if (!editor) return null;
  const wrapper = editor.getWrapper();
  if (!wrapper) return null;
  const footers = wrapper.find('footer');
  return footers && footers.length > 0 ? footers[0] : null;
};

// Helper: Get element's geometric center point
export const getElementCenter = (component: any, editorInstance: any) => {
  if (!component) return null;

  // Try multiple ways to get the DOM element
  let el = component.getEl?.();

  // If getEl() doesn't work, try view.el
  if (!el && component.view) {
    el = component.view.el;
  }

  if (!el) return null;

  const rect = el.getBoundingClientRect();
  const wrapper = editorInstance?.getWrapper?.();
  const wrapperEl = wrapper?.getEl?.();
  if (!wrapperEl) return null;

  const wrapperRect = wrapperEl.getBoundingClientRect();

  // Get position relative to wrapper
  const relativeLeft = rect.left - wrapperRect.left;
  const relativeTop = rect.top - wrapperRect.top;

  return {
    x: relativeLeft + rect.width / 2,
    y: relativeTop + rect.height / 2,
  };
};

// Helper: Get header bounding box
export const getHeaderBounds = (headerComponent: any, editorInstance: any) => {
  if (!headerComponent) return null;

  const el = headerComponent.getEl?.();
  if (!el) return null;

  const rect = el.getBoundingClientRect();
  const wrapper = editorInstance?.getWrapper?.();
  const wrapperEl = wrapper?.getEl?.();
  if (!wrapperEl) return null;

  const wrapperRect = wrapperEl.getBoundingClientRect();

  // Get position relative to wrapper
  const relativeLeft = rect.left - wrapperRect.left;
  const relativeTop = rect.top - wrapperRect.top;

  return {
    top: relativeTop,
    left: relativeLeft,
    width: rect.width,
    height: rect.height,
  };
};

// Helper: Get footer bounding box
export const getFooterBounds = (footerComponent: any, editorInstance: any) => {
  if (!footerComponent) return null;

  const el = footerComponent.getEl?.();
  if (!el) return null;

  const rect = el.getBoundingClientRect();
  const wrapper = editorInstance?.getWrapper?.();
  const wrapperEl = wrapper?.getEl?.();
  if (!wrapperEl) return null;

  const wrapperRect = wrapperEl.getBoundingClientRect();

  // Get position relative to wrapper
  const relativeLeft = rect.left - wrapperRect.left;
  const relativeTop = rect.top - wrapperRect.top;

  return {
    top: relativeTop,
    left: relativeLeft,
    width: rect.width,
    height: rect.height,
  };
};

// Helper: Check if a point is inside given bounds
export const isPointInBounds = (
  point: { x: number; y: number } | null,
  bounds: { top: number; left: number; width: number; height: number } | null
) => {
  if (!point || !bounds) return false;

  return (
    point.y >= bounds.top &&
    point.y <= bounds.top + bounds.height &&
    point.x >= bounds.left &&
    point.x <= bounds.left + bounds.width
  );
};

// Aliases for backward compatibility
export const isPointInHeader = isPointInBounds;
export const isPointInFooter = isPointInBounds;

// Helper: Convert page-absolute position to header-relative
export const convertToHeaderRelative = (component: any, headerComponent: any, editorInstance: any) => {
  if (!component || !headerComponent) return null;

  const el = component.getEl?.();
  const headerEl = headerComponent.getEl?.();
  if (!el || !headerEl) return null;

  const wrapper = editorInstance?.getWrapper?.();
  const wrapperEl = wrapper?.getEl?.();
  if (!wrapperEl) return null;

  const rect = el.getBoundingClientRect();
  const wrapperRect = wrapperEl.getBoundingClientRect();
  const headerRect = headerEl.getBoundingClientRect();

  // Get positions relative to wrapper
  const elementLeft = rect.left - wrapperRect.left;
  const elementTop = rect.top - wrapperRect.top;
  const headerLeft = headerRect.left - wrapperRect.left;
  const headerTop = headerRect.top - wrapperRect.top;

  // Convert to header-relative
  return {
    left: elementLeft - headerLeft,
    top: elementTop - headerTop,
  };
};

// Helper: Convert header-relative position to page-absolute
export const convertToPageAbsolute = (component: any, headerComponent: any, editorInstance: any) => {
  if (!component || !headerComponent) return null;

  const el = component.getEl?.();
  const headerEl = headerComponent.getEl?.();
  if (!el || !headerEl) return null;

  const wrapper = editorInstance?.getWrapper?.();
  const wrapperEl = wrapper?.getEl?.();
  if (!wrapperEl) return null;

  const rect = el.getBoundingClientRect();
  const wrapperRect = wrapperEl.getBoundingClientRect();
  const headerRect = headerEl.getBoundingClientRect();

  // Get current position relative to header
  const elementLeft = rect.left - headerRect.left;
  const elementTop = rect.top - headerRect.top;
  const headerLeft = headerRect.left - wrapperRect.left;
  const headerTop = headerRect.top - wrapperRect.top;

  // Convert to page-absolute (relative to wrapper)
  return {
    left: headerLeft + elementLeft,
    top: headerTop + elementTop,
  };
};

// Helper: Convert page-absolute position to footer-relative (bottom-left anchored)
export const convertToFooterRelative = (component: any, footerComponent: any, editorInstance: any) => {
  if (!component || !footerComponent) return null;

  const el = component.getEl?.();
  const footerEl = footerComponent.getEl?.();
  if (!el || !footerEl) return null;

  const wrapper = editorInstance?.getWrapper?.();
  const wrapperEl = wrapper?.getEl?.();
  if (!wrapperEl) return null;

  const rect = el.getBoundingClientRect();
  const wrapperRect = wrapperEl.getBoundingClientRect();
  const footerRect = footerEl.getBoundingClientRect();

  // Get positions relative to wrapper
  const elementLeft = rect.left - wrapperRect.left;
  const elementBottom = rect.bottom - wrapperRect.top; // bottom edge
  const footerLeft = footerRect.left - wrapperRect.left;
  const footerBottom = footerRect.bottom - wrapperRect.top; // bottom edge

  // Convert to footer-relative (from bottom-left corner)
  return {
    left: elementLeft - footerLeft,
    bottom: footerBottom - elementBottom,
  };
};

// Helper: Convert footer-relative position (bottom-left anchored) to page-absolute
export const convertFromFooterToPageAbsolute = (component: any, footerComponent: any, editorInstance: any) => {
  if (!component || !footerComponent) return null;

  const el = component.getEl?.();
  const footerEl = footerComponent.getEl?.();
  if (!el || !footerEl) return null;

  const wrapper = editorInstance?.getWrapper?.();
  const wrapperEl = wrapper?.getEl?.();
  if (!wrapperEl) return null;

  const rect = el.getBoundingClientRect();
  const wrapperRect = wrapperEl.getBoundingClientRect();
  const footerRect = footerEl.getBoundingClientRect();

  // Get current position (element is positioned with bottom+left in footer)
  const elementLeft = rect.left - footerRect.left;
  const elementBottom = footerRect.bottom - rect.bottom; // distance from footer bottom
  const footerLeft = footerRect.left - wrapperRect.left;
  const footerBottom = footerRect.bottom - wrapperRect.top;

  // Convert to page-absolute (top+left relative to wrapper)
  const pageTop = footerBottom - elementBottom - rect.height;

  return {
    left: footerLeft + elementLeft,
    top: pageTop,
  };
};

export const clampComponentWithinHeader = (
  component: any,
  headerComponent: any,
  isClamping: React.MutableRefObject<boolean>,
  forceOverride: boolean = false
): { blocked: boolean } => {
  if (!component || !headerComponent || isClamping.current) return { blocked: false };

  isClamping.current = true;
  let blocked = false;

  try {
    const el = component.getEl?.();
    const headerEl = headerComponent.getEl?.();
    if (!el || !headerEl) return { blocked: false };

    const compRect = el.getBoundingClientRect();
    const headerRect = headerEl.getBoundingClientRect();
    const styles = component.getStyle?.() ?? {};
    const computed = window.getComputedStyle(el);
    const headerComputed = window.getComputedStyle(headerEl);

    const currentLeft = parseFloat(styles.left ?? computed.left ?? '0');
    const currentTop = parseFloat(styles.top ?? computed.top ?? '0');
    const paddingBottom = parseFloat(headerComputed.paddingBottom) || 0;

    const nextStyle: Record<string, string> = {};
    let adjusted = false;

    // Clamp left (min 0)
    if (currentLeft < 0) {
      nextStyle.left = '0px';
      adjusted = true;
    }

    // Clamp right (max headerWidth - elementWidth)
    const maxLeft = headerRect.width - compRect.width;
    if (currentLeft > maxLeft) {
      nextStyle.left = `${maxLeft}px`;
      adjusted = true;
    }

    // Clamp top (min 0)
    if (currentTop < 0) {
      nextStyle.top = '0px';
      adjusted = true;
    }

    // Clamp bottom (max headerHeight - paddingBottom - elementHeight)
    // Unless forceOverride is true (Shift pressed) - allow dragging out
    if (!forceOverride) {
      const maxTop = headerRect.height - paddingBottom - compRect.height;
      if (currentTop > maxTop) {
        nextStyle.top = `${Math.max(0, maxTop)}px`;
        adjusted = true;
        blocked = true;
      }
    }

    if (adjusted) {
      component.addStyle(nextStyle);
    }

    return { blocked };
  } finally {
    isClamping.current = false;
  }
};

export const clampComponentWithinFooter = (component: any, footerComponent: any, isClamping: React.MutableRefObject<boolean>) => {
  if (!component || !footerComponent || isClamping.current) return;

  isClamping.current = true;
  try {
    const el = component.getEl?.();
    const footerEl = footerComponent.getEl?.();
    if (!el || !footerEl) return;

    const compRect = el.getBoundingClientRect();
    const footerRect = footerEl.getBoundingClientRect();
    const styles = component.getStyle?.() ?? {};
    const computed = window.getComputedStyle(el);

    const currentLeft = parseFloat(styles.left ?? computed.left ?? '0');
    const currentBottom = parseFloat(styles.bottom ?? computed.bottom ?? '0');

    const nextStyle: Record<string, string> = {};
    let adjusted = false;

    // Clamp left (min 0)
    if (currentLeft < 0) {
      nextStyle.left = '0px';
      adjusted = true;
    }

    // Clamp right (max footerWidth - elementWidth)
    const maxLeft = footerRect.width - compRect.width;
    if (currentLeft > maxLeft) {
      nextStyle.left = `${maxLeft}px`;
      adjusted = true;
    }

    // Clamp bottom (min 0)
    if (currentBottom < 0) {
      nextStyle.bottom = '0px';
      adjusted = true;
    }

    // Top: NO CLAMPING (allow dragging out upward to main section)
    // We don't clamp the top because elements use bottom positioning

    if (adjusted) {
      component.addStyle(nextStyle);
    }
  } finally {
    isClamping.current = false;
  }
};

export const clampComponentWithinMargins = (component: any, editorInstance: any, isClamping: React.MutableRefObject<boolean>) => {
  if (!component || isClamping.current) return;

  // Skip clamping for table and all table structure elements
  // Tables use their own layout model - margin-based clamping generates absurd values
  // (e.g. margin-top: 17336px or top: -18px) when tables overflow their container
  const tagName = component?.get?.('tagName')?.toLowerCase?.();
  const TABLE_TAGS = ['table', 'td', 'th', 'tr', 'tbody', 'thead', 'tfoot'];
  if (tagName && TABLE_TAGS.includes(tagName)) {
    return;
  }

  const isContainerComponent =
    component?.get?.('type') === 'section' ||
    component?.get?.('attributes')?.class?.includes('pdf-container');

  // Skip clamping for elements inside header or footer - they have their own clamping
  const parent = typeof component?.parent === 'function' ? component.parent() : component?.parent;
  const parentTag = parent?.get?.('tagName')?.toLowerCase?.();
  const parentIsContainer =
    parentTag === 'div' &&
    (parent?.get?.('type') === 'section' || parent?.get?.('attributes')?.class?.includes('pdf-container'));
  if (parentTag === 'header' || parentTag === 'footer') {
    return; // Elements in header/footer use their own coordinate system
  }

  isClamping.current = true;
  const wrapper = editorInstance?.getWrapper?.();
  const wrapperEl = wrapper?.getEl?.();
  const el = component.getEl?.();

  // Check if el is a valid DOM element with getBoundingClientRect method
  if (!wrapperEl || !el || typeof el.getBoundingClientRect !== 'function') {
    isClamping.current = false;
    return;
  }

  const view = el.ownerDocument?.defaultView ?? window;
  const computedWrapper = view.getComputedStyle(wrapperEl);

  // Compute bounds relative to parent (container) if exists, otherwise wrapper
  const hostEl = parentIsContainer ? parent.getEl?.() : wrapperEl;
  const computedHost = hostEl ? view.getComputedStyle(hostEl) : computedWrapper;
  const paddingLeft = parsePixelValue(computedHost.paddingLeft);
  const paddingRight = parsePixelValue(computedHost.paddingRight);
  const paddingTop = parsePixelValue(computedHost.paddingTop);
  const paddingBottom = parsePixelValue(computedHost.paddingBottom);
  const hostRect = hostEl?.getBoundingClientRect?.() ?? wrapperEl.getBoundingClientRect();
  const bounds = {
    left: hostRect.left + paddingLeft,
    right: hostRect.right - paddingRight,
    top: hostRect.top + paddingTop,
    bottom: hostRect.bottom - paddingBottom,
  };

  const compRect = el.getBoundingClientRect();
  const styles = component.getStyle?.() ?? {};
  const computed = view.getComputedStyle(el);
  const position = styles.position || computed.position;

  const fallbackLeft = Number.isFinite(el.offsetLeft) ? el.offsetLeft : 0;
  const fallbackTop = Number.isFinite(el.offsetTop) ? el.offsetTop : 0;
  const currentLeft = parsePixelValue(styles.left ?? computed.left ?? `${fallbackLeft}px`);
  const currentTop = parsePixelValue(styles.top ?? computed.top ?? `${fallbackTop}px`);
  const marginLeft = parsePixelValue(styles.marginLeft ?? computed.marginLeft ?? "0");
  const marginTop = parsePixelValue(styles.marginTop ?? computed.marginTop ?? "0");
  const nextStyle: Record<string, string> = {};
  let adjusted = false;

  const maxWidth = bounds.right - bounds.left;
  const maxHeight = bounds.bottom - bounds.top;

  // Calculate allowed position range (element's left/top must stay within these bounds)
  const allowedLeft = paddingLeft;
  const allowedTop = paddingTop;
  // For right: element.left + element.width <= wrapperWidth - paddingRight
  // So: element.left <= wrapperWidth - paddingRight - element.width
  const allowedRight = (hostRect.width ?? 0) - paddingRight - compRect.width;
  const allowedBottom = (hostRect.height ?? 0) - paddingBottom - compRect.height;

  // Containers: clamp horizontal bounds/width, leave height untouched
  if (isContainerComponent) {
    if (compRect.width > maxWidth) {
      nextStyle.width = `${maxWidth}px`;
      adjusted = true;
    }

    if (compRect.left < bounds.left) {
      nextStyle["margin-left"] = `${marginLeft + (bounds.left - compRect.left)}px`;
      adjusted = true;
    } else if (compRect.right > bounds.right) {
      nextStyle["margin-left"] = `${marginLeft - (compRect.right - bounds.right)}px`;
      adjusted = true;
    }

    try {
      if (adjusted) {
        component.addStyle(nextStyle);
      }
    } finally {
      isClamping.current = false;
    }
    return;
  }

  if (["absolute", "fixed", "relative"].includes(position)) {
    const clampedLeft = Math.min(Math.max(currentLeft, allowedLeft), allowedRight);

    // When element is taller than container (allowedBottom < allowedTop),
    // don't clamp vertically - this prevents generating negative top values
    // that break table layout and contenteditable behavior
    const clampedTop = allowedBottom >= allowedTop
      ? Math.min(Math.max(currentTop, allowedTop), allowedBottom)
      : Math.max(currentTop, 0); // At minimum, keep top >= 0

    if (clampedLeft !== currentLeft) {
      nextStyle.left = `${clampedLeft}px`;
      adjusted = true;
    }
    if (clampedTop !== currentTop && allowedBottom >= allowedTop) {
      // Only adjust top if the element actually fits in the container
      nextStyle.top = `${clampedTop}px`;
      adjusted = true;
    }
  } else {
    // Static/flow elements: adjust margins and max sizes to keep inside bounds
    if (compRect.left < bounds.left) {
      nextStyle["margin-left"] = `${marginLeft + (bounds.left - compRect.left)}px`;
      adjusted = true;
    } else if (compRect.right > bounds.right) {
      nextStyle["margin-left"] = `${marginLeft - (compRect.right - bounds.right)}px`;
      adjusted = true;
    }

    if (!isContainerComponent) {
      if (compRect.top < bounds.top) {
        nextStyle["margin-top"] = `${marginTop + (bounds.top - compRect.top)}px`;
        adjusted = true;
      } else if (compRect.bottom > bounds.bottom) {
        nextStyle["margin-top"] = `${marginTop - (compRect.bottom - bounds.bottom)}px`;
        adjusted = true;
      }
    }
  }

  if (compRect.width > maxWidth) {
    nextStyle.width = `${maxWidth}px`;
    adjusted = true;
  }

  // Allow containers to exceed the visual page height (they can span multiple pages)
  if (!isContainerComponent && compRect.height > maxHeight) {
    nextStyle.height = `${maxHeight}px`;
    adjusted = true;
  }

  try {
    if (adjusted) {
      component.addStyle(nextStyle);
    }
  } finally {
    isClamping.current = false;
  }
};

/**
 * Recursively collects all draggable components from a wrapper,
 * excluding header/footer containers but including their children.
 */
export const getAllDraggableComponents = (wrapper: any): any[] => {
  const result: any[] = [];

  const recurse = (comp: any) => {
    const children = comp.components?.()?.models || [];

    children.forEach((child: any) => {
      const tag = child.get?.('tagName')?.toLowerCase?.();
      const el = child?.getEl?.();

      // Include if not header/footer and has valid DOM element
      if (tag !== 'header' && tag !== 'footer' && el && typeof el.getBoundingClientRect === 'function') {
        result.push(child);
      }

      // Recursively get children (including from header/footer)
      recurse(child);
    });
  };

  recurse(wrapper);
  return result;
};

// Helper: Check if component is a header
const isHeaderComp = (component: any) => {
  const type = component?.get?.('type');
  const tagName = component?.get?.('tagName')?.toLowerCase?.();
  return type === 'header' || tagName === 'header';
};

// Helper: Check if component is a footer
const isFooterComp = (component: any) => {
  const type = component?.get?.('type');
  const tagName = component?.get?.('tagName')?.toLowerCase?.();
  return type === 'footer' || tagName === 'footer';
};

// Helper: Check if component is a container
const isContainerComp = (component: any) => {
  const type = component?.get?.('type');
  const classStr = String(component?.get?.('attributes')?.class || '');
  return type === 'section' || classStr.includes('pdf-container');
};

/**
 * Information about a section's position in the wrapper
 */
interface SectionInfo {
  component: any;
  index: number;
  top: number;
  bottom: number;
  type: 'header' | 'footer' | 'section';
}

/**
 * Calculates the optimal insertion index for a new container
 * based on the cursor Y position during drop.
 *
 * @param editor - GrapesJS editor instance
 * @param cursorY - Y position of cursor relative to wrapper
 * @returns The index where the new container should be inserted
 */
export const calculateContainerInsertionIndex = (
  editor: any,
  cursorY: number,
  options?: { ignoreComponent?: any }
): number => {
  const wrapper = editor?.getWrapper?.();
  if (!wrapper) return 0;

  const wrapperEl = wrapper.getEl?.();
  if (!wrapperEl) return 0;

  const wrapperRect = wrapperEl.getBoundingClientRect();
  const children = wrapper.components?.()?.models || [];

  if (children.length === 0) return 0;

  // Build section info array with positions relative to wrapper
  const sections: SectionInfo[] = [];

  children.forEach((comp: any, idx: number) => {
    if (options?.ignoreComponent && comp === options.ignoreComponent) return;
    const el = comp.getEl?.();
    if (!el) return;

    const rect = el.getBoundingClientRect();

    let type: 'header' | 'footer' | 'section';
    if (isHeaderComp(comp)) {
      type = 'header';
    } else if (isFooterComp(comp)) {
      type = 'footer';
    } else if (isContainerComp(comp)) {
      type = 'section';
    } else {
      return; // Skip unknown components
    }

    sections.push({
      component: comp,
      index: idx,
      top: rect.top - wrapperRect.top,
      bottom: rect.bottom - wrapperRect.top,
      type,
    });
  });

  if (sections.length === 0) return 0;

  // Sort sections by their top position (should already be in order, but ensure it)
  sections.sort((a, b) => a.top - b.top);

  // Find the footer index (if exists) - we must NEVER insert after footer
  const footerSection = sections.find(s => s.type === 'footer');
  const footerIndex = footerSection?.index ?? children.length;

  // Find where cursor Y falls between sections
  for (let i = 0; i < sections.length; i++) {
    const current = sections[i];
    const next = sections[i + 1];

    // If cursor is above the first section, insert at position 0 (or after header)
    if (i === 0 && cursorY < current.top) {
      // If first section is header, insert after it
      if (current.type === 'header') {
        return current.index + 1;
      }
      return current.index;
    }

    // If cursor is within current section
    if (cursorY >= current.top && cursorY <= current.bottom) {
      // If it's the footer, insert before it
      if (current.type === 'footer') {
        return current.index;
      }
      // If it's header, insert after it
      if (current.type === 'header') {
        return current.index + 1;
      }
      // For container: use midpoint to decide above or below
      const midpoint = (current.top + current.bottom) / 2;
      if (cursorY < midpoint) {
        return current.index;
      } else {
        // Insert after this container, but check if next is footer
        if (next && next.type === 'footer') {
          return next.index;
        }
        return current.index + 1;
      }
    }

    // If cursor is in the gap between current and next section
    if (next && cursorY > current.bottom && cursorY < next.top) {
      // If next is footer, insert before it
      if (next.type === 'footer') {
        return next.index;
      }
      return next.index;
    }
  }

  // Cursor is below all sections - insert before footer if exists
  return footerIndex;
};

/**
 * Validates and corrects an insertion index to ensure
 * it's never after the footer.
 *
 * @param editor - GrapesJS editor instance
 * @param proposedIndex - The proposed insertion index
 * @returns A valid insertion index (always before footer)
 */
export const validateInsertionIndex = (
  editor: any,
  proposedIndex: number
): number => {
  const wrapper = editor?.getWrapper?.();
  if (!wrapper) return proposedIndex;

  const children = wrapper.components?.()?.models || [];
  const footerIndex = children.findIndex((c: any) => isFooterComp(c));

  // If a footer exists and proposed index is >= footer index
  // Return the footer index (insert just before footer)
  if (footerIndex >= 0 && proposedIndex > footerIndex) {
    return footerIndex;
  }

  // Also ensure we don't insert before header
  const headerIndex = children.findIndex((c: any) => isHeaderComp(c));
  if (headerIndex >= 0 && proposedIndex <= headerIndex) {
    return headerIndex + 1;
  }

  return proposedIndex;
};

/**
 * Ensures the correct order of sections in the wrapper:
 * Header (if exists) → Containers → Footer (if exists)
 *
 * This function is idempotent and can be called multiple times safely.
 * It should be called:
 * - After adding a container
 * - When switching to infinite mode
 * - After loading content
 *
 * @param editor - GrapesJS editor instance
 * @returns Object with info about what was reordered
 */
export const ensureSectionOrder = (editor: any): { reordered: boolean; changes: string[] } => {
  const result = { reordered: false, changes: [] as string[] };

  const wrapper = editor?.getWrapper?.();
  if (!wrapper) return result;

  const children = wrapper.components?.();
  if (!children || children.length === 0) return result;

  const models = children.models || [];
  if (models.length <= 1) return result;

  // Find header, footer, and containers
  let headerComp: any = null;
  let footerComp: any = null;
  const containers: any[] = [];

  models.forEach((comp: any) => {
    if (isHeaderComp(comp)) {
      headerComp = comp;
    } else if (isFooterComp(comp)) {
      footerComp = comp;
    } else if (isContainerComp(comp)) {
      containers.push(comp);
    }
  });

  // Step 1: Ensure header is at index 0
  if (headerComp) {
    const currentIndex = children.indexOf(headerComp);
    if (currentIndex !== 0) {
      headerComp.move(wrapper, { at: 0 });
      result.reordered = true;
      result.changes.push(`Header moved from ${currentIndex} to 0`);
    }
  }

  // Step 2: Ensure footer is at last index
  if (footerComp) {
    const currentIndex = children.indexOf(footerComp);
    const lastIndex = children.length - 1;
    if (currentIndex !== lastIndex) {
      footerComp.move(wrapper, { at: lastIndex });
      result.reordered = true;
      result.changes.push(`Footer moved from ${currentIndex} to ${lastIndex}`);
    }
  }

  // Step 3: Ensure all containers are between header and footer
  // Re-read children after potential moves
  const updatedChildren = wrapper.components?.();
  const headerIndex = headerComp ? updatedChildren.indexOf(headerComp) : -1;
  const footerIndex = footerComp ? updatedChildren.indexOf(footerComp) : updatedChildren.length;

  containers.forEach((container) => {
    const currentIndex = updatedChildren.indexOf(container);
    if (currentIndex <= headerIndex || currentIndex >= footerIndex) {
      container.move(wrapper, { at: footerIndex });
      result.reordered = true;
      result.changes.push(`Container moved from ${currentIndex} to ${footerIndex}`);
    }
  });

  return result;
};
