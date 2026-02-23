/**
 * Debug logging utility for the PDF Template Editor
 * Logs are only output in development mode
 */

const isDev = process.env.NODE_ENV === 'development';

type LogLevel = 'log' | 'warn' | 'error';

const createLogger = (prefix: string) => {
  return {
    log: (...args: any[]) => {
      if (isDev) console.log(`[${prefix}]`, ...args);
    },
    warn: (...args: any[]) => {
      if (isDev) console.warn(`[${prefix}]`, ...args);
    },
    error: (...args: any[]) => {
      // Always show errors
      console.error(`[${prefix}]`, ...args);
    },
  };
};

// Pre-configured loggers for each subsystem
export const sectionLog = createLogger('Section');
export const headerLog = createLogger('Header');
export const footerLog = createLogger('Footer');
export const paddingLog = createLogger('Padding');
export const resizeLog = createLogger('Resize');
export const tableLog = createLogger('Table');
export const alignmentLog = createLogger('Alignment');
export const positionLog = createLogger('Position');
export const dragLog = createLogger('Drag');
export const exportLog = createLogger('Export');
export const initLog = createLogger('Init');

// Generic debug log for one-off cases
export const debugLog = (prefix: string, ...args: any[]) => {
  if (isDev) console.log(`[${prefix}]`, ...args);
};
