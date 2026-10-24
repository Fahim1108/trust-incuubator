"use client";

import { Plus } from "lucide-react";
import { Group, ItemControls, move, TextField, Toggle } from "../fields";
import type { PanelProps } from "../types";

export function HeaderPanel({ settings, update }: PanelProps) {
  const h = settings.header;
  return (
    <>
      <Group title="Announcement bar">
        <Toggle label="Show announcement bar" checked={h.announcement.enabled} onChange={(v) => update((d) => void (d.header.announcement.enabled = v))} />
        {h.announcement.items.map((item, i) => (
          <div key={i} className="flex items-end gap-1">
            <div className="flex-1">
              <TextField label={`Message ${i + 1}`} value={item} onChange={(v) => update((d) => void (d.header.announcement.items[i] = v))} />
            </div>
            <ItemControls index={i} count={h.announcement.items.length} label={`message ${i + 1}`} onMove={(a, b) => update((d) => void (d.header.announcement.items = move(d.header.announcement.items, a, b)))} onRemove={() => update((d) => void d.header.announcement.items.splice(i, 1))} />
          </div>
        ))}
        <button type="button" onClick={() => update((d) => void d.header.announcement.items.push("New announcement"))} className="flex items-center gap-1 text-xs font-medium text-primary">
          <Plus className="h-3.5 w-3.5" /> Add message
        </button>
      </Group>
      <Group title="Navigation" description="Top-level menu items. Sub-menus are edited in src/config/header.ts.">
        {h.navigation.map((n, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_auto] items-end gap-1.5">
            <TextField label="Label" value={n.label} onChange={(v) => update((d) => void (d.header.navigation[i]!.label = v))} />
            <TextField label="Link" value={n.href} onChange={(v) => update((d) => void (d.header.navigation[i]!.href = v))} />
            <ItemControls index={i} count={h.navigation.length} label={n.label} onMove={(a, b) => update((d) => void (d.header.navigation = move(d.header.navigation, a, b)))} onRemove={() => update((d) => void d.header.navigation.splice(i, 1))} />
          </div>
        ))}
        <button type="button" onClick={() => update((d) => void d.header.navigation.push({ label: "New link", href: "/shop" }))} className="flex items-center gap-1 text-xs font-medium text-primary">
          <Plus className="h-3.5 w-3.5" /> Add menu item
        </button>
      </Group>
      <Group title="Header options">
        <TextField label="Search placeholder" value={h.searchPlaceholder} onChange={(v) => update((d) => void (d.header.searchPlaceholder = v))} />
        <Toggle label="Sticky header" checked={h.sticky} onChange={(v) => update((d) => void (d.header.sticky = v))} />
      </Group>
      <Group title="Logo" description="Official logo files live in /public/brand. Replace files there; do not redraw.">
        <TextField label="Header logo path" value={settings.logo.primary} onChange={(v) => update((d) => void (d.logo.primary = v))} />
        <TextField label="Footer logo path" value={settings.logo.inverse} onChange={(v) => update((d) => void (d.logo.inverse = v))} />
      </Group>
      <Group title="Value propositions">
        {settings.valueProps.map((v, i) => (
          <div key={i} className="grid grid-cols-2 gap-1.5">
            <TextField label="Title" value={v.title} onChange={(val) => update((d) => void (d.valueProps[i]!.title = val))} />
            <TextField label="Description" value={v.description} onChange={(val) => update((d) => void (d.valueProps[i]!.description = val))} />
          </div>
        ))}
      </Group>
    </>
  );
}

export function FooterPanel({ settings, update }: PanelProps) {
  const f = settings.footer;
  return (
    <>
      <Group title="Brand">
        <TextField label="Tagline" value={f.tagline} onChange={(v) => update((d) => void (d.footer.tagline = v))} multiline />
        <TextField label="Copyright ({year} is replaced)" value={f.copyright} onChange={(v) => update((d) => void (d.footer.copyright = v))} />
      </Group>
      <Group title="Newsletter">
        <Toggle label="Show newsletter in footer" checked={f.newsletter.enabled} onChange={(v) => update((d) => void (d.footer.newsletter.enabled = v))} />
        <TextField label="Title" value={f.newsletter.title} onChange={(v) => update((d) => void (d.footer.newsletter.title = v))} />
        <TextField label="Description" value={f.newsletter.description} onChange={(v) => update((d) => void (d.footer.newsletter.description = v))} multiline />
      </Group>
      <Group title="Contact details">
        {(["phone", "email", "address", "hours"] as const).map((k) => (
          <TextField key={k} label={k} value={f.contact[k]} onChange={(v) => update((d) => void (d.footer.contact[k] = v))} />
        ))}
      </Group>
      <Group title="Link columns">
        {f.columns.map((col, ci) => (
          <details key={ci} className="rounded-control border border-line">
            <summary className="cursor-pointer px-3 py-2 text-sm text-ink">{col.title}</summary>
            <div className="space-y-2 border-t border-line p-3">
              <TextField label="Column title" value={col.title} onChange={(v) => update((d) => void (d.footer.columns[ci]!.title = v))} />
              {col.links.map((l, li) => (
                <div key={li} className="grid grid-cols-[1fr_1fr_auto] items-end gap-1.5">
                  <TextField label="Label" value={l.label} onChange={(v) => update((d) => void (d.footer.columns[ci]!.links[li]!.label = v))} />
                  <TextField label="Link" value={l.href} onChange={(v) => update((d) => void (d.footer.columns[ci]!.links[li]!.href = v))} />
                  <ItemControls index={li} count={col.links.length} label={l.label} onMove={(a, b) => update((d) => void (d.footer.columns[ci]!.links = move(d.footer.columns[ci]!.links, a, b)))} onRemove={() => update((d) => void d.footer.columns[ci]!.links.splice(li, 1))} />
                </div>
              ))}
              <button type="button" onClick={() => update((d) => void d.footer.columns[ci]!.links.push({ label: "New link", href: "/" }))} className="flex items-center gap-1 text-xs font-medium text-primary">
                <Plus className="h-3.5 w-3.5" /> Add link
              </button>
            </div>
          </details>
        ))}
      </Group>
      <Group title="Payment badges">
        <TextField label="Comma-separated" value={f.paymentBadges.join(", ")} onChange={(v) => update((d) => void (d.footer.paymentBadges = v.split(",").map((s) => s.trim()).filter(Boolean)))} />
      </Group>
    </>
  );
}
