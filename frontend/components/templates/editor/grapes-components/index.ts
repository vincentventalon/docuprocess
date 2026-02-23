export * from './barcode';
export * from './qrcode';
export * from './header';
export * from './footer';
export * from './custom-components';
export * from './shapes';

import { registerBarcodeComponent } from './barcode';
import { registerQRCodeComponent } from './qrcode';
import { registerHeaderComponent } from './header';
import { registerFooterComponent } from './footer';
import { registerCustomComponents } from './custom-components';
import { registerShapeComponents } from './shapes';
import { setupGhostSync } from '../utils/repeat-ghost-overlay';

export const registerAllComponents = (editor: any) => {
  registerHeaderComponent(editor);
  registerFooterComponent(editor);
  registerBarcodeComponent(editor);
  registerQRCodeComponent(editor);
  registerCustomComponents(editor);
  registerShapeComponents(editor);
  setupGhostSync(editor);
};
