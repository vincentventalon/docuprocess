/**
 * Alignment guide system types and constants
 */

export type AlignmentType =
  | 'center-vertical'
  | 'center-horizontal'
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'middle-x'
  | 'middle-y';

export interface AlignmentPoint {
  type: AlignmentType;
  value: number; // px position
  component?: any; // reference to component this aligns with (null for page center)
}

export type GuideDirection = 'vertical' | 'horizontal';
export type GuideType = 'page-center' | 'element-alignment';

export interface AlignmentGuide {
  direction: GuideDirection;
  position: number; // px position where line should be drawn
  type: GuideType;
  alignedComponents: any[]; // which components are aligned to this guide
  color: string; // guide line color
}

export interface AlignmentState {
  guides: AlignmentGuide[];
}

// Constants
export const SNAP_THRESHOLD = 1; // pixels - how close to trigger snap
export const PAGE_CENTER_COLOR = 'rgba(147, 51, 234, 0.8)'; // purple for page center
export const ELEMENT_ALIGN_COLOR = 'rgba(34, 255, 94, 1)'; // bright fluorescent green for element alignment
export const CONNECTING_LINE_COLOR = 'rgba(96, 165, 250, 0.4)'; // light blue for connections
