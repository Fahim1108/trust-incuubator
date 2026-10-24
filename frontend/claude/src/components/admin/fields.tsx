"use client";

import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { useId, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Group({ title, description, children, actions }: { title: string; description?: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <section className="space-y-3 border-b border-line px-5 py-5 last:border-0">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[13px] font-semibold text-ink">{title}</h3>
          {description && <p className="mt-0.5 text-xs text-ink-muted">{description}</p>}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}

export function TextField({ label, value, onChange, placeholder, multiline }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; multiline?: boolean }) {
  const id = useId();
  const cls = "w-full rounded-control border border-line bg-surface px-3 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10";
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-[11px] font-medium uppercase tracking-wide text-ink-muted">
        {label}
      </label>
      {multiline ? (
        <textarea id={id} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={2} className={cn(cls, "py-2")} />
      ) : (
        <input id={id} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={cn(cls, "h-9")} />
      )}
    </div>
  );
}

export function NumberField({ label, value, onChange, min, max, step = 1 }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number }) {
  const id = useId();
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="flex justify-between text-[11px] font-medium uppercase tracking-wide text-ink-muted">
        {label} <span className="normal-case tracking-normal text-ink">{value}</span>
      </label>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-[rgb(var(--aa-primary))]" />
    </div>
  );
}

export function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const id = useId();
  const valid = /^#[0-9a-f]{6}$/i.test(value);
  return (
    <div className="flex items-center gap-3">
      <input id={id} type="color" value={valid ? value : "#000000"} onChange={(e) => onChange(e.target.value.toUpperCase())} className="h-9 w-9 shrink-0 cursor-pointer rounded border border-line bg-transparent p-0.5" aria-label={`${label} colour picker`} />
      <label htmlFor={`${id}-hex`} className="flex-1 text-xs text-ink">
        {label}
      </label>
      <input id={`${id}-hex`} value={value} onChange={(e) => onChange(e.target.value)} className={cn("h-8 w-24 rounded border px-2 font-mono text-xs uppercase", valid ? "border-line" : "border-danger")} aria-label={`${label} hex value`} />
    </div>
  );
}

export function Toggle({ label, checked, onChange, description }: { label: string; checked: boolean; onChange: (v: boolean) => void; description?: string }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3">
      <span>
        <span className="block text-sm text-ink">{label}</span>
        {description && <span className="block text-xs text-ink-muted">{description}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors", checked ? "bg-primary" : "bg-ink/20")}
      >
        <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform", checked ? "translate-x-[22px]" : "translate-x-0.5")} />
      </button>
    </label>
  );
}

export function SelectField<T extends string>({ label, value, onChange, options }: { label: string; value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  const id = useId();
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-[11px] font-medium uppercase tracking-wide text-ink-muted">
        {label}
      </label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value as T)} className="h-9 w-full rounded-control border border-line bg-surface px-2.5 text-sm text-ink focus:border-primary focus:outline-none">
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function ItemControls({ index, count, onMove, onRemove, label }: { index: number; count: number; onMove: (from: number, to: number) => void; onRemove?: () => void; label: string }) {
  const btn = "flex h-7 w-7 items-center justify-center rounded text-ink-muted hover:bg-ink/5 hover:text-ink disabled:opacity-30";
  return (
    <div className="flex items-center gap-0.5">
      <button type="button" className={btn} disabled={index === 0} onClick={() => onMove(index, index - 1)} aria-label={`Move ${label} up`}>
        <ArrowUp className="h-3.5 w-3.5" />
      </button>
      <button type="button" className={btn} disabled={index === count - 1} onClick={() => onMove(index, index + 1)} aria-label={`Move ${label} down`}>
        <ArrowDown className="h-3.5 w-3.5" />
      </button>
      {onRemove && (
        <button type="button" className={cn(btn, "hover:text-danger")} onClick={onRemove} aria-label={`Remove ${label}`}>
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

export function move<T>(list: T[], from: number, to: number): T[] {
  const next = [...list];
  const [item] = next.splice(from, 1);
  if (item !== undefined) next.splice(to, 0, item);
  return next;
}
