/**
 * Shape components for decorative elements (Line, Circle, Rectangle)
 * Line and Rectangle use CSS divs for better WeasyPrint compatibility
 * Circle uses SVG with viewBox for proper scaling
 * Supports {{ variable }} syntax for dynamic colors via Jinja2
 */

export type ShapeType = 'line' | 'circle' | 'rectangle';

/**
 * Check if a value contains Jinja2 variable syntax
 */
const isJinjaVariable = (value: string): boolean => {
  return value.includes('{{') && value.includes('}}');
};

/**
 * Renders shape content - uses raw values so export matches what Jinja2 will process
 */
export const renderShapeComponent = (component: any) => {
  if (!component) return;
  const type = component.get?.('type');
  if (!type?.startsWith('shape-')) return;

  const el = component.getEl?.() as HTMLElement | null;
  if (!el) return;

  const attrs = (component.getAttributes?.() || {}) as Record<string, string>;
  const shapeType = attrs['data-shape-type'] as ShapeType;

  // Get raw values from attributes
  const strokeRaw = attrs['data-shape-stroke'] || '#111827';
  const strokeWidthRaw = attrs['data-shape-stroke-width'] || '2';
  const fillRaw = attrs['data-shape-fill'] || 'transparent';
  const opacityRaw = attrs['data-shape-opacity'] || '1';
  const borderRadiusRaw = attrs['data-shape-border-radius'] || '4';

  // For preview: use magenta as fallback for Jinja variables so shapes remain visible
  const stroke = isJinjaVariable(strokeRaw) ? '#ff00ff' : strokeRaw;
  const strokeWidth = isJinjaVariable(strokeWidthRaw) ? '2' : strokeWidthRaw;
  const fill = isJinjaVariable(fillRaw) ? '#ff00ff' : fillRaw;
  const opacity = isJinjaVariable(opacityRaw) ? '1' : opacityRaw;
  const borderRadius = isJinjaVariable(borderRadiusRaw) ? '4' : borderRadiusRaw;

  // For display, we need numeric strokeWidth for calculations
  const strokeWidthNum = Number(strokeWidth);

  let content = '';

  switch (shapeType) {
    case 'line':
      // CSS div centered vertically
      content = `<div style="width:100%;height:${strokeWidth}px;background:${stroke};opacity:${opacity};border-radius:${borderRadius}px;position:absolute;top:50%;transform:translateY(-50%);"></div>`;
      break;

    case 'circle': {
      // Circle uses SVG
      const radius = 50 - strokeWidthNum;
      content = `
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
          <circle cx="50" cy="50" r="${radius}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" opacity="${opacity}" />
        </svg>
      `;
      break;
    }

    case 'rectangle': {
      // CSS div
      const borderStyle = strokeWidthNum > 0 ? `border:${strokeWidth}px solid ${stroke};` : '';
      content = `<div style="width:100%;height:100%;background:${fill};opacity:${opacity};${borderStyle}box-sizing:border-box;"></div>`;
      break;
    }
  }

  el.innerHTML = content;
  el.style.display = 'block';
  el.style.overflow = 'visible';
};

/**
 * Common traits for shape components (using text inputs for variable support)
 */
const getShapeTraits = (includesFill: boolean) => {
  const traits: any[] = [
    {
      type: 'color',
      name: 'data-shape-stroke',
      label: 'Border color',
      placeholder: '#111827 or {{color}}',
    },
    {
      type: 'text',
      name: 'data-shape-stroke-width',
      label: 'Border width',
      placeholder: '2',
    },
    {
      type: 'text',
      name: 'data-shape-opacity',
      label: 'Opacity',
      placeholder: '0-1 or {{opacity}}',
    },
  ];

  if (includesFill) {
    traits.unshift({
      type: 'color',
      name: 'data-shape-fill',
      label: 'Fill color',
      placeholder: 'transparent or {{color}}',
    });
  }

  return traits;
};

/**
 * Register Line shape component
 */
export const registerShapeLineComponent = (editor: any) => {
  editor.DomComponents.addType('shape-line', {
    isComponent: (el: HTMLElement) => {
      if (!(el instanceof HTMLElement)) return false;
      return el.getAttribute?.('data-shape-type') === 'line';
    },
    model: {
      defaults: {
        tagName: 'div',
        draggable: '.pdf-container, header, footer, td, th',
        droppable: false,
        editable: false,
        textable: false,
        resizable: true,
        selectable: true,
        hoverable: true,
        attributes: {
          'data-shape-type': 'line',
          'data-shape-stroke': '#111827',
          'data-shape-stroke-width': '2',
          'data-shape-opacity': '1',
          'data-shape-border-radius': '4',
        },
        style: {
          position: 'absolute',
          width: '200px',
          height: '20px',
        },
        traits: [
          ...getShapeTraits(false),
          {
            type: 'text',
            name: 'data-shape-border-radius',
            label: 'End roundness',
            placeholder: '0-50 or {{radius}}',
          },
        ],
      },
      init() {
        this.on('change:attributes', () => renderShapeComponent(this));
      },
    },
    view: {
      onRender() {
        renderShapeComponent(this.model);
      },
    },
  });
};

/**
 * Register Circle shape component
 */
export const registerShapeCircleComponent = (editor: any) => {
  editor.DomComponents.addType('shape-circle', {
    isComponent: (el: HTMLElement) => {
      if (!(el instanceof HTMLElement)) return false;
      return el.getAttribute?.('data-shape-type') === 'circle';
    },
    model: {
      defaults: {
        tagName: 'div',
        draggable: '.pdf-container, header, footer, td, th',
        droppable: false,
        editable: false,
        textable: false,
        resizable: true,
        selectable: true,
        hoverable: true,
        attributes: {
          'data-shape-type': 'circle',
          'data-shape-fill': 'transparent',
          'data-shape-stroke': '#111827',
          'data-shape-stroke-width': '2',
          'data-shape-opacity': '1',
        },
        style: {
          position: 'absolute',
          width: '100px',
          height: '100px',
        },
        traits: getShapeTraits(true),
      },
      init() {
        this.on('change:attributes', () => renderShapeComponent(this));
      },
    },
    view: {
      onRender() {
        renderShapeComponent(this.model);
      },
    },
  });
};

/**
 * Register Rectangle shape component
 */
export const registerShapeRectangleComponent = (editor: any) => {
  editor.DomComponents.addType('shape-rectangle', {
    isComponent: (el: HTMLElement) => {
      if (!(el instanceof HTMLElement)) return false;
      return el.getAttribute?.('data-shape-type') === 'rectangle';
    },
    model: {
      defaults: {
        tagName: 'div',
        draggable: '.pdf-container, header, footer, td, th',
        droppable: false,
        editable: false,
        textable: false,
        resizable: true,
        selectable: true,
        hoverable: true,
        attributes: {
          'data-shape-type': 'rectangle',
          'data-shape-fill': 'transparent',
          'data-shape-stroke': '#111827',
          'data-shape-stroke-width': '2',
          'data-shape-opacity': '1',
        },
        style: {
          position: 'absolute',
          width: '200px',
          height: '100px',
        },
        traits: getShapeTraits(true),
      },
      init() {
        this.on('change:attributes', () => renderShapeComponent(this));
      },
    },
    view: {
      onRender() {
        renderShapeComponent(this.model);
      },
    },
  });
};

/**
 * Register all shape components
 */
export const registerShapeComponents = (editor: any) => {
  registerShapeLineComponent(editor);
  registerShapeCircleComponent(editor);
  registerShapeRectangleComponent(editor);
};
