import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Editor } from "grapesjs";
import grapesjs from "grapesjs";
import JsBarcode from "jsbarcode";
import {
  DEFAULT_PAGE_SETTINGS,
  clampPadding,
  type PageSettings,
} from "@/types/page-settings";
import { ResizeSnapshot } from "../types";
import {
  applyPageSettings,
  applyExternalCssToCanvas,
  injectHeaderHighlightStyles,
  injectFooterHighlightStyles,
  injectImageOutlineStyles,
  updateMarginGuides,
  updateInfiniteModeHeight,
} from "../utils/canvas";
import { injectOverflowStyles } from "../utils/zone-overflow";
import { renderBarcodeComponent } from "../grapes-components/barcode";
import { enforceSectionPosition } from "../grapes-components/custom-components";
import { registerAllComponents } from "../grapes-components";
import { initLog, paddingLog, exportLog } from "../utils/debug";
import { injectTableHandleStyles } from "../utils/table-column-row-handles";
import { ElementType } from "../panels/components/NewElementDropdown";
import {
  isHeaderComponent,
  enforceHeaderPosition,
} from "../grapes-components/header";
import {
  isFooterComponent,
  enforceFooterPosition,
} from "../grapes-components/footer";
import { ensureSectionOrder } from "../utils/positioning";

// Extracted modules
import {
  updateFixedModeSectionFlex,
  updateFirstSectionPosition,
} from "../utils/section-utils";
import { preprocessHtml } from "../utils/zone-placement";
import {
  createBlockDragState,
  setupBlockDragHandlers,
} from "../utils/block-drag-handlers";
import {
  startPasteDropMode,
  setupPasteCommandOverride,
  PasteDropModeState,
} from "../utils/paste-drop-mode";
import {
  enterCellEditMode,
  ensureTableDraggable,
  CellEditModeState,
} from "../utils/table-editing";
import {
  setupResizeInitHandler,
  setupResizeUpdateHandler,
  setupResizeEndHandler,
  ResizeHandlerCallbacks,
} from "../utils/resize-handlers";
import {
  setupDragStartHandler,
  setupDragHandler,
  setupDragEndHandler,
  setupSelectedComponentDragPriority,
  MultiSelectDragState,
  DragHandlerRefs,
  DragHandlerCallbacks,
} from "../utils/drag-handlers";
import {
  createScheduleClamp,
  setupComponentAddHandler,
  setupComponentUpdateHandler,
  setupComponentRemoveHandler,
  setupComponentMountHandler,
  setupTraitChangeHandler,
  ComponentLifecycleRefs,
} from "../utils/component-lifecycle";
import {
  createSelectionState,
  setupSelectionHandler,
  setupDeselectionHandler,
  setupEscapeKeyHandler,
  cleanupEscapeKeyHandler,
} from "../utils/component-selection";
import {
  cancelPlacement,
  placeElementAt,
  startPlacement,
  PlacementModeRefs,
} from "../utils/placement-mode";
import { initializeAllZIndexes } from "../utils/z-index";

interface UseGrapesJSEditorProps {
  htmlContent: string;
  cssContent?: string;
  onChange: (_html: string) => void;
  onCssChange?: (_css: string) => void;
  onDirty?: () => void;
  pageSettings?: PageSettings;
  externalCss?: string;
  infiniteMode?: boolean;
}

export const useGrapesJSEditor = ({
  htmlContent,
  cssContent,
  onChange,
  onCssChange,
  onDirty,
  pageSettings,
  externalCss = "",
  infiniteMode = false,
}: UseGrapesJSEditorProps) => {
  const resolvedPageSettings = useMemo<PageSettings>(() => {
    const candidate = pageSettings ?? DEFAULT_PAGE_SETTINGS;
    return {
      ...candidate,
      padding: clampPadding(candidate.padding),
    };
  }, [pageSettings]);

  const editorRef = useRef<HTMLDivElement>(null);
  const editorInstance = useRef<any>(null);
  const [editor, setEditor] = useState<Editor | null>(null);
  const isUpdatingFromEditor = useRef(false);
  const hasLoadedInitialContent = useRef(false);
  const externalCssId = useRef(`gjs-external-css-${Math.random().toString(36).slice(2)}`);
  const latestExternalCss = useRef<string>(externalCss || "");
  const latestPageSettings = useRef<PageSettings>(resolvedPageSettings);
  const latestInfiniteMode = useRef<boolean>(infiniteMode);
  const isClamping = useRef(false);
  const pendingClamp = useRef<WeakSet<any>>(new WeakSet());
  const isDraggingRef = useRef(false);
  const isSectionOrderSyncing = useRef(false);
  const draggingContainerRef = useRef<any>(null);
  const dragPointerRef = useRef<{ x: number; y: number } | null>(null);
  const dragPointerCleanupRef = useRef<(() => void) | null>(null);

  // Placement mode state
  const [isPlacementActive, setIsPlacementActive] = useState(false);
  const placementTypeRef = useRef<ElementType | null>(null);
  const placementCleanupRef = useRef<(() => void) | null>(null);

  // RTE (Rich Text Editor) active state
  const [isRTEActive, setIsRTEActive] = useState(false);

  // Refs for component lifecycle
  const lifecycleRefs: ComponentLifecycleRefs = {
    editorInstance,
    latestPageSettings,
    latestInfiniteMode,
    isClamping,
    pendingClamp,
    isDraggingRef,
  };

  // Create scheduleClamp function
  const scheduleClamp = useMemo(() => createScheduleClamp(lifecycleRefs), []);

  useEffect(() => {
    if (!editorRef.current || editorInstance.current) return;

    if (typeof window !== "undefined" && !(window as any).JsBarcode) {
      (window as any).JsBarcode = JsBarcode;
    }

    const activeResizeSessions = new WeakMap<any, ResizeSnapshot>();
    const pendingAlignmentFrames = new WeakMap<any, number>();
    let currentDragComponent: any = null;
    let multiSelectDragState: MultiSelectDragState | null = null;
    let pasteDropMode: PasteDropModeState | null = null;

    // Track Shift key for force-override during zone resize
    let isShiftPressed = false;
    // Track current cursor position for tooltip
    let cursorPosition = { x: 0, y: 0 };

    // Track cell edit mode state
    const selectionState = createSelectionState();

    // Block drag state
    const blockDragState = createBlockDragState();

    // Variables for cleanup of Escape key listeners
    let canvasDoc: Document | null = null;
    let handleEscapeKey: ((_e: KeyboardEvent) => void) | null = null;

    // Variables for cleanup functions
    let cleanupBlockDrag: (() => void) | null = null;
    let cleanupShiftTracking: (() => void) | null = null;
    let cleanupDragPriority: (() => void) | null = null;

    try {
      const editor = grapesjs.init({
        container: editorRef.current,
        dragMode: 'absolute',
        height: "calc(100vh - 48px)",
        width: "100%",
        storageManager: false,
        canvas: {
          styles: [],
          scripts: [],
        },
        canvasCss: `
          .gjs-selected {
            outline: 1.5px solid #8b5cf6 !important;
          }
          body.gjs-dashed *[data-gjs-highlightable] {
            outline-color: #8b5cf6 !important;
          }
        `,
        avoidInlineStyle: false,
        forceClass: false,
        parser: {
          optionsHtml: {
            allowScripts: true,
            allowUnsafeAttr: true,
          }
        },
        blockManager: {
          appendTo: "#gjs-hidden-blocks",
        },
        styleManager: {
          appendTo: "#gjs-hidden-styles",
          sectors: [
            {
              name: "General",
              properties: [
                { property: "top", type: "number", units: ["px"] },
                { property: "left", type: "number", units: ["px"] },
              ],
            },
            {
              name: "Dimension",
              open: true,
              properties: [
                { property: "width", type: "number", units: ["px"], min: 0 },
                { property: "height", type: "number", units: ["px"], min: 0 },
                {
                  property: "margin",
                  type: "composite",
                  properties: [
                    { property: "margin-top", type: "number", units: ["px"] },
                    { property: "margin-right", type: "number", units: ["px"] },
                    { property: "margin-bottom", type: "number", units: ["px"] },
                    { property: "margin-left", type: "number", units: ["px"] },
                  ],
                },
                {
                  property: "padding",
                  type: "padding-toggle",
                  label: "Padding",
                }
              ],
            },
            {
              name: "Typography",
              open: true,
              properties: [
                "font-family",
                { property: "font-size", type: "number", units: ["px"], min: 1 },
                "font-weight",
                { property: "letter-spacing", type: "number", units: ["em"] },
                "color",
                { property: "line-height", type: "number", units: ["px", ""] },
                "text-align"
              ],
            },
            {
              name: "Decorations",
              id: "decorations",
              open: true,
              properties: [
                { extend: "border-radius", units: ["px"] },
                {
                  type: "border-toggle",
                  property: "border",
                  label: "Border",
                  full: true,
                },
                "background-color",
                "box-shadow",
              ],
            },
          ],
        },
        traitManager: {
          appendTo: "#traits",
        },
        domComponents: {
          defaults: {
            resizable: true,
          }
        } as any,
        panels: {
          defaults: [],
        },
      });

      // Expose editor instance to parent components
      setEditor(editor);

      // Disable GrapesJS internal snap/guides
      const canvasView = editor.Canvas.getCanvasView() as any;
      const dragger = canvasView?.dragger;
      if (dragger && typeof dragger.setGuidesStatic === 'function') {
        dragger.setGuidesStatic([]);
        dragger.setGuidesTargets([]);
      }

      // Register all custom components
      registerAllComponents(editor);

      // Track RTE active state + attach plain-text paste handler to the edited element
      let rteCleanupPaste: (() => void) | null = null;

      editor.on('rte:enable', () => {
        setIsRTEActive(true);

        // Find the contenteditable element and attach paste handler directly
        const selected = editor.getSelected();
        const el = selected?.getEl?.() as HTMLElement | null;
        if (!el) return;

        const editableEl = el.getAttribute('contenteditable') === 'true'
          ? el
          : el.querySelector('[contenteditable="true"]');
        if (!editableEl) return;

        const onPaste = (e: Event) => {
          const ce = e as ClipboardEvent;
          const clipboardData = ce.clipboardData;
          if (!clipboardData) return;

          ce.preventDefault();
          ce.stopPropagation();

          const plainText = clipboardData.getData('text/plain');
          if (plainText) {
            const canvasDoc = (editableEl as HTMLElement).ownerDocument;
            const html = plainText
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/\n/g, '<br>');
            canvasDoc.execCommand('insertHTML', false, html);
          }
        };

        editableEl.addEventListener('paste', onPaste, true);
        rteCleanupPaste = () => {
          editableEl.removeEventListener('paste', onPaste, true);
        };
      });

      editor.on('rte:disable', () => {
        setIsRTEActive(false);
        if (rteCleanupPaste) {
          rteCleanupPaste();
          rteCleanupPaste = null;
        }
      });

      // Override GrapesJS drag command to enforce 1px snap tolerance instead of default 5px
      const baseComponentDrag = editor.Commands.get('core:component-drag');
      if (baseComponentDrag) {
        const SNAP_TOLERANCE_PX = 1;
        editor.Commands.add('core:component-drag', {
          ...baseComponentDrag,
          run(ed: any, sender: any, opts: any = {}) {
            const mergedDragger = {
              snapGuides: {
                x: SNAP_TOLERANCE_PX,
                y: SNAP_TOLERANCE_PX,
                ...(opts?.dragger?.snapGuides || {}),
              },
              snapOffset: opts?.dragger?.snapOffset ?? SNAP_TOLERANCE_PX,
              ...(opts?.dragger || {}),
            };
            return baseComponentDrag.run(ed, sender, { ...opts, dragger: mergedDragger });
          },
          stop(ed: any, sender: any, opts?: any) {
            return baseComponentDrag.stop?.(ed, sender, opts);
          },
        });
      }

      // Setup paste command override for paste-drop mode
      setupPasteCommandOverride(editor, (pastedComponents) => {
        startPasteDropMode(editor, pastedComponents, (state) => {
          pasteDropMode = state;
        });
      });

      // Setup block drag handlers
      cleanupBlockDrag = setupBlockDragHandlers(editor, blockDragState, latestInfiniteMode);

      // Setup component lifecycle handlers
      const lifecycleCallbacks = { scheduleClamp };
      setupComponentAddHandler(editor, lifecycleRefs, lifecycleCallbacks, blockDragState);
      setupComponentUpdateHandler(editor, lifecycleRefs);
      setupComponentRemoveHandler(editor, lifecycleRefs);
      setupComponentMountHandler(
        editor,
        lifecycleRefs,
        activeResizeSessions,
        () => currentDragComponent
      );
      setupTraitChangeHandler(editor);

      // Setup resize handlers
      const resizeCallbacks: ResizeHandlerCallbacks = {
        scheduleClamp,
        latestPageSettings,
        latestInfiniteMode,
        editorInstance,
        isShiftPressedGetter: () => isShiftPressed,
        cursorPositionGetter: () => cursorPosition,
      };
      setupResizeInitHandler(editor, activeResizeSessions, resizeCallbacks);
      setupResizeUpdateHandler(editor, activeResizeSessions, pendingAlignmentFrames, resizeCallbacks);
      setupResizeEndHandler(editor, activeResizeSessions, pendingAlignmentFrames, resizeCallbacks);

      // Setup drag handlers
      const dragRefs: DragHandlerRefs = {
        editorInstance,
        latestPageSettings,
        latestInfiniteMode,
        isClamping,
        isDraggingRef,
        draggingContainerRef,
        dragPointerRef,
        dragPointerCleanupRef,
        isSectionOrderSyncing,
      };
      const dragCallbacks: DragHandlerCallbacks = {
        scheduleClamp,
        isShiftPressedGetter: () => isShiftPressed,
      };
      setupDragStartHandler(
        editor,
        dragRefs,
        () => multiSelectDragState,
        (state) => { multiSelectDragState = state; }
      );
      setupDragHandler(
        editor,
        dragRefs,
        dragCallbacks,
        () => multiSelectDragState,
        (component) => { currentDragComponent = component; }
      );
      setupDragEndHandler(
        editor,
        dragRefs,
        dragCallbacks,
        (component) => { currentDragComponent = component; },
        (state) => { multiSelectDragState = state; }
      );

      // Listen for wrapper padding changes to update footer position
      editor.on('styleable:change', (component: any) => {
        const wrapper = editor?.getWrapper?.();
        if (component === wrapper) {
          const styles = wrapper.getStyle();
          const paddingTop = parseFloat(String(styles['padding-top'] || '0')) ?? latestPageSettings.current.padding.top;
          const paddingRight = parseFloat(String(styles['padding-right'] || '0')) ?? latestPageSettings.current.padding.right;
          const paddingBottom = parseFloat(String(styles['padding-bottom'] || '0')) ?? latestPageSettings.current.padding.bottom;
          const paddingLeft = parseFloat(String(styles['padding-left'] || '0')) ?? latestPageSettings.current.padding.left;

          latestPageSettings.current = {
            ...latestPageSettings.current,
            padding: {
              top: paddingTop,
              right: paddingRight,
              bottom: paddingBottom,
              left: paddingLeft,
            },
          };

          paddingLog.log('Padding changed, updating header and footer positions:', { top: paddingTop, right: paddingRight, bottom: paddingBottom, left: paddingLeft });

          const headers = wrapper.components?.().filter?.((comp: any) => isHeaderComponent(comp)) || [];
          headers.forEach((header: any) => {
            enforceHeaderPosition(header, editor, latestPageSettings, latestInfiniteMode);
          });

          const footers = wrapper.components?.().filter?.((comp: any) => isFooterComponent(comp)) || [];
          footers.forEach((footer: any) => {
            enforceFooterPosition(footer, editor, latestPageSettings, latestInfiniteMode);
          });

          if (editorInstance.current) {
            updateFirstSectionPosition(editorInstance.current, latestInfiniteMode.current);
          }

          updateMarginGuides(editor, latestPageSettings.current);

          // Trigger HTML export to update body styles
          if (!isUpdatingFromEditor.current) {
            let innerHtml = editor.getHtml();
            const wrapperStyles = wrapper?.getStyle?.() || {};
            const styleString = Object.entries(wrapperStyles)
              .map(([key, value]) => `${key}:${value}`)
              .join(';');

            const bodyMatch = innerHtml.match(/^<body\s*([^>]*)>([\s\S]*)<\/body>$/i);
            if (bodyMatch) {
              innerHtml = bodyMatch[2];
            }

            const html = styleString
              ? `<body style="${styleString}">\n${innerHtml}\n</body>`
              : `<body>\n${innerHtml}\n</body>`;

            isUpdatingFromEditor.current = true;
            onChange(html);
            setTimeout(() => {
              isUpdatingFromEditor.current = false;
            }, 0);
          }
        }
      });

      // Setup selection handlers
      const enterCellEditModeFn = (cellComponent: any, cellEl: HTMLElement) => {
        enterCellEditMode(
          editor,
          cellComponent,
          cellEl,
          (state) => { selectionState.cellEditMode = state; }
        );
      };
      const ensureTableDraggableFn = (tableComponent: any) => {
        ensureTableDraggable(tableComponent, editor);
      };

      setupSelectionHandler(
        editor,
        selectionState,
        enterCellEditModeFn,
        ensureTableDraggableFn
      );
      setupDeselectionHandler(editor, selectionState);

      // Set initial content ONLY ONCE
      if (!hasLoadedInitialContent.current) {
        // Extract background-color from body tag BEFORE preprocessHtml strips it.
        // The save path puts wrapper styles on the body tag, but the wrapper gets a
        // new ID on each load so the CSS rule won't match — we must restore it manually.
        const bodyStyleMatch = htmlContent.match(/<body\s+[^>]*style="([^"]*)"/i);
        let savedBgColor: string | undefined;
        if (bodyStyleMatch) {
          const bgMatch = bodyStyleMatch[1].match(/background-color:\s*([^;]+)/);
          if (bgMatch) savedBgColor = bgMatch[1].trim();
        }

        const processedHtml = preprocessHtml(htmlContent);
        editor.setComponents(processedHtml);

        if (cssContent) {
          editor.setStyle(cssContent);
        }

        applyPageSettings(editor, resolvedPageSettings, infiniteMode);

        // Restore saved background-color on the wrapper
        if (savedBgColor) {
          const wrapper = editor.getWrapper();
          wrapper?.addStyle({ 'background-color': savedBgColor });
        }

        injectHeaderHighlightStyles(editor);
        injectFooterHighlightStyles(editor);
        injectOverflowStyles(editor);

        // Setup Shift key tracking and cursor position for zone resize
        const setupShiftTracking = () => {
          const canvasFrame = editor.Canvas?.getFrameEl?.();
          const canvasDocument = canvasFrame?.contentDocument || document;

          const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Shift') isShiftPressed = true;
          };
          const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === 'Shift') isShiftPressed = false;
          };
          const handleMouseMove = (e: MouseEvent) => {
            cursorPosition = { x: e.clientX, y: e.clientY };
          };

          document.addEventListener('keydown', handleKeyDown);
          document.addEventListener('keyup', handleKeyUp);
          document.addEventListener('mousemove', handleMouseMove);
          canvasDocument.addEventListener('keydown', handleKeyDown);
          canvasDocument.addEventListener('keyup', handleKeyUp);
          canvasDocument.addEventListener('mousemove', handleMouseMove);

          return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
            document.removeEventListener('mousemove', handleMouseMove);
            canvasDocument.removeEventListener('keydown', handleKeyDown);
            canvasDocument.removeEventListener('keyup', handleKeyUp);
            canvasDocument.removeEventListener('mousemove', handleMouseMove);
          };
        };

        requestAnimationFrame(() => {
          cleanupShiftTracking = setupShiftTracking();
        });

        requestAnimationFrame(() => {
          if (editorInstance.current) {
            updateFirstSectionPosition(editorInstance.current, latestInfiniteMode.current);
          }
        });

        hasLoadedInitialContent.current = true;
      }

      // Make width and flex mutually exclusive
      let isUpdatingStyles = false;

      editor.on('component:styleUpdate:width', (component: any) => {
        if (isUpdatingStyles) return;
        const styles = component.getStyle();
        if (styles && styles.width && styles.width !== 'auto' && styles.width !== '') {
          isUpdatingStyles = true;
          component.removeStyle('flex');
          isUpdatingStyles = false;
        }
      });

      editor.on('component:styleUpdate:flex', (component: any) => {
        if (isUpdatingStyles) return;
        const styles = component.getStyle();
        if (styles && styles.flex && styles.flex !== 'none' && styles.flex !== '' && styles.flex !== '0') {
          isUpdatingStyles = true;
          component.removeStyle('width');
          isUpdatingStyles = false;
        }
      });

      // Mark as dirty on actual user modifications (not selection changes)
      editor.on("component:add component:remove component:drag:end component:resize:end rte:disable", () => {
        if (onDirty) onDirty();
      });

      // Listen to changes and get HTML with inline styles
      editor.on("component:add component:remove component:update", () => {
        try {
          if (isUpdatingFromEditor.current) return;

          let innerHtml = editor.getHtml();
          const css = editor.getCss();

          const wrapper = editor.getWrapper();
          const wrapperStyles = wrapper?.getStyle?.() || {};

          const styleString = Object.entries(wrapperStyles)
            .map(([key, value]) => `${key}:${value}`)
            .join(';');

          const bodyMatch = innerHtml.match(/^<body\s*([^>]*)>([\s\S]*)<\/body>$/i);
          if (bodyMatch) {
            innerHtml = bodyMatch[2];
          }

          const html = styleString
            ? `<body style="${styleString}">\n${innerHtml}\n</body>`
            : `<body>\n${innerHtml}\n</body>`;

          exportLog.log('Generated HTML with body styles:', html);

          const allComponents = wrapper?.components?.();
          exportLog.log('All components in wrapper:', allComponents?.models?.map((c: any) => ({ type: c.get('type'), tagName: c.get('tagName'), attributes: c.get('attributes') })));

          isUpdatingFromEditor.current = true;
          onChange(html);
          if (onCssChange) {
            onCssChange(css);
          }
          setTimeout(() => {
            isUpdatingFromEditor.current = false;
          }, 0);
        } catch (error) {
          console.error("Error in editor update handler:", error);
        }
      });

      // Hide all GrapesJS panels (using custom EditorToolbar instead)
      const styleElement = document.createElement("style");
      styleElement.textContent = `
        .gjs-pn-panels {
          display: none !important;
        }
        .gjs-pn-views {
          display: none !important;
        }
        .gjs-pn-options {
          display: none !important;
        }
        .gjs-pn-devices-c {
          display: none !important;
        }
        .gjs-editor-cont {
          background-color: transparent !important;
        }
        .gjs-cv-canvas {
          width: 100% !important;
          height: 100% !important;
          top: 0 !important;
          background-color: #e5e7eb !important;
        }
        .gjs-frame-wrapper {
          margin: 0 !important;
        }
        .gjs-sm-header {
          display: none !important;
        }
        .gjs-cv-canvas__frames {
          background-color: #e5e7eb !important;
        }
        .gjs-rte-toolbar {
          display: none !important;
        }
        /* Hide all toolbar buttons */
        .gjs-toolbar .gjs-toolbar-item {
          display: none !important;
        }
        /* Brand purple - override GrapesJS CSS variables */
        :root, .gjs-editor, .gjs-editor-cont {
          --gjs-color-highlight: #8b5cf6 !important;
          --gjs-primary-color: #8b5cf6 !important;
          --gjs-color-blue: #8b5cf6 !important;
        }
        .gjs-selected {
          outline-color: #8b5cf6 !important;
          border-color: #8b5cf6 !important;
        }
        .gjs-selected-parent {
          outline-color: #8b5cf6 !important;
          border-color: #8b5cf6 !important;
        }
        .gjs-hovered {
          outline-color: #a78bfa !important;
          border-color: #a78bfa !important;
        }
        .gjs-highlighter {
          outline-color: #8b5cf6 !important;
          border-color: #8b5cf6 !important;
        }
        .gjs-highlighter-sel {
          outline-color: #8b5cf6 !important;
          border-color: #8b5cf6 !important;
        }
        .gjs-badge {
          background-color: #8b5cf6 !important;
          border-radius: 4px !important;
        }
        .gjs-toolbar {
          background-color: #8b5cf6 !important;
        }
        .gjs-frame-wrapper__top,
        .gjs-frame-wrapper__right,
        .gjs-frame-wrapper__bottom,
        .gjs-frame-wrapper__left {
          background-color: #8b5cf6 !important;
        }
        [class*="gjs-frame-wrapper__"] {
          background-color: #8b5cf6 !important;
        }
        .gjs-resizer-h {
          background-color: #8b5cf6 !important;
          border-color: #8b5cf6 !important;
        }
        .gjs-resizer-h-tl, .gjs-resizer-h-tr, .gjs-resizer-h-bl, .gjs-resizer-h-br,
        .gjs-resizer-h-tc, .gjs-resizer-h-bc, .gjs-resizer-h-cl, .gjs-resizer-h-cr {
          background-color: #8b5cf6 !important;
          border: none !important;
          width: 8px !important;
          height: 8px !important;
        }
      `;
      document.head.appendChild(styleElement);

      editor.on("load", () => {
        applyPageSettings(editor, latestPageSettings.current, latestInfiniteMode.current);

        // Initialize z-index for backward compatibility with templates that don't have z-index set
        initializeAllZIndexes(editor);

        const applyExternalCssWithRetry = (retries = 5) => {
          const success = applyExternalCssToCanvas(editor, latestExternalCss.current, externalCssId.current);
          if (!success && retries > 0) {
            setTimeout(() => applyExternalCssWithRetry(retries - 1), 50);
          }
        };
        applyExternalCssWithRetry();

        injectImageOutlineStyles(editor);
        injectTableHandleStyles(editor);
        const barcodeComponents = editor.getWrapper()?.find?.('.gjs-barcode') || [];
        barcodeComponents.forEach((comp: any) => renderBarcodeComponent(comp));

        const applyCanvasBodyStyles = (retries = 5) => {
          const frame = editor?.Canvas?.getFrameEl?.();
          const doc = frame?.contentDocument;
          if (doc?.body) {
            doc.body.style.backgroundColor = '#e8e8e8';
            doc.body.style.paddingTop = '20px';
            doc.body.style.paddingBottom = '20px';

            let fixStyle = doc.getElementById('gjs-wrapper-height-fix');
            if (!fixStyle) {
              fixStyle = doc.createElement('style');
              fixStyle.id = 'gjs-wrapper-height-fix';
              fixStyle.textContent = `
                [data-gjs-type="wrapper"] {
                  min-height: unset !important;
                }
              `;
              doc.head.appendChild(fixStyle);
            }
          } else if (retries > 0) {
            setTimeout(() => applyCanvasBodyStyles(retries - 1), 50);
          }
        };
        applyCanvasBodyStyles();

        // Setup priority drag for selected component (drag parent even when clicking on child)
        cleanupDragPriority = setupSelectedComponentDragPriority(editor);
      });

      // Setup Escape key handler for cell edit mode
      const escapeResult = setupEscapeKeyHandler(editor, selectionState, ensureTableDraggableFn);
      canvasDoc = escapeResult.canvasDoc;
      handleEscapeKey = escapeResult.handleEscapeKey;

      editorInstance.current = editor;
    } catch (error) {
      console.error("Error initializing GrapesJS:", error);
    }

    return () => {
      if (editorInstance.current) {
        try {
          cleanupEscapeKeyHandler(canvasDoc, handleEscapeKey);

          if (cleanupBlockDrag) {
            cleanupBlockDrag();
            cleanupBlockDrag = null;
          }

          if (cleanupShiftTracking) {
            cleanupShiftTracking();
            cleanupShiftTracking = null;
          }

          if (dragPointerCleanupRef.current) {
            dragPointerCleanupRef.current();
            dragPointerCleanupRef.current = null;
          }

          if (cleanupDragPriority) {
            cleanupDragPriority();
            cleanupDragPriority = null;
          }

          editorInstance.current.destroy();
        } catch (error) {
          console.error("Error destroying GrapesJS:", error);
        }
        editorInstance.current = null;
        hasLoadedInitialContent.current = false;
      }
    };
  }, []);

  useEffect(() => {
    latestPageSettings.current = resolvedPageSettings;
    if (editorInstance.current) {
      applyPageSettings(editorInstance.current, resolvedPageSettings, latestInfiniteMode.current);
    }
  }, [resolvedPageSettings]);

  useEffect(() => {
    latestExternalCss.current = externalCss || "";
    if (editorInstance.current) {
      applyExternalCssToCanvas(editorInstance.current, latestExternalCss.current, externalCssId.current);
    }
  }, [externalCss]);

  useEffect(() => {
    if (!editorInstance.current || isUpdatingFromEditor.current) return;

    try {
      const editor = editorInstance.current;
      const wrapper = editor.getWrapper();
      const components = wrapper.components();
      const wrapperIsEmpty = components.length === 0;

      initLog.log('useEffect triggered', { hasEditor: true, isUpdating: false, wrapperIsEmpty, htmlContent: htmlContent ? 'exists' : 'empty', hasLoaded: hasLoadedInitialContent.current });

      if (!wrapperIsEmpty) {
        initLog.log('Wrapper already has content, skipping');
        return;
      }

      if (htmlContent) {
        initLog.log('Loading existing HTML content');
        editor.setComponents(preprocessHtml(htmlContent));

        if (cssContent) {
          editor.setStyle(cssContent);
        }
      } else {
        initLog.log('Creating default container');
        const container = wrapper.append({
          type: 'section',
        })[0];

        if (container) {
          initLog.log('Container created, applying styles');
          const styles: Record<string, string> = {
            'position': 'relative',
            'width': '100%',
            'height': '200px',
            'padding-top': '20px',
            'padding-right': '20px',
            'padding-bottom': '20px',
            'padding-left': '20px',
            'box-sizing': 'border-box',
            'margin-left': '0',
            'margin-right': '0',
          };

          container.set('resizable', {
            tl: 0, tc: 0, tr: 0, cl: 0, cr: 0, bl: 0, bc: 1, br: 0,
          });

          if (!latestInfiniteMode.current) {
            container.set('draggable', false);
          }

          container.addStyle(styles);

          updateFixedModeSectionFlex(editor, latestInfiniteMode.current);
          initLog.log('Styles applied, current style:', container.getStyle());
        } else {
          initLog.warn('Container is null!');
        }
      }

      requestAnimationFrame(() => {
        if (editorInstance.current) {
          const ed = editorInstance.current;
          ensureSectionOrder(ed);
          updateFirstSectionPosition(ed, latestInfiniteMode.current);

          const wr = ed.getWrapper?.();
          if (wr) {
            const containers = wr.components?.().filter?.((comp: any) => {
              const type = comp.get?.('type');
              const classStr = String(comp.get?.('attributes')?.class || '');
              return type === 'section' || classStr.includes('pdf-container');
            }) || [];
            containers.forEach((container: any) => {
              container.set('resizable', {
                tl: 0, tc: 0, tr: 0, cl: 0, cr: 0, bl: 0, bc: 1, br: 0,
              });

              if (latestInfiniteMode.current) {
                container.set('draggable', '[data-gjs-type="wrapper"]');
                container.removeStyle('flex-grow');
                container.removeStyle('flex-shrink');
                container.removeStyle('min-height');
              } else {
                container.set('draggable', false);
              }
            });

            updateFixedModeSectionFlex(ed, latestInfiniteMode.current);
          }

          if (latestInfiniteMode.current) {
            updateInfiniteModeHeight(ed);
          }
        }
      });

      hasLoadedInitialContent.current = true;
    } catch (error) {
      console.error("Error loading initial content:", error);
    }
  }, [htmlContent, cssContent]);

  // Placement mode refs
  const placementRefs: PlacementModeRefs = {
    editorInstance,
    placementTypeRef,
    placementCleanupRef,
  };

  // Cancel placement mode
  const cancelPlacementFn = useCallback(() => {
    cancelPlacement(placementRefs, setIsPlacementActive);
  }, []);

  // Place element at position
  const placeElementAtFn = useCallback((x: number, y: number) => {
    placeElementAt(placementRefs, x, y, cancelPlacementFn);
  }, [cancelPlacementFn]);

  // Start placement mode
  const startPlacementFn = useCallback((type: ElementType) => {
    startPlacement(placementRefs, type, setIsPlacementActive, cancelPlacementFn, placeElementAtFn);
  }, [cancelPlacementFn, placeElementAtFn]);

  return { editorRef, editor, isPlacementActive, isRTEActive, startPlacement: startPlacementFn, cancelPlacement: cancelPlacementFn };
};
