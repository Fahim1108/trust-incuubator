/** Bangladeshi mobile numbers: 01[3-9]XXXXXXXX, optionally prefixed with +88 / 88. */
export const BD_PHONE_REGEX = /^(?:\+?88)?01[3-9]\d{8}$/;

export function normalizePhone(value: string): string {
  return value.replace(/[\s-]/g, "");
}

export function isValidBdPhone(value: string): boolean {
  return BD_PHONE_REGEX.test(normalizePhone(value));
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

export type FieldErrors<T extends string> = Partial<Record<T, string>>;

export function required(value: string | undefined, label: string): string | undefined {
  return value && value.trim() ? undefined : `${label} is required`;
}
