"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Subtle scroll reveal for major editorial sections (fade + 16px rise).
 * - Server render and first paint are fully visible (no hidden content without JS,
 *   no flash for sections already on screen).
 * - Only sections that start below the fold are hidden, then revealed once.
 * - Uses opacity/transform only, so it never shifts layout.
 * - Disabled for prefers-reduced-motion.
 */
export function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"idle" | "hidden" | "shown">("idle");

  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return; // already visible
    setState("hidden");
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setState("shown");
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        state !== "idle" && "transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
        state === "hidden" && "translate-y-4 opacity-0",
        className,
      )}
    >
      {children}
    </div>
  );
}
