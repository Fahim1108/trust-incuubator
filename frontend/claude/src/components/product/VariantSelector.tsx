"use client";
import { canonicalSize } from "@/lib/catalogue-dimensions";

import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { isLightColor } from "@/lib/color";
import type { ColorOption } from "@/types";

export function ColorSelector({ colors, value, onChange }: { colors: ColorOption[]; value: string; onChange: (id: string) => void }) {
  const selected = colors.find((c) => c.id === value);
  return (
    <fieldset>
      <legend className="mb-2.5 text-sm text-ink">
        Color: <span className="font-medium">{selected?.name}</span>
      </legend>
      <div className="flex flex-wrap gap-2.5" role="radiogroup">
        {colors.map((c) => {
          const active = c.id === value;
          return (
            <button
              key={c.id}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={c.name}
              title={c.name}
              onClick={() => onChange(c.id)}
              className={cn("aa-press flex h-11 w-11 items-center justify-center rounded-full border-2 transition-all", active ? "border-primary" : "border-transparent hover:border-ink/25")}
            >
              <span className={cn("flex h-8 w-8 items-center justify-center rounded-full", isLightColor(c.hex) && "ring-1 ring-inset ring-ink/15")} style={{ backgroundColor: c.hex }}>
                {active && <Check className={cn("h-4 w-4", isLightColor(c.hex) ? "text-ink" : "text-white")} aria-hidden />}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function SizeSelector({ sizes, labels, locked = false, value, onChange, isAvailable, onSizeGuide, error }: { sizes: string[]; locked?: boolean; labels?: Record<string, string>; value?: string; onChange: (s: string) => void; isAvailable: (s: string) => boolean; onSizeGuide?: () => void; error?: string }) {
  if (sizes.length === 1 && sizes[0] === "One Size") {
    return <p className="text-sm text-ink">Size: <span className="font-medium">One Size</span></p>;
  }
  return (
    <fieldset>
      <div className="mb-2.5 flex items-center justify-between">
        <legend className="text-sm text-ink">
          Size: <span className="font-medium">{value ? labels?.[value] ?? labels?.[canonicalSize(value) ?? value] ?? canonicalSize(value) ?? value : "Select a size"}</span>
        </legend>
        {onSizeGuide && (
          <button type="button" onClick={onSizeGuide} className="text-xs text-primary underline underline-offset-4 hover:text-primary-dark">
            Size Guide
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-invalid={error ? true : undefined}>
        {sizes.map((s) => {
          const available = isAvailable(s);
          const active = s === value;
          return (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={available ? `Size ${s}` : `Size ${s}, ${locked ? "not available for this item" : "sold out"}`}
              disabled={locked || !available}
              onClick={() => { if (!locked) onChange(s); }}
              className={cn(
                "aa-press relative h-11 min-w-14 px-3 rounded-control border text-sm transition-colors",
                active ? "border-primary bg-primary text-white" : "border-line bg-surface text-ink hover:border-ink/50",
                !available && locked && "opacity-40",
                !available && !locked && "cursor-not-allowed text-ink-muted/50 after:absolute after:left-1/2 after:top-1/2 after:h-px after:w-[70%] after:-translate-x-1/2 after:-rotate-[20deg] after:bg-ink/25 hover:border-line",
              )}
            >
              {labels?.[s] ?? labels?.[canonicalSize(s) ?? s] ?? canonicalSize(s) ?? s}
            </button>
          );
        })}
      </div>
      {error && <p className="mt-2 text-xs text-danger" role="alert">{error}</p>}
    </fieldset>
  );
}
