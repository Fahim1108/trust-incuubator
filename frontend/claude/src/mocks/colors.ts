import type { ColorOption } from "@/types";

/** Shared color palette used by the demo catalogue. */
export const COLORS = {
  maroon: { id: "maroon", name: "Maroon", hex: "#6B1A1A" },
  navy: { id: "navy", name: "Navy", hex: "#1F2A44" },
  beige: { id: "beige", name: "Beige", hex: "#D8C7AE" },
  black: { id: "black", name: "Black", hex: "#1E1E1E" },
  white: { id: "white", name: "White", hex: "#F3F2EE" },
  olive: { id: "olive", name: "Olive", hex: "#5B5E3C" },
  stone: { id: "stone", name: "Stone", hex: "#B9B2A6" },
  charcoal: { id: "charcoal", name: "Charcoal", hex: "#3A3A3C" },
  sky: { id: "sky", name: "Sky Blue", hex: "#A7BCD3" },
  brown: { id: "brown", name: "Brown", hex: "#5A3A28" },
  tan: { id: "tan", name: "Tan", hex: "#A9744F" },
  khaki: { id: "khaki", name: "Khaki", hex: "#B9A57F" },
  grey: { id: "grey", name: "Grey", hex: "#9A9A98" },
  cream: { id: "cream", name: "Cream", hex: "#EDE6D8" },
  indigo: { id: "indigo", name: "Indigo", hex: "#2E3F63" },
  silver: { id: "silver", name: "Silver", hex: "#C9CACC" },
  gold: { id: "gold", name: "Gold", hex: "#C2A060" },
} satisfies Record<string, ColorOption>;

export type ColorKey = keyof typeof COLORS;
