/**
 * Table Column & Row Resize Handles
 *
 * This module creates custom resize handles between table columns and rows.
 * When a table is selected, handles appear allowing users to:
 * - Resize columns (Excel-style: left col grows, right col shrinks, total width constant)
 * - Resize rows (each row has independent height, total height variable)
 */

import { tableLog } from './debug';

const HANDLE_CLASS = 'gjs-table-resize-handle';
const COLUMN_HANDLE_CLASS = 'gjs-table-resize-handle-column';
const ROW_HANDLE_CLASS = 'gjs-table-resize-handle-row';
const ADD_BUTTON_CLASS = 'gjs-table-add-button';
const DELETE_BUTTON_CLASS = 'gjs-table-delete-button';
const HANDLE_SIZE = 8; // px - clickable area size
const BUTTON_SIZE = 20; // px - add/delete button size
const MIN_COLUMN_WIDTH = 1; // px - minimal constraint for safety
const MIN_ROW_HEIGHT = 1; // px - minimal constraint for safety

interface HandleState {
  isDragging: boolean;
  startX: number;
  startY: number;
  leftColumnIndex?: number;
  topRowIndex?: number;
  startLeftWidth?: number;
  startRightWidth?: number;
  startTopHeight?: number;
  startBottomHeight?: number;
}

// Store active handles per table
const activeHandles = new WeakMap<any, HTMLElement[]>();
// Store style change handlers per table (for cleanup)
const styleChangeHandlers = new WeakMap<any, () => void>();
// Store last known table height per table (to detect external changes)
const lastTableHeights = new WeakMap<any, number>();

const handleState: HandleState = {
  isDragging: false,
  startX: 0,
  startY: 0,
};

// Global state for button visibility
let areButtonsVisible = false;

/**
 * Injects CSS styles for table resize handles into the canvas
 */
export function injectTableHandleStyles(editor: any): void {
  const frame = editor?.Canvas?.getFrameEl?.();
  const doc = frame?.contentDocument || document;

  const styleId = 'gjs-table-resize-handle-styles';
  if (doc.getElementById(styleId)) return; // Already injected

  const style = doc.createElement('style');
  style.id = styleId;
  style.textContent = `
    .${HANDLE_CLASS} {
      position: absolute;
      background-color: #8b5cf6;
      opacity: 0;
      transition: opacity 0.2s;
      z-index: 1000;
      pointer-events: all;
    }

    .${COLUMN_HANDLE_CLASS} {
      width: ${HANDLE_SIZE}px;
      height: 100%;
      top: 0;
      cursor: col-resize;
      transform: translateX(-${HANDLE_SIZE / 2}px);
    }

    .${ROW_HANDLE_CLASS} {
      width: 100%;
      height: ${HANDLE_SIZE}px;
      left: 0;
      cursor: row-resize;
      transform: translateY(-${HANDLE_SIZE / 2}px);
    }

    .${HANDLE_CLASS}:hover,
    .${HANDLE_CLASS}.active {
      opacity: 0.5;
    }

    .${ADD_BUTTON_CLASS}, .${DELETE_BUTTON_CLASS} {
      position: absolute;
      width: ${BUTTON_SIZE}px;
      height: ${BUTTON_SIZE}px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: bold;
      cursor: pointer;
      z-index: 1001;
      opacity: 0;
      transition: opacity 0.2s, background-color 0.2s;
      pointer-events: all;
      color: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }

    .${ADD_BUTTON_CLASS}.visible, .${DELETE_BUTTON_CLASS}.visible {
      opacity: 0.7;
    }

    .${ADD_BUTTON_CLASS} {
      background-color: #10b981;
    }

    .${ADD_BUTTON_CLASS}:hover {
      background-color: #059669;
      opacity: 1 !important;
    }

    .${DELETE_BUTTON_CLASS} {
      background-color: #ef4444;
    }

    .${DELETE_BUTTON_CLASS}:hover {
      background-color: #dc2626;
      opacity: 1 !important;
    }

  `;

  doc.head.appendChild(style);
}

/**
 * Creates column resize handles for a table
 */
function createColumnHandles(component: any, tableEl: HTMLElement, doc: Document): HTMLElement[] {
  const handles: HTMLElement[] = [];

  // Find first row to get column positions
  const firstRow = tableEl.querySelector('tr');
  if (!firstRow) return handles;

  const cells = Array.from(firstRow.querySelectorAll('td, th'));

  // Create a handle between each pair of adjacent columns
  for (let i = 0; i < cells.length - 1; i++) {
    const leftCell = cells[i] as HTMLElement;

    const handle = doc.createElement('div');
    handle.className = `${HANDLE_CLASS} ${COLUMN_HANDLE_CLASS}`;
    handle.dataset.leftColumnIndex = String(i);
    handle.dataset.rightColumnIndex = String(i + 1);

    // Position handle at the border between cells
    const leftRect = leftCell.getBoundingClientRect();
    const tableRect = tableEl.getBoundingClientRect();
    const relativeLeft = leftRect.right - tableRect.left;

    handle.style.left = `${relativeLeft}px`;

    // Add event listeners
    handle.addEventListener('mousedown', (e) => handleColumnMouseDown(e, component, i));

    tableEl.appendChild(handle);
    handles.push(handle);
  }

  return handles;
}

/**
 * Creates row resize handles for a table
 * Includes handles between rows AND a handle below the last row
 */
function createRowHandles(component: any, tableEl: HTMLElement, doc: Document): HTMLElement[] {
  const handles: HTMLElement[] = [];

  const rows = Array.from(tableEl.querySelectorAll('tr'));

  // Create a handle between each pair of adjacent rows
  for (let i = 0; i < rows.length - 1; i++) {
    const topRow = rows[i] as HTMLElement;

    const handle = doc.createElement('div');
    handle.className = `${HANDLE_CLASS} ${ROW_HANDLE_CLASS}`;
    handle.dataset.topRowIndex = String(i);
    handle.dataset.bottomRowIndex = String(i + 1);

    // Position handle at the border between rows
    const topRect = topRow.getBoundingClientRect();
    const tableRect = tableEl.getBoundingClientRect();
    const relativeTop = topRect.bottom - tableRect.top;

    handle.style.top = `${relativeTop}px`;

    // Add event listeners - redistribute % between adjacent rows
    handle.addEventListener('mousedown', (e) => handleRowMouseDown(e, component, i));

    tableEl.appendChild(handle);
    handles.push(handle);
  }

  // Handle below the last row - resizes the table height
  if (rows.length > 0) {
    const lastRow = rows[rows.length - 1] as HTMLElement;

    const handle = doc.createElement('div');
    handle.className = `${HANDLE_CLASS} ${ROW_HANDLE_CLASS}`;
    handle.dataset.topRowIndex = String(rows.length - 1);
    handle.dataset.isLastRowHandle = 'true';

    const lastRect = lastRow.getBoundingClientRect();
    const tableRect = tableEl.getBoundingClientRect();
    const relativeTop = lastRect.bottom - tableRect.top;

    handle.style.top = `${relativeTop}px`;

    // Last row handle resizes the table height
    handle.addEventListener('mousedown', (e) => handleLastRowMouseDown(e, component));

    tableEl.appendChild(handle);
    handles.push(handle);
  }

  return handles;
}

/**
 * Handle mousedown on column resize handle
 */
function handleColumnMouseDown(e: MouseEvent, component: any, leftColumnIndex: number): void {
  e.preventDefault();
  e.stopPropagation();

  // Force la sélection de la table pendant le resize
  const editor = (window as any).editor;
  if (editor) {
    editor.select(component);
  }

  const handle = e.target as HTMLElement;
  handle.classList.add('active');

  // Get all rows
  const tableEl = component.getEl();
  const rows = Array.from(tableEl.querySelectorAll('tr')) as HTMLElement[];

  // Get cells in first row to measure widths
  const firstRowCells = Array.from(rows[0].querySelectorAll('td, th')) as HTMLElement[];
  const leftCell = firstRowCells[leftColumnIndex];
  const rightCell = firstRowCells[leftColumnIndex + 1];

  handleState.isDragging = true;
  handleState.startX = e.clientX;
  handleState.leftColumnIndex = leftColumnIndex;
  handleState.startLeftWidth = leftCell.offsetWidth;
  handleState.startRightWidth = rightCell.offsetWidth;

  tableLog.log('Column resize start:', { leftColumnIndex, startLeftWidth: handleState.startLeftWidth, startRightWidth: handleState.startRightWidth });

  const handleMouseMove = (e: MouseEvent) => {
    if (!handleState.isDragging) return;

    const deltaX = e.clientX - handleState.startX;
    const newLeftWidth = handleState.startLeftWidth! + deltaX;
    const newRightWidth = handleState.startRightWidth! - deltaX;

    // Enforce minimum widths
    if (newLeftWidth < MIN_COLUMN_WIDTH || newRightWidth < MIN_COLUMN_WIDTH) {
      return;
    }

    tableLog.log('Column resize update:', { deltaX, newLeftWidth, newRightWidth });

    // Apply new widths as px to all rows
    rows.forEach((row) => {
      const cells = Array.from(row.querySelectorAll('td, th'));
      const leftCell = cells[leftColumnIndex];
      const rightCell = cells[leftColumnIndex + 1];

      if (leftCell && rightCell) {
        const leftComp = getComponentFromElement(component, leftCell);
        const rightComp = getComponentFromElement(component, rightCell);

        if (leftComp && rightComp) {
          leftComp.addStyle({ width: `${newLeftWidth.toFixed(2)}px` });
          rightComp.addStyle({ width: `${newRightWidth.toFixed(2)}px` });
        }
      }
    });

    // Update handle position
    const tableRect = tableEl.getBoundingClientRect();
    const firstRowLeftCell = firstRowCells[leftColumnIndex];
    const newLeftRect = firstRowLeftCell.getBoundingClientRect();
    const relativeLeft = newLeftRect.right - tableRect.left;
    handle.style.left = `${relativeLeft}px`;
  };

  const handleMouseUp = () => {
    handleState.isDragging = false;
    handle.classList.remove('active');
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);

    tableLog.log('Column resize end');
  };

  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
}

/**
 * Handle mousedown on row resize handle (between two rows)
 * Redistributes height percentages between adjacent rows (like columns)
 */
function handleRowMouseDown(e: MouseEvent, component: any, topRowIndex: number): void {
  e.preventDefault();
  e.stopPropagation();

  // Force la sélection de la table pendant le resize
  const editor = (window as any).editor;
  if (editor) {
    editor.select(component);
  }

  const handle = e.target as HTMLElement;
  handle.classList.add('active');

  const tableEl = component.getEl();
  const rows = Array.from(tableEl.querySelectorAll('tr'));
  const topRow = rows[topRowIndex] as HTMLElement;
  const bottomRow = rows[topRowIndex + 1] as HTMLElement;

  const tableHeight = tableEl.offsetHeight;

  handleState.isDragging = true;
  handleState.startY = e.clientY;
  handleState.topRowIndex = topRowIndex;
  handleState.startTopHeight = topRow.offsetHeight;
  handleState.startBottomHeight = bottomRow.offsetHeight;

  tableLog.log('Row resize start:', {
    topRowIndex,
    startTopHeight: handleState.startTopHeight,
    startBottomHeight: handleState.startBottomHeight,
    tableHeight
  });

  const handleMouseMove = (e: MouseEvent) => {
    if (!handleState.isDragging) return;

    const deltaY = e.clientY - handleState.startY;
    const newTopHeight = handleState.startTopHeight! + deltaY;
    const newBottomHeight = handleState.startBottomHeight! - deltaY;

    // Enforce minimum heights
    if (newTopHeight < MIN_ROW_HEIGHT || newBottomHeight < MIN_ROW_HEIGHT) {
      return;
    }

    tableLog.log('Row resize update:', {
      deltaY,
      newTopHeight: newTopHeight.toFixed(2),
      newBottomHeight: newBottomHeight.toFixed(2)
    });

    // Apply new heights as pixels (not percentages)
    const topRowComp = getComponentFromElement(component, topRow);
    const bottomRowComp = getComponentFromElement(component, bottomRow);

    if (topRowComp) {
      const topHeightPx = `${newTopHeight.toFixed(2)}px`;
      topRowComp.addStyle({ height: topHeightPx });
      // Also set height on cells so images with height: 100% are constrained
      const topCells = topRowComp.find('td, th');
      topCells.forEach((cell: any) => cell.addStyle({ height: topHeightPx }));
    }
    if (bottomRowComp) {
      const bottomHeightPx = `${newBottomHeight.toFixed(2)}px`;
      bottomRowComp.addStyle({ height: bottomHeightPx });
      // Also set height on cells so images with height: 100% are constrained
      const bottomCells = bottomRowComp.find('td, th');
      bottomCells.forEach((cell: any) => cell.addStyle({ height: bottomHeightPx }));
    }

    // Update handle position
    const tableRect = tableEl.getBoundingClientRect();
    const topRowRect = topRow.getBoundingClientRect();
    const relativeTop = topRowRect.bottom - tableRect.top;
    handle.style.top = `${relativeTop}px`;
  };

  const handleMouseUp = () => {
    handleState.isDragging = false;
    handle.classList.remove('active');
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);

    tableLog.log('Row resize end');
  };

  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
}

/**
 * Handle mousedown on the last row handle
 * Resizes the table height and recalculates row heights proportionally in px
 */
function handleLastRowMouseDown(e: MouseEvent, component: any): void {
  e.preventDefault();
  e.stopPropagation();

  const editor = (window as any).editor;
  if (editor) {
    editor.select(component);
  }

  const handle = e.target as HTMLElement;
  handle.classList.add('active');

  const tableEl = component.getEl();
  const rows = Array.from(tableEl.querySelectorAll('tr')) as HTMLElement[];

  // Capture initial row heights in px
  const initialRowHeights = rows.map(row => row.offsetHeight);
  const oldTableHeight = tableEl.offsetHeight;

  handleState.isDragging = true;
  handleState.startY = e.clientY;
  handleState.startTopHeight = oldTableHeight;

  tableLog.log('Last row resize start:', { tableHeight: handleState.startTopHeight, initialRowHeights });

  const handleMouseMove = (e: MouseEvent) => {
    if (!handleState.isDragging) return;

    const deltaY = e.clientY - handleState.startY;
    const newTableHeight = handleState.startTopHeight! + deltaY;

    // Enforce minimum table height (at least MIN_ROW_HEIGHT per row)
    const minTableHeight = rows.length * MIN_ROW_HEIGHT;
    if (newTableHeight < minTableHeight) {
      return;
    }

    tableLog.log('Last row resize update:', { deltaY, newTableHeight });

    // Change table height
    component.addStyle({ height: `${newTableHeight}px` });

    // Recalculate each row height proportionally in px
    const ratio = newTableHeight / oldTableHeight;
    rows.forEach((row, i) => {
      const rowComp = getComponentFromElement(component, row);
      if (rowComp) {
        const newRowHeight = initialRowHeights[i] * ratio;
        const heightPx = `${newRowHeight.toFixed(2)}px`;
        rowComp.addStyle({ height: heightPx });
        // Also set height on cells so images with height: 100% are constrained
        const cells = rowComp.find('td, th');
        cells.forEach((cell: any) => cell.addStyle({ height: heightPx }));
      }
    });

    // Update handle position
    const tableRect = tableEl.getBoundingClientRect();
    handle.style.top = `${tableRect.height}px`;
  };

  const handleMouseUp = () => {
    handleState.isDragging = false;
    handle.classList.remove('active');
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);

    // Refresh handles to update positions
    if (editor) {
      setTimeout(() => addTableResizeHandles(component, editor), 50);
    }

    tableLog.log('Last row resize end');
  };

  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
}

/**
 * Helper: Get GrapesJS component from DOM element
 */
function getComponentFromElement(tableComponent: any, element: Element): any {
  // Find the component that matches this DOM element
  const allComponents = tableComponent.find('td, th, tr');
  return allComponents.find((comp: any) => comp.getEl() === element);
}

/**
 * Creates add/delete buttons for columns
 */
function createColumnButtons(component: any, tableEl: HTMLElement, doc: Document): HTMLElement[] {
  const buttons: HTMLElement[] = [];
  const firstRow = tableEl.querySelector('tr');
  if (!firstRow) return buttons;

  const cells = Array.from(firstRow.querySelectorAll('td, th'));
  const tableRect = tableEl.getBoundingClientRect();

  cells.forEach((cell, index) => {
    const cellEl = cell as HTMLElement;
    const cellRect = cellEl.getBoundingClientRect();

    // Add button - left side of column
    const addLeft = doc.createElement('div');
    addLeft.className = `${ADD_BUTTON_CLASS}`;
    addLeft.textContent = '+';
    addLeft.dataset.action = 'add-column-before';
    addLeft.dataset.columnIndex = String(index);
    addLeft.style.left = `${cellRect.left - tableRect.left - BUTTON_SIZE / 2}px`;
    addLeft.style.top = `${-BUTTON_SIZE - 5}px`;
    addLeft.title = 'Ajouter une colonne avant';
    if (areButtonsVisible) addLeft.classList.add('visible');
    addLeft.addEventListener('mouseenter', () => addLeft.style.opacity = '1');
    addLeft.addEventListener('mouseleave', () => {
      if (areButtonsVisible) addLeft.style.opacity = '0.7';
      else addLeft.style.opacity = '0';
    });
    addLeft.addEventListener('click', (e) => {
      e.stopPropagation();
      addColumnBefore(component, index);
    });
    tableEl.appendChild(addLeft);
    buttons.push(addLeft);

    // Add button - right side of column
    const addRight = doc.createElement('div');
    addRight.className = `${ADD_BUTTON_CLASS}`;
    addRight.textContent = '+';
    addRight.dataset.action = 'add-column-after';
    addRight.dataset.columnIndex = String(index);
    addRight.style.left = `${cellRect.right - tableRect.left - BUTTON_SIZE / 2}px`;
    addRight.style.top = `${-BUTTON_SIZE - 5}px`;
    addRight.title = 'Ajouter une colonne après';
    if (areButtonsVisible) addRight.classList.add('visible');
    addRight.addEventListener('mouseenter', () => addRight.style.opacity = '1');
    addRight.addEventListener('mouseleave', () => {
      if (areButtonsVisible) addRight.style.opacity = '0.7';
      else addRight.style.opacity = '0';
    });
    addRight.addEventListener('click', (e) => {
      e.stopPropagation();
      addColumnAfter(component, index);
    });
    tableEl.appendChild(addRight);
    buttons.push(addRight);

    // Delete button - center top of column
    const deleteBtn = doc.createElement('div');
    deleteBtn.className = `${DELETE_BUTTON_CLASS}`;
    deleteBtn.textContent = '−';
    deleteBtn.dataset.action = 'delete-column';
    deleteBtn.dataset.columnIndex = String(index);
    deleteBtn.style.left = `${cellRect.left - tableRect.left + cellRect.width / 2 - BUTTON_SIZE / 2}px`;
    deleteBtn.style.top = `${-BUTTON_SIZE - 5}px`;
    deleteBtn.title = 'Supprimer cette colonne';
    if (areButtonsVisible) deleteBtn.classList.add('visible');
    deleteBtn.addEventListener('mouseenter', () => deleteBtn.style.opacity = '1');
    deleteBtn.addEventListener('mouseleave', () => {
      if (areButtonsVisible) deleteBtn.style.opacity = '0.7';
      else deleteBtn.style.opacity = '0';
    });
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteColumn(component, index);
    });
    tableEl.appendChild(deleteBtn);
    buttons.push(deleteBtn);
  });

  return buttons;
}

/**
 * Creates add/delete buttons for rows
 */
function createRowButtons(component: any, tableEl: HTMLElement, doc: Document): HTMLElement[] {
  const buttons: HTMLElement[] = [];
  const rows = Array.from(tableEl.querySelectorAll('tr'));
  const tableRect = tableEl.getBoundingClientRect();

  rows.forEach((row, index) => {
    const rowEl = row as HTMLElement;
    const rowRect = rowEl.getBoundingClientRect();

    // Add button - top of row
    const addTop = doc.createElement('div');
    addTop.className = `${ADD_BUTTON_CLASS}`;
    addTop.textContent = '+';
    addTop.dataset.action = 'add-row-before';
    addTop.dataset.rowIndex = String(index);
    addTop.style.left = `${-BUTTON_SIZE - 5}px`;
    addTop.style.top = `${rowRect.top - tableRect.top - BUTTON_SIZE / 2}px`;
    addTop.title = 'Ajouter une ligne avant';
    if (areButtonsVisible) addTop.classList.add('visible');
    addTop.addEventListener('mouseenter', () => addTop.style.opacity = '1');
    addTop.addEventListener('mouseleave', () => {
      if (areButtonsVisible) addTop.style.opacity = '0.7';
      else addTop.style.opacity = '0';
    });
    addTop.addEventListener('click', (e) => {
      e.stopPropagation();
      addRowBefore(component, index);
    });
    tableEl.appendChild(addTop);
    buttons.push(addTop);

    // Add button - bottom of row
    const addBottom = doc.createElement('div');
    addBottom.className = `${ADD_BUTTON_CLASS}`;
    addBottom.textContent = '+';
    addBottom.dataset.action = 'add-row-after';
    addBottom.dataset.rowIndex = String(index);
    addBottom.style.left = `${-BUTTON_SIZE - 5}px`;
    addBottom.style.top = `${rowRect.bottom - tableRect.top - BUTTON_SIZE / 2}px`;
    addBottom.title = 'Ajouter une ligne après';
    if (areButtonsVisible) addBottom.classList.add('visible');
    addBottom.addEventListener('mouseenter', () => addBottom.style.opacity = '1');
    addBottom.addEventListener('mouseleave', () => {
      if (areButtonsVisible) addBottom.style.opacity = '0.7';
      else addBottom.style.opacity = '0';
    });
    addBottom.addEventListener('click', (e) => {
      e.stopPropagation();
      addRowAfter(component, index);
    });
    tableEl.appendChild(addBottom);
    buttons.push(addBottom);

    // Delete button - center left of row
    const deleteBtn = doc.createElement('div');
    deleteBtn.className = `${DELETE_BUTTON_CLASS}`;
    deleteBtn.textContent = '−';
    deleteBtn.dataset.action = 'delete-row';
    deleteBtn.dataset.rowIndex = String(index);
    deleteBtn.style.left = `${-BUTTON_SIZE - 5}px`;
    deleteBtn.style.top = `${rowRect.top - tableRect.top + rowRect.height / 2 - BUTTON_SIZE / 2}px`;
    deleteBtn.title = 'Supprimer cette ligne';
    if (areButtonsVisible) deleteBtn.classList.add('visible');
    deleteBtn.addEventListener('mouseenter', () => deleteBtn.style.opacity = '1');
    deleteBtn.addEventListener('mouseleave', () => {
      if (areButtonsVisible) deleteBtn.style.opacity = '0.7';
      else deleteBtn.style.opacity = '0';
    });
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteRow(component, index);
    });
    tableEl.appendChild(deleteBtn);
    buttons.push(deleteBtn);
  });

  return buttons;
}

/**
 * Add a column before the specified index
 * Splits the reference column's width in half for the new column
 */
function addColumnBefore(component: any, columnIndex: number): void {
  tableLog.log('Adding column before index', columnIndex);

  const rows = component.find('tr');
  const firstRow = rows[0];
  if (!firstRow) return;

  // Get reference cell to determine its current width
  const referenceCells = firstRow.find('td, th');
  const referenceCell = referenceCells[columnIndex];
  if (!referenceCell) return;

  // Get current width of reference column in px
  const refEl = referenceCell.getEl?.();
  let refWidthPx = 100; // Default fallback

  if (refEl) {
    const refStyle = referenceCell.getStyle?.();
    const widthValue = refStyle?.width || '';

    if (widthValue.endsWith('px')) {
      refWidthPx = parseFloat(widthValue);
    } else {
      // Fallback to actual rendered width
      refWidthPx = refEl.offsetWidth;
    }
  }

  // Split the width: new column gets half, reference keeps half
  const halfWidthPx = (refWidthPx / 2).toFixed(2);

  rows.forEach((row: any) => {
    const cells = row.find('td, th');
    const refCell = cells[columnIndex];

    if (refCell) {
      const newCell = refCell.clone();
      newCell.components('');
      // Set width for new column
      newCell.addStyle({ width: `${halfWidthPx}px` });
      // Update reference column width
      refCell.addStyle({ width: `${halfWidthPx}px` });
      row.append(newCell, { at: columnIndex });
    }
  });

  // Refresh handles
  const editor = (window as any).editor;
  if (editor) {
    setTimeout(() => addTableResizeHandles(component, editor), 50);
  }
}

/**
 * Add a column after the specified index
 * Splits the reference column's width in half for the new column
 */
function addColumnAfter(component: any, columnIndex: number): void {
  tableLog.log('Adding column after index', columnIndex);

  const rows = component.find('tr');
  const firstRow = rows[0];
  if (!firstRow) return;

  // Get reference cell to determine its current width
  const referenceCells = firstRow.find('td, th');
  const referenceCell = referenceCells[columnIndex];
  if (!referenceCell) return;

  // Get current width of reference column in px
  const refEl = referenceCell.getEl?.();
  let refWidthPx = 100; // Default fallback

  if (refEl) {
    const refStyle = referenceCell.getStyle?.();
    const widthValue = refStyle?.width || '';

    if (widthValue.endsWith('px')) {
      refWidthPx = parseFloat(widthValue);
    } else {
      // Fallback to actual rendered width
      refWidthPx = refEl.offsetWidth;
    }
  }

  // Split the width: reference keeps half, new column gets half
  const halfWidthPx = (refWidthPx / 2).toFixed(2);

  rows.forEach((row: any) => {
    const cells = row.find('td, th');
    const refCell = cells[columnIndex];

    if (refCell) {
      const newCell = refCell.clone();
      newCell.components('');
      // Set width for new column
      newCell.addStyle({ width: `${halfWidthPx}px` });
      // Update reference column width
      refCell.addStyle({ width: `${halfWidthPx}px` });
      row.append(newCell, { at: columnIndex + 1 });
    }
  });

  // Refresh handles
  const editor = (window as any).editor;
  if (editor) {
    setTimeout(() => addTableResizeHandles(component, editor), 50);
  }
}

/**
 * Delete the specified column
 */
function deleteColumn(component: any, columnIndex: number): void {
  tableLog.log('Deleting column at index', columnIndex);

  const rows = component.find('tr');

  // Don't allow deleting the last column
  const firstRow = rows[0];
  if (firstRow && firstRow.find('td, th').length <= 1) {
    tableLog.warn('Cannot delete last column');
    return;
  }

  rows.forEach((row: any) => {
    const cells = row.find('td, th');
    const cellToDelete = cells[columnIndex];
    if (cellToDelete) {
      cellToDelete.remove();
    }
  });

  // Refresh handles
  const editor = (window as any).editor;
  if (editor) {
    setTimeout(() => addTableResizeHandles(component, editor), 50);
  }
}

/**
 * Find all <tr> across thead + tbody (matching the global indices used by buttons),
 * and resolve which container (thead or tbody) a given row belongs to.
 */
function findAllRows(component: any): any[] {
  const allRows: any[] = [];
  const thead = component.find('thead')[0];
  const tbody = component.find('tbody')[0];
  if (thead) allRows.push(...thead.find('tr'));
  if (tbody) allRows.push(...tbody.find('tr'));
  // Fallback: direct <tr> children (no thead/tbody wrapper)
  if (allRows.length === 0) allRows.push(...component.find('tr'));
  return allRows;
}

function findRowParent(component: any, row: any): any {
  const thead = component.find('thead')[0];
  if (thead && thead.find('tr').some((r: any) => r === row)) return thead;
  const tbody = component.find('tbody')[0];
  if (tbody && tbody.find('tr').some((r: any) => r === row)) return tbody;
  return component;
}

function localRowIndex(parent: any, row: any): number {
  return parent.find('tr').indexOf(row);
}

function addRowBefore(component: any, rowIndex: number): void {
  tableLog.log('Adding row before index', rowIndex);

  const tableEl = component.getEl();
  if (!tableEl) return;

  const allRows = findAllRows(component);
  const referenceRow = allRows[rowIndex];
  if (!referenceRow) return;

  const parent = findRowParent(component, referenceRow);
  const localIdx = localRowIndex(parent, referenceRow);

  // Capture current row heights in px (all rows globally)
  const oldTableHeight = tableEl.offsetHeight;
  const rowHeights: number[] = allRows.map((row: any) => row.getEl()?.offsetHeight || 32);

  // Default height for new row
  const newRowHeight = 32;
  const newTableHeight = oldTableHeight + newRowHeight;

  // Clone and insert new row into the same container
  const newRow = referenceRow.clone();
  const cells = newRow.find('td, th');
  cells.forEach((cell: any) => cell.components(''));

  parent.append(newRow, { at: localIdx });

  // Update table height
  component.addStyle({ height: `${newTableHeight}px` });

  // Set heights in px for all rows
  rowHeights.splice(rowIndex, 0, newRowHeight);
  const updatedRows = findAllRows(component);

  updatedRows.forEach((row: any, i: number) => {
    const heightPx = `${rowHeights[i].toFixed(2)}px`;
    row.addStyle({ height: heightPx });
    const rowCells = row.find('td, th');
    rowCells.forEach((cell: any) => cell.addStyle({ height: heightPx }));
  });

  tableLog.log('Row added:', { newTableHeight, rowHeights });

  // Refresh handles
  const editor = (window as any).editor;
  if (editor) {
    setTimeout(() => addTableResizeHandles(component, editor), 50);
  }
}

/**
 * Add a row after the specified index
 * Grows the table height, new row gets fixed px height, existing rows keep their px heights
 */
function addRowAfter(component: any, rowIndex: number): void {
  tableLog.log('Adding row after index', rowIndex);

  const tableEl = component.getEl();
  if (!tableEl) return;

  const allRows = findAllRows(component);
  const referenceRow = allRows[rowIndex];
  if (!referenceRow) return;

  const parent = findRowParent(component, referenceRow);
  const localIdx = localRowIndex(parent, referenceRow);

  // Capture current row heights in px (all rows globally)
  const oldTableHeight = tableEl.offsetHeight;
  const rowHeights: number[] = allRows.map((row: any) => row.getEl()?.offsetHeight || 32);

  // Default height for new row
  const newRowHeight = 32;
  const newTableHeight = oldTableHeight + newRowHeight;

  // Clone and insert new row into the same container
  const newRow = referenceRow.clone();
  const cells = newRow.find('td, th');
  cells.forEach((cell: any) => cell.components(''));

  parent.append(newRow, { at: localIdx + 1 });

  // Update table height
  component.addStyle({ height: `${newTableHeight}px` });

  // Set heights in px for all rows
  rowHeights.splice(rowIndex + 1, 0, newRowHeight);
  const updatedRows = findAllRows(component);

  updatedRows.forEach((row: any, i: number) => {
    const heightPx = `${rowHeights[i].toFixed(2)}px`;
    row.addStyle({ height: heightPx });
    const rowCells = row.find('td, th');
    rowCells.forEach((cell: any) => cell.addStyle({ height: heightPx }));
  });

  tableLog.log('Row added:', { newTableHeight, rowHeights });

  // Refresh handles
  const editor = (window as any).editor;
  if (editor) {
    setTimeout(() => addTableResizeHandles(component, editor), 50);
  }
}

/**
 * Delete the specified row
 * Shrinks the table height, remaining rows keep their px heights
 */
function deleteRow(component: any, rowIndex: number): void {
  tableLog.log('Deleting row at index', rowIndex);

  const tableEl = component.getEl();
  if (!tableEl) return;

  const allRows = findAllRows(component);

  // Don't allow deleting the last row
  if (allRows.length <= 1) {
    tableLog.warn('Cannot delete last row');
    return;
  }

  // Capture height of row to delete
  const rowToDelete = allRows[rowIndex];
  const deletedHeight = rowToDelete?.getEl()?.offsetHeight || 0;
  const oldTableHeight = tableEl.offsetHeight;

  // Capture remaining row heights before deletion
  const remainingHeights: number[] = [];
  allRows.forEach((row: any, i: number) => {
    if (i !== rowIndex) {
      remainingHeights.push(row.getEl()?.offsetHeight || 32);
    }
  });

  // Delete the row
  if (rowToDelete) {
    rowToDelete.remove();
  }

  // Calculate new table height
  const newTableHeight = oldTableHeight - deletedHeight;

  // Update table height
  component.addStyle({ height: `${newTableHeight}px` });

  // Set heights in px for remaining rows (they keep their original heights)
  const updatedRows = findAllRows(component);
  updatedRows.forEach((row: any, i: number) => {
    const heightPx = `${remainingHeights[i].toFixed(2)}px`;
    row.addStyle({ height: heightPx });
    const cells = row.find('td, th');
    cells.forEach((cell: any) => cell.addStyle({ height: heightPx }));
  });

  tableLog.log('Row deleted:', { newTableHeight, remainingHeights });

  // Refresh handles
  const editor = (window as any).editor;
  if (editor) {
    setTimeout(() => addTableResizeHandles(component, editor), 50);
  }
}

// Store last known table width per table (to detect external changes)
const lastTableWidths = new WeakMap<any, number>();

/**
 * Computes the horizontal border adjustment for border-box tables.
 * With border-box, CSS width includes border, but columns fill the content area only.
 * Returns total left+right border when border-box, 0 otherwise.
 */
function getTableBorderWidthAdjustment(tableEl: HTMLElement): number {
  const computed = window.getComputedStyle(tableEl);
  if (computed.boxSizing === 'border-box') {
    return (parseFloat(computed.borderLeftWidth) || 0) + (parseFloat(computed.borderRightWidth) || 0);
  }
  return 0;
}

/**
 * Computes the vertical border adjustment for border-box tables.
 * Returns total top+bottom border when border-box, 0 otherwise.
 */
function getTableBorderHeightAdjustment(tableEl: HTMLElement): number {
  const computed = window.getComputedStyle(tableEl);
  if (computed.boxSizing === 'border-box') {
    return (parseFloat(computed.borderTopWidth) || 0) + (parseFloat(computed.borderBottomWidth) || 0);
  }
  return 0;
}

/**
 * Creates a handler for table style changes that syncs row heights and column widths
 * when the table is resized externally (e.g., via native resize or style panel)
 */
function createTableStyleChangeHandler(component: any, editor: any): () => void {
  return () => {
    // Skip if we're in the middle of our own resize operation
    if (handleState.isDragging) return;

    const tableEl = component.getEl();
    if (!tableEl) return;

    const style = component.getStyle();

    // Handle height changes (existing logic)
    const styleHeight = style?.height;
    if (styleHeight && styleHeight.endsWith('px')) {
      const cssHeight = parseFloat(styleHeight);
      const lastHeight = lastTableHeights.get(component);

      // Only act if height actually changed
      if (lastHeight && Math.abs(cssHeight - lastHeight) > 1) {
        // Content area = CSS height minus border (for border-box)
        const contentHeight = cssHeight - getTableBorderHeightAdjustment(tableEl);

        const rows = component.find('tr');
        if (rows.length) {
          // Get current row heights from style (not rendered)
          const rowHeights: number[] = rows.map((row: any) => {
            const rowStyle = row.getStyle()?.height;
            if (rowStyle && rowStyle.endsWith('px')) {
              return parseFloat(rowStyle);
            }
            const rowEl = row.getEl();
            return rowEl ? rowEl.offsetHeight : 32;
          });

          const sumRowHeights = rowHeights.reduce((a: number, b: number) => a + b, 0);
          if (sumRowHeights > 0) {
            // Calculate ratio using content area (not CSS value which includes border)
            const ratio = contentHeight / sumRowHeights;
            rows.forEach((row: any, i: number) => {
              const newHeight = Math.max(MIN_ROW_HEIGHT, rowHeights[i] * ratio);
              const heightPx = `${newHeight.toFixed(2)}px`;
              row.addStyle({ height: heightPx });

              // Also set height on cells so images with height: 100% are constrained
              const cells = row.find('td, th');
              cells.forEach((cell: any) => {
                cell.addStyle({ height: heightPx });
              });
            });

            tableLog.log('Synced rows after table resize:', {
              oldTableHeight: lastHeight,
              newTableHeight: cssHeight,
              ratio,
            });
          }
        }

        // Update last known height (CSS value for change detection)
        lastTableHeights.set(component, cssHeight);

        // Refresh handles
        setTimeout(() => addTableResizeHandles(component, editor), 50);
      }
    }

    // Handle width changes (new logic)
    const styleWidth = style?.width;
    if (styleWidth && styleWidth.endsWith('px')) {
      const cssWidth = parseFloat(styleWidth);
      const lastWidth = lastTableWidths.get(component);

      // Only act if width actually changed
      if (lastWidth && Math.abs(cssWidth - lastWidth) > 1) {
        // Content area = CSS width minus border (for border-box)
        const contentWidth = cssWidth - getTableBorderWidthAdjustment(tableEl);

        const rows = component.find('tr');
        if (rows.length) {
          const firstRow = rows[0];
          const cells = firstRow.find('td, th');

          if (cells.length) {
            // Get current column widths from style or rendered width
            const columnWidths: number[] = cells.map((cell: any) => {
              const cellStyle = cell.getStyle()?.width;
              if (cellStyle && cellStyle.endsWith('px')) {
                return parseFloat(cellStyle);
              }
              const cellEl = cell.getEl();
              return cellEl ? cellEl.offsetWidth : 100;
            });

            const sumColumnWidths = columnWidths.reduce((a: number, b: number) => a + b, 0);
            if (sumColumnWidths > 0) {
              // Calculate ratio using content area (not CSS value which includes border)
              const ratio = contentWidth / sumColumnWidths;
              rows.forEach((row: any) => {
                const rowCells = row.find('td, th');
                rowCells.forEach((cell: any, i: number) => {
                  const newWidth = Math.max(MIN_COLUMN_WIDTH, columnWidths[i] * ratio);
                  cell.addStyle({ width: `${newWidth.toFixed(2)}px` });
                });
              });

              tableLog.log('Synced columns after table resize:', {
                oldTableWidth: lastWidth,
                newTableWidth: cssWidth,
                ratio,
              });
            }
          }
        }

        // Update last known width (CSS value for change detection)
        lastTableWidths.set(component, cssWidth);

        // Refresh handles
        setTimeout(() => addTableResizeHandles(component, editor), 50);
      }
    }
  };
}

/**
 * Ensures table height and row heights are consistent in pixels.
 * - Migrates % heights to px
 * - Removes explicit heights from td/th cells (they should follow tr height)
 * - Syncs table height to match sum of row heights
 */
function syncTableRowHeights(component: any): void {
  const tableEl = component.getEl();
  if (!tableEl) return;

  const rows = component.find('tr');
  if (!rows.length) return;

  // Compute content height from CSS value minus border (for border-box)
  const tableStyle = component.getStyle();
  const cssHeightVal = tableStyle?.height;
  let tableHeight: number;
  if (cssHeightVal && cssHeightVal.endsWith('px')) {
    tableHeight = parseFloat(cssHeightVal) - getTableBorderHeightAdjustment(tableEl);
  } else {
    tableHeight = tableEl.offsetHeight;
  }

  // First pass: migrate % to px and collect actual heights
  const rowHeights: number[] = [];
  rows.forEach((row: any) => {
    const rowEl = row.getEl();
    if (!rowEl) {
      rowHeights.push(32); // default
      return;
    }

    const style = row.getStyle();
    const heightValue = style?.height || '';

    let finalHeight: number;
    if (heightValue.endsWith('%')) {
      // Migrate from % to px
      const percent = parseFloat(heightValue);
      finalHeight = (percent / 100) * tableHeight;
      tableLog.log('Migrated row height:', { from: heightValue, to: `${finalHeight.toFixed(2)}px` });
    } else {
      // Already in px, use actual rendered height
      finalHeight = rowEl.offsetHeight;
    }

    const heightPx = `${finalHeight.toFixed(2)}px`;
    row.addStyle({ height: heightPx });
    rowHeights.push(finalHeight);

    // Also set height on cells so images with height: 100% are constrained
    const cells = row.find('td, th');
    cells.forEach((cell: any) => {
      cell.addStyle({ height: heightPx });
    });
  });

  // Calculate sum of row heights
  const sumRowHeights = rowHeights.reduce((a, b) => a + b, 0);

  // Sync table height if there's a significant mismatch (more than 2px)
  if (Math.abs(tableHeight - sumRowHeights) > 2) {
    // Add border back when setting CSS height (for border-box)
    const newCssHeight = sumRowHeights + getTableBorderHeightAdjustment(tableEl);
    component.addStyle({ height: `${newCssHeight.toFixed(2)}px` });
    tableLog.log('Synced table height:', { from: tableHeight, to: sumRowHeights, rowHeights });
  }
}

/**
 * Ensures table width and column widths are consistent in pixels.
 * - Migrates % widths to px
 * - Syncs cell widths to match table width
 */
function syncTableColumnWidths(component: any): void {
  const tableEl = component.getEl();
  if (!tableEl) return;

  const rows = component.find('tr');
  if (!rows.length) return;

  const firstRow = rows[0];
  const firstRowCells = firstRow.find('td, th');
  if (!firstRowCells.length) return;

  // Compute content width from CSS value minus border (for border-box)
  const tableStyle = component.getStyle();
  const cssWidthVal = tableStyle?.width;
  let tableWidth: number;
  if (cssWidthVal && cssWidthVal.endsWith('px')) {
    tableWidth = parseFloat(cssWidthVal) - getTableBorderWidthAdjustment(tableEl);
  } else {
    tableWidth = tableEl.offsetWidth;
  }

  // First pass on first row: migrate % to px and collect actual widths
  const columnWidths: number[] = [];
  firstRowCells.forEach((cell: any) => {
    const cellEl = cell.getEl();
    if (!cellEl) {
      columnWidths.push(100); // default
      return;
    }

    const style = cell.getStyle();
    const widthValue = style?.width || '';

    if (widthValue.endsWith('%')) {
      // Migrate from % to px
      const percent = parseFloat(widthValue);
      const pxWidth = (percent / 100) * tableWidth;
      columnWidths.push(pxWidth);
      tableLog.log('Will migrate column width:', { from: widthValue, to: `${pxWidth.toFixed(2)}px` });
    } else if (widthValue.endsWith('px')) {
      columnWidths.push(parseFloat(widthValue));
    } else {
      // Use actual rendered width
      columnWidths.push(cellEl.offsetWidth);
    }
  });

  // Calculate sum of column widths
  const sumColumnWidths = columnWidths.reduce((a, b) => a + b, 0);

  // Calculate ratio to fit columns within table width
  const ratio = sumColumnWidths > 0 ? tableWidth / sumColumnWidths : 1;

  // Apply px widths to all cells in all rows
  rows.forEach((row: any) => {
    const cells = row.find('td, th');
    cells.forEach((cell: any, i: number) => {
      if (i < columnWidths.length) {
        const newWidth = columnWidths[i] * ratio;
        cell.addStyle({ width: `${newWidth.toFixed(2)}px` });
      }
    });
  });

  if (Math.abs(ratio - 1) > 0.01) {
    tableLog.log('Synced column widths:', { tableWidth, sumColumnWidths, ratio, columnWidths });
  }
}

/**
 * Adds column and row resize handles to a table
 */
export function addTableResizeHandles(component: any, editor: any): void {
  const tableEl = component.getEl();
  if (!tableEl) return;

  // Store editor reference globally for button callbacks
  (window as any).editor = editor;

  // Make sure table has position: relative so handles are positioned correctly
  if (window.getComputedStyle(tableEl).position === 'static') {
    component.addStyle({ position: 'relative' });
  }

  // Sync row heights (migrate % to px and ensure table height matches sum of rows)
  syncTableRowHeights(component);

  // Sync column widths (migrate % to px if needed)
  syncTableColumnWidths(component);

  // Store current table height for change detection (use style value, not rendered)
  const styleHeight = component.getStyle()?.height;
  if (styleHeight && styleHeight.endsWith('px')) {
    lastTableHeights.set(component, parseFloat(styleHeight));
  } else {
    lastTableHeights.set(component, tableEl.offsetHeight);
  }

  // Store current table width for change detection (use style value, not rendered)
  const styleWidth = component.getStyle()?.width;
  if (styleWidth && styleWidth.endsWith('px')) {
    lastTableWidths.set(component, parseFloat(styleWidth));
  } else {
    lastTableWidths.set(component, tableEl.offsetWidth);
  }

  // Remove any existing handles and listeners
  removeTableResizeHandles(component);

  // Add style change listener to sync rows when table height changes externally
  const styleChangeHandler = createTableStyleChangeHandler(component, editor);
  component.on('change:style', styleChangeHandler);
  styleChangeHandlers.set(component, styleChangeHandler);

  const frame = editor?.Canvas?.getFrameEl?.();
  const doc = frame?.contentDocument || document;

  // Create new handles and buttons
  const columnHandles = createColumnHandles(component, tableEl, doc);
  const rowHandles = createRowHandles(component, tableEl, doc);
  const columnButtons = createColumnButtons(component, tableEl, doc);
  const rowButtons = createRowButtons(component, tableEl, doc);

  const allHandles = [...columnHandles, ...rowHandles, ...columnButtons, ...rowButtons];
  activeHandles.set(component, allHandles);

  tableLog.log('Handles added:', { columnHandles: columnHandles.length, rowHandles: rowHandles.length, columnButtons: columnButtons.length, rowButtons: rowButtons.length });
}

/**
 * Removes all resize handles from a table
 */
export function removeTableResizeHandles(component: any): void {
  // Remove style change listener
  const styleChangeHandler = styleChangeHandlers.get(component);
  if (styleChangeHandler) {
    component.off('change:style', styleChangeHandler);
    styleChangeHandlers.delete(component);
  }

  // Remove handles
  const handles = activeHandles.get(component);
  if (!handles) return;

  handles.forEach(handle => handle.remove());
  activeHandles.delete(component);

  tableLog.log('Handles removed');
}

/**
 * Updates handle positions (call this when table is resized or modified)
 */
export function updateTableResizeHandles(component: any, editor: any): void {
  // Simply recreate handles with new positions
  addTableResizeHandles(component, editor);
}

/**
 * Toggles visibility of add/delete buttons
 */
export function toggleTableButtonsVisibility(editor: any): void {
  areButtonsVisible = !areButtonsVisible;

  const frame = editor?.Canvas?.getFrameEl?.();
  const doc = frame?.contentDocument || document;

  // Toggle class on all buttons
  const allButtons = doc.querySelectorAll(`.${ADD_BUTTON_CLASS}, .${DELETE_BUTTON_CLASS}`);
  allButtons.forEach((button: Element) => {
    if (areButtonsVisible) {
      button.classList.add('visible');
    } else {
      button.classList.remove('visible');
    }
  });

  tableLog.log('Buttons visibility toggled:', areButtonsVisible);
}

/**
 * Gets current visibility state of buttons
 */
export function areTableButtonsVisible(): boolean {
  return areButtonsVisible;
}
