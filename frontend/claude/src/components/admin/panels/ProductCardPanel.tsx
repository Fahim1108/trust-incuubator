"use client";

import type { ProductCardSettings } from "@/types";
import { ColorField, Group, SelectField, Toggle } from "../fields";
import type { PanelProps } from "../types";

const toggles: { key: keyof ProductCardSettings; label: string }[] = [
  { key: "showBrand", label: "Show brand name" },
  { key: "showRating", label: "Show rating" },
  { key: "showColorSwatches", label: "Show colour swatches" },
  { key: "showQuickAdd", label: "Show Quick Add (desktop hover)" },
  { key: "showWishlist", label: "Show wishlist heart" },
  { key: "showDiscountBadge", label: "Show discount badge" },
  { key: "showAddToCart", label: "Show Add to Cart button" },
];

export function ProductCardPanel({ settings, update }: PanelProps) {
  const c = settings.productCard;
  return (
    <>
      <Group title="Product card" description="Applies to every product grid and rail.">
        <SelectField label="Image shape" value={c.imageAspect} onChange={(v) => update((d) => void (d.productCard.imageAspect = v))} options={[{ value: "portrait", label: "Portrait 4:5" }, { value: "square", label: "Square 1:1" }, { value: "landscape", label: "Landscape 4:3" }]} />
        <ColorField label="Image background" value={c.imageBackground} onChange={(v) => update((d) => void (d.productCard.imageBackground = v))} />
        <div className="space-y-3 pt-1">
          {toggles.map((t) => (
            <Toggle key={t.key} label={t.label} checked={c[t.key] as boolean} onChange={(v) => update((d) => void ((d.productCard[t.key] as boolean) = v))} />
          ))}
        </div>
      </Group>
      <Group title="Demo notices">
        <Toggle label="Show demonstration notices" description="Disable only after real data is connected." checked={settings.demo.showNotices} onChange={(v) => update((d) => void (d.demo.showNotices = v))} />
      </Group>
    </>
  );
}
