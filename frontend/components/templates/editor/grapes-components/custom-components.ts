// Generate unique ID for sections (keep container- prefix for backward compat with saved templates)
let sectionIdCounter = 0;
const generateSectionId = () => `container-${Date.now()}-${++sectionIdCounter}`;

// Helper to enforce section position (full-width, no offset)
export const enforceSectionPosition = (component: any) => {
  if (!component) return;

  // Don't attach listener multiple times
  if (component.get('_sectionEnforced')) {
    return;
  }
  component.set('_sectionEnforced', true);

  // Guard flag to prevent infinite loop
  let isUpdatingSectionPosition = false;

  // Function to force section position
  const forceSectionPosition = () => {
    if (isUpdatingSectionPosition) return;

    const currentStyle = component.getStyle();

    // Check if position needs to be corrected
    const needsUpdate =
      currentStyle.position !== 'relative' ||
      currentStyle.width !== '100%' ||
      currentStyle['margin-left'] !== '0' ||
      currentStyle['margin-right'] !== '0' ||
      currentStyle.left ||
      currentStyle.top ||
      currentStyle.right ||
      currentStyle.bottom;

    if (needsUpdate) {
      isUpdatingSectionPosition = true;
      try {
        // Remove absolute positioning properties
        component.removeStyle('left');
        component.removeStyle('top');
        component.removeStyle('right');
        component.removeStyle('bottom');

        // Force relative positioning and full width
        component.addStyle({
          'position': 'relative',
          'width': '100%',
          'margin-left': '0',
          'margin-right': '0',
        });
      } finally {
        isUpdatingSectionPosition = false;
      }
    }
  };

  // Set initial position
  forceSectionPosition();

  // Listen for style changes to re-enforce position
  component.on('change:style', forceSectionPosition);
};

export const registerCustomComponents = (editor: any) => {
  const textType = editor.DomComponents.getType('text');
  const textModel = textType?.model;
  const textView = textType?.view;

  // Image component - disable double-click asset manager modal + broken image placeholder
  editor.DomComponents.addType('image', {
    extend: 'image',
    isComponent: (el: HTMLElement) => el.tagName === 'IMG',
    view: {
      events: {
        dblclick: () => {},
        error: 'onImageError',
        load: 'onImageLoad',
      },
      onImageError() {
        this.el.classList.add('gjs-image-broken');
        this.showPlaceholderOverlay();
      },
      onImageLoad() {
        this.el.classList.remove('gjs-image-broken');
        this.hidePlaceholderOverlay();
      },
      showPlaceholderOverlay() {
        const src = this.el.getAttribute('src') || '';
        // Only show overlay for template variables
        if (!src.includes('{{')) return;

        // Check if overlay already exists
        let overlay = this.el.parentElement?.querySelector('.gjs-image-placeholder-overlay');
        if (overlay) {
          overlay.textContent = src;
          return;
        }

        // Create overlay
        overlay = document.createElement('div');
        overlay.className = 'gjs-image-placeholder-overlay';
        overlay.textContent = src;

        // Insert after image (needs wrapper)
        if (this.el.parentElement) {
          const wrapper = document.createElement('div');
          wrapper.className = 'gjs-image-placeholder-wrapper';
          wrapper.style.cssText = 'position:relative;display:inline-block;';
          this.el.parentElement.insertBefore(wrapper, this.el);
          wrapper.appendChild(this.el);
          wrapper.appendChild(overlay);
        }
      },
      hidePlaceholderOverlay() {
        const wrapper = this.el.parentElement;
        if (wrapper?.classList.contains('gjs-image-placeholder-wrapper')) {
          const overlay = wrapper.querySelector('.gjs-image-placeholder-overlay');
          overlay?.remove();
          // Unwrap the image
          wrapper.parentElement?.insertBefore(this.el, wrapper);
          wrapper.remove();
        }
      },
      onRender() {
        // Check if image src is a template variable or invalid
        const src = this.el.getAttribute('src') || '';
        if (!src || src.includes('{{') || src.includes('}}')) {
          this.el.classList.add('gjs-image-broken');
          // Delay to ensure element is in DOM
          setTimeout(() => this.showPlaceholderOverlay(), 0);
        }
      },
    },
  });

  // Section component (full-width section - vertical stacking)
  editor.DomComponents.addType('section', {
    isComponent: (el: HTMLElement) => {
      if (el.tagName === 'DIV' && el.classList.contains('pdf-container')) {
        return { type: 'section' };
      }
      return false;
    },
    model: {
      defaults: {
        tagName: 'div',
        draggable: '[data-gjs-type="wrapper"]', // Native drag: reorder within wrapper only
        droppable: true,         // Can contain elements
        editable: false,
        resizable: {
          // Only allow vertical resizing (height)
          tl: 0, // top-left
          tc: 0, // top-center
          tr: 0, // top-right
          cl: 0, // center-left
          cr: 0, // center-right
          bl: 0, // bottom-left
          bc: 1, // bottom-center (enabled)
          br: 0, // bottom-right
        },
        classes: ['pdf-container'],
        // Use ID-based selector to prevent styles from leaking to other sections
        stylable: true,
        style: {
          position: 'relative',  // CRITICAL: for vertical stacking
          width: '100%',
          height: '200px',       // Default 200px
          padding: '0',
          'box-sizing': 'border-box',
          'margin-left': '0',
          'margin-right': '0',
        },
        traits: [
          {
            type: 'number',
            label: 'Height (px)',
            name: 'height',
            changeProp: 1,
            placeholder: '200',
          },
          {
            type: 'text',
            label: 'Background',
            name: 'background',
            changeProp: 1,
            placeholder: 'transparent',
          },
          {
            type: 'text',
            label: 'Border',
            name: 'border',
            changeProp: 1,
            placeholder: '1px solid #ddd',
          },
          {
            type: 'text',
            label: 'Border Radius',
            name: 'border-radius',
            changeProp: 1,
            placeholder: '0px',
          },
          // REMOVED: Padding trait - now managed by Style Manager only
          {
            type: 'text',
            label: 'Margin Top',
            name: 'margin-top',
            changeProp: 1,
            placeholder: '0px',
          },
        ],
      },
      init() {
        // Assign unique ID to each section for CSS selector isolation
        const attrs = this.get('attributes') || {};
        if (!attrs.id) {
          const uniqueId = generateSectionId();
          this.set('attributes', { ...attrs, id: uniqueId });
        }

        // Listen to trait changes and update styles
        this.on('change:height', this.updateHeight);
        this.on('change:background', this.updateBackground);
        this.on('change:border', this.updateBorder);
        this.on('change:border-radius', this.updateBorderRadius);
        // REMOVED: this.on('change:padding', this.updatePadding);
        this.on('change:margin-top', this.updateMarginTop);
      },
      updateHeight() {
        const height = this.get('height');
        if (height) {
          this.addStyle({ height: `${height}px` });
        }
      },
      updateBackground() {
        const bg = this.get('background');
        if (bg) {
          this.addStyle({ background: bg });
        }
      },
      updateBorder() {
        const border = this.get('border');
        if (border) {
          this.addStyle({ border: border });
        }
      },
      updateBorderRadius() {
        const borderRadius = this.get('border-radius');
        if (borderRadius) {
          this.addStyle({ 'border-radius': borderRadius });
        }
      },
      // REMOVED: updatePadding method
      updateMarginTop() {
        const marginTop = this.get('margin-top');
        if (marginTop) {
          this.addStyle({ 'margin-top': marginTop });
        }
      },
    },
  });

  // Table component
  editor.DomComponents.addType('table', {
    isComponent: (el: HTMLElement) => el.tagName === 'TABLE',
    model: {
      defaults: {
        tagName: 'table',
        draggable: '.pdf-container, header, footer',  // Only droppable in containers/header/footer
        droppable: true,
        editable: true,
        resizable: true,
        textable: true,
        attributes: { style: 'width: 500px; table-layout: fixed; border-collapse: separate; border-spacing: 0;' },
      },
    },
  });

  // Thead component
  editor.DomComponents.addType('thead', {
    isComponent: (el: HTMLElement) => el.tagName === 'THEAD',
    model: {
      defaults: {
        tagName: 'thead',
        draggable: false,
        droppable: false,
        selectable: false,
        hoverable: false,
        highlightable: false,
      },
    },
  });

  // Tbody component
  editor.DomComponents.addType('tbody', {
    isComponent: (el: HTMLElement) => el.tagName === 'TBODY',
    model: {
      defaults: {
        tagName: 'tbody',
        draggable: false,
        droppable: true,
        editable: true,
        selectable: false,  // Empêche sélection - le click doit remonter à la table
      },
    },
  });

  // TR component
  editor.DomComponents.addType('tr', {
    isComponent: (el: HTMLElement) => el.tagName === 'TR',
    model: {
      defaults: {
        tagName: 'tr',
        draggable: false,
        droppable: true,
        editable: false,
        selectable: false,  // Empêche sélection - le click doit remonter à la table
      },
    },
  });

  const baseTextDefaults =
    textModel && typeof textModel.prototype.defaults === 'function'
      ? textModel.prototype.defaults()
      : textModel?.prototype?.defaults || {};

  // Text component - inline text, no resize/drag (auto-sizes with content)
  editor.DomComponents.addType('text', {
    isComponent: (el: HTMLElement) => el.tagName === 'SPAN',
    model: {
      defaults: {
        tagName: 'span',
        draggable: false,
        droppable: false,
        resizable: false,
        editable: true,
        selectable: true,
        hoverable: true,
      },
    },
  });

  if (textModel && textView) {
    // Div component (extends text)
    // Exclude special div-based components (barcode, qrcode) that have their own handlers
    editor.DomComponents.addType('div', {
      extend: 'text',
      isComponent: (el: HTMLElement) => {
        if (el.tagName !== 'DIV') return false;
        // Don't match barcode or qrcode elements - they have their own component types
        if (el.classList?.contains('gjs-barcode') || el.getAttribute('data-barcode-value')) return false;
        if (el.classList?.contains('gjs-qrcode') || el.getAttribute('data-qrcode-value')) return false;
        return true;
      },
      model: {
        defaults: {
          ...baseTextDefaults,
          tagName: 'div',
          draggable: '.pdf-container, header, footer',  // Only droppable in containers/header/footer
          droppable: true,
          editable: true,
          resizable: true,
          style: {
            overflow: 'hidden',
          },
        },
      },
      // Extend the text view to prevent RTE on divs that contain child block
      // elements. Without this, double-clicking a parent div activates
      // contenteditable on the parent — children merge on backspace and flatten
      // to text + <br> on blur. For parent divs, we select the first child
      // instead so the user can drill down to edit individual leaf divs.
      view: textView.extend({
        // Override canActivate to prevent GrapesJS from delegating editing
        // from a child div to its parent div. GrapesJS checks isChildOf('text')
        // and if true, delegates to the closest text parent. This means
        // iafr3 (child) always delegates to iafrm (parent). We override to
        // allow self-activation when the parent has block children (meaning
        // the parent is a structural container, not a text editing unit).
        canActivate() {
          const original = textView.prototype.canActivate.call(this);
          console.log('[DIV canActivate]', this.el?.id, 'result:', original.result, 'delegate:', original.delegate?.getEl?.()?.id);

          if (!original.result && original.delegate) {
            const delegateEl = original.delegate.getEl?.();
            if (delegateEl && delegateEl.querySelector(':scope > div, :scope > table, :scope > img')) {
              console.log('[DIV canActivate]', this.el?.id, '→ OVERRIDE: parent', delegateEl.id, 'has block children, activating self');
              return { result: true, delegate: undefined };
            }
          }
          return original;
        },

        onActive(ev: any) {
          const el = this.el;
          const id = el?.id || 'no-id';

          if (el && el.querySelector(':scope > div, :scope > table, :scope > img')) {
            console.log('[DIV onActive] BLOCKED for', id, '(has block children)');
            return;
          }

          console.log('[DIV onActive] ALLOWED for', id, '— calling textView.prototype.onActive');
          return textView.prototype.onActive.call(this, ev);
        },
      }),
    });

    // Table cell component (extends text)
    editor.DomComponents.addType('table-cell', {
      extend: 'text',
      isComponent: (el: HTMLElement) => {
        if (el.tagName === 'TD' || el.tagName === 'TH') {
          return {
            type: 'table-cell',
            tagName: el.tagName.toLowerCase(),
          };
        }
        return false;
      },
      model: {
        defaults: {
          ...baseTextDefaults,
          tagName: 'td',
          draggable: false,
          droppable: true,
          resizable: false,
          editable: false,    // RTE désactivé par défaut, on l'active manuellement au double click
          selectable: false,  // Empêche sélection au click - permet au click de remonter à la table
          hoverable: true,    // Permet toujours le hover state
          attributes: { style: 'border: 1px solid #ddd; padding: 0; width: 50%; text-align: center; vertical-align: middle; overflow: hidden; white-space: nowrap; box-sizing: border-box;' },
        },
      },
      // Override canActivate so table cells never delegate editing to a
      // parent text component (e.g. a div that contains the table).  The
      // base textView.canActivate walks up the tree and, when a table sits
      // inside a div (which also extends 'text'), it delegates to the div.
      // The div's onActive then blocks because it has block children →
      // cell editing silently fails.
      view: textView.extend({
        canActivate() {
          return { result: true, delegate: undefined as any };
        },
      }),
    });
  } else {
    // Fallback div component (without text extension)
    // Exclude special div-based components (barcode, qrcode) that have their own handlers
    editor.DomComponents.addType('div', {
      isComponent: (el: HTMLElement) => {
        if (el.tagName !== 'DIV') return false;
        // Don't match barcode or qrcode elements - they have their own component types
        if (el.classList?.contains('gjs-barcode') || el.getAttribute('data-barcode-value')) return false;
        if (el.classList?.contains('gjs-qrcode') || el.getAttribute('data-qrcode-value')) return false;
        return true;
      },
      model: {
        defaults: {
          tagName: 'div',
          draggable: '.pdf-container, header, footer',  // Only droppable in containers/header/footer
          droppable: true,
          editable: true,
          textable: true,
          resizable: true,
          style: {
            overflow: 'hidden',
          },
        },
        init() {
          this.listenTo(this.components(), 'add remove reset', this._updateEditableFromChildren);
          this._updateEditableFromChildren();
        },
        _updateEditableFromChildren() {
          const hasChildren = this.components().length > 0;
          this.set('editable', !hasChildren);
        },
      },
    });
  }
};
