"use client";

import { CheckCircle2, Info, TriangleAlert, X } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type ToastTone = "success" | "info" | "warning";
interface Toast {
  id: number;
  title: string;
  description?: string;
  tone: ToastTone;
}

const ToastContext = createContext<{ toast: (t: Omit<Toast, "id">) => void } | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => setToasts((ts) => ts.filter((t) => t.id !== id)), []);
  const toast = useCallback(
    (t: Omit<Toast, "id">) => {
      const id = Date.now() + Math.random();
      setToasts((ts) => [...ts.slice(-2), { ...t, id }]);
      window.setTimeout(() => dismiss(id), t.tone === "warning" ? 6000 : 3500);
    },
    [dismiss],
  );
  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-20 z-[70] flex flex-col items-center gap-2 px-4 md:bottom-6 md:items-end md:pr-6">
        {toasts.map((t) => {
          const Icon = t.tone === "success" ? CheckCircle2 : t.tone === "warning" ? TriangleAlert : Info;
          return (
            <div key={t.id} role="status" className="pointer-events-auto flex w-full max-w-sm animate-slide-up items-start gap-3 rounded-card border border-line bg-surface p-4 shadow-lift">
              <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", t.tone === "success" ? "text-success" : t.tone === "warning" ? "text-warning" : "text-primary")} aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink">{t.title}</p>
                {t.description && <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">{t.description}</p>}
              </div>
              <button type="button" onClick={() => dismiss(t.id)} className="-m-1 rounded p-1 text-ink-muted hover:text-ink" aria-label="Dismiss notification">
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx.toast;
}
