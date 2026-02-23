import { PageSettings } from "@/types/page-settings";
import React from "react";

export const isFooterComponent = (component: any) => {
  const type = component?.get?.('type');
  const tagName = component?.get?.('tagName')?.toLowerCase?.();
  return type === 'footer' || tagName === 'footer';
};

export const enforceFooterPosition = (
  component: any,
  editor: any,
  latestPageSettings: React.MutableRefObject<PageSettings>,
  latestInfiniteMode?: React.MutableRefObject<boolean>
) => {
  if (!component || !isFooterComponent(component)) return;

  // Ensure tagName is 'footer'
  const currentTag = component.get('tagName');
  if (currentTag !== 'footer') {
    component.set('tagName', 'footer');
  }

  // Move footer to last position in wrapper
  const wrapper = editor?.getWrapper?.();
  if (wrapper && typeof component.move === 'function') {
    const parent = typeof component.parent === 'function' ? component.parent() : component?.parent;
    if (parent === wrapper) {
      const children = wrapper.components?.();
      const childrenArray = children?.models || [];
      const lastIndex = childrenArray.length - 1;
      const currentIndex = typeof children?.indexOf === 'function' ? children.indexOf(component) : -1;
      if (currentIndex !== lastIndex) {
        component.move(wrapper, { at: lastIndex });
      }
    }
  }

  // Guard flag to prevent infinite loop
  let isUpdatingFooterPosition = false;

  // Always use relative positioning for footer
  const forceFooterPositionRelative = () => {
    if (isUpdatingFooterPosition) return;

    const currentStyle = component.getStyle();

    // Check if any absolute positioning styles exist that need to be removed
    const hasAbsoluteStyles =
      currentStyle.top !== undefined ||
      currentStyle.bottom !== undefined ||
      (currentStyle.left !== undefined && currentStyle.left !== '0' && currentStyle.left !== '0px') ||
      (currentStyle.right !== undefined && currentStyle.right !== '0' && currentStyle.right !== '0px') ||
      (currentStyle.position !== undefined && currentStyle.position !== 'relative');

    // In fixed mode, footer needs margin-top: auto to stick to bottom
    const isFixedMode = !latestInfiniteMode?.current;
    const expectedMarginTop = isFixedMode ? 'auto' : '0';
    const needsMarginTopUpdate = currentStyle['margin-top'] !== expectedMarginTop;

    if (hasAbsoluteStyles || currentStyle.width !== '100%' || needsMarginTopUpdate) {
      isUpdatingFooterPosition = true;
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
        // In fixed mode, use margin-top: auto to push footer to bottom of flex container
        component.addStyle({
          position: 'relative',
          width: '100%',
          'margin-left': '0',
          'margin-right': '0',
          'margin-top': expectedMarginTop,
        });
      } finally {
        isUpdatingFooterPosition = false;
      }
    }
  };

  // Apply relative positioning
  forceFooterPositionRelative();

  // Listen for style changes to re-enforce position
  component.on('change:style', forceFooterPositionRelative);

  // Footer is not draggable, resizable from bottom only
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

export const registerFooterComponent = (editor: any) => {
  editor.DomComponents.addType('footer', {
    isComponent: (el: HTMLElement) => el.tagName === 'FOOTER',
    model: {
      defaults: {
        tagName: 'footer',
        draggable: true,
        droppable: true,
        editable: true,
        resizable: true,
      }
    }
  });
};
