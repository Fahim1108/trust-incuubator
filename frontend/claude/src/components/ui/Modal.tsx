"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";

interface OverlayProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Visually hide the title (still announced by screen readers). */
  hideTitle?: boolean;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

/** Matches the CSS transition duration on overlays/panels below. */
const EXIT_MS = 280;

/**
 * Keeps an overlay mounted while it animates out.
 * `mounted` → render the portal; `shown` → apply the "open" transition classes.
 */
function usePresence(open: boolean) {
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (open) {
      // Two frames so the browser paints the closed state before transitioning in.
      let raf2 = 0;
      const raf1 = requestAnimationFrame(() => {
        setMounted(true);
        setShown(false);
        raf2 = requestAnimationFrame(() => setShown(true));
      });
      return () => {
        cancelAnimationFrame(raf1);
        cancelAnimationFrame(raf2);
      };
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = window.setTimeout(() => setMounted(false), reduce ? 0 : EXIT_MS);
    return () => window.clearTimeout(t);
  }, [open]);
  return { mounted, shown: open && shown };
}

/** Focus trap, Escape to close, background scroll lock (without layout shift) and focus restore. */
function useOverlayBehaviour(open: boolean, onClose: () => void, panelRef: React.RefObject<HTMLDivElement | null>, mounted: boolean) {
  // Keep the latest onClose without re-running the effect (which would steal focus on every render).
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);
  useEffect(() => {
    if (!open || !mounted) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const { overflow, paddingRight } = document.body.style;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
    const focusable = () =>
      Array.from(panelRef.current?.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])') ?? []);
    (focusable()[0] ?? panelRef.current)?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
      if (e.key === "Tab") {
        const els = focusable();
        if (!els.length) return;
        const first = els[0]!, last = els[els.length - 1]!;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
      document.removeEventListener("keydown", onKey);
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, [open, mounted, panelRef]);
}

const overlayClasses = (shown: boolean) => cn("absolute inset-0 bg-ink/50 backdrop-blur-[2px] transition-opacity duration-300 ease-out", shown ? "opacity-100" : "opacity-0");

export function Modal({ open, onClose, title, hideTitle, description, children, footer, className }: OverlayProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const { mounted, shown } = usePresence(open);
  useOverlayBehaviour(open, onClose, panelRef, mounted);
  if (!mounted || typeof document === "undefined") return null;
  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4" aria-hidden={!open || undefined}>
      <div className={overlayClasses(shown)} onClick={onClose} aria-hidden />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          "relative flex max-h-[90vh] w-full flex-col rounded-t-2xl bg-surface shadow-lift transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform sm:max-w-lg sm:rounded-card",
          // Phones: bottom sheet slides up. Larger screens: subtle scale + fade.
          shown ? "translate-y-0 opacity-100 sm:scale-100" : "translate-y-6 opacity-0 sm:translate-y-2 sm:scale-[0.97]",
          className,
        )}
      >
        <div className={cn("flex items-start justify-between gap-4 border-b border-line px-5 py-4", hideTitle && "sr-only")}>
          <div>
            <h2 id={titleId} className="font-serif text-2xl text-ink">
              {title}
            </h2>
            {description && <p className="mt-1 text-sm text-ink-muted">{description}</p>}
          </div>
          <button type="button" onClick={onClose} className="-mr-2 rounded-full p-2 text-ink-muted transition-colors hover:bg-ink/5 hover:text-ink" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-5">{children}</div>
        {footer && <div className="border-t border-line px-5 py-4">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}

export function Drawer({ open, onClose, title, hideTitle, children, footer, side = "right", className }: OverlayProps & { side?: "left" | "right" }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const { mounted, shown } = usePresence(open);
  useOverlayBehaviour(open, onClose, panelRef, mounted);
  if (!mounted || typeof document === "undefined") return null;
  return createPortal(
    <div className="fixed inset-0 z-[60]" aria-hidden={!open || undefined}>
      <div className={overlayClasses(shown)} onClick={onClose} aria-hidden />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          "absolute top-0 flex h-full w-[88vw] max-w-md flex-col bg-surface shadow-lift transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform",
          side === "right" ? "right-0" : "left-0",
          shown ? "translate-x-0" : side === "right" ? "translate-x-full" : "-translate-x-full",
          className,
        )}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 id={titleId} className={cn("font-serif text-2xl text-ink", hideTitle && "sr-only")}>
            {title}
          </h2>
          <button type="button" onClick={onClose} className="-mr-2 ml-auto rounded-full p-2 text-ink-muted transition-colors hover:bg-ink/5 hover:text-ink" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
        {footer && <div className="border-t border-line p-5">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
