/** Tiny className joiner (avoids adding clsx/tailwind-merge as dependencies). */
export function cn(...values: (string | false | null | undefined)[]): string {
  return values.filter(Boolean).join(" ");
}
