/**
 * Alignment guide detection and calculation logic
 */

import { PagePadding } from '@/types/page-settings';
import {
  AlignmentPoint,
  AlignmentGuide,
  AlignmentState,
  SNAP_THRESHOLD,
  PAGE_CENTER_COLOR,
  ELEMENT_ALIGN_COLOR,
} from '../types/alignment';

/**
 * Calculate page center lines considering body padding
 */
export const getPageCenterLines = (
  wrapper: any,
  padding: PagePadding
): { centerX: number; centerY: number } | null => {
  const wrapperEl = wrapper?.getEl?.();
  if (!wrapperEl) return null;

  const wrapperRect = wrapperEl.getBoundingClientRect();
  const computedStyle = window.getComputedStyle(wrapperEl);

  // Convert MM padding to PX
  const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0;
  const paddingRight = parseFloat(computedStyle.paddingRight) || 0;
  const paddingTop = parseFloat(computedStyle.paddingTop) || 0;
  const paddingBottom = parseFloat(computedStyle.paddingBottom) || 0;

  // Calculate content area dimensions (excluding padding)
  const contentWidth = wrapperRect.width - paddingLeft - paddingRight;
  const contentHeight = wrapperRect.height - paddingTop - paddingBottom;

  // Center is in the middle of content area
  const centerX = paddingLeft + contentWidth / 2;
  const centerY = paddingTop + contentHeight / 2;

  return { centerX, centerY };
};

/**
 * Get bounding box for a component relative to wrapper
 */
export const getComponentBounds = (
  component: any,
  wrapperEl: HTMLElement
): { left: number; top: number; width: number; height: number } | null => {
  const el = component?.getEl?.();

  // Check if el is a valid DOM element with getBoundingClientRect
  if (!el || typeof el.getBoundingClientRect !== 'function') {
    return null;
  }

  const rect = el.getBoundingClientRect();
  const wrapperRect = wrapperEl.getBoundingClientRect();

  return {
    left: rect.left - wrapperRect.left,
    top: rect.top - wrapperRect.top,
    width: rect.width,
    height: rect.height,
  };
};

/**
 * Get all alignment points from a list of components
 */
export const getAllAlignmentPoints = (
  components: any[],
  wrapperEl: HTMLElement
): AlignmentPoint[] => {
  const points: AlignmentPoint[] = [];

  components.forEach((component) => {
    const bounds = getComponentBounds(component, wrapperEl);
    if (!bounds) return;

    // Left edge
    points.push({
      type: 'left',
      value: bounds.left,
      component,
    });

    // Right edge
    points.push({
      type: 'right',
      value: bounds.left + bounds.width,
      component,
    });

    // Top edge
    points.push({
      type: 'top',
      value: bounds.top,
      component,
    });

    // Bottom edge
    points.push({
      type: 'bottom',
      value: bounds.top + bounds.height,
      component,
    });

    // Horizontal center (middle-x)
    points.push({
      type: 'middle-x',
      value: bounds.left + bounds.width / 2,
      component,
    });

    // Vertical center (middle-y)
    points.push({
      type: 'middle-y',
      value: bounds.top + bounds.height / 2,
      component,
    });
  });

  return points;
};

/**
 * Find alignments for a dragged component
 */
export const findAlignments = (
  draggedComponent: any,
  wrapperEl: HTMLElement,
  otherComponents: any[],
  pageCenterLines: { centerX: number; centerY: number } | null,
  threshold: number = SNAP_THRESHOLD
): AlignmentState => {
  const guides: AlignmentGuide[] = [];

  const draggedBounds = getComponentBounds(draggedComponent, wrapperEl);
  if (!draggedBounds) {
    return { guides };
  }

  // Calculate dragged element's alignment points
  const draggedPoints = {
    left: draggedBounds.left,
    right: draggedBounds.left + draggedBounds.width,
    top: draggedBounds.top,
    bottom: draggedBounds.top + draggedBounds.height,
    middleX: draggedBounds.left + draggedBounds.width / 2,
    middleY: draggedBounds.top + draggedBounds.height / 2,
  };

  // Get all alignment points from other components
  const otherPoints = getAllAlignmentPoints(otherComponents, wrapperEl);

  // Track alignments by position to group multiple elements on same line
  const verticalAlignments = new Map<number, AlignmentPoint[]>();
  const horizontalAlignments = new Map<number, AlignmentPoint[]>();

  // Check page center alignments
  if (pageCenterLines) {
    // Vertical center line (horizontal centering)
    const centerXDiff = Math.abs(draggedPoints.middleX - pageCenterLines.centerX);
    if (centerXDiff <= threshold) {
      const roundedPos = Math.round(pageCenterLines.centerX);
      if (!verticalAlignments.has(roundedPos)) {
        verticalAlignments.set(roundedPos, []);
      }
      verticalAlignments.get(roundedPos)!.push({
        type: 'center-vertical',
        value: pageCenterLines.centerX,
      });
    }

    // Horizontal center line (vertical centering)
    const centerYDiff = Math.abs(draggedPoints.middleY - pageCenterLines.centerY);
    if (centerYDiff <= threshold) {
      const roundedPos = Math.round(pageCenterLines.centerY);
      if (!horizontalAlignments.has(roundedPos)) {
        horizontalAlignments.set(roundedPos, []);
      }
      horizontalAlignments.get(roundedPos)!.push({
        type: 'center-horizontal',
        value: pageCenterLines.centerY,
      });
    }
  }

  // Check element-to-element alignments
  otherPoints.forEach((point) => {
    let alignedDraggedPoint: number | null = null;

    // Check which dragged point aligns with this point
    switch (point.type) {
      case 'left':
      case 'right':
      case 'middle-x':
        // Vertical alignment lines (for horizontal positioning)
        [
          { key: 'left', value: draggedPoints.left },
          { key: 'right', value: draggedPoints.right },
          { key: 'middleX', value: draggedPoints.middleX },
        ].forEach(({ value }) => {
          const diff = Math.abs(value - point.value);
          if (diff <= threshold) {
            alignedDraggedPoint = value;
          }
        });

        if (alignedDraggedPoint !== null) {
          const roundedPos = Math.round(point.value);
          if (!verticalAlignments.has(roundedPos)) {
            verticalAlignments.set(roundedPos, []);
          }
          verticalAlignments.get(roundedPos)!.push(point);
        }
        break;

      case 'top':
      case 'bottom':
      case 'middle-y':
        // Horizontal alignment lines (for vertical positioning)
        [
          { key: 'top', value: draggedPoints.top },
          { key: 'bottom', value: draggedPoints.bottom },
          { key: 'middleY', value: draggedPoints.middleY },
        ].forEach(({ value }) => {
          const diff = Math.abs(value - point.value);
          if (diff <= threshold) {
            alignedDraggedPoint = value;
          }
        });

        if (alignedDraggedPoint !== null) {
          const roundedPos = Math.round(point.value);
          if (!horizontalAlignments.has(roundedPos)) {
            horizontalAlignments.set(roundedPos, []);
          }
          horizontalAlignments.get(roundedPos)!.push(point);
        }
        break;
    }
  });

  // Convert alignments to guides
  verticalAlignments.forEach((points, position) => {
    const isPageCenter = points.some((p) => p.type === 'center-vertical');
    const components = points.filter((p) => p.component).map((p) => p.component);

    guides.push({
      direction: 'vertical',
      position,
      type: isPageCenter ? 'page-center' : 'element-alignment',
      // Include draggedComponent for element alignments so it gets a green segment too
      alignedComponents: isPageCenter ? components : [...components, draggedComponent],
      color: isPageCenter ? PAGE_CENTER_COLOR : ELEMENT_ALIGN_COLOR,
    });
  });

  horizontalAlignments.forEach((points, position) => {
    const isPageCenter = points.some((p) => p.type === 'center-horizontal');
    const components = points.filter((p) => p.component).map((p) => p.component);

    guides.push({
      direction: 'horizontal',
      position,
      type: isPageCenter ? 'page-center' : 'element-alignment',
      // Include draggedComponent for element alignments so it gets a green segment too
      alignedComponents: isPageCenter ? components : [...components, draggedComponent],
      color: isPageCenter ? PAGE_CENTER_COLOR : ELEMENT_ALIGN_COLOR,
    });
  });

  return { guides };
};
