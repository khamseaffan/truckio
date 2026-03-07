/** Validate Indian phone number (10 digits, optionally with +91) */
export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-+]/g, '');
  return /^(91)?[6-9]\d{9}$/.test(cleaned);
}

/** Validate GST number format */
export function isValidGst(gst: string): boolean {
  return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gst);
}

/** Check if string is non-empty after trim */
export function isNotEmpty(value: string): boolean {
  return value.trim().length > 0;
}
