import type { Config } from "tailwindcss";

/**
 * Colors resolve to CSS variables that are generated from `src/config/theme.ts`
 * (see `src/components/theme/ThemeStyle.tsx`). Edit colors in the config file,
 * not here, so the Appearance Editor and the storefront stay in sync.
 */
const withVar = (name: string) => `rgb(var(--aa-${name}) / <alpha-value>)`;

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  // `hover:` / `group-hover:` only apply on devices that can truly hover,
  // so taps on phones never leave "stuck" hover states.
  future: { hoverOnlyWhenSupported: true },
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1rem", sm: "1.5rem", lg: "2rem" },
      screens: { "2xl": "1360px" },
    },
    extend: {
      colors: {
        primary: { DEFAULT: withVar("primary"), dark: withVar("primary-dark") },
        surface: withVar("surface"),
        page: withVar("background"),
        ink: { DEFAULT: withVar("text"), muted: withVar("text-muted") },
        line: withVar("border"),
        selected: withVar("selected"),
        success: "#1F7A3A",
        warning: "#9A6200",
        danger: "#B42318",
      },
      fontFamily: {
        serif: ["var(--aa-font-serif)", "Georgia", "serif"],
        sans: ["var(--aa-font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
        script: ["var(--font-script)", "cursive"],
      },
      borderRadius: {
        card: "var(--aa-radius-card)",
        control: "var(--aa-radius-control)",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(23,23,23,0.04), 0 8px 24px -12px rgba(23,23,23,0.12)",
        lift: "0 12px 32px -12px rgba(70,1,1,0.25)",
      },
      keyframes: {
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "slide-in-right": { from: { transform: "translateX(100%)" }, to: { transform: "translateX(0)" } },
        "slide-in-left": { from: { transform: "translateX(-100%)" }, to: { transform: "translateX(0)" } },
        "slide-up": { from: { transform: "translateY(16px)", opacity: "0" }, to: { transform: "translateY(0)", opacity: "1" } },
        shimmer: { "100%": { transform: "translateX(100%)" } },
        "dropdown-in": { from: { opacity: "0", transform: "translateY(-4px) scale(0.98)" }, to: { opacity: "1", transform: "translateY(0) scale(1)" } },
        "fade-up": { from: { opacity: "0", transform: "translateY(14px)" } },
        "heart-pop": { "0%": { transform: "scale(1)" }, "40%": { transform: "scale(1.22)" }, "70%": { transform: "scale(0.94)" }, "100%": { transform: "scale(1)" } },
      },
      animation: {
        "fade-in": "fade-in 200ms ease-out",
        "slide-in-right": "slide-in-right 280ms cubic-bezier(0.22,1,0.36,1)",
        "slide-in-left": "slide-in-left 280ms cubic-bezier(0.22,1,0.36,1)",
        "slide-up": "slide-up 280ms cubic-bezier(0.22,1,0.36,1)",
        "dropdown-in": "dropdown-in 180ms cubic-bezier(0.22,1,0.36,1)",
        "fade-up": "fade-up 600ms cubic-bezier(0.22,1,0.36,1) both",
        "heart-pop": "heart-pop 380ms cubic-bezier(0.22,1,0.36,1)",
      },
    },
  },
  plugins: [],
};

export default config;
