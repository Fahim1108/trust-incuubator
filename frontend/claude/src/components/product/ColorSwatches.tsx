"use client";

import type { ColorOption } from "@/types";
import { cn } from "@/lib/cn";
import { isLightColor } from "@/lib/color";

/** Small swatch row for product cards. */
export function ColorSwatches({ colors, activeId, onHover, max = 4, className }: { colors: ColorOption[]; activeId?: string; onHover?: (id: string) => void; max?: number; className?: string }) {
  const shown = colors.slice(0, max);
  return (
    <ul className={cn("flex items-center gap-1.5", className)} aria-label={`Available in ${colors.length} colours`}>
      {shown.map((c) => (
        <li key={c.id}>
          <button
            type="button"
            title={c.name}
            aria-label={c.name}
            onMouseEnter={() => onHover?.(c.id)}
            onFocus={() => onHover?.(c.id)}
            onClick={(e) => {
              e.preventDefault();
              onHover?.(c.id);
            }}
            className={cn("flex h-5 w-5 items-center justify-center rounded-full border transition-all", activeId === c.id ? "border-ink" : "border-transparent hover:border-ink/40")}
          >
            <span className={cn("h-3.5 w-3.5 rounded-full", isLightColor(c.hex) && "ring-1 ring-inset ring-ink/15")} style={{ backgroundColor: c.hex }} />
          </button>
        </li>
      ))}
      {colors.length > max && <li className="text-[11px] text-ink-muted">+{colors.length - max}</li>}
    </ul>
  );
}
