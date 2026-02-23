import { PageSettings } from "@/types/page-settings";
import React from "react";

export const isHeaderComponent = (component: any) => {
  const type = component?.get?.('type');
  const tagName = component?.get?.('tagName')?.toLowerCase?.();
  return type === 'header' || tagName === 'header';
};

export const enforceHeaderPosition = (
  component: any,
  editor: any,
  latestPageSettings: React.MutableRefObject<PageSettings>,
  latestInfiniteMode?: React.MutableRefObject<boolean>
) => {
  if (!component || !isHeaderComponent(component)) return;

  // Ensure tagName is 'header'
  const currentTag = component.get('tagName');
  if (currentTag !== 'header') {
    component.set('tagName', 'header');
  }

  // Move header to first position in wrapper
  const wrapper = editor?.getWrapper?.();
  if (wrapper && typeof component.move === 'function') {
    const parent = typeof component.parent === 'function' ? component.parent() : component?.parent;
    if (parent === wrapper) {
      const children = wrapper.components?.();
      const index = typeof children?.indexOf === 'function' ? children.indexOf(component) : -1;
      if (index > 0) {
        component.move(wrapper, { at: 0 });
      }
    }
  }

  // Guard flag to prevent infinite loop
  let isUpdatingHeaderPosition = false;

  // Always use relative positioning for header
  const forceHeaderPositionRelative = () => {
    if (isUpdatingHeaderPosition) return;

    const currentStyle = component.getStyle();

    // Check if any absolute positioning styles exist that need to be removed
    const hasAbsoluteStyles =
      currentStyle.top !== undefined ||
      currentStyle.bottom !== undefined ||
      (currentStyle.left !== undefined && currentStyle.left !== '0' && currentStyle.left !== '0px') ||
      (currentStyle.right !== undefined && currentStyle.right !== '0' && currentStyle.right !== '0px') ||
      (currentStyle.position !== undefined && currentStyle.position !== 'relative');

    if (hasAbsoluteStyles || currentStyle.width !== '100%') {
      isUpdatingHeaderPosition = true;
      try {
        // Remove absolute positioning styles
        component.removeStyle('top');
        component.removeStyle('bottom');
        component.removeStyle('left');
        component.removeStyle('right');

        // Also clean up the DOM element directly (in case of inline styles from drag)
        const el = component.getEl?.();
        if (el) {
          el.style.left = '';
          el.style.right = '';
          el.style.top = '';
          el.style.bottom = '';
          el.style.position = '';
        }

        // Apply relative positioning
        component.addStyle({
          position: 'relative',
          width: '100%',
          'margin-left': '0',
          'margin-right': '0',
        });
      } finally {
        isUpdatingHeaderPosition = false;
      }
    }
  };

  // Apply relative positioning
  forceHeaderPositionRelative();

  // Listen for style changes to re-enforce position
  component.on('change:style', forceHeaderPositionRelative);

  // Header is not draggable, resizable from bottom only
  component.set({
    draggable: false,
    resizable: {
      tl: 0,
      tc: 0,
      tr: 0,
      cl: 0,
      cr: 0,
      bl: 0,
      bc: 1,  // bottom-center: enabled (resize height downward)
      br: 0,
    }
  });
};

export const registerHeaderComponent = (editor: any) => {
  editor.DomComponents.addType('header', {
    isComponent: (el: HTMLElement) => el.tagName === 'HEADER',
    model: {
      defaults: {
        tagName: 'header',
        draggable: '[data-gjs-type="wrapper"]',
        droppable: true,
        editable: true,
        resizable: true,
        // Force tagName to always be 'header'
        type: 'header',
      },
      init() {
        // Ensure tagName stays 'header'
        this.set('tagName', 'header');
      }
    }
  });
};
