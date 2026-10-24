"use client";

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
              className={cn("flex h-11 w-11 items-center justify-center rounded-full border-2 transition-all", active ? "border-primary" : "border-transparent hover:border-ink/25")}
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

export function SizeSelector({ sizes, value, onChange, isAvailable, onSizeGuide, error }: { sizes: string[]; value?: string; onChange: (s: string) => void; isAvailable: (s: string) => boolean; onSizeGuide?: () => void; error?: string }) {
  if (sizes.length === 1 && sizes[0] === "One Size") {
    return <p className="text-sm text-ink">Size: <span className="font-medium">One Size</span></p>;
  }
  return (
    <fieldset>
      <div className="mb-2.5 flex items-center justify-between">
        <legend className="text-sm text-ink">
          Size: <span className="font-medium">{value ?? "Select a size"}</span>
        </legend>
        {onSizeGuide && (
          <button type="button" onClick={onSizeGuide} className="text-xs text-primary underline underline-offset-4 hover:text-primary-dark">
            Size Guide
          </button>
        )}
      </div>
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-6" role="radiogroup" aria-invalid={error ? true : undefined}>
        {sizes.map((s) => {
          const available = isAvailable(s);
          const active = s === value;
          return (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={available ? `Size ${s}` : `Size ${s}, sold out`}
              disabled={!available}
              onClick={() => onChange(s)}
              className={cn(
                "relative h-11 rounded-control border text-sm transition-colors",
                active ? "border-primary bg-primary text-white" : "border-line bg-surface text-ink hover:border-ink/50",
                !available && "cursor-not-allowed text-ink-muted/50 after:absolute after:left-1/2 after:top-1/2 after:h-px after:w-[70%] after:-translate-x-1/2 after:-rotate-[20deg] after:bg-ink/25 hover:border-line",
              )}
            >
              {s}
            </button>
          );
        })}
      </div>
      {error && <p className="mt-2 text-xs text-danger" role="alert">{error}</p>}
    </fieldset>
  );
}
