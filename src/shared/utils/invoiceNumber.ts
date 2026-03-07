/** Generate auto invoice number: INV-2026-001 */
export function generateInvoiceNumber(sequence: number, year?: number): string {
  const y = year ?? new Date().getFullYear();
  const padded = String(sequence).padStart(3, '0');
  return `INV-${y}-${padded}`;
}

/** Generate custom prefix invoice number: RAM/2026/001 */
export function generateCustomInvoiceNumber(
  prefix: string,
  sequence: number,
  year?: number,
): string {
  const y = year ?? new Date().getFullYear();
  const padded = String(sequence).padStart(3, '0');
  return `${prefix}${y}/${padded}`;
}
