import { ResizeSnapshot } from "../types";
import { parsePixelValue, getRelativeOffsets, calculateMinimumSize } from "./positioning";
import { calculateResizeBounds } from "./resize-constraints";
import { calculateTableMinimumSize } from "./table-utils";

export const captureResizeSnapshot = (
  component: any,
  opts: any,
  activeResizeSessions: WeakMap<any, ResizeSnapshot>,
  editorInstance: any,
  pageSettings: any
) => {
  const { el, resizer } = opts;
  if (!component || !el) return;

  const view = el.ownerDocument?.defaultView ?? window;
  const computedStyle = view.getComputedStyle(el);
  const rect = el.getBoundingClientRect();
  const relative = getRelativeOffsets(el);
  const handle =
    typeof resizer?.getSelectedHandler === "function"
      ? resizer.getSelectedHandler()
      : resizer?.selectedHandler;

  // Check if this is an image component
  const componentType = component?.get?.('type');
  const isImage = componentType === 'image';

  // For images, get the natural aspect ratio from the actual image element
  let aspectRatio = rect.width > 0 && rect.height > 0 ? rect.width / rect.height : 1;
  if (isImage) {
    const imgElement = el.querySelector('img') || (el.tagName === 'IMG' ? el : null);
    if (imgElement && imgElement.naturalWidth > 0 && imgElement.naturalHeight > 0) {
      aspectRatio = imgElement.naturalWidth / imgElement.naturalHeight;
    }
  }

  // Calculate spatial bounds (margins)
  const bounds = calculateResizeBounds(component, editorInstance, pageSettings);

  // Calculate minimum size based on component type
  const isTable = componentType === 'table';
  const minSizes = isTable
    ? calculateTableMinimumSize(component)
    : calculateMinimumSize(el);

  const snapshot: ResizeSnapshot = {
    handle,
    affectsLeft: Boolean(handle && handle.includes("l")),
    affectsTop: Boolean(handle && handle.includes("t")),
    isAbsolute: computedStyle.position === "absolute",
    startWidth: rect.width,
    startHeight: rect.height,
    startLeft: relative.left,
    startTop: relative.top,
    initialMarginLeft: parsePixelValue(computedStyle.marginLeft),
    initialMarginTop: parsePixelValue(computedStyle.marginTop),
    aspectRatio,
    isImage,
    bounds,
    minWidth: minSizes.minWidth,
    minHeight: minSizes.minHeight,
  };

  activeResizeSessions.set(component, snapshot);
};

export const decorateResizableOptions = (
  component: any,
  currentValue: any,
  activeResizeSessions: WeakMap<any, ResizeSnapshot>,
  scheduleClamp: (component: any) => void,
  editorInstance: any,
  pageSettings: any
) => {
  if (!component) return currentValue;
  const baseConfig = (typeof currentValue === "object" ? currentValue : {}) as Record<string, any>;
  const defaultHandles = { tl: 1, tc: 1, tr: 1, cl: 1, cr: 1, bl: 1, bc: 1, br: 1 };
  const mergedConfig: Record<string, any> = { ...defaultHandles, ...baseConfig };
  const baseOnStart = mergedConfig.onStart;
  const baseOnEnd = mergedConfig.onEnd;

  return {
    ...mergedConfig,
    onStart: (event: PointerEvent, opts: any) => {
      if (typeof baseOnStart === "function") {
        baseOnStart(event, opts);
      }
      captureResizeSnapshot(component, opts, activeResizeSessions, editorInstance, pageSettings);
    },
    onResize: (event: PointerEvent, opts: any) => {
      // Note: We no longer need scheduleClamp during resize
      // The new constraint system handles bounds in real-time
      if (mergedConfig.onResize && typeof mergedConfig.onResize === "function") {
        mergedConfig.onResize(event, opts);
      }
    },
    onEnd: (event: PointerEvent, opts: any) => {
      if (typeof baseOnEnd === "function") {
        baseOnEnd(event, opts);
      }
      activeResizeSessions.delete(component);
      // Final clamp after resize ends (just in case)
      scheduleClamp(component);
    },
  };
};

export const autoResizeImageComponent = (component: any) => {
  if (!component || component.get?.("type") !== "image") return;

  const el = component.getEl?.() as HTMLElement | null;
  if (!el) return;

  const imgElement = (el.querySelector('img') || (el.tagName === 'IMG' ? el : null)) as HTMLImageElement | null;
  if (!imgElement) return;

  // Get current component style dimensions
  const currentStyle = component.getStyle?.() || {};
  const styleHeight = parseFloat(currentStyle.height);

  // Use style height if available, otherwise default to 150px
  const baseHeight = styleHeight > 0 ? styleHeight : 150;

  const resizeWithRatio = () => {
    const naturalWidth = imgElement.naturalWidth;
    const naturalHeight = imgElement.naturalHeight;

    if (naturalWidth === 0 || naturalHeight === 0) return;

    const aspectRatio = naturalWidth / naturalHeight;
    const targetWidth = baseHeight * aspectRatio;

    component.addStyle({
      width: `${targetWidth}px`,
      height: `${baseHeight}px`,
    });
  };

  // Remove previous listener if exists
  if ((imgElement as any)._resizeListener) {
    imgElement.removeEventListener('load', (imgElement as any)._resizeListener);
  }

  // Always add load listener for new images
  const listener = () => resizeWithRatio();
  (imgElement as any)._resizeListener = listener;
  imgElement.addEventListener('load', listener, { once: true });

  // If image already loaded, resize now
  if (imgElement.complete && imgElement.naturalWidth > 0) {
    resizeWithRatio();
  }
};
