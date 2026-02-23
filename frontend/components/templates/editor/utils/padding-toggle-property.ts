/**
 * Custom padding toggle property for GrapesJS StyleManager
 * Provides "All sides" / "Per side" modes for padding editing
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
 * If you create a new custom StyleManager type for inline styles in the future,
 * you will need to:
 * 1. Export a `refresh[PropertyName]Controls` function from your property file
 * 2. Call it in the `component:selected` handler in useGrapesJSEditor.ts
 *
 * See `refreshPaddingControls` below as an example.
 */

export type PaddingSide = 'top' | 'right' | 'bottom' | 'left';
export type PaddingMode = 'all' | 'per';

/** Controls interface for padding-toggle custom property */
export interface PaddingControls {
  mode: PaddingMode;
  setMode: (mode: PaddingMode, opts?: { silent?: boolean }) => void;
  allInput: HTMLInputElement;
  perInputs: Record<PaddingSide, HTMLInputElement>;
}

export const PADDING_SIDES: PaddingSide[] = ['top', 'right', 'bottom', 'left'];

export const normalizePaddingValue = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  return String(value).trim();
};

export const parsePaddingShorthand = (value?: string): Partial<Record<PaddingSide, string>> => {
  const normalized = normalizePaddingValue(value);
  if (!normalized) return {};

  const parts = normalized.split(/\s+/).filter(Boolean);
  if (!parts.length) return {};

  if (parts.length === 1) {
    return {
      top: parts[0],
      right: parts[0],
      bottom: parts[0],
      left: parts[0],
    };
  }

  if (parts.length === 2) {
    return {
      top: parts[0],
      right: parts[1],
      bottom: parts[0],
      left: parts[1],
    };
  }

  if (parts.length === 3) {
    return {
      top: parts[0],
      right: parts[1],
      bottom: parts[2],
      left: parts[1],
    };
  }

  return {
    top: parts[0],
    right: parts[1],
    bottom: parts[2],
    left: parts[3],
  };
};

export const getPaddingValuesFromStyle = (style: Record<string, any>): Record<PaddingSide, string> => {
  const shorthand = parsePaddingShorthand(typeof style.padding === 'string' ? style.padding : '');

  return {
    top: normalizePaddingValue(style['padding-top'] ?? (style as any).paddingTop ?? shorthand.top ?? ''),
    right: normalizePaddingValue(style['padding-right'] ?? (style as any).paddingRight ?? shorthand.right ?? ''),
    bottom: normalizePaddingValue(style['padding-bottom'] ?? (style as any).paddingBottom ?? shorthand.bottom ?? ''),
    left: normalizePaddingValue(style['padding-left'] ?? (style as any).paddingLeft ?? shorthand.left ?? ''),
  };
};

export const paddingsAreEqual = (values: Record<PaddingSide, string>): boolean => {
  const reference = values.top;
  return PADDING_SIDES.every((side) => values[side] === reference);
};

export const mergePaddingValues = (...sources: Array<Record<PaddingSide, string>>): Record<PaddingSide, string> => {
  const result: Record<PaddingSide, string> = {
    top: '',
    right: '',
    bottom: '',
    left: '',
  };

  PADDING_SIDES.forEach((side) => {
    for (const source of sources) {
      const candidate = source?.[side];
      if (candidate) {
        result[side] = candidate;
        break;
      }
    }
  });

  return result;
};

/**
 * Refresh padding controls with values from the selected component.
 *
 * This function must be called manually from `component:selected` handler
 * because GrapesJS doesn't call the `update` method on component selection
 * for custom property types with inline styles.
 *
 * @param controls - The padding controls object (stored on wrapper._paddingControls)
 * @param selected - The selected GrapesJS component
 * @param paddingProperty - The GrapesJS property object (for getting paddingMode)
 */
export const refreshPaddingControls = (
  controls: PaddingControls,
  selected: any,
  paddingProperty?: any
): void => {
  if (!controls || !selected) return;

  const style = selected.getStyle?.() || {};
  const inlineStyle = (selected.getEl?.() as HTMLElement | undefined)?.style || {};
  const computed = selected.getEl?.() ? window.getComputedStyle(selected.getEl()) : null;

  const styleValues = getPaddingValuesFromStyle(style);
  const inlineValues = getPaddingValuesFromStyle(inlineStyle as any);
  const computedValues = computed ? getPaddingValuesFromStyle(computed as any) : {
    top: '', right: '', bottom: '', left: '',
  };

  const paddingValues = mergePaddingValues(styleValues, inlineValues, computedValues);
  const uniform = paddingsAreEqual(paddingValues);
  const preferredMode: PaddingMode =
    (paddingProperty?.get?.('paddingMode') as PaddingMode) || (uniform ? 'all' : 'per');

  controls.perInputs.top.value = paddingValues.top;
  controls.perInputs.right.value = paddingValues.right;
  controls.perInputs.bottom.value = paddingValues.bottom;
  controls.perInputs.left.value = paddingValues.left;
  controls.allInput.value = uniform ? paddingValues.top : '';
  controls.setMode(preferredMode, { silent: true });
};

/**
 * Find padding controls in a property element.
 *
 * @param propertyEl - The property view element
 * @returns The controls object or null if not found
 */
export const findPaddingControls = (propertyEl: HTMLElement | null): PaddingControls | null => {
  if (!propertyEl) return null;

  const fieldsContainer = propertyEl.querySelector('[data-sm-fields]') || propertyEl;

  // Search in children for element with _paddingControls
  if (fieldsContainer?.children) {
    for (let i = 0; i < fieldsContainer.children.length; i++) {
      const controls = (fieldsContainer.children[i] as any)?._paddingControls;
      if (controls) return controls;
    }
  }

  return null;
};

const addPxIfNumeric = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) return '';

  const numericValue = Number(trimmed);
  if (!Number.isNaN(numericValue) && /^-?\d+(\.\d+)?$/.test(trimmed)) {
    return `${trimmed}px`;
  }

  return trimmed;
};

export const registerPaddingToggleProperty = (editor: any) => {
  const styleManager = editor.StyleManager;

  styleManager.addType('padding-toggle', {
    create({ property, change }: { property: any; change: any }) {
      const wrapper = document.createElement('div');
      wrapper.style.display = 'flex';
      wrapper.style.flexDirection = 'column';
      wrapper.style.gap = '6px';
      wrapper.style.color = 'var(--gjs-font-color, #f9fafb)';

      const toggleRow = document.createElement('div');
      toggleRow.style.display = 'flex';
      toggleRow.style.gap = '6px';

      const createModeButton = (label: string) => {
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

      const allBtn = createModeButton('All Sides');
      const perBtn = createModeButton('Per Side');
      toggleRow.append(allBtn, perBtn);

      const allWrapper = document.createElement('div');
      allWrapper.style.display = 'flex';
      allWrapper.style.flexDirection = 'column';
      allWrapper.style.gap = '4px';

      const allLabel = document.createElement('span');
      allLabel.textContent = 'Padding';
      allLabel.style.fontSize = '12px';
      allLabel.style.color = 'var(--gjs-font-color, #f9fafb)';

      const allInput = document.createElement('input');
      allInput.type = 'text';
      allInput.className = 'gjs-field';
      allInput.placeholder = '0';
      allInput.style.width = '100%';
      allInput.style.padding = '6px 8px';
      allInput.style.borderRadius = '4px';
      allInput.style.border = '1px solid var(--gjs-secondary-dark-color, #374151)';
      allInput.style.background = 'var(--gjs-main-color, #1f2937)';
      allInput.style.color = 'var(--gjs-font-color, #f9fafb)';

      allWrapper.append(allLabel, allInput);

      const perGrid = document.createElement('div');
      perGrid.style.display = 'grid';
      perGrid.style.gridTemplateColumns = 'repeat(2, minmax(0, 1fr))';
      perGrid.style.gap = '6px';

      const createSideInput = (label: string) => {
        const sideWrapper = document.createElement('div');
        sideWrapper.style.display = 'flex';
        sideWrapper.style.flexDirection = 'column';
        sideWrapper.style.gap = '4px';

        const sideLabel = document.createElement('span');
        sideLabel.textContent = label;
        sideLabel.style.fontSize = '12px';
        sideLabel.style.color = 'var(--gjs-font-color, #f9fafb)';

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'gjs-field';
        input.placeholder = '0';
        input.style.width = '100%';
        input.style.padding = '6px 8px';
        input.style.borderRadius = '4px';
        input.style.border = '1px solid var(--gjs-secondary-dark-color, #374151)';
        input.style.background = 'var(--gjs-main-color, #1f2937)';
        input.style.color = 'var(--gjs-font-color, #f9fafb)';

        sideWrapper.append(sideLabel, input);
        return { input, wrapper: sideWrapper };
      };

      const top = createSideInput('Top');
      const right = createSideInput('Right');
      const bottom = createSideInput('Bottom');
      const left = createSideInput('Left');

      perGrid.append(top.wrapper, right.wrapper, bottom.wrapper, left.wrapper);

      wrapper.append(toggleRow, allWrapper, perGrid);

      const perInputs: Record<PaddingSide, HTMLInputElement> = {
        top: top.input,
        right: right.input,
        bottom: bottom.input,
        left: left.input,
      };

      let mode: PaddingMode = (property.get('paddingMode') as PaddingMode) || 'per';

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

      const setMode = (nextMode: PaddingMode, opts: { silent?: boolean } = {}) => {
        mode = nextMode;
        setActiveModeButton();
        allWrapper.style.display = nextMode === 'all' ? 'flex' : 'none';
        perGrid.style.display = nextMode === 'per' ? 'grid' : 'none';
        const storedControls = (wrapper as any)._paddingControls;
        if (storedControls) {
          storedControls.mode = nextMode;
        }
        if (!opts.silent) {
          property.set('paddingMode', nextMode);
        }
      };

      const emitAll = (partial = false) =>
        change({
          mode: 'all',
          partial,
          values: { all: allInput.value },
        });

      const emitPer = (partial = false) =>
        change({
          mode: 'per',
          partial,
          values: {
            top: perInputs.top.value,
            right: perInputs.right.value,
            bottom: perInputs.bottom.value,
            left: perInputs.left.value,
          },
        });

      allInput.addEventListener('change', () => emitAll(false));
      allInput.addEventListener('input', () => emitAll(true));

      PADDING_SIDES.forEach((side) => {
        const input = perInputs[side];
        input.addEventListener('change', () => emitPer(false));
        input.addEventListener('input', () => emitPer(true));
      });

      allBtn.addEventListener('click', () => setMode('all'));
      perBtn.addEventListener('click', () => setMode('per'));

      const controls = {
        mode,
        setMode,
        allInput,
        perInputs,
      };

      (wrapper as any)._paddingControls = controls;
      setMode(mode, { silent: true });

      return wrapper;
    },
    emit({ updateStyle, property }: { updateStyle: any; property: any }, data: any) {
      const mode: PaddingMode = data?.mode || property.get('paddingMode') || 'per';
      const values = data?.values || {};
      const partial = Boolean(data?.partial);

      if (mode === 'all') {
        const value = addPxIfNumeric(normalizePaddingValue(values.all ?? ''));
        const styles: Record<string, string> = {};
        PADDING_SIDES.forEach((side) => {
          styles[`padding-${side}`] = value;
        });
        updateStyle(styles, { partial });
      } else {
        const styles: Record<string, string> = {};
        PADDING_SIDES.forEach((side) => {
          styles[`padding-${side}`] = addPxIfNumeric(normalizePaddingValue(values[side] ?? ''));
        });
        updateStyle(styles, { partial });
      }

      property.set('paddingMode', mode);
    },
    // NOTE: This update method is kept for completeness but is NOT reliably called
    // by GrapesJS on component selection. See refreshPaddingControls() for the
    // function that actually handles UI updates on component selection.
    update({ property, el }: { property: any; el: any }) {
      const controls = findPaddingControls(el);
      if (!controls) return;

      // Wrap in try-catch because editor might not be fully initialized
      let selected: any;
      try {
        selected = editor?.getSelected?.();
      } catch {
        return;
      }
      if (!selected) return;

      refreshPaddingControls(controls, selected, property);
    },
  });

  // Remove the default padding property and add our custom one
  const dimensionSector = styleManager.getSector('Dimension');
  if (dimensionSector) {
    const properties = dimensionSector.getProperties();
    const paddingIndex = properties.findIndex((p: any) => p.get('property') === 'padding');

    if (paddingIndex !== -1) {
      // Remove the old padding property
      properties.remove(properties.at(paddingIndex));

      // Add our custom padding property
      dimensionSector.addProperty({
        property: 'padding',
        type: 'padding-toggle',
        label: 'Padding',
        full: true,
      }, { at: paddingIndex });

      styleManager.render();
    }
  }
};
