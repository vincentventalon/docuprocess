import { parsePixelValue } from "./positioning";

export interface ResizeBounds {
  minLeft: number;
  maxRight: number;
  minTop: number;
  maxBottom: number;
  maxWidth: number;
  maxHeight: number;
}

export interface ResizeConstraints {
  bounds: ResizeBounds;
  aspectRatio?: number;
  lockOppositeEdge: {
    horizontal: boolean;
    vertical: boolean;
  };
  startRect: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
  isAbsolute: boolean;
  startMarginLeft: number;
  startMarginTop: number;
  minWidth?: number;
  minHeight?: number;
}

/**
 * Calculate bounds for header components
 */
function calculateHeaderBounds(component: any, headerComponent: any): ResizeBounds {
  const headerEl = headerComponent.getEl?.();

  if (!headerEl) {
    return {
      minLeft: 0,
      maxRight: Infinity,
      minTop: 0,
      maxBottom: Infinity,
      maxWidth: Infinity,
      maxHeight: Infinity,
    };
  }

  const headerRect = headerEl.getBoundingClientRect();

  return {
    minLeft: 0,
    maxRight: headerRect.width,
    minTop: 0,
    maxBottom: headerRect.height,
    maxWidth: headerRect.width,
    maxHeight: headerRect.height,
  };
}

/**
 * Calculate bounds for footer components
 */
function calculateFooterBounds(component: any, footerComponent: any): ResizeBounds {
  const footerEl = footerComponent.getEl?.();

  if (!footerEl) {
    return {
      minLeft: 0,
      maxRight: Infinity,
      minTop: 0,
      maxBottom: Infinity,
      maxWidth: Infinity,
      maxHeight: Infinity,
    };
  }

  const footerRect = footerEl.getBoundingClientRect();

  return {
    minLeft: 0,
    maxRight: footerRect.width,
    minTop: 0,
    maxBottom: footerRect.height,
    maxWidth: footerRect.width,
    maxHeight: footerRect.height,
  };
}

/**
 * Calculates spatial bounds (margins) for a component
 * These bounds define where the component can be positioned and sized
 */
export function calculateResizeBounds(
  component: any,
  editorInstance: any,
  pageSettings?: any
): ResizeBounds {
  const wrapper = editorInstance?.getWrapper?.();
  const wrapperEl = wrapper?.getEl?.();
  const el = component.getEl?.();

  if (!wrapperEl || !el) {
    return {
      minLeft: 0,
      maxRight: Infinity,
      minTop: 0,
      maxBottom: Infinity,
      maxWidth: Infinity,
      maxHeight: Infinity,
    };
  }

  // Check if in header/footer (special logic)
  const parent = typeof component?.parent === 'function' ? component.parent() : component?.parent;
  const parentTag = parent?.get?.('tagName')?.toLowerCase?.();

  if (parentTag === 'header') {
    return calculateHeaderBounds(component, parent);
  }

  if (parentTag === 'footer') {
    return calculateFooterBounds(component, parent);
  }

  // Check if parent is a container - use container bounds instead of wrapper bounds
  const parentIsContainer =
    parentTag === 'div' &&
    (parent?.get?.('type') === 'section' || parent?.get?.('attributes')?.class?.includes('pdf-container'));

  const view = el.ownerDocument?.defaultView ?? window;

  if (parentIsContainer) {
    // Element is inside a container - calculate bounds relative to container
    const containerEl = parent.getEl?.();
    if (containerEl) {
      const computedContainer = view.getComputedStyle(containerEl);
      const containerPaddingLeft = parsePixelValue(computedContainer.paddingLeft);
      const containerPaddingRight = parsePixelValue(computedContainer.paddingRight);
      const containerPaddingTop = parsePixelValue(computedContainer.paddingTop);
      const containerPaddingBottom = parsePixelValue(computedContainer.paddingBottom);
      const containerRect = containerEl.getBoundingClientRect();

      // Constrain to first column if repeating section with split
      const repeatCols = parseInt(parent?.getAttributes?.()?.['data-repeat-columns'] || '1', 10);
      if (repeatCols > 1) {
        const columnWidth = containerRect.width / repeatCols;
        return {
          minLeft: containerPaddingLeft,
          maxRight: columnWidth - containerPaddingRight,
          minTop: containerPaddingTop,
          maxBottom: containerRect.height - containerPaddingBottom,
          maxWidth: columnWidth - containerPaddingLeft - containerPaddingRight,
          maxHeight: containerRect.height - containerPaddingTop - containerPaddingBottom,
        };
      }

      return {
        minLeft: containerPaddingLeft,
        maxRight: containerRect.width - containerPaddingRight,
        minTop: containerPaddingTop,
        maxBottom: containerRect.height - containerPaddingBottom,
        maxWidth: containerRect.width - containerPaddingLeft - containerPaddingRight,
        maxHeight: containerRect.height - containerPaddingTop - containerPaddingBottom,
      };
    }
  }

  // Logic for body (with padding) - for elements directly in wrapper
  const computedWrapper = view.getComputedStyle(wrapperEl);
  const paddingLeft = parsePixelValue(computedWrapper.paddingLeft);
  const paddingRight = parsePixelValue(computedWrapper.paddingRight);
  const paddingTop = parsePixelValue(computedWrapper.paddingTop);
  const paddingBottom = parsePixelValue(computedWrapper.paddingBottom);

  const wrapperRect = wrapperEl.getBoundingClientRect();
  const isContainerComponent =
    component?.get?.('type') === 'section' ||
    component?.get?.('attributes')?.class?.includes('pdf-container');

  const baseBounds = {
    minLeft: paddingLeft,
    maxRight: wrapperRect.width - paddingRight,
    minTop: paddingTop,
    maxBottom: wrapperRect.height - paddingBottom,
    maxWidth: wrapperRect.width - paddingLeft - paddingRight,
    maxHeight: wrapperRect.height - paddingTop - paddingBottom,
  };

  if (isContainerComponent) {
    // Allow containers to extend beyond the page height so they can span multiple pages.
    return {
      ...baseBounds,
      maxBottom: Infinity,
      maxHeight: Infinity,
    };
  }

  return baseBounds;
}

/**
 * Applies all resize constraints and returns final dimensions and styles
 * Order of constraint application:
 * 1. Spatial constraints (margins/bounds)
 * 2. Aspect ratio (for images)
 * 3. Opposite edge locking (for left/top handles)
 */
export function applyResizeConstraints(
  handle: string,
  targetRect: { w?: number; h?: number; x?: number; y?: number },
  constraints: ResizeConstraints
): {
  rect: { x: number; y: number; w: number; h: number };
  style: Record<string, string>;
  blocked: { left: boolean; right: boolean; top: boolean; bottom: boolean };
} {
  const affectsLeft = handle.includes('l');
  const affectsRight = handle.includes('r');
  const affectsTop = handle.includes('t');
  const affectsBottom = handle.includes('b');
  const isCornerHandle = (affectsLeft || affectsRight) && (affectsTop || affectsBottom);

  let finalWidth = targetRect.w ?? constraints.startRect.width;
  let finalHeight = targetRect.h ?? constraints.startRect.height;
  let finalLeft = constraints.startRect.left;
  let finalTop = constraints.startRect.top;

  const blocked = { left: false, right: false, top: false, bottom: false };

  // STEP 1: Apply aspect ratio constraints FIRST (for images with corner handles)
  if (constraints.aspectRatio && isCornerHandle) {
    // Determine which dimension drives (the one that changed more)
    const widthChange = Math.abs(finalWidth - constraints.startRect.width);
    const heightChange = Math.abs(finalHeight - constraints.startRect.height);

    if (widthChange > heightChange) {
      // Width drives → recalculate height
      finalHeight = finalWidth / constraints.aspectRatio;
    } else {
      // Height drives → recalculate width
      finalWidth = finalHeight * constraints.aspectRatio;
    }
  }

  // STEP 1.5: Apply minimum size constraints BEFORE position calculation
  // This prevents elements from being pushed when they reach their minimum size
  if (constraints.minWidth !== undefined && finalWidth < constraints.minWidth) {
    finalWidth = constraints.minWidth;
    blocked.left = affectsLeft;
    blocked.right = affectsRight;

    // If we have aspect ratio, recalculate height
    if (constraints.aspectRatio && isCornerHandle) {
      finalHeight = finalWidth / constraints.aspectRatio;
    }
  }

  if (constraints.minHeight !== undefined && finalHeight < constraints.minHeight) {
    finalHeight = constraints.minHeight;
    blocked.top = affectsTop;
    blocked.bottom = affectsBottom;

    // If we have aspect ratio, recalculate width
    if (constraints.aspectRatio && isCornerHandle) {
      finalWidth = finalHeight * constraints.aspectRatio;

      // Re-check minWidth after recalculation
      if (constraints.minWidth !== undefined && finalWidth < constraints.minWidth) {
        finalWidth = constraints.minWidth;
      }
    }
  }

  // STEP 2: Apply spatial constraints with opposite edge locking

  // Horizontal constraints
  if (affectsLeft && constraints.lockOppositeEdge.horizontal) {
    // We want to keep the right edge fixed
    const fixedRight = constraints.startRect.left + constraints.startRect.width;

    // Calculate the new left based on the new width
    let potentialLeft = fixedRight - finalWidth;

    // Check limits
    if (potentialLeft < constraints.bounds.minLeft) {
      // We hit the left margin
      blocked.left = true;
      // Limit width so that left stays at minLeft
      finalWidth = fixedRight - constraints.bounds.minLeft;
      finalLeft = constraints.bounds.minLeft;

      // If we have aspect ratio, recalculate height
      if (constraints.aspectRatio) {
        finalHeight = finalWidth / constraints.aspectRatio;
      }
    } else if (!blocked.left) {
      // Only update position if we're not blocked by min size
      finalLeft = potentialLeft;
    } else {
      // Blocked by min size - keep right edge fixed
      finalLeft = fixedRight - finalWidth;
    }
  } else if (affectsLeft) {
    // Just moving left without locking right (shouldn't happen in our case)
    finalLeft = Math.max(targetRect.x ?? finalLeft, constraints.bounds.minLeft);
  }

  if (affectsRight && !affectsLeft) {
    // Resizing from right edge
    const potentialRight = finalLeft + finalWidth;

    if (potentialRight > constraints.bounds.maxRight) {
      blocked.right = true;
      finalWidth = constraints.bounds.maxRight - finalLeft;

      // If we have aspect ratio, recalculate height
      if (constraints.aspectRatio) {
        finalHeight = finalWidth / constraints.aspectRatio;
      }
    }
  }

  // Vertical constraints
  if (affectsTop && constraints.lockOppositeEdge.vertical) {
    // We want to keep the bottom edge fixed
    const fixedBottom = constraints.startRect.top + constraints.startRect.height;

    // Calculate the new top based on the new height
    let potentialTop = fixedBottom - finalHeight;

    // Check limits
    if (potentialTop < constraints.bounds.minTop) {
      // We hit the top margin
      blocked.top = true;
      // Limit height so that top stays at minTop
      finalHeight = fixedBottom - constraints.bounds.minTop;
      finalTop = constraints.bounds.minTop;

      // If we have aspect ratio, recalculate width
      if (constraints.aspectRatio) {
        finalWidth = finalHeight * constraints.aspectRatio;

        // Re-check horizontal bounds after width recalculation
        if (affectsLeft) {
          const fixedRight = constraints.startRect.left + constraints.startRect.width;
          const newLeft = fixedRight - finalWidth;
          if (newLeft >= constraints.bounds.minLeft) {
            finalLeft = newLeft;
          } else {
            // Width is also constrained, use the smallest that fits both
            blocked.left = true;
            finalWidth = fixedRight - constraints.bounds.minLeft;
            finalHeight = finalWidth / constraints.aspectRatio;
            finalLeft = constraints.bounds.minLeft;
            finalTop = fixedBottom - finalHeight;
          }
        }
      }
    } else if (!blocked.top) {
      // Only update position if we're not blocked by min size
      finalTop = potentialTop;
    } else {
      // Blocked by min size - keep bottom edge fixed
      finalTop = fixedBottom - finalHeight;
    }
  } else if (affectsTop) {
    // Just moving top without locking bottom (shouldn't happen in our case)
    finalTop = Math.max(targetRect.y ?? finalTop, constraints.bounds.minTop);
  }

  if (affectsBottom && !affectsTop) {
    // Resizing from bottom edge
    const potentialBottom = finalTop + finalHeight;

    if (potentialBottom > constraints.bounds.maxBottom) {
      blocked.bottom = true;
      finalHeight = constraints.bounds.maxBottom - finalTop;

      // If we have aspect ratio, recalculate width
      if (constraints.aspectRatio) {
        finalWidth = finalHeight * constraints.aspectRatio;

        // Re-check horizontal bounds after width recalculation
        if (affectsLeft) {
          const fixedRight = constraints.startRect.left + constraints.startRect.width;
          const newLeft = fixedRight - finalWidth;
          if (newLeft >= constraints.bounds.minLeft) {
            finalLeft = newLeft;
          } else {
            blocked.left = true;
            finalWidth = fixedRight - constraints.bounds.minLeft;
            finalHeight = finalWidth / constraints.aspectRatio;
            finalLeft = constraints.bounds.minLeft;
          }
        } else if (finalLeft + finalWidth > constraints.bounds.maxRight) {
          blocked.right = true;
          finalWidth = constraints.bounds.maxRight - finalLeft;
          finalHeight = finalWidth / constraints.aspectRatio;
        }
      }
    }
  }

  // STEP 3: Final bounds check (ensure we never exceed maximum bounds)
  if (finalWidth > constraints.bounds.maxWidth) {
    finalWidth = constraints.bounds.maxWidth;
    if (constraints.aspectRatio) {
      finalHeight = finalWidth / constraints.aspectRatio;
    }
  }

  if (finalHeight > constraints.bounds.maxHeight) {
    finalHeight = constraints.bounds.maxHeight;
    if (constraints.aspectRatio) {
      finalWidth = finalHeight * constraints.aspectRatio;
    }
  }

  // Ensure position stays within bounds
  if (finalLeft < constraints.bounds.minLeft) {
    finalLeft = constraints.bounds.minLeft;
  }
  if (finalTop < constraints.bounds.minTop) {
    finalTop = constraints.bounds.minTop;
  }
  if (finalLeft + finalWidth > constraints.bounds.maxRight) {
    if (affectsLeft && constraints.lockOppositeEdge.horizontal) {
      // Adjust width instead of position
      finalWidth = constraints.bounds.maxRight - finalLeft;
    } else {
      finalLeft = constraints.bounds.maxRight - finalWidth;
    }
  }
  if (finalTop + finalHeight > constraints.bounds.maxBottom) {
    if (affectsTop && constraints.lockOppositeEdge.vertical) {
      // Adjust height instead of position
      finalHeight = constraints.bounds.maxBottom - finalTop;
    } else {
      finalTop = constraints.bounds.maxBottom - finalHeight;
    }
  }

  // STEP 4: Build CSS styles
  const style: Record<string, string> = {
    width: `${finalWidth}px`,
    height: `${finalHeight}px`,
  };

  if (constraints.isAbsolute) {
    style.left = `${finalLeft}px`;
    style.top = `${finalTop}px`;
  } else {
    // Position relative/static: use margins
    const marginLeft = finalLeft - constraints.startRect.left + constraints.startMarginLeft;
    const marginTop = finalTop - constraints.startRect.top + constraints.startMarginTop;
    style['margin-left'] = `${marginLeft}px`;
    style['margin-top'] = `${marginTop}px`;
  }

  return {
    rect: { x: finalLeft, y: finalTop, w: finalWidth, h: finalHeight },
    style,
    blocked,
  };
}
