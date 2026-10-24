/** "#6B0202" -> "107 2 2" (space-separated channels for Tailwind alpha support). */
export function hexToChannels(hex: string): string {
  const h = hex.replace("#", "").trim();
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h.padEnd(6, "0").slice(0, 6);
  const n = parseInt(full, 16);
  if (Number.isNaN(n)) return "0 0 0";
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}

export function isLightColor(hex: string): boolean {
  const [r, g, b] = hexToChannels(hex).split(" ").map(Number) as [number, number, number];
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.62;
}
