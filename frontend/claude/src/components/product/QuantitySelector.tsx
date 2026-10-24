"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/cn";

export function QuantitySelector({ value, onChange, min = 1, max = 99, size = "md", label = "Quantity", className }: { value: number; onChange: (v: number) => void; min?: number; max?: number; size?: "sm" | "md"; label?: string; className?: string }) {
  const btn = cn("flex items-center justify-center text-ink transition-colors hover:bg-ink/5 disabled:cursor-not-allowed disabled:opacity-30", size === "sm" ? "h-8 w-8" : "h-11 w-11");
  return (
    <div role="group" aria-label={label} className={cn("inline-flex items-center rounded-control border border-line bg-surface", className)}>
      <button type="button" className={btn} onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label="Decrease quantity">
        <Minus className="h-3.5 w-3.5" />
      </button>
      <output aria-live="polite" className={cn("min-w-[2rem] text-center font-medium tabular-nums text-ink", size === "sm" ? "text-xs" : "text-sm")}>
        {value}
      </output>
      <button type="button" className={btn} onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label="Increase quantity">
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
