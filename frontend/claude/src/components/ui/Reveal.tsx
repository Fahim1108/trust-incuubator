"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { motion, motionEase } from "@/config/motion";
import { cn } from "@/lib/cn";

/** Content is never hidden by React/CSS. Start a once-only entrance on intersection. */
export function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!el || !el.animate || !("IntersectionObserver" in window) || media.matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * .92) return;
    let animation: Animation | undefined;
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      el.dataset.reveal = "shown";
      if (!media.matches) animation = el.animate([
        { opacity: 0, transform: "translateY(12px)" },
        { opacity: 1, transform: "translateY(0)" },
      ], { duration: motion.reveal, easing: motionEase });
    }, { rootMargin: "0px 0px -4% 0px", threshold: .01 });
    const stop = () => { if (media.matches) { observer.disconnect(); animation?.cancel(); } };
    media.addEventListener("change", stop);
    observer.observe(el);
    return () => { observer.disconnect(); animation?.cancel(); media.removeEventListener("change", stop); };
  }, []);
  return <div ref={ref} data-reveal="idle" className={cn("aa-reveal", className)}>{children}</div>;
}
