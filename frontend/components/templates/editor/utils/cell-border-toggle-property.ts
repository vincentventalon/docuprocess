/**
 * Custom cell border toggle property for GrapesJS StyleManager
 * Applies border styles to ALL cells in a selected table
 *
 * Similar to border-toggle-property.ts but operates on table cells instead of the selected component.
 */

import {
  type BorderSide,
  type BorderMode,
  type BorderValues,
  type BorderFieldControls,
  BORDER_SIDES,
  parseBorderShorthand,
  getBorderValuesForAllSides,
  bordersAreEqual,
  mergeBorderValues,
} from './border-toggle-property';

export interface CellBorderToggleControls {
  mode: BorderMode;
  setMode: (newMode: BorderMode, options?: { silent?: boolean }) => void;
  allControls: BorderFieldControls;
  perControls: Record<BorderSide, BorderFieldControls>;
}

const BORDER_STYLES = ['none', 'solid', 'dashed', 'dotted', 'double', 'groove', 'ridge', 'inset', 'outset'] as const;

// ============================================================================
// UI Helpers (copied from border-toggle-property.ts for independence)
// ============================================================================

const createLabel = (text: string, small = false): HTMLSpanElement => {
  const label = document.createElement('span');
  label.textContent = text;
  label.style.fontSize = small ? '10px' : '11px';
  label.style.color = 'var(--gjs-font-color-lt, #9ca3af)';
  return label;
};

const createInput = (placeholder: string): HTMLInputElement => {
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'gjs-field';
  input.placeholder = placeholder;
  input.style.width = '100%';
  input.style.padding = '6px 8px';
  input.style.borderRadius = '4px';
  input.style.border = '1px solid var(--gjs-secondary-dark-color, #374151)';
  input.style.background = 'var(--gjs-main-color, #1f2937)';
  input.style.color = 'var(--gjs-font-color, #f9fafb)';
  return input;
};

const createSelect = (options: readonly string[]): HTMLSelectElement => {
  const select = document.createElement('select');
  select.className = 'gjs-field';
  select.style.width = '100%';
  select.style.padding = '6px 8px';
  select.style.borderRadius = '4px';
  select.style.border = '1px solid var(--gjs-secondary-dark-color, #374151)';
  select.style.background = 'var(--gjs-main-color, #1f2937)';
  select.style.color = 'var(--gjs-font-color, #f9fafb)';

  options.forEach((value) => {
    const opt = document.createElement('option');
    opt.value = value;
    opt.textContent = value.charAt(0).toUpperCase() + value.slice(1);
    select.appendChild(opt);
  });

  return select;
};

const createColorPicker = (): HTMLInputElement => {
  const picker = document.createElement('input');
  picker.type = 'color';
  picker.style.width = '36px';
  picker.style.height = '36px';
  picker.style.padding = '0';
  picker.style.border = '1px solid var(--gjs-secondary-dark-color, #374151)';
  picker.style.borderRadius = '4px';
  picker.style.cursor = 'pointer';
  picker.style.flexShrink = '0';
  return picker;
};

const createModeButton = (label: string): HTMLButtonElement => {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.textContent = label;
  btn.style.flex = '1';
  btn.style.padding = '6px 8px';
  btn.style.fontSize = '12px';
  btn.style.border = '1px solid var(--gjs-secondary-dark-color, #374151)';
  btn.style.borderRadius = '4px';
  btn.style.background = 'var(--gjs-main-color, #1f2937)';
  btn.style.color = 'var(--gjs-font-color, #f9fafb)';
  btn.style.cursor = 'pointer';
  btn.style.transition = 'background-color 0.15s ease, border-color 0.15s ease';
  return btn;
};

/** Convert color to hex for color picker */
const colorToHex = (color: string): string | null => {
  if (color.startsWith('#')) {
    return color.slice(0, 7);
  }
  if (color.startsWith('rgb')) {
    const match = color.match(/(\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
      return '#' + [match[1], match[2], match[3]]
        .map(x => parseInt(x).toString(16).padStart(2, '0'))
        .join('');
    }
  }
  return null;
};

/** Build border shorthand from components */
const buildBorderShorthand = (width: string, style: string, color: string): string => {
  if (style === 'none' || width === '0' || width === '0px') {
    return 'none';
  }
  const normalizedWidth = /^\d+$/.test(width) ? `${width}px` : width;
  return `${normalizedWidth} ${style} ${color}`;
};

/** Create a set of border field controls (width, style, color) */
const createBorderFields = (
  sideLabel?: string
): { wrapper: HTMLDivElement; controls: BorderFieldControls } => {
  const wrapper = document.createElement('div');
  wrapper.style.display = 'flex';
  wrapper.style.flexDirection = 'column';
  wrapper.style.gap = '6px';

  if (sideLabel) {
    const label = createLabel(sideLabel);
    label.style.fontWeight = '500';
    label.style.marginBottom = '2px';
    wrapper.appendChild(label);
  }

  // Width + Style row
  const topRow = document.createElement('div');
  topRow.style.display = 'grid';
  topRow.style.gridTemplateColumns = '1fr 1fr';
  topRow.style.gap = '6px';

  const widthWrapper = document.createElement('div');
  widthWrapper.style.display = 'flex';
  widthWrapper.style.flexDirection = 'column';
  widthWrapper.style.gap = '2px';
  const widthLabel = createLabel('Width', true);
  const widthInput = createInput('0');
  widthWrapper.append(widthLabel, widthInput);

  const styleWrapper = document.createElement('div');
  styleWrapper.style.display = 'flex';
  styleWrapper.style.flexDirection = 'column';
  styleWrapper.style.gap = '2px';
  const styleLabel = createLabel('Style', true);
  const styleSelect = createSelect(BORDER_STYLES);
  styleWrapper.append(styleLabel, styleSelect);

  topRow.append(widthWrapper, styleWrapper);

  // Color row
  const colorWrapper = document.createElement('div');
  colorWrapper.style.display = 'flex';
  colorWrapper.style.flexDirection = 'column';
  colorWrapper.style.gap = '2px';
  const colorLabel = createLabel('Color', true);
  const colorRow = document.createElement('div');
  colorRow.style.display = 'flex';
  colorRow.style.gap = '6px';
  const colorInput = createInput('#000000');
  colorInput.style.flex = '1';
  const colorPicker = createColorPicker();
  colorRow.append(colorInput, colorPicker);
  colorWrapper.append(colorLabel, colorRow);

  wrapper.append(topRow, colorWrapper);

  return {
    wrapper,
    controls: { widthInput, styleSelect, colorInput, colorPicker },
  };
};

/** Create a compact border field set for per-side mode */
const createCompactBorderFields = (
  sideLabel: string
): { wrapper: HTMLDivElement; controls: BorderFieldControls } => {
  const wrapper = document.createElement('div');
  wrapper.style.display = 'flex';
  wrapper.style.flexDirection = 'column';
  wrapper.style.gap = '4px';
  wrapper.style.padding = '8px';
  wrapper.style.borderRadius = '4px';
  wrapper.style.border = '1px solid var(--gjs-secondary-dark-color, #374151)';
  wrapper.style.background = 'rgba(0, 0, 0, 0.1)';

  const label = createLabel(sideLabel);
  label.style.fontWeight = '500';
  wrapper.appendChild(label);

  // Width + Style row (compact)
  const topRow = document.createElement('div');
  topRow.style.display = 'flex';
  topRow.style.gap = '4px';

  const widthInput = createInput('0');
  widthInput.style.width = '50px';
  widthInput.style.padding = '4px 6px';
  widthInput.style.fontSize = '11px';

  const styleSelect = createSelect(BORDER_STYLES);
  styleSelect.style.flex = '1';
  styleSelect.style.padding = '4px 6px';
  styleSelect.style.fontSize = '11px';

  topRow.append(widthInput, styleSelect);

  // Color row (compact)
  const colorRow = document.createElement('div');
  colorRow.style.display = 'flex';
  colorRow.style.gap = '4px';

  const colorInput = createInput('#000000');
  colorInput.style.flex = '1';
  colorInput.style.padding = '4px 6px';
  colorInput.style.fontSize = '11px';

  const colorPicker = createColorPicker();
  colorPicker.style.width = '28px';
  colorPicker.style.height = '28px';

  colorRow.append(colorInput, colorPicker);

  wrapper.append(topRow, colorRow);

  return {
    wrapper,
    controls: { widthInput, styleSelect, colorInput, colorPicker },
  };
};

// ============================================================================
// Cell-specific helpers
// ============================================================================

/** Get all cell components from a table component */
const getAllCellsFromTable = (tableComponent: any): any[] => {
  if (!tableComponent) return [];

  // Find all td and th elements
  const cells: any[] = [];
  const findCells = (component: any) => {
    const tagName = component?.get?.('tagName')?.toLowerCase?.();
    if (tagName === 'td' || tagName === 'th') {
      cells.push(component);
    }
    const children = component?.components?.();
    if (children?.models) {
      children.models.forEach((child: any) => findCells(child));
    }
  };

  findCells(tableComponent);
  return cells;
};

/** Get the selected table component from editor */
const getSelectedTable = (editor: any): any | null => {
  const selected = editor?.getSelected?.();
  if (!selected) return null;

  const tagName = selected?.get?.('tagName')?.toLowerCase?.();
  if (tagName === 'table') return selected;

  // Check if we're inside a table
  const closestTable = selected?.closestType?.('table');
  return closestTable || null;
};

// ============================================================================
// Refresh & Find Controls
// ============================================================================

/**
 * Refresh cell border toggle controls with values from the first cell in the table.
 */
export const refreshCellBorderToggleControls = (
  controls: CellBorderToggleControls,
  tableComponent: any,
  property?: any
): void => {
  if (!controls || !tableComponent) return;

  const cells = getAllCellsFromTable(tableComponent);
  if (cells.length === 0) return;

  // Use the first cell as reference
  const firstCell = cells[0];
  const modelStyle = firstCell.getStyle?.() || {};
  const domEl = firstCell.getEl?.() as HTMLElement | undefined;
  const inlineStyle = domEl?.style || {};
  const computedStyle = domEl ? window.getComputedStyle(domEl) : null;

  // Get values from all sources
  const styleValues = getBorderValuesForAllSides(modelStyle);
  const inlineValues = getBorderValuesForAllSides(inlineStyle as any);
  const computedValues = computedStyle
    ? getBorderValuesForAllSides(computedStyle as any)
    : { top: { width: '0', style: 'none', color: '#1f2937' }, right: { width: '0', style: 'none', color: '#1f2937' }, bottom: { width: '0', style: 'none', color: '#1f2937' }, left: { width: '0', style: 'none', color: '#1f2937' } };

  const borderValues = mergeBorderValues(styleValues, inlineValues, computedValues);

  // Determine mode based on actual border values
  const hasPerSideBorders =
    modelStyle['border-top'] ||
    modelStyle['border-right'] ||
    modelStyle['border-bottom'] ||
    modelStyle['border-left'];
  const hasGlobalBorder = modelStyle.border;
  const allSidesEqual = bordersAreEqual(borderValues);

  const preferredMode: BorderMode =
    hasPerSideBorders && !hasGlobalBorder && !allSidesEqual ? 'per' : 'all';

  // Populate all mode controls
  const allValues = borderValues.top;
  controls.allControls.widthInput.value = allValues.width === '0px' ? '0' : allValues.width;
  controls.allControls.styleSelect.value = allValues.style;
  controls.allControls.colorInput.value = allValues.color;
  try {
    const hex = colorToHex(allValues.color);
    if (hex) controls.allControls.colorPicker.value = hex;
  } catch {
    // Ignore color picker errors
  }

  // Populate per-side controls
  BORDER_SIDES.forEach((side) => {
    const sideValues = borderValues[side];
    const sideControls = controls.perControls[side];
    sideControls.widthInput.value = sideValues.width === '0px' ? '0' : sideValues.width;
    sideControls.styleSelect.value = sideValues.style;
    sideControls.colorInput.value = sideValues.color;
    try {
      const hex = colorToHex(sideValues.color);
      if (hex) sideControls.colorPicker.value = hex;
    } catch {
      // Ignore color picker errors
    }
  });

  controls.setMode(preferredMode, { silent: true });
};

/**
 * Find cell border toggle controls in a property element.
 */
export const findCellBorderToggleControls = (propertyEl: HTMLElement | null): CellBorderToggleControls | null => {
  if (!propertyEl) return null;

  const fieldsContainer = propertyEl.querySelector('[data-sm-fields]') || propertyEl;
  if (fieldsContainer?.children) {
    for (let i = 0; i < fieldsContainer.children.length; i++) {
      const controls = (fieldsContainer.children[i] as any)?._cellBorderToggleControls;
      if (controls) return controls;
    }
  }
  return null;
};

// ============================================================================
// GrapesJS Type Registration
// ============================================================================

export const registerCellBorderToggleProperty = (editor: any) => {
  const styleManager = editor.StyleManager;

  styleManager.addType('cell-border-toggle', {
    create({ property, change }: { property: any; change: any }) {
      const wrapper = document.createElement('div');
      wrapper.style.display = 'flex';
      wrapper.style.flexDirection = 'column';
      wrapper.style.gap = '8px';
      wrapper.style.color = 'var(--gjs-font-color, #f9fafb)';

      // Toggle row
      const toggleRow = document.createElement('div');
      toggleRow.style.display = 'flex';
      toggleRow.style.gap = '6px';

      const allBtn = createModeButton('All Borders');
      const perBtn = createModeButton('Per Side');
      toggleRow.append(allBtn, perBtn);

      // All mode controls
      const { wrapper: allWrapper, controls: allControls } = createBorderFields();

      // Per mode controls (2x2 grid)
      const perGrid = document.createElement('div');
      perGrid.style.display = 'grid';
      perGrid.style.gridTemplateColumns = 'repeat(2, 1fr)';
      perGrid.style.gap = '6px';

      const perControls: Record<BorderSide, BorderFieldControls> = {} as any;
      const sideLabels: Record<BorderSide, string> = {
        top: 'Top',
        right: 'Right',
        bottom: 'Bottom',
        left: 'Left',
      };

      BORDER_SIDES.forEach((side) => {
        const { wrapper: sideWrapper, controls: sideControls } = createCompactBorderFields(sideLabels[side]);
        perGrid.appendChild(sideWrapper);
        perControls[side] = sideControls;
      });

      wrapper.append(toggleRow, allWrapper, perGrid);

      // Mode state
      let mode: BorderMode = 'all';

      const setActiveModeButton = () => {
        const activeStyles = {
          background: 'var(--gjs-secondary-dark-color, #374151)',
          border: '1px solid var(--gjs-color-highlight, #a78bfa)',
        };
        const inactiveStyles = {
          background: 'var(--gjs-main-color, #1f2937)',
          border: '1px solid var(--gjs-secondary-dark-color, #374151)',
        };

        if (mode === 'all') {
          Object.assign(allBtn.style, activeStyles);
          Object.assign(perBtn.style, inactiveStyles);
        } else {
          Object.assign(perBtn.style, activeStyles);
          Object.assign(allBtn.style, inactiveStyles);
        }
      };

      const setMode = (nextMode: BorderMode, opts: { silent?: boolean } = {}) => {
        mode = nextMode;
        setActiveModeButton();
        allWrapper.style.display = nextMode === 'all' ? 'flex' : 'none';
        perGrid.style.display = nextMode === 'per' ? 'grid' : 'none';

        const storedControls = (wrapper as any)._cellBorderToggleControls;
        if (storedControls) {
          storedControls.mode = nextMode;
        }
      };

      // Emit functions - these apply to ALL cells
      const emitAll = (partial = false) => {
        change({
          mode: 'all',
          partial,
          width: allControls.widthInput.value || '0',
          style: allControls.styleSelect.value || 'none',
          color: allControls.colorInput.value || '#1f2937',
        });
      };

      const emitPer = (partial = false) => {
        const values: Record<BorderSide, BorderValues> = {} as any;
        BORDER_SIDES.forEach((side) => {
          values[side] = {
            width: perControls[side].widthInput.value || '0',
            style: perControls[side].styleSelect.value || 'none',
            color: perControls[side].colorInput.value || '#1f2937',
          };
        });
        change({
          mode: 'per',
          partial,
          values,
        });
      };

      // Event listeners for all mode
      allControls.widthInput.addEventListener('input', () => emitAll(true));
      allControls.widthInput.addEventListener('change', () => emitAll(false));
      allControls.styleSelect.addEventListener('change', () => emitAll(false));
      allControls.colorInput.addEventListener('input', () => emitAll(true));
      allControls.colorInput.addEventListener('change', () => emitAll(false));
      allControls.colorPicker.addEventListener('input', () => {
        allControls.colorInput.value = allControls.colorPicker.value;
        emitAll(true);
      });
      allControls.colorPicker.addEventListener('change', () => {
        allControls.colorInput.value = allControls.colorPicker.value;
        emitAll(false);
      });

      // Event listeners for per-side mode
      BORDER_SIDES.forEach((side) => {
        const sideControls = perControls[side];
        sideControls.widthInput.addEventListener('input', () => emitPer(true));
        sideControls.widthInput.addEventListener('change', () => emitPer(false));
        sideControls.styleSelect.addEventListener('change', () => emitPer(false));
        sideControls.colorInput.addEventListener('input', () => emitPer(true));
        sideControls.colorInput.addEventListener('change', () => emitPer(false));
        sideControls.colorPicker.addEventListener('input', () => {
          sideControls.colorInput.value = sideControls.colorPicker.value;
          emitPer(true);
        });
        sideControls.colorPicker.addEventListener('change', () => {
          sideControls.colorInput.value = sideControls.colorPicker.value;
          emitPer(false);
        });
      });

      // Mode toggle buttons
      allBtn.addEventListener('click', () => {
        setMode('all');
        emitAll(false);
      });

      perBtn.addEventListener('click', () => {
        setMode('per');
        // Populate per-side with current all values
        const allWidth = allControls.widthInput.value;
        const allStyle = allControls.styleSelect.value;
        const allColor = allControls.colorInput.value;
        BORDER_SIDES.forEach((side) => {
          perControls[side].widthInput.value = allWidth;
          perControls[side].styleSelect.value = allStyle;
          perControls[side].colorInput.value = allColor;
          try {
            const hex = colorToHex(allColor);
            if (hex) perControls[side].colorPicker.value = hex;
          } catch {
            // Ignore
          }
        });
        emitPer(false);
      });

      // Store controls reference
      const controls: CellBorderToggleControls = {
        mode,
        setMode,
        allControls,
        perControls,
      };
      (wrapper as any)._cellBorderToggleControls = controls;

      // Initialize mode
      setMode(mode, { silent: true });

      return wrapper;
    },

    emit({ updateStyle, property }: { updateStyle: any; property: any }, data: any) {
      const mode: BorderMode = data?.mode || 'all';

      const em = property.em || property.collection?.em;
      const selected = em?.getSelected?.();

      // Get the table component
      const tableComponent = getSelectedTable({ getSelected: () => selected });
      if (!tableComponent) return;

      // Get all cells
      const cells = getAllCellsFromTable(tableComponent);
      if (cells.length === 0) return;

      if (mode === 'all') {
        const shorthand = buildBorderShorthand(
          data?.width || '0',
          data?.style || 'none',
          data?.color || '#1f2937'
        );

        // Apply to all cells
        cells.forEach((cell: any) => {
          // Clear per-side borders
          cell.removeStyle('border-top');
          cell.removeStyle('border-right');
          cell.removeStyle('border-bottom');
          cell.removeStyle('border-left');
          // Apply global border
          cell.addStyle({ border: shorthand });
        });
      } else {
        // Per-side mode
        const values = data?.values || {};

        // Build per-side styles
        const styles: Record<string, string> = {};
        BORDER_SIDES.forEach((side) => {
          const sideValues = values[side] || { width: '0', style: 'none', color: '#1f2937' };
          styles[`border-${side}`] = buildBorderShorthand(
            sideValues.width,
            sideValues.style,
            sideValues.color
          );
        });

        // Apply to all cells
        cells.forEach((cell: any) => {
          // Clear global border
          cell.removeStyle('border');
          // Apply per-side borders
          cell.addStyle(styles);
        });
      }
    },

    update({ property, el }: { property: any; el: any }) {
      const controls = findCellBorderToggleControls(el);
      if (!controls) return;

      let tableComponent: any;
      try {
        const em = property.em || property.collection?.em;
        const selected = em?.getSelected?.();
        tableComponent = getSelectedTable({ getSelected: () => selected });
      } catch {
        return;
      }
      if (!tableComponent) return;

      refreshCellBorderToggleControls(controls, tableComponent, property);
    },
  });
};
