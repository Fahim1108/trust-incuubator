"use client";

import { ImageUp, Plus } from "lucide-react";
import { useState } from "react";
import { uploadMediaAction } from "@/services/actions";
import type { Banner } from "@/types";
import { Group, ItemControls, move, NumberField, SelectField, TextField } from "../fields";
import type { PanelProps } from "../types";

function BannerEditor({ banner, onChange, showOverlay }: { banner: Banner; onChange: (b: Banner) => void; showOverlay?: boolean }) {
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);
  const set = <K extends keyof Banner>(k: K, v: Banner[K]) => onChange({ ...banner, [k]: v });
  return (
    <div className="space-y-2.5">
      {"eyebrow" in banner || showOverlay ? <TextField label="Eyebrow" value={banner.eyebrow ?? ""} onChange={(v) => set("eyebrow", v || undefined)} /> : null}
      <TextField label="Title" value={banner.title} onChange={(v) => set("title", v)} />
      <TextField label="Subtitle" value={banner.subtitle ?? ""} onChange={(v) => set("subtitle", v || undefined)} multiline />
      <div className="grid grid-cols-2 gap-2">
        <TextField label="Button label" value={banner.cta?.label ?? ""} onChange={(v) => set("cta", { href: banner.cta?.href ?? "/shop", label: v })} />
        <TextField label="Button link" value={banner.cta?.href ?? ""} onChange={(v) => set("cta", { label: banner.cta?.label ?? "Shop Now", href: v })} />
      </div>
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <TextField label="Image URL" value={banner.image.src} onChange={(v) => set("image", { ...banner.image, src: v })} />
        </div>
        <label className="flex h-9 cursor-pointer items-center gap-1.5 rounded-control border border-line px-2.5 text-xs text-ink hover:border-ink/40">
          <ImageUp className="h-3.5 w-3.5" aria-hidden /> Upload
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              // Local preview only — the file is not uploaded anywhere.
              set("image", { ...banner.image, src: URL.createObjectURL(file) });
              const r = await uploadMediaAction({ name: file.name, type: file.type, size: file.size });
              setUploadMsg(r.ok ? null : `${r.message} Showing a temporary local preview.`);
            }}
          />
        </label>
      </div>
      {uploadMsg && <p className="text-[11px] text-warning">{uploadMsg}</p>}
      <TextField label="Image alt text" value={banner.image.alt} onChange={(v) => set("image", { ...banner.image, alt: v })} />
      {showOverlay && (
        <div className="grid grid-cols-2 gap-2">
          <SelectField label="Text colour" value={banner.tone} onChange={(v) => set("tone", v)} options={[{ value: "light", label: "Light" }, { value: "dark", label: "Dark" }]} />
          <NumberField label="Overlay %" min={0} max={80} value={banner.overlay ?? 30} onChange={(v) => set("overlay", v)} />
        </div>
      )}
    </div>
  );
}

const newSlide = (): Banner => ({
  id: `slide-${Date.now()}`,
  eyebrow: "New Collection",
  title: "New Slide",
  subtitle: "Describe the collection.",
  cta: { label: "Shop Now", href: "/shop" },
  image: { src: "/images/banners/hero-quiet-luxury.svg", alt: "" },
  align: "left",
  tone: "light",
  overlay: 30,
});

export function BannersPanel({ settings, update }: PanelProps) {
  const [open, setOpen] = useState<string | null>(settings.hero.slides[0]?.id ?? null);
  const slides = settings.hero.slides;
  return (
    <>
      <Group
        title="Hero slides"
        description="Main homepage slider. First slide loads with priority."
        actions={
          <button type="button" onClick={() => update((d) => void d.hero.slides.push(newSlide()))} className="flex items-center gap-1 text-xs font-medium text-primary">
            <Plus className="h-3.5 w-3.5" /> Add
          </button>
        }
      >
        <NumberField label="Autoplay (seconds, 0 = off)" min={0} max={15} value={settings.hero.autoplayMs / 1000} onChange={(v) => update((d) => void (d.hero.autoplayMs = v * 1000))} />
        <ul className="space-y-2">
          {slides.map((s, i) => (
            <li key={s.id} className="rounded-control border border-line">
              <div className="flex items-center justify-between gap-2 px-3 py-2">
                <button type="button" onClick={() => setOpen(open === s.id ? null : s.id)} className="flex-1 truncate text-left text-sm text-ink" aria-expanded={open === s.id}>
                  {i + 1}. {s.title || "Untitled"}
                </button>
                <ItemControls index={i} count={slides.length} label={s.title} onMove={(a, b) => update((d) => void (d.hero.slides = move(d.hero.slides, a, b)))} onRemove={slides.length > 1 ? () => update((d) => void d.hero.slides.splice(i, 1)) : undefined} />
              </div>
              {open === s.id && (
                <div className="border-t border-line p-3">
                  <BannerEditor banner={s} showOverlay onChange={(b) => update((d) => void (d.hero.slides[i] = b))} />
                </div>
              )}
            </li>
          ))}
        </ul>
      </Group>
      <Group title="Hero side tiles" description="Shown beside the slider on laptop and desktop.">
        {settings.hero.side.map((b, i) => (
          <details key={b.id} className="rounded-control border border-line">
            <summary className="cursor-pointer px-3 py-2 text-sm text-ink">{b.title}</summary>
            <div className="border-t border-line p-3">
              <BannerEditor banner={b} onChange={(nb) => update((d) => void (d.hero.side[i] = nb))} />
            </div>
          </details>
        ))}
      </Group>
      <Group title="Hero badges">
        <TextField label="Comma-separated" value={settings.hero.badges.join(", ")} onChange={(v) => update((d) => void (d.hero.badges = v.split(",").map((s) => s.trim()).filter(Boolean)))} />
      </Group>
      <Group title="Promotional banners">
        {settings.promoBanners.map((b, i) => (
          <details key={b.id} className="rounded-control border border-line">
            <summary className="cursor-pointer px-3 py-2 text-sm text-ink">{b.title}</summary>
            <div className="border-t border-line p-3">
              <BannerEditor banner={b} onChange={(nb) => update((d) => void (d.promoBanners[i] = nb))} />
            </div>
          </details>
        ))}
      </Group>
    </>
  );
}
