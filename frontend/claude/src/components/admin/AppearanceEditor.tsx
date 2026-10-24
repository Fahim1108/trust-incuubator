"use client";

import { Download, ExternalLink, Laptop, Monitor, RotateCcw, Rocket, Save, Smartphone, Tablet, Upload } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, useTransition } from "react";
import { Button, Modal } from "@/components/ui";
import { cn } from "@/lib/cn";
import { publishStorefrontSettingsAction, saveStorefrontDraftAction } from "@/services/actions";
import type { StorefrontSettings } from "@/types";
import { PREVIEW_MESSAGE, PREVIEW_READY } from "./preview-protocol";
import { BannersPanel } from "./panels/BannersPanel";
import { FooterPanel, HeaderPanel } from "./panels/HeaderFooterPanel";
import { ProductCardPanel } from "./panels/ProductCardPanel";
import { SectionsPanel } from "./panels/SectionsPanel";
import { ThemePanel } from "./panels/ThemePanel";
import type { Updater } from "./types";


const TABS = [
  { id: "sections", label: "Sections", Panel: SectionsPanel },
  { id: "banners", label: "Banners", Panel: BannersPanel },
  { id: "theme", label: "Theme", Panel: ThemePanel },
  { id: "header", label: "Header", Panel: HeaderPanel },
  { id: "footer", label: "Footer", Panel: FooterPanel },
  { id: "cards", label: "Cards", Panel: ProductCardPanel },
] as const;

const DEVICES = [
  { id: "mobile", label: "Mobile", width: 390, Icon: Smartphone },
  { id: "tablet", label: "Tablet", width: 768, Icon: Tablet },
  { id: "laptop", label: "Laptop", width: 1024, Icon: Laptop },
  { id: "desktop", label: "Desktop", width: 1440, Icon: Monitor },
] as const;

/**
 * Frontend-only Website Appearance Editor.
 * - Edits a local copy of StorefrontSettings in React state.
 * - Streams changes to an <iframe> preview via postMessage.
 * - Save / Publish / Upload call server actions that report "not connected"
 *   until Codex wires them to the backend. Nothing is persisted here.
 */
export function AppearanceEditor({ initial }: { initial: StorefrontSettings }) {
  const [settings, setSettings] = useState<StorefrontSettings>(() => structuredClone(initial));
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("sections");
  const [device, setDevice] = useState<(typeof DEVICES)[number]["id"]>("desktop");
  const [mobileView, setMobileView] = useState<"edit" | "preview">("edit");
  const [dirty, setDirty] = useState(false);
  const [dialog, setDialog] = useState<{ title: string; body: string } | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState<string>();
  const [pending, start] = useTransition();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState({ w: 1000, h: 700 });

  const update: Updater = useCallback((mutate) => {
    setSettings((cur) => {
      const draft = structuredClone(cur);
      mutate(draft);
      return draft;
    });
    setDirty(true);
  }, []);

  const send = useCallback(() => {
    iframeRef.current?.contentWindow?.postMessage({ type: PREVIEW_MESSAGE, settings }, window.location.origin);
  }, [settings]);

  useEffect(() => {
    send();
  }, [send]);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin === window.location.origin && e.data?.type === PREVIEW_READY) send();
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [send]);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => entry && setStage({ w: entry.contentRect.width, h: entry.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const deviceWidth = DEVICES.find((d) => d.id === device)!.width;
  const scale = Math.min(1, (stage.w - 32) / deviceWidth);
  const frameHeight = (stage.h - 32) / scale;

  const runAction = (kind: "save" | "publish") =>
    start(async () => {
      const r = kind === "save" ? await saveStorefrontDraftAction(settings) : await publishStorefrontSettingsAction(settings);
      setDialog(
        r.ok
          ? { title: kind === "save" ? "Draft saved" : "Published", body: "Your changes were stored by the backend." }
          : { title: "Not saved", body: `${r.message} Use “Export JSON” to keep a copy of these settings, or paste them into src/config.` },
      );
    });

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), { href: url, download: "attires-arena-storefront-settings.json" });
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJson = () => {
    try {
      const parsed = JSON.parse(importText) as StorefrontSettings;
      if (!parsed?.theme?.colors || !Array.isArray(parsed.homepage) || !parsed.hero) throw new Error("Missing theme, homepage or hero keys.");
      setSettings(parsed);
      setDirty(true);
      setImportOpen(false);
      setImportText("");
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Invalid JSON");
    }
  };

  const ActivePanel = TABS.find((t) => t.id === tab)!.Panel;

  return (
    <div className="flex h-[100dvh] flex-col bg-[#F5F4F2]">
      {/* Top bar */}
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-line bg-surface px-3 sm:px-5">
        <Link href="/" className="font-serif text-lg text-primary">
          Attires Arena
        </Link>
        <span className="hidden text-sm text-ink-muted sm:inline">/ Appearance Editor</span>
        <span className="hidden rounded bg-warning/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-warning md:inline">Local preview · not saved</span>
        <div className="ml-auto flex items-center gap-1.5">
          {dirty && <span className="mr-1 hidden text-xs text-ink-muted lg:inline">Unsaved changes</span>}
          <Button size="sm" variant="ghost" onClick={() => { setSettings(structuredClone(initial)); setDirty(false); }} leftIcon={<RotateCcw className="h-3.5 w-3.5" />} className="hidden sm:inline-flex">
            Reset
          </Button>
          <Button size="sm" variant="outline" onClick={() => runAction("save")} disabled={pending} leftIcon={<Save className="h-3.5 w-3.5" />}>
            <span className="hidden sm:inline">Save draft</span>
          </Button>
          <Button size="sm" onClick={() => runAction("publish")} loading={pending} leftIcon={<Rocket className="h-3.5 w-3.5" />}>
            Publish
          </Button>
        </div>
      </header>

      {/* Mobile switcher */}
      <div className="flex shrink-0 border-b border-line bg-surface lg:hidden" role="tablist">
        {(["edit", "preview"] as const).map((v) => (
          <button key={v} type="button" role="tab" aria-selected={mobileView === v} onClick={() => setMobileView(v)} className={cn("flex-1 py-2.5 text-sm capitalize", mobileView === v ? "border-b-2 border-primary text-primary" : "text-ink-muted")}>
            {v}
          </button>
        ))}
      </div>

      <div className="flex min-h-0 flex-1">
        {/* Controls */}
        <aside className={cn("flex w-full shrink-0 flex-col border-r border-line bg-surface lg:flex lg:w-[380px]", mobileView === "edit" ? "flex" : "hidden")}>
          <nav className="flex shrink-0 gap-1 overflow-x-auto border-b border-line px-3 py-2 scrollbar-none" role="tablist" aria-label="Editor sections">
            {TABS.map((t) => (
              <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)} className={cn("whitespace-nowrap rounded-full px-3 py-1.5 text-xs", tab === t.id ? "bg-primary text-white" : "text-ink hover:bg-ink/5")}>
                {t.label}
              </button>
            ))}
          </nav>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <ActivePanel settings={settings} update={update} />
          </div>
          <div className="grid shrink-0 grid-cols-2 gap-2 border-t border-line p-3">
            <Button size="sm" variant="outline" onClick={exportJson} leftIcon={<Download className="h-3.5 w-3.5" />}>
              Export JSON
            </Button>
            <Button size="sm" variant="outline" onClick={() => { setImportError(undefined); setImportOpen(true); }} leftIcon={<Upload className="h-3.5 w-3.5" />}>
              Import JSON
            </Button>
          </div>
        </aside>

        {/* Preview */}
        <section className={cn("min-w-0 flex-1 flex-col lg:flex", mobileView === "preview" ? "flex" : "hidden")} aria-label="Live preview">
          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-line bg-surface px-3 py-2">
            <div className="flex gap-1" role="radiogroup" aria-label="Preview device">
              {DEVICES.map(({ id, label, width, Icon }) => (
                <button key={id} type="button" role="radio" aria-checked={device === id} onClick={() => setDevice(id)} title={`${label} · ${width}px`} className={cn("flex h-8 items-center gap-1.5 rounded-control px-2.5 text-xs", device === id ? "bg-selected text-primary" : "text-ink-muted hover:bg-ink/5")}>
                  <Icon className="h-4 w-4" aria-hidden /> <span className="hidden xl:inline">{label}</span>
                </button>
              ))}
            </div>
            <span className="text-xs text-ink-muted">
              {deviceWidth}px · {Math.round(scale * 100)}%
            </span>
            <a href="/admin/appearance/preview" target="_blank" rel="noreferrer" className="hidden items-center gap-1 text-xs text-primary sm:flex">
              Open <ExternalLink className="h-3 w-3" aria-hidden />
            </a>
          </div>
          <div ref={stageRef} className="relative min-h-0 flex-1 overflow-hidden">
            <div className="absolute left-1/2 top-4 origin-top overflow-hidden rounded-lg bg-white shadow-lift ring-1 ring-ink/10" style={{ width: deviceWidth, height: frameHeight, transform: `translateX(-50%) scale(${scale})` }}>
              <iframe ref={iframeRef} src="/admin/appearance/preview?embed=1" title="Homepage preview" className="h-full w-full border-0" onLoad={send} />
            </div>
          </div>
        </section>
      </div>

      <Modal open={Boolean(dialog)} onClose={() => setDialog(null)} title={dialog?.title ?? ""} footer={<div className="flex justify-end gap-2"><Button variant="outline" onClick={exportJson} leftIcon={<Download className="h-4 w-4" />}>Export JSON</Button><Button onClick={() => setDialog(null)}>OK</Button></div>}>
        <p className="text-sm leading-relaxed text-ink-muted">{dialog?.body}</p>
      </Modal>

      <Modal open={importOpen} onClose={() => setImportOpen(false)} title="Import settings JSON" footer={<div className="flex justify-end gap-2"><Button variant="ghost" onClick={() => setImportOpen(false)}>Cancel</Button><Button onClick={importJson}>Apply to preview</Button></div>}>
        <textarea value={importText} onChange={(e) => setImportText(e.target.value)} rows={12} className="w-full rounded-control border border-line p-3 font-mono text-xs focus:border-primary focus:outline-none" placeholder='{"theme": {...}, "homepage": [...]}' aria-label="Settings JSON" />
        {importError && <p className="mt-2 text-xs text-danger">{importError}</p>}
      </Modal>
    </div>
  );
}
