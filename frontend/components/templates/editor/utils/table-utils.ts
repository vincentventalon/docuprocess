/**
 * Calculate the minimum size of a table.
 * Returns 0,0 to allow full user control over table dimensions.
 * Row heights use percentages (like columns), so no minimum constraints needed.
 */
export function calculateTableMinimumSize(_tableComponent: any): { minWidth: number; minHeight: number } {
  return { minWidth: 0, minHeight: 0 };
}
