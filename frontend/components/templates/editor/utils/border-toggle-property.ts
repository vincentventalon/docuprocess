/**
 * Custom border toggle property for GrapesJS StyleManager
 * Provides "All Borders" / "Per Side" modes for border editing
 *
 * IMPORTANT - GrapesJS Custom Types and Inline Styles:
 * =====================================================
 * GrapesJS StyleManager custom types have a limitation: the `update` method
 * is NOT called when a component is selected. It's only called when the style
 * actually changes through GrapesJS's internal mechanisms.
 *
 * For components using inline styles (like our containers), we must manually
 * refresh the UI controls when a component is selected. This is done in
 * `useGrapesJSEditor.ts` in the `component:selected` event handler.
 *
 * See `refreshBorderToggleControls` below for the refresh function.
 */

export type BorderSide = 'top' | 'right' | 'bottom' | 'left';
export type BorderMode = 'all' | 'per';

export interface BorderValues {
  width: string;
  style: string;
  color: string;
}

export interface BorderFieldControls {
  widthInput: HTMLInputElement;
  styleSelect: HTMLSelectElement;
  colorInput: HTMLInputElement;
  colorPicker: HTMLInputElement;
}

export interface BorderToggleControls {
  mode: BorderMode;
  setMode: (newMode: BorderMode, options?: { silent?: boolean }) => void;
  allControls: BorderFieldControls;
  perControls: Record<BorderSide, BorderFieldControls>;
}

export const BORDER_SIDES: BorderSide[] = ['top', 'right', 'bottom', 'left'];
const BORDER_STYLES = ['none', 'solid', 'dashed', 'dotted', 'double', 'groove', 'ridge', 'inset', 'outset'] as const;

// ============================================================================
// Parsing & Building
// ============================================================================

/** Parse border shorthand "2px solid rgb(0, 0, 0)" into components */
export const parseBorderShorthand = (value: string): BorderValues => {
  if (!value || value === 'none') {
    return { width: '0', style: 'none', color: '#1f2937' };
  }

  const trimmed = value.trim();
  const widthMatch = trimmed.match(/^(\d+(?:\.\d+)?)(px|em|rem|%|pt)?/);
  const styleMatch = trimmed.match(/\b(solid|dashed|dotted|double|groove|ridge|inset|outset|none|hidden)\b/);
  const colorMatch = trimmed.match(/(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\)|(?!solid|dashed|dotted|double|groove|ridge|inset|outset|none|hidden)[a-zA-Z]+)$/);

  return {
    width: widthMatch ? widthMatch[1] + (widthMatch[2] || 'px') : '0',
    style: styleMatch ? styleMatch[1] : 'none',
    color: colorMatch ? colorMatch[1] : '#1f2937',
  };
};

/** Build border shorthand from components */
const buildBorderShorthand = (width: string, style: string, color: string): string => {
  if (style === 'none' || width === '0' || width === '0px') {
    return 'none';
  }
  const normalizedWidth = /^\d+$/.test(width) ? `${width}px` : width;
  return `${normalizedWidth} ${style} ${color}`;
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

// ============================================================================
// Border Value Helpers
// ============================================================================

/** Get border values for all sides from a style object */
export const getBorderValuesForAllSides = (style: Record<string, any>): Record<BorderSide, BorderValues> => {
  const globalBorder = parseBorderShorthand(typeof style.border === 'string' ? style.border : '');

  return {
    top: parseBorderShorthand(style['border-top'] || style.borderTop || '') || globalBorder,
    right: parseBorderShorthand(style['border-right'] || style.borderRight || '') || globalBorder,
    bottom: parseBorderShorthand(style['border-bottom'] || style.borderBottom || '') || globalBorder,
    left: parseBorderShorthand(style['border-left'] || style.borderLeft || '') || globalBorder,
  };
};

/** Check if all border sides have the same values */
export const bordersAreEqual = (values: Record<BorderSide, BorderValues>): boolean => {
  const reference = values.top;
  return BORDER_SIDES.every(
    (side) =>
      values[side].width === reference.width &&
      values[side].style === reference.style &&
      values[side].color === reference.color
  );
};

/** Merge border values, preferring non-empty values from earlier sources */
export const mergeBorderValues = (
  ...sources: Array<Record<BorderSide, BorderValues>>
): Record<BorderSide, BorderValues> => {
  const result: Record<BorderSide, BorderValues> = {
    top: { width: '0', style: 'none', color: '#1f2937' },
    right: { width: '0', style: 'none', color: '#1f2937' },
    bottom: { width: '0', style: 'none', color: '#1f2937' },
    left: { width: '0', style: 'none', color: '#1f2937' },
  };

  BORDER_SIDES.forEach((side) => {
    for (const source of sources) {
      const candidate = source?.[side];
      if (candidate && (candidate.width !== '0' || candidate.style !== 'none')) {
        result[side] = candidate;
        break;
      }
    }
  });

  return result;
};

// ============================================================================
// UI Helpers
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
// Refresh & Find Controls
// ============================================================================

/**
 * Refresh border toggle controls with values from the selected component.
 * Must be called manually from `component:selected` handler.
 */
export const refreshBorderToggleControls = (
  controls: BorderToggleControls,
  selected: any,
  property?: any
): void => {
  if (!controls || !selected) return;

  const modelStyle = selected.getStyle?.() || {};
  const domEl = selected.getEl?.() as HTMLElement | undefined;
  const inlineStyle = domEl?.style || {};
  const computedStyle = domEl ? window.getComputedStyle(domEl) : null;

  // Get values from all sources
  const styleValues = getBorderValuesForAllSides(modelStyle);
  const inlineValues = getBorderValuesForAllSides(inlineStyle as any);
  const computedValues = computedStyle
    ? getBorderValuesForAllSides(computedStyle as any)
    : { top: { width: '0', style: 'none', color: '#1f2937' }, right: { width: '0', style: 'none', color: '#1f2937' }, bottom: { width: '0', style: 'none', color: '#1f2937' }, left: { width: '0', style: 'none', color: '#1f2937' } };

  const borderValues = mergeBorderValues(styleValues, inlineValues, computedValues);

  // Determine mode based on actual border values (always auto-detect)
  const hasPerSideBorders =
    modelStyle['border-top'] ||
    modelStyle['border-right'] ||
    modelStyle['border-bottom'] ||
    modelStyle['border-left'];
  const hasGlobalBorder = modelStyle.border;
  const allSidesEqual = bordersAreEqual(borderValues);

  // Always auto-detect: use 'per' mode if element has per-side borders set and they're not all equal
  const preferredMode: BorderMode =
    hasPerSideBorders && !hasGlobalBorder && !allSidesEqual ? 'per' : 'all';

  // Populate all mode controls
  const allValues = borderValues.top; // Use top as reference for "all" mode
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
 * Find border toggle controls in a property element.
 */
export const findBorderToggleControls = (propertyEl: HTMLElement | null): BorderToggleControls | null => {
  if (!propertyEl) return null;

  const fieldsContainer = propertyEl.querySelector('[data-sm-fields]') || propertyEl;
  if (fieldsContainer?.children) {
    for (let i = 0; i < fieldsContainer.children.length; i++) {
      const controls = (fieldsContainer.children[i] as any)?._borderToggleControls;
      if (controls) return controls;
    }
  }
  return null;
};

// ============================================================================
// GrapesJS Type Registration
// ============================================================================

export const registerBorderToggleProperty = (editor: any) => {
  const styleManager = editor.StyleManager;

  styleManager.addType('border-toggle', {
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

      // Mode state (will be set correctly by refreshBorderToggleControls on component selection)
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

        const storedControls = (wrapper as any)._borderToggleControls;
        if (storedControls) {
          storedControls.mode = nextMode;
        }
      };

      // Emit functions
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
        // When switching to "all", apply current all values
        emitAll(false);
      });

      perBtn.addEventListener('click', () => {
        setMode('per');
        // When switching to "per", populate per-side with current all values
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
      const controls: BorderToggleControls = {
        mode,
        setMode,
        allControls,
        perControls,
      };
      (wrapper as any)._borderToggleControls = controls;

      // Initialize mode
      setMode(mode, { silent: true });

      return wrapper;
    },

    emit({ updateStyle, property }: { updateStyle: any; property: any }, data: any) {
      const mode: BorderMode = data?.mode || property.get('borderMode') || 'all';
      const partial = Boolean(data?.partial);

      const em = property.em || property.collection?.em;
      const selected = em?.getSelected?.();

      if (mode === 'all') {
        const shorthand = buildBorderShorthand(
          data?.width || '0',
          data?.style || 'none',
          data?.color || '#1f2937'
        );

        // Clear per-side borders
        if (selected) {
          selected.removeStyle('border-top');
          selected.removeStyle('border-right');
          selected.removeStyle('border-bottom');
          selected.removeStyle('border-left');
        }

        // Apply global border
        updateStyle({ border: shorthand }, { partial });
        if (selected) {
          selected.addStyle({ border: shorthand });
        }
      } else {
        // Per-side mode
        const values = data?.values || {};

        // Clear global border
        if (selected) {
          selected.removeStyle('border');
        }

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

        updateStyle(styles, { partial });
        if (selected) {
          selected.addStyle(styles);
        }
      }
    },

    // NOTE: Not reliably called on component selection. See refreshBorderToggleControls.
    update({ property, el }: { property: any; el: any }) {
      const controls = findBorderToggleControls(el);
      if (!controls) return;

      let selected: any;
      try {
        selected = editor?.getSelected?.();
      } catch {
        return;
      }
      if (!selected) return;

      refreshBorderToggleControls(controls, selected, property);
    },
  });
};
