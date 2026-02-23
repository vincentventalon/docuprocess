import QRCode from "qrcode";

export const createQRCodeDataUri = async (
  value: string,
  fgColor: string,
  bgColor: string,
  errorLevel: string
): Promise<string | null> => {
  try {
    const dataUri = await QRCode.toDataURL(value, {
      width: 400,
      margin: 2,
      color: {
        dark: fgColor,
        light: bgColor,
      },
      errorCorrectionLevel: errorLevel as "L" | "M" | "Q" | "H",
    });
    return dataUri;
  } catch {
    return null;
  }
};

const svgToDataUri = (svg: string): string => {
  const encoded =
    typeof window !== "undefined"
      ? window.btoa(unescape(encodeURIComponent(svg)))
      : Buffer.from(svg, "utf8").toString("base64");
  return `data:image/svg+xml;base64,${encoded}`;
};

const createErrorSvg = (message: string): string => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
    <rect fill="#fee2e2" width="200" height="200"/>
    <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" fill="#dc2626" font-size="14">${message}</text>
  </svg>`;
  return svgToDataUri(svg);
};

const createPlaceholderSvg = (): string => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
    <rect fill="#f3f4f6" width="200" height="200"/>
    <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" fill="#9ca3af" font-size="14">QR Code</text>
  </svg>`;
  return svgToDataUri(svg);
};

export const renderQRCodeComponent = async (component: any, retryCount = 0): Promise<void> => {
  if (!component || component.get?.("type") !== "qrcode") return;

  const el = component.getEl?.() as HTMLImageElement | null;

  // Retry up to 5 times if element not ready (50ms intervals)
  if (!el) {
    if (retryCount < 5) {
      setTimeout(() => renderQRCodeComponent(component, retryCount + 1), 50);
    }
    return;
  }

  const attrs = (component.getAttributes?.() || {}) as Record<string, string>;
  const value = attrs["data-qrcode-value"] || "https://example.com";
  const fgColor = attrs["data-qrcode-fg-color"] || "#111827";
  const bgColor = attrs["data-qrcode-bg-color"] || "#ffffff";
  const errorLevel = attrs["data-qrcode-error-level"] || "M";

  try {
    // Generate QR code
    const pngData = await createQRCodeDataUri(value, fgColor, bgColor, errorLevel);

    // Check if element is still valid (component might have been removed)
    const currentEl = component.getEl?.() as HTMLImageElement | null;
    if (!currentEl) return;

    if (pngData) {
      currentEl.src = pngData;
      currentEl.alt = "QR Code";
    } else {
      currentEl.src = createErrorSvg("Invalid QR data");
      currentEl.alt = "QR Code Error";
    }
  } catch (error) {
    console.error("Failed to render QR code:", error);
    el.src = createErrorSvg("QR code error");
    el.alt = "QR Code Error";
  }
};

export const registerQRCodeComponent = (editor: any) => {
  editor.DomComponents.addType("qrcode", {
    isComponent: (el: HTMLElement) => {
      if (!(el instanceof HTMLElement)) return false;
      // Check for img with qrcode attributes or class
      const isImg = el.tagName?.toLowerCase() === "img";
      const hasMarkerClass = el.classList?.contains("gjs-qrcode");
      const hasDataAttr =
        typeof el.getAttribute === "function" &&
        el.getAttribute("data-qrcode-value") !== null;
      return Boolean((isImg && hasDataAttr) || hasMarkerClass);
    },
    model: {
      defaults: {
        tagName: "img",
        draggable: ".pdf-container, header, footer, td, th",
        droppable: false,
        editable: false,
        textable: false,
        resizable: true,
        selectable: true,
        hoverable: true,
        classes: ["gjs-qrcode"],
        style: {
          width: "150px",
          height: "150px",
          display: "inline-block",
          'object-fit': "contain",
        },
        attributes: {
          src: createPlaceholderSvg(),
          alt: "QR Code",
          "data-qrcode-value": "https://example.com",
          "data-qrcode-fg-color": "#111827",
          "data-qrcode-bg-color": "#ffffff",
          "data-qrcode-error-level": "M",
        },
        traits: [
          {
            type: "text",
            name: "data-qrcode-value",
            label: "Content",
            placeholder: "{{url}} or https://...",
          },
          {
            type: "color",
            name: "data-qrcode-fg-color",
            label: "Foreground",
          },
          {
            type: "color",
            name: "data-qrcode-bg-color",
            label: "Background",
          },
          {
            type: "select",
            name: "data-qrcode-error-level",
            label: "Error Correction",
            options: [
              { id: "L", name: "Low (7%)" },
              { id: "M", name: "Medium (15%)" },
              { id: "Q", name: "Quartile (25%)" },
              { id: "H", name: "High (30%)" },
            ],
          },
        ],
      },
      init() {
        // Re-render on attribute changes
        this.on("change:attributes", () => renderQRCodeComponent(this));

        // Also render after component is fully loaded (handles page refresh)
        const self = this;
        setTimeout(() => renderQRCodeComponent(self), 100);
      },
    },
    view: {
      onRender() {
        const model = this.model;
        // Use requestAnimationFrame to ensure DOM is ready
        requestAnimationFrame(() => {
          renderQRCodeComponent(model);
        });
      },
    },
  });
};
