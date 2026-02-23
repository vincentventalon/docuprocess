/**
 * Complete table handling: cell editing, selection, drag, style sectors
 */

import {
  addTableResizeHandles,
  removeTableResizeHandles,
  toggleTableButtonsVisibility,
} from "./table-column-row-handles";
import {
  findPaddingControls,
  refreshPaddingControls,
} from "./padding-toggle-property";
import {
  findBorderToggleControls,
  refreshBorderToggleControls,
} from "./border-toggle-property";
import {
  findCellBorderToggleControls,
  refreshCellBorderToggleControls,
} from "./cell-border-toggle-property";

export interface CellEditModeState {
  cellComponent: any;
  tableComponent: any;
  originalContent: string;
}

export const TABLE_HANDLE_SELECTOR = '.gjs-table-resize-handle, .gjs-table-resize-handle-column, .gjs-table-resize-handle-row, .gjs-table-add-button, .gjs-table-delete-button';

/**
 * Restore draggable attribute chain up to body
 */
const restoreDraggableChain = (el?: HTMLElement | null) => {
  let current = el;
  while (current && current.tagName !== 'BODY') {
    current.draggable = true;
    current = current.parentElement;
  }
};

/**
 * Reset text editing state for a component
 */
const resetTextEditingState = (component: any, editor: any) => {
  if (!component) return;
  const view = component?.view || component?.getView?.();
  if (view?.disableEditing) {
    Promise.resolve(view.disableEditing({})).catch((err) => {
      console.warn('[CELL EDIT] Failed to disable GrapesJS RTE', err);
    });
  }
  restoreDraggableChain(component?.getEl?.());
  editor.getModel()?.setEditing(false);
};

/**
 * Enter cell edit mode: make cell selectable and activate text editing
 */
export const enterCellEditMode = (
  editor: any,
  cellComponent: any,
  cellEl: HTMLElement,
  onStateChange: (state: CellEditModeState | null) => void
): void => {
  if (!cellComponent || !cellEl) return;

  const tableComponent = cellComponent.closestType?.('table');
  if (!tableComponent) {
    console.warn('[CELL EDIT] No parent table found');
    return;
  }

  const originalContent = cellComponent.get('content') || '';

  // Make cell temporarily selectable
  cellComponent.set('selectable', true);
  cellComponent.set('editable', true);

  editor.select(cellComponent);

  const state: CellEditModeState = { cellComponent, tableComponent, originalContent };
  onStateChange(state);

  // Simple visual feedback
  cellEl.style.outline = '2px solid #8b5cf6';
  cellEl.style.backgroundColor = 'rgba(139, 92, 246, 0.05)';

  // Activate native GrapesJS RTE for this cell
  const view = cellComponent.view || cellComponent.getView?.();
  if (view?.onActive) {
    view.onActive({ stopPropagation() {}, preventDefault() {} } as any);
  } else {
    // Fallback focus if view not available
    setTimeout(() => {
      cellEl.setAttribute('contenteditable', 'true');
      cellEl.focus();
    }, 0);
  }
};

/**
 * Exit cell edit mode: restore cell to non-selectable state and re-select table
 */
export const exitCellEditMode = (
  editor: any,
  cellEditMode: CellEditModeState | null,
  onStateChange: (state: CellEditModeState | null) => void,
  ensureTableDraggableFn: (tableComponent: any) => void
): void => {
  if (!cellEditMode) return;

  const { cellComponent, tableComponent } = cellEditMode;

  // Clean up DOM
  const cellEl = cellComponent.getEl?.();
  if (cellEl) {
    cellEl.removeAttribute('contenteditable');
    cellEl.style.outline = '';
    // Read the current background color from the GrapesJS model (not the saved original)
    // This preserves any background color set while in edit mode
    const modelStyle = cellComponent.getStyle?.() || {};
    const modelBgColor = modelStyle['background-color'] || '';
    cellEl.style.backgroundColor = modelBgColor;
  }

  // Restore non-selectable state
  cellComponent.set('selectable', false);
  cellComponent.set('editable', false);
  resetTextEditingState(cellComponent, editor);
  resetTextEditingState(tableComponent, editor);

  // Re-select table
  if (tableComponent) {
    editor.select(tableComponent);
    ensureTableDraggableFn(tableComponent);
  }

  onStateChange(null);
};

/**
 * Attach double-click listeners to table cells
 */
export const attachCellDoubleClickListeners = (
  tableComponent: any,
  enterEditModeFn: (cellComponent: any, cellEl: HTMLElement) => void
): void => {
  const tableEl = tableComponent.getEl?.();
  if (!tableEl) return;

  const cells = tableEl.querySelectorAll('td, th');

  cells.forEach((cellEl: HTMLElement) => {
    // Remove existing listener if present (avoid duplicates)
    const oldListener = (cellEl as any)._gjsDoubleClickListener;
    if (oldListener) {
      cellEl.removeEventListener('dblclick', oldListener);
      cellEl.removeEventListener('dblclick', oldListener, true);
    }

    const doubleClickListener = (e: MouseEvent) => {
      // Prevent default GrapesJS handler from entering RTE mode
      e.stopImmediatePropagation();
      e.stopPropagation();
      e.preventDefault();

      // Find the GrapesJS component for this cell
      const cellComponent = tableComponent
        .find('td, th')
        .find((comp: any) => comp.getEl() === cellEl);

      if (cellComponent) {
        enterEditModeFn(cellComponent, cellEl);
      }
    };

    cellEl.addEventListener('dblclick', doubleClickListener, { capture: true });
    // Store listener for future cleanup
    (cellEl as any)._gjsDoubleClickListener = doubleClickListener;
  });
};

/**
 * Ensure table component is draggable
 */
export const ensureTableDraggable = (tableComponent: any, editor: any): void => {
  if (!tableComponent) return;
  tableComponent.set('draggable', true);
  tableComponent.set('status', 'selected');
  const tableEl = tableComponent.getEl?.();
  if (tableEl) {
    tableEl.draggable = true;
  }
  const em = editor.getModel?.();
  em?.setEditing?.(false);
  em?.set?.('_cmpDrag');
};

/**
 * Setup table drag starter for mousedown events
 */
export const setupTableDragStarter = (
  tableComponent: any,
  editor: any,
  cellEditModeGetter: () => CellEditModeState | null,
  dragMouseDownMap: WeakMap<any, (e: MouseEvent) => void>
): void => {
  const tableEl = tableComponent.getEl?.();
  if (!tableEl || dragMouseDownMap.get(tableComponent)) return;

  const handleTableMouseDown = (e: MouseEvent) => {
    if (cellEditModeGetter()) return;
    if (e.button !== 0) return;
    const target = e.target as HTMLElement | null;
    if (target?.closest?.(TABLE_HANDLE_SELECTOR)) return;

    const startX = e.clientX;
    const startY = e.clientY;
    let started = false;

    const cleanup = () => {
      tableEl.removeEventListener('mousemove', onMove, true);
      tableEl.removeEventListener('mouseup', onUp, true);
      tableEl.removeEventListener('mouseleave', onUp, true);
    };

    const onMove = (moveEvt: MouseEvent) => {
      const dx = Math.abs(moveEvt.clientX - startX);
      const dy = Math.abs(moveEvt.clientY - startY);
      if (!started && dx + dy > 3) {
        started = true;
        moveEvt.stopPropagation();
        moveEvt.preventDefault();
        editor.runCommand('tlb-move', { target: tableComponent, event: moveEvt });
        cleanup();
      }
    };

    const onUp = () => {
      cleanup();
    };

    tableEl.addEventListener('mousemove', onMove, true);
    tableEl.addEventListener('mouseup', onUp, true);
    tableEl.addEventListener('mouseleave', onUp, true);
  };

  tableEl.addEventListener('mousedown', handleTableMouseDown, true);
  dragMouseDownMap.set(tableComponent, handleTableMouseDown);
};

/**
 * Setup table style sectors - toggle between decorations and table-specific sectors
 */
export const setupTableStyleSectors = (styleManager: any, isTable: boolean, selected: any): void => {
  if (isTable) {
    // Hide Decorations, show Table Decoration and Cell Decoration
    styleManager.removeSector('decorations');

    // Add Table Decoration sector if not already present
    if (!styleManager.getSector('table-decoration')) {
      (styleManager as any).addSector('table-decoration', {
        name: 'Table Decoration',
        open: true,
        properties: [
          {
            property: 'border-radius',
            type: 'number',
            units: ['px'],
            default: '0',
            min: 0,
          },
          {
            type: 'border-toggle',
            property: 'border',
            label: 'Table Border',
            full: true,
          },
          'background-color',
        ],
      });
    }

    // Add Cell Decoration sector if not already present
    if (!styleManager.getSector('cell-decoration')) {
      (styleManager as any).addSector('cell-decoration', {
        name: 'Cell Decoration',
        open: true,
        properties: [
          {
            type: 'cell-border-toggle',
            property: 'cell-border',
            label: 'Cell Borders',
            full: true,
          },
        ],
      });
    }

    // Refresh controls after sectors are added
    setTimeout(() => {
      const tableDecorationSector = styleManager.getSector('table-decoration');
      const cellDecorationSector = styleManager.getSector('cell-decoration');

      // Refresh table border controls
      if (tableDecorationSector) {
        const tableBorderProperty = tableDecorationSector.getProperties().find((p: any) => p.get('property') === 'border') as any;
        if (tableBorderProperty?.view) {
          const controls = findBorderToggleControls(tableBorderProperty.view.el);
          if (controls && selected) {
            refreshBorderToggleControls(controls, selected, tableBorderProperty);
          }
        }
      }

      // Refresh cell border controls
      if (cellDecorationSector) {
        const cellBorderProperty = cellDecorationSector.getProperties().find((p: any) => p.get('property') === 'cell-border') as any;
        if (cellBorderProperty?.view) {
          const controls = findCellBorderToggleControls(cellBorderProperty.view.el);
          if (controls && selected) {
            refreshCellBorderToggleControls(controls, selected, cellBorderProperty);
          }
        }
      }
    }, 50);
  } else {
    // Show Decorations, hide Table Decoration and Cell Decoration
    styleManager.removeSector('table-decoration');
    styleManager.removeSector('cell-decoration');

    // Re-add Decorations sector if it was removed
    if (!styleManager.getSector('decorations')) {
      (styleManager as any).addSector('decorations', {
        name: 'Decorations',
        open: true,
        properties: [
          {
            property: 'border-radius',
            type: 'number',
            units: ['px'],
            default: '0',
            min: 0,
          },
          {
            type: 'border-toggle',
            property: 'border',
            label: 'Border',
            full: true,
          },
          'background-color',
        ],
      });
    }
  }
};

/**
 * Handle table selected - setup handles, drag starter, toolbar, and cell listeners
 */
export const handleTableSelected = (
  component: any,
  editor: any,
  cellEditModeGetter: () => CellEditModeState | null,
  enterEditModeFn: (cellComponent: any, cellEl: HTMLElement) => void,
  dragMouseDownMap: WeakMap<any, (e: MouseEvent) => void>
): void => {
  ensureTableDraggable(component, editor);
  addTableResizeHandles(component, editor);

  // Setup drag starter
  setupTableDragStarter(component, editor, cellEditModeGetter, dragMouseDownMap);

  // Add toggle button to toolbar when table is selected (at the end)
  const toolbar = component.get('toolbar');
  const hasToggle = toolbar?.some((btn: any) => btn.attributes?.title === 'Toggle add/remove buttons');

  if (!hasToggle) {
    component.set('toolbar', [
      ...(toolbar || []),
      {
        attributes: { class: 'fa fa-plus-square', title: 'Toggle add/remove buttons' },
        command: (ed: any) => {
          toggleTableButtonsVisibility(ed);
        },
      },
    ]);
  }

  // Attach double-click listeners to cells
  attachCellDoubleClickListeners(component, enterEditModeFn);
};

/**
 * Handle table deselected - cleanup handles and drag starter
 */
export const handleTableDeselected = (
  component: any,
  dragMouseDownMap: WeakMap<any, (e: MouseEvent) => void>
): void => {
  removeTableResizeHandles(component);
  const dragHandler = dragMouseDownMap.get(component);
  const elForCleanup = component.getEl?.();
  if (dragHandler && elForCleanup) {
    elForCleanup.removeEventListener('mousedown', dragHandler, true);
  }
  dragMouseDownMap.delete(component);
};

/**
 * Refresh style manager controls for padding and border
 */
export const refreshStyleManagerControls = (
  styleManager: any,
  selected: any
): void => {
  // Refresh padding controls
  setTimeout(() => {
    const dimensionSector = styleManager.getSectors().find((s: any) => s.get('name') === 'Dimension');
    if (dimensionSector) {
      const paddingProperty = dimensionSector.getProperties().find((p: any) => p.get('property') === 'padding') as any;
      if (paddingProperty?.view) {
        const controls = findPaddingControls(paddingProperty.view.el);
        if (controls && selected) {
          refreshPaddingControls(controls, selected, paddingProperty);
        }
      }
    }
  }, 0);

  // Refresh border toggle controls
  setTimeout(() => {
    const decorationsSector = styleManager.getSectors().find((s: any) => s.get('name') === 'Decorations');
    if (decorationsSector) {
      const borderProperty = decorationsSector.getProperties().find((p: any) => p.get('property') === 'border') as any;
      if (borderProperty?.view) {
        const controls = findBorderToggleControls(borderProperty.view.el);
        if (controls && selected) {
          refreshBorderToggleControls(controls, selected, borderProperty);
        }
      }
    }
  }, 0);
};
