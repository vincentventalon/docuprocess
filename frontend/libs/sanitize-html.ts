/**
 * HTML Sanitization for Template Content
 *
 * Removes XSS attack vectors while preserving legitimate HTML for PDF templates.
 * Uses DOMPurify - the industry-standard XSS sanitizer.
 */

import DOMPurify from "isomorphic-dompurify";

// Dangerous CSS patterns that could be used for XSS
// Based on OWASP recommendations and known attack vectors
const DANGEROUS_CSS_PATTERNS = [
  /javascript\s*:/gi,
  /vbscript\s*:/gi,
  /expression\s*\(/gi,        // IE expression() - legacy but still dangerous
  /-moz-binding\s*:/gi,       // Firefox XBL binding - legacy
  /behavior\s*:/gi,           // IE behavior - legacy
  /@import/gi,                // Can load external stylesheets
  /url\s*\(\s*["']?\s*javascript:/gi,
  /url\s*\(\s*["']?\s*vbscript:/gi,
  /url\s*\(\s*["']?\s*data\s*:\s*text\/html/gi, // data: URLs with HTML
];

/**
 * Sanitize CSS value to remove dangerous patterns
 */
function sanitizeCssValue(css: string): string {
  if (!css) return css;

  let sanitized = css;
  for (const pattern of DANGEROUS_CSS_PATTERNS) {
    sanitized = sanitized.replace(pattern, '/* blocked */');
  }
  return sanitized;
}

/**
 * Sanitize HTML template content to prevent XSS attacks.
 *
 * This function removes dangerous elements and attributes while preserving
 * all legitimate HTML features needed for PDF templates:
 * - All standard HTML elements (div, table, p, h1-h6, etc.)
 * - Inline styles and CSS
 * - Template variables {{...}}
 * - Images with data: URIs
 * - SVG elements
 *
 * Blocked XSS vectors:
 * - <script> tags
 * - Event handlers (onerror, onclick, onload, etc.)
 * - javascript: protocol URLs
 * - <iframe>, <object>, <embed> tags
 */
export function sanitizeTemplateHtml(html: string): string {
  if (!html) return html;

  return DOMPurify.sanitize(html, {
    // Allow all standard HTML elements needed for PDF templates
    ALLOWED_TAGS: [
      // Document structure
      "html",
      "head",
      "body",
      "style",
      "meta",
      // Layout
      "div",
      "span",
      "p",
      "br",
      "hr",
      // Headings
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      // Tables
      "table",
      "thead",
      "tbody",
      "tfoot",
      "tr",
      "th",
      "td",
      "caption",
      "colgroup",
      "col",
      // Lists
      "ul",
      "ol",
      "li",
      "dl",
      "dt",
      "dd",
      // Text formatting
      "strong",
      "em",
      "b",
      "i",
      "u",
      "s",
      "sub",
      "sup",
      "small",
      "mark",
      // Semantic sections
      "header",
      "footer",
      "main",
      "section",
      "article",
      "aside",
      "nav",
      // Media
      "img",
      "figure",
      "figcaption",
      // SVG elements
      "svg",
      "path",
      "rect",
      "circle",
      "ellipse",
      "line",
      "polyline",
      "polygon",
      "text",
      "tspan",
      "g",
      "defs",
      "use",
      "symbol",
      "clipPath",
      "mask",
      "linearGradient",
      "radialGradient",
      "stop",
      // Other
      "blockquote",
      "pre",
      "code",
      "a",
    ],
    // Allow necessary attributes
    ALLOWED_ATTR: [
      // Common attributes
      "id",
      "class",
      "style",
      "title",
      "lang",
      "dir",
      // Data attributes (including GrapesJS)
      "data-gjs-type",
      "data-barcode-value",
      "data-format",
      "data-display-value",
      "data-line-color",
      // Image attributes
      "src",
      "alt",
      "width",
      "height",
      // Link attributes
      "href",
      "target",
      "rel",
      // Table attributes
      "colspan",
      "rowspan",
      "scope",
      // SVG attributes
      "xmlns",
      "viewBox",
      "fill",
      "stroke",
      "stroke-width",
      "stroke-linecap",
      "stroke-linejoin",
      "d",
      "x",
      "y",
      "x1",
      "y1",
      "x2",
      "y2",
      "cx",
      "cy",
      "r",
      "rx",
      "ry",
      "transform",
      "points",
      "offset",
      "stop-color",
      "stop-opacity",
      "gradientUnits",
      "gradientTransform",
      // Meta charset
      "charset",
    ],
    // Allow data: and https: URIs, block javascript:
    ALLOWED_URI_REGEXP:
      /^(?:(?:https?|data|blob):|[^a-z]|[a-z+.-]+(?:[^a-z+.:-]|$))/i,
    // Allow data-* attributes (wildcard)
    ADD_ATTR: ["data-*"],
    // Keep the full document structure including body tag with its styles
    WHOLE_DOCUMENT: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
  });
}

// Add hook to sanitize style attributes (inline styles)
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.hasAttribute && node.hasAttribute('style')) {
    const style = node.getAttribute('style');
    if (style) {
      const sanitizedStyle = sanitizeCssValue(style);
      if (sanitizedStyle !== style) {
        node.setAttribute('style', sanitizedStyle);
      }
    }
  }
});

// Add hook to sanitize <style> tag contents
DOMPurify.addHook('uponSanitizeElement', (node, data) => {
  if (data.tagName === 'style' && node.textContent) {
    node.textContent = sanitizeCssValue(node.textContent);
  }
});
