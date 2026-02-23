import JsBarcode from "jsbarcode";

export const createBarcodePngDataUri = (
  value: string,
  format: string,
  displayValue: boolean,
  lineColor: string
): string | null => {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 200;
    JsBarcode(canvas as any, value, {
      format,
      background: "transparent",
      displayValue,
      lineColor,
      fontSize: 18,
      margin: 8,
      textMargin: 10,
    });
    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
};

export const svgToDataUri = (svg: string): string => {
  const encoded = typeof window !== "undefined"
    ? window.btoa(unescape(encodeURIComponent(svg)))
    : Buffer.from(svg, "utf8").toString("base64");
  return `data:image/svg+xml;base64,${encoded}`;
};

const createPlaceholderSvg = (): string => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="80" viewBox="0 0 220 80">
    <rect fill="#f3f4f6" width="220" height="80"/>
    <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" fill="#9ca3af" font-size="14">Barcode</text>
  </svg>`;
  return svgToDataUri(svg);
};

const createErrorSvg = (): string => {
  return svgToDataUri(
    '<svg xmlns="http://www.w3.org/2000/svg" width="220" height="80" viewBox="0 0 220 80"><rect fill="#fee2e2" width="220" height="80"/><text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" fill="#dc2626">Invalid barcode</text></svg>'
  );
};

export const renderBarcodeComponent = (component: any) => {
  if (!component || component.get?.("type") !== "barcode") return;
  const el = component.getEl?.() as HTMLImageElement | null;
  if (!el) return;

  const attrs = (component.getAttributes?.() || {}) as Record<string, string>;
  const value = attrs["data-barcode-value"] || "123456789012";
  const format = (attrs["data-format"] || "code128").toUpperCase();
  const displayValue = attrs["data-display-value"] !== "false";
  const lineColor = attrs["data-line-color"] || "#111827";

  const pngData = createBarcodePngDataUri(value, format, displayValue, lineColor);

  if (pngData) {
    el.src = pngData;
    el.alt = "Barcode";
  } else {
    el.src = createErrorSvg();
    el.alt = "Invalid barcode";
  }
};

export const registerBarcodeComponent = (editor: any) => {
  editor.DomComponents.addType('barcode', {
    isComponent: (el: HTMLElement) => {
      if (!(el instanceof HTMLElement)) return false;
      const isImg = el.tagName?.toLowerCase() === 'img';
      const hasMarkerClass = el.classList?.contains('gjs-barcode');
      const hasDataAttr = typeof el.getAttribute === 'function' && el.getAttribute('data-barcode-value') !== null;
      return Boolean((isImg && hasDataAttr) || hasMarkerClass);
    },
    model: {
      defaults: {
        tagName: 'img',
        draggable: '.pdf-container, header, footer, td, th',
        droppable: false,
        editable: false,
        textable: false,
        resizable: true,
        selectable: true,
        hoverable: true,
        classes: ['gjs-barcode'],
        style: {
          width: '220px',
          height: '80px',
          display: 'inline-block',
          'object-fit': 'contain',
        },
        attributes: {
          src: createPlaceholderSvg(),
          alt: 'Barcode',
          'data-barcode-value': '123456789012',
          'data-format': 'code128',
          'data-display-value': 'true',
          'data-line-color': '#111827',
        },
        traits: [
          {
            type: 'text',
            name: 'data-barcode-value',
            label: 'Value',
            placeholder: '{{tracking_id}}',
          },
          {
            type: 'select',
            name: 'data-format',
            label: 'Format',
            options: [
              { id: 'code128', name: 'Code 128' },
              { id: 'code39', name: 'Code 39' },
              { id: 'ean13', name: 'EAN-13' },
              { id: 'ean8', name: 'EAN-8' },
              { id: 'itf14', name: 'ITF-14' },
            ],
          },
          {
            type: 'checkbox',
            name: 'data-display-value',
            label: 'Show text',
            valueTrue: 'true',
            valueFalse: 'false',
          },
          {
            type: 'color',
            name: 'data-line-color',
            label: 'Line color',
          },
        ],
      },
      init() {
        this.on('change:attributes', () => renderBarcodeComponent(this));
        // Also render after component is fully loaded (handles page refresh)
        const self = this;
        setTimeout(() => renderBarcodeComponent(self), 100);
      },
    },
    view: {
      onRender() {
        renderBarcodeComponent(this.model);
      },
    },
  });
};
