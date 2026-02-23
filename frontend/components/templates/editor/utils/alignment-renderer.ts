/**
 * Alignment guide visual rendering
 */

import { AlignmentState, AlignmentGuide, CONNECTING_LINE_COLOR } from '../types/alignment';
import { getComponentBounds } from './alignment-guides';

const ALIGNMENT_GUIDE_STYLE_ID = 'gjs-alignment-guides';
const ALIGNMENT_GUIDE_CONTAINER_ID = 'gjs-alignment-guide-container';

/**
 * Inject CSS styles for alignment guides
 */
export const injectAlignmentGuideStyles = (editor: any): void => {
  const frame = editor?.Canvas?.getFrameEl?.();
  const doc = frame?.contentDocument;
  if (!doc) return;

  let styleEl = doc.getElementById(ALIGNMENT_GUIDE_STYLE_ID) as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = doc.createElement('style');
    styleEl.id = ALIGNMENT_GUIDE_STYLE_ID;
    doc.head.appendChild(styleEl);
  }

  styleEl.textContent = `
    #${ALIGNMENT_GUIDE_CONTAINER_ID} {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9999;
    }
  `;
};

/**
 * Get or create the alignment guide container
 */
const getAlignmentContainer = (editor: any): HTMLElement | null => {
  const frame = editor?.Canvas?.getFrameEl?.();
  const doc = frame?.contentDocument;
  if (!doc) return null;

  const wrapperComponent = editor?.getWrapper?.();
  const wrapperEl = wrapperComponent?.getEl?.();
  if (!wrapperEl) return null;

  let container = doc.getElementById(ALIGNMENT_GUIDE_CONTAINER_ID);
  if (!container) {
    container = doc.createElement('div');
    container.id = ALIGNMENT_GUIDE_CONTAINER_ID;
    wrapperEl.appendChild(container);
  }

  return container;
};

/**
 * Clear all alignment guides
 */
export const clearAlignmentGuides = (editor: any): void => {
  const container = getAlignmentContainer(editor);
  if (!container) return;

  // Remove all child elements
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
};

/**
 * Line segment for rendering
 */
interface LineSegment {
  start: number;
  end: number;
  color: string;
  type: 'element' | 'gap';
}

/**
 * Calculate guide segments with gaps between elements
 */
const calculateGuideSegments = (
  guide: AlignmentGuide,
  wrapperEl: HTMLElement
): LineSegment[] => {
  const segments: LineSegment[] = [];

  // Get bounds for all aligned components
  const componentBounds = guide.alignedComponents
    .map((c) => getComponentBounds(c, wrapperEl))
    .filter((b): b is NonNullable<typeof b> => b !== null);

  if (componentBounds.length === 0) return segments;

  if (guide.direction === 'vertical') {
    // Sort by top position
    componentBounds.sort((a, b) => a.top - b.top);

    // Create green segments for each component
    componentBounds.forEach((bounds) => {
      segments.push({
        start: bounds.top,
        end: bounds.top + bounds.height,
        color: guide.color,
        type: 'element',
      });
    });

    // Create blue segments for gaps between components
    for (let i = 0; i < componentBounds.length - 1; i++) {
      const currentBottom = componentBounds[i].top + componentBounds[i].height;
      const nextTop = componentBounds[i + 1].top;

      // Only create gap segment if there's actually a gap (no overlap)
      if (nextTop > currentBottom) {
        segments.push({
          start: currentBottom,
          end: nextTop,
          color: CONNECTING_LINE_COLOR,
          type: 'gap',
        });
      }
    }
  } else {
    // Horizontal: sort by left position
    componentBounds.sort((a, b) => a.left - b.left);

    // Create green segments for each component
    componentBounds.forEach((bounds) => {
      segments.push({
        start: bounds.left,
        end: bounds.left + bounds.width,
        color: guide.color,
        type: 'element',
      });
    });

    // Create blue segments for gaps between components
    for (let i = 0; i < componentBounds.length - 1; i++) {
      const currentRight = componentBounds[i].left + componentBounds[i].width;
      const nextLeft = componentBounds[i + 1].left;

      // Only create gap segment if there's actually a gap (no overlap)
      if (nextLeft > currentRight) {
        segments.push({
          start: currentRight,
          end: nextLeft,
          color: CONNECTING_LINE_COLOR,
          type: 'gap',
        });
      }
    }
  }

  return segments;
};

/**
 * Render alignment guides
 */
export const renderAlignmentGuides = (editor: any, alignmentState: AlignmentState): void => {
  // Inject styles if not already present
  injectAlignmentGuideStyles(editor);

  // Clear previous guides
  clearAlignmentGuides(editor);

  const container = getAlignmentContainer(editor);
  if (!container) return;

  const frame = editor?.Canvas?.getFrameEl?.();
  const doc = frame?.contentDocument;
  if (!doc) return;

  const wrapperComponent = editor?.getWrapper?.();
  const wrapperEl = wrapperComponent?.getEl?.();
  if (!wrapperEl) return;

  // Render each guide
  alignmentState.guides.forEach((guide) => {
    // For page-center alignments, keep the long line (as requested by user)
    if (guide.type === 'page-center') {
      const guideEl = doc.createElement('div');
      guideEl.style.position = 'absolute';
      guideEl.style.pointerEvents = 'none';
      guideEl.style.zIndex = '10000';
      guideEl.style.backgroundColor = guide.color;

      if (guide.direction === 'vertical') {
        guideEl.style.left = `${guide.position}px`;
        guideEl.style.top = '0';
        guideEl.style.width = '2px';
        guideEl.style.height = '100%';
      } else {
        guideEl.style.top = `${guide.position}px`;
        guideEl.style.left = '0';
        guideEl.style.height = '2px';
        guideEl.style.width = '100%';
      }

      container.appendChild(guideEl);
    } else {
      // For element-alignment, calculate segments (elements + gaps)
      const segments = calculateGuideSegments(guide, wrapperEl);

      segments.forEach((segment) => {
        const segmentEl = doc.createElement('div');
        segmentEl.style.position = 'absolute';
        segmentEl.style.pointerEvents = 'none';
        segmentEl.style.zIndex = '10000';

        // For gap segments, use dashed border; for element segments, use solid background
        const isGap = segment.type === 'gap';

        if (guide.direction === 'vertical') {
          // Vertical line: fixed X, varies in Y
          segmentEl.style.left = `${guide.position}px`;
          segmentEl.style.top = `${segment.start}px`;
          segmentEl.style.height = `${segment.end - segment.start}px`;

          if (isGap) {
            segmentEl.style.width = '0';
            segmentEl.style.borderLeft = `2px dashed ${segment.color}`;
          } else {
            segmentEl.style.width = '2px';
            segmentEl.style.backgroundColor = segment.color;
          }
        } else {
          // Horizontal line: fixed Y, varies in X
          segmentEl.style.top = `${guide.position}px`;
          segmentEl.style.left = `${segment.start}px`;
          segmentEl.style.width = `${segment.end - segment.start}px`;

          if (isGap) {
            segmentEl.style.height = '0';
            segmentEl.style.borderTop = `2px dashed ${segment.color}`;
          } else {
            segmentEl.style.height = '2px';
            segmentEl.style.backgroundColor = segment.color;
          }
        }

        container.appendChild(segmentEl);
      });
    }
  });
};
