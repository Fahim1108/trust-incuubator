import { hexToChannels } from "@/lib/color";
import type { ThemeSettings } from "@/types";

/** Builds the CSS custom properties consumed by tailwind.config.ts. */
export function themeToCssVars(theme: ThemeSettings): Record<string, string> {
  const c = theme.colors;
  return {
    "--aa-primary": hexToChannels(c.primary),
    "--aa-primary-dark": hexToChannels(c.primaryDark),
    "--aa-background": hexToChannels(c.background),
    "--aa-surface": hexToChannels(c.surface),
    "--aa-text": hexToChannels(c.text),
    "--aa-text-muted": hexToChannels(c.textMuted),
    "--aa-border": hexToChannels(c.border),
    "--aa-selected": hexToChannels(c.selected),
    "--aa-font-serif": theme.typography.serif,
    "--aa-font-sans": theme.typography.sans,
    "--aa-heading-weight": String(theme.typography.headingWeight),
    "--aa-radius-card": theme.radius.card,
    "--aa-radius-control": theme.radius.control,
  };
}

/** Injects theme variables on :root (or a custom selector for previews). */
export function ThemeStyle({ theme, selector = ":root" }: { theme: ThemeSettings; selector?: string }) {
  const vars = themeToCssVars(theme);
  const css = `${selector}{${Object.entries(vars)
    .map(([k, v]) => `${k}:${v.replace(/[<>{}]/g, "")};`)
    .join("")}}`;
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
