/**
 * Generates a standard TapTignan report identifier in format TT-YYYY-NNNNN
 * Example: TT-2026-00124
 */
export function generateReportId(counter?: number): string {
  const year = new Date().getFullYear();
  const num = counter !== undefined ? counter : Math.floor(1000 + Math.random() * 9000);
  const padded = String(num).padStart(5, '0');
  return `TT-${year}-${padded}`;
}
