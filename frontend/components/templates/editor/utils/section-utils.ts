/**
 * Section management utilities
 * Handles section flex behavior, positioning, and selector management
 */

import { isHeaderComponent } from "../grapes-components/header";
import { isFooterComponent } from "../grapes-components/footer";
import { sectionLog } from "./debug";

/**
 * Update section flex behavior in fixed mode
 * All sections have fixed heights - no flex-grow, resize freely and push others down
 */
export const updateFixedModeSectionFlex = (editor: any, infiniteMode: boolean) => {
  if (!editor || typeof editor.getWrapper !== 'function') return;
  if (infiniteMode) return; // Only applies to fixed mode

  const wrapper = editor.getWrapper();
  if (!wrapper) return;

  // Get all sections (not header/footer)
  const sections = wrapper.components?.().filter?.((comp: any) => {
    const type = comp.get?.('type');
    const classStr = String(comp.get?.('attributes')?.class || '');
    const isSection = type === 'section' || type === 'container' || classStr.includes('pdf-container');
    return isSection && !isHeaderComponent(comp) && !isFooterComponent(comp);
  }) || [];

  if (sections.length === 0) return;

  // All sections: fixed height, no flex-grow
  sections.forEach((section: any) => {
    section.addStyle({
      'flex-grow': '0',
      'flex-shrink': '0',
    });
    section.removeStyle('min-height');
  });
};

/**
 * Ensure first section has no extra margin-top
 * Header is always position: relative, so it naturally pushes content down - no margin needed
 */
export const updateFirstSectionPosition = (editor: any, infiniteMode: boolean = false) => {
  if (!editor || typeof editor.getWrapper !== 'function') return;

  const wrapper = editor.getWrapper();
  if (!wrapper) return;

  // Find first section (not header/footer)
  const sections = wrapper.components?.().filter?.((comp: any) => {
    const type = comp.get?.('type');
    const isSection = type === 'section' || type === 'container' || comp.get?.('attributes')?.class?.includes('pdf-container');
    return isSection && !isHeaderComponent(comp) && !isFooterComponent(comp);
  }) || [];

  const firstSection = sections[0];
  if (!firstSection) return;

  // Header is always relative, so no margin-top needed on first section
  firstSection.addStyle({ 'margin-top': '0px' });
  sectionLog.log('First section margin-top:', 0);
};

/**
 * Ensure section rules use the unique ID selector (while keeping the semantic class)
 */
export const ensureSectionIdSelector = (component: any, editor: any) => {
  if (!component || !editor) return;
  const sectionId = component.getAttributes?.()?.id;
  if (!sectionId) return;

  const selectorManager = editor.Selectors;
  const selectors = component.getSelectors?.();
  if (!selectorManager || !selectors) return;

  // Create/retrieve ID selector
  const idSelector = selectorManager.add({ name: sectionId, type: 2 });

  // Add if missing; keep existing class selectors untouched
  const hasIdSelector = selectors.models?.some((s: any) => s.get?.('name') === sectionId && s.get?.('type') === 2);
  if (!hasIdSelector) {
    selectors.add(idSelector);
  }
};

/**
 * Get all sections from the wrapper (excluding header/footer)
 */
export const getSections = (editor: any): any[] => {
  if (!editor || typeof editor.getWrapper !== 'function') return [];

  const wrapper = editor.getWrapper();
  if (!wrapper) return [];

  return wrapper.components?.().filter?.((comp: any) => {
    const type = comp.get?.('type');
    const classStr = String(comp.get?.('attributes')?.class || '');
    const isSection = type === 'section' || type === 'container' || classStr.includes('pdf-container');
    return isSection && !isHeaderComponent(comp) && !isFooterComponent(comp);
  }) || [];
};

/**
 * Check if a component is a section
 * Accepts both 'section' (new) and 'container' (old) types for backward compatibility
 */
export const isSectionComponent = (component: any): boolean => {
  if (!component) return false;
  const type = component.get?.('type');
  const attrs = component.get?.('attributes') || {};
  const classStr = Array.isArray(attrs.class) ? attrs.class.join(' ') : String(attrs.class || '');
  const classList = typeof component.getClasses === 'function' ? component.getClasses().join(' ') : '';

  return type === 'section' ||
    type === 'container' ||
    classStr.includes('pdf-container') ||
    classList.includes('pdf-container') ||
    attrs['data-gjs-type'] === 'section' ||
    attrs['data-gjs-type'] === 'container';
};
