import type { ThemeSettings } from "@/types";

/**
 * Brand design tokens. Every color used by Tailwind (`bg-primary`, `text-ink-muted`,
 * `border-line`, ...) is generated from this object at runtime as CSS variables.
 */
export const theme: ThemeSettings = {
  colors: {
    primary: "#6B0202",
    primaryDark: "#460101",
    background: "#FFFFFF",
    surface: "#FFFFFF",
    text: "#171717",
    textMuted: "#74706C",
    border: "#EAEAEA",
    selected: "#F6EAEA",
  },
  typography: {
    // The variables are provided by next/font in src/app/layout.tsx.
    serif: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
    sans: "var(--font-inter), Inter, system-ui, -apple-system, 'Segoe UI', sans-serif",
    headingWeight: 500,
    headingUppercaseHero: true,
  },
  radius: { card: "6px", control: "6px" },
};
