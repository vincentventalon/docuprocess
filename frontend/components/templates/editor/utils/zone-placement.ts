/**
 * Zone placement logic for routing components to header/footer/containers
 */

import type { MutableRefObject } from "react";
import {
  findHeaderComponent,
  findFooterComponent,
  getElementCenter,
  getHeaderBounds,
  getFooterBounds,
  isPointInHeader,
  isPointInFooter,
  convertToHeaderRelative,
  convertToPageAbsolute,
  convertToFooterRelative,
  convertFromFooterToPageAbsolute,
  clampComponentWithinHeader,
  clampComponentWithinFooter,
} from "./positioning";
import { enforceSectionPosition } from "../grapes-components/custom-components";

export interface ZonePlacementRefs {
  editorInstance: MutableRefObject<any>;
  isClamping: MutableRefObject<boolean>;
}

/**
 * Handle component zone placement - moves component to correct zone based on position
 * Handles: new drops, moving INTO header/footer, moving OUT of header/footer
 */
export const handleComponentZonePlacement = (
  component: any,
  editor: any,
  refs: ZonePlacementRefs
) => {
  const { editorInstance, isClamping } = refs;

  let wrapper;
  try {
    wrapper = editor?.getWrapper?.();
  } catch {
    return;
  }
  if (!component || !wrapper) return;

  const componentType = component.get?.('type');
  const componentClass = String(component.get?.('attributes')?.class || '');
  const isContainer = componentType === 'section' || componentClass.includes('pdf-container');

  if (isContainer) {
    const currentParent = typeof component.parent === 'function' ? component.parent() : component?.parent;
    if (currentParent && currentParent !== wrapper) {
      wrapper.append(component);
    }
    enforceSectionPosition(component);
    return;
  }

  const elementCenter = getElementCenter(component, editorInstance.current);
  const headerComponent = findHeaderComponent(editor);
  const footerComponent = findFooterComponent(editor);

  // Get current parent
  const currentParent = typeof component.parent === 'function' ? component.parent() : component?.parent;
  const currentParentTag = currentParent?.get?.('tagName')?.toLowerCase?.();
  const isCurrentlyInHeader = currentParentTag === 'header';
  const isCurrentlyInFooter = currentParentTag === 'footer';

  // Check target zones
  const headerBounds = headerComponent ? getHeaderBounds(headerComponent, editorInstance.current) : null;
  const footerBounds = footerComponent ? getFooterBounds(footerComponent, editorInstance.current) : null;
  let isInHeaderZone = headerBounds && isPointInHeader(elementCenter, headerBounds);
  let isInFooterZone = footerBounds && isPointInFooter(elementCenter, footerBounds);

  // Header takes priority if in both zones
  if (isInHeaderZone && isInFooterZone) isInFooterZone = false;

  // HEADER: clamp if staying, move in, or move out
  if (headerComponent) {
    if (isInHeaderZone && isCurrentlyInHeader) {
      clampComponentWithinHeader(component, headerComponent, isClamping, false);
      return;
    }
    if (isInHeaderZone && !isCurrentlyInHeader) {
      const pos = convertToHeaderRelative(component, headerComponent, editorInstance.current);
      if (pos) {
        component.addStyle({ left: `${pos.left}px`, top: `${pos.top}px`, position: 'absolute' });
        headerComponent.append(component);
        return;
      }
    }
    if (!isInHeaderZone && isCurrentlyInHeader) {
      const pos = convertToPageAbsolute(component, headerComponent, editorInstance.current);
      if (pos) {
        component.addStyle({ left: `${pos.left}px`, top: `${pos.top}px`, position: 'absolute' });
        wrapper.append(component);
        // Continue to find correct container below
      }
    }
  }

  // FOOTER: clamp if staying, move in, or move out
  if (footerComponent) {
    if (isInFooterZone && isCurrentlyInFooter) {
      clampComponentWithinFooter(component, footerComponent, isClamping);
      return;
    }
    if (isInFooterZone && !isCurrentlyInFooter) {
      const pos = convertToFooterRelative(component, footerComponent, editorInstance.current);
      if (pos) {
        component.removeStyle('top');
        component.addStyle({ left: `${pos.left}px`, bottom: `${pos.bottom}px`, position: 'absolute' });
        footerComponent.append(component);
        return;
      }
    }
    if (!isInFooterZone && isCurrentlyInFooter) {
      const pos = convertFromFooterToPageAbsolute(component, footerComponent, editorInstance.current);
      if (pos) {
        component.removeStyle('bottom');
        component.addStyle({ left: `${pos.left}px`, top: `${pos.top}px`, position: 'absolute' });
        wrapper.append(component);
        // Continue to find correct container below
      }
    }
  }

  // If already in header/footer zone, we're done
  if (isInHeaderZone || isInFooterZone) return;

  // DEFAULT: move to container
  const containers = wrapper.components?.()?.models?.filter((c: any) => {
    const cType = c.get?.('type');
    const cClass = String(c.get?.('attributes')?.class || '');
    return cType === 'section' || cClass.includes('pdf-container');
  }) || [];

  if (!containers.length) {
    return;
  }

  const compRect = component.getEl?.()?.getBoundingClientRect?.();
  let destination = containers[0];

  if (compRect) {
    const center = { x: compRect.left + compRect.width / 2, y: compRect.top + compRect.height / 2 };
    const found = containers.find((c: any) => {
      const r = c.getEl?.()?.getBoundingClientRect?.();
      return r && center.x >= r.left && center.x <= r.right && center.y >= r.top && center.y <= r.bottom;
    });
    if (found) destination = found;
  }

  const destRect = destination.getEl?.()?.getBoundingClientRect?.();
  let left = 0, top = 0;
  if (destRect && compRect) {
    left = compRect.left - destRect.left;
    top = compRect.top - destRect.top;
  }

  component.removeStyle('left');
  component.removeStyle('top');
  component.removeStyle('right');
  component.removeStyle('bottom');
  component.removeStyle('margin');
  component.addStyle({ position: 'absolute', left: `${left}px`, top: `${top}px` });
  component.set('draggable', '.pdf-container, header, footer');
  destination.append(component);
};

/**
 * Preprocess saved HTML to normalize containers and unwrap body
 */
export const preprocessHtml = (rawHtml: string): string => {
  if (!rawHtml || typeof rawHtml !== "string") return rawHtml;
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawHtml, "text/html");

    // Normalize container elements even if they only have the generated ID pattern
    const containers = doc.querySelectorAll(".pdf-container, [id^=\"container-\"]");
    containers.forEach((el) => {
      el.setAttribute("data-gjs-type", "section");

      const idAttr = el.getAttribute("id") || "";
      const classNames = (el.getAttribute("class") || "").split(/\s+/).filter(Boolean);
      const classSet = new Set(classNames);

      // Drop autogenerated ID classes and ensure the semantic class is present
      classSet.delete(idAttr);
      for (const cls of Array.from(classSet)) {
        if (/^container-\d+-\d+$/.test(cls)) {
          classSet.delete(cls);
        }
      }
      classSet.add("pdf-container");

      el.setAttribute("class", Array.from(classSet).join(" "));

      // Force relative positioning and full width; preserve existing height/margins
      const existingStyle = el.getAttribute("style") || "";
      const normalizedStyle = `${existingStyle}; position: relative; width: 100%; box-sizing: border-box; margin-left: 0; margin-right: 0; left: auto; right: auto;`;
      el.setAttribute("style", normalizedStyle);
    });

    // If a body exists, return its innerHTML to avoid adding a body element as a child
    // Handle nested body tags by recursively extracting innerHTML
    if (doc.body) {
      let content = (doc.body.innerHTML || rawHtml).trim();
      // Check for nested body tags and extract their content (handles whitespace around body tag)
      let nestedBodyMatch = content.match(/^\s*<body\s*[^>]*>([\s\S]*)<\/body>\s*$/i);
      while (nestedBodyMatch) {
        content = nestedBodyMatch[1].trim();
        nestedBodyMatch = content.match(/^\s*<body\s*[^>]*>([\s\S]*)<\/body>\s*$/i);
      }
      // Clean HTML tags from inside {{ }} template expressions
      content = content.replace(/\{\{([^}]+)\}\}/g, (match, inner) => {
        if (inner.includes('<')) {
          return `{{${inner.replace(/<[^>]*>/g, '').trim()}}}`;
        }
        return match;
      });
      return content;
    }
    return rawHtml;
  } catch {
    return rawHtml;
  }
};
