"use client";

import { Eye, EyeOff, GripVertical } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { Group, ItemControls, move, NumberField, TextField } from "../fields";
import type { PanelProps } from "../types";

const RAIL_TYPES = new Set(["new-arrivals", "featured", "best-sellers"]);
const TITLED_TYPES = new Set(["categories", "brands", "new-arrivals", "featured", "best-sellers"]);

export function SectionsPanel({ settings, update }: PanelProps) {
  const [open, setOpen] = useState<string | null>(null);
  const [dragging, setDragging] = useState<number | null>(null);
  const sections = settings.homepage;
  return (
    <>
      <Group title="Homepage sections" description="Drag or use the arrows to reorder. Toggle the eye to show or hide.">
        <ul className="space-y-1.5">
          {sections.map((s, i) => (
            <li
              key={s.id}
              draggable
              onDragStart={() => setDragging(i)}
              onDragOver={(e) => {
                e.preventDefault();
                if (dragging !== null && dragging !== i) {
                  update((d) => void (d.homepage = move(d.homepage, dragging, i)));
                  setDragging(i);
                }
              }}
              onDragEnd={() => setDragging(null)}
              className={cn("rounded-control border bg-surface", dragging === i ? "border-primary opacity-60" : "border-line", !s.enabled && "bg-ink/[0.02]")}
            >
              <div className="flex items-center gap-1.5 px-2 py-1.5">
                <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-ink-muted" aria-hidden />
                <button
                  type="button"
                  onClick={() => update((d) => void (d.homepage[i]!.enabled = !d.homepage[i]!.enabled))}
                  className={cn("flex h-7 w-7 items-center justify-center rounded", s.enabled ? "text-primary" : "text-ink-muted")}
                  aria-label={s.enabled ? `Hide ${s.adminLabel}` : `Show ${s.adminLabel}`}
                  aria-pressed={s.enabled}
                >
                  {s.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
                <button type="button" onClick={() => setOpen(open === s.id ? null : s.id)} className={cn("flex-1 truncate text-left text-sm", s.enabled ? "text-ink" : "text-ink-muted line-through")} aria-expanded={open === s.id}>
                  {s.adminLabel}
                </button>
                <ItemControls index={i} count={sections.length} label={s.adminLabel} onMove={(a, b) => update((d) => void (d.homepage = move(d.homepage, a, b)))} />
              </div>
              {open === s.id && TITLED_TYPES.has(s.type) && (
                <div className="space-y-2.5 border-t border-line p-3">
                  <TextField label="Title" value={s.title ?? ""} onChange={(v) => update((d) => void (d.homepage[i]!.title = v))} />
                  <TextField label="Subtitle" value={s.subtitle ?? ""} onChange={(v) => update((d) => void (d.homepage[i]!.subtitle = v || undefined))} />
                  <div className="grid grid-cols-2 gap-2">
                    <TextField label="Link label" value={s.cta?.label ?? ""} onChange={(v) => update((d) => void (d.homepage[i]!.cta = v ? { href: s.cta?.href ?? "/shop", label: v } : undefined))} />
                    <TextField label="Link URL" value={s.cta?.href ?? ""} onChange={(v) => update((d) => void (d.homepage[i]!.cta = { label: s.cta?.label ?? "View All", href: v }))} />
                  </div>
                  {RAIL_TYPES.has(s.type) && <NumberField label="Products shown" min={2} max={12} value={s.limit ?? 8} onChange={(v) => update((d) => void (d.homepage[i]!.limit = v))} />}
                </div>
              )}
              {open === s.id && !TITLED_TYPES.has(s.type) && <p className="border-t border-line p-3 text-xs text-ink-muted">Edit this section&apos;s content in the {s.type === "newsletter" ? "Footer" : s.type === "value-props" ? "Header" : "Banners"} tab.</p>}
            </li>
          ))}
        </ul>
      </Group>
    </>
  );
}
