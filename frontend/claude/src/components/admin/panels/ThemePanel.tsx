"use client";

import type { ThemeColors } from "@/types";
import { ColorField, Group, NumberField, SelectField, Toggle } from "../fields";
import type { PanelProps } from "../types";

const colorLabels: Record<keyof ThemeColors, string> = {
  primary: "Primary",
  primaryDark: "Dark maroon",
  background: "Page background",
  surface: "Card surface",
  text: "Primary text",
  textMuted: "Secondary text",
  border: "Borders",
  selected: "Selected state",
};

const SERIF_OPTIONS = [
  { value: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif", label: "Cormorant Garamond (default)" },
  { value: "Georgia, 'Times New Roman', serif", label: "Georgia" },
  { value: "'Didot', 'Bodoni MT', 'Playfair Display', Georgia, serif", label: "Didot / Bodoni (system)" },
];
const SANS_OPTIONS = [
  { value: "var(--font-inter), Inter, system-ui, -apple-system, 'Segoe UI', sans-serif", label: "Inter (default)" },
  { value: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif", label: "System UI" },
  { value: "'Helvetica Neue', Helvetica, Arial, sans-serif", label: "Helvetica / Arial" },
];

export function ThemePanel({ settings, update }: PanelProps) {
  const t = settings.theme;
  return (
    <>
      <Group title="Brand colours" description="Applied site-wide through CSS variables.">
        <div className="space-y-2.5">
          {(Object.keys(colorLabels) as (keyof ThemeColors)[]).map((key) => (
            <ColorField key={key} label={colorLabels[key]} value={t.colors[key]} onChange={(v) => update((d) => void (d.theme.colors[key] = v))} />
          ))}
        </div>
      </Group>
      <Group title="Typography">
        <SelectField label="Heading font" value={t.typography.serif} onChange={(v) => update((d) => void (d.theme.typography.serif = v))} options={SERIF_OPTIONS} />
        <SelectField label="Interface font" value={t.typography.sans} onChange={(v) => update((d) => void (d.theme.typography.sans = v))} options={SANS_OPTIONS} />
        <SelectField
          label="Heading weight"
          value={String(t.typography.headingWeight) as "400" | "500" | "600" | "700"}
          onChange={(v) => update((d) => void (d.theme.typography.headingWeight = Number(v) as 400 | 500 | 600 | 700))}
          options={["400", "500", "600", "700"].map((w) => ({ value: w as "400", label: w }))}
        />
        <Toggle label="Uppercase hero titles" checked={t.typography.headingUppercaseHero} onChange={(v) => update((d) => void (d.theme.typography.headingUppercaseHero = v))} />
      </Group>
      <Group title="Corners">
        <NumberField label="Card radius (px)" min={0} max={24} value={parseInt(t.radius.card, 10)} onChange={(v) => update((d) => void (d.theme.radius.card = `${v}px`))} />
        <NumberField label="Button & input radius (px)" min={0} max={24} value={parseInt(t.radius.control, 10)} onChange={(v) => update((d) => void (d.theme.radius.control = `${v}px`))} />
      </Group>
    </>
  );
}
