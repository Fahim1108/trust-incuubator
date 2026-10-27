"use client";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef, type ReactNode } from "react";
import { motion, motionEase } from "@/config/motion";

/** Animate ready route content; leave initial SSR, streaming and router timing alone. */
export function RouteMotion({ children }: { children: ReactNode }) {
  const path = usePathname();
  const previous = useRef(path);
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (previous.current === path) return;
    previous.current = path;
    if (!ref.current?.animate || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const animation = ref.current.animate([
      { opacity: 0, transform: "translateY(8px)" },
      { opacity: 1, transform: "translateY(0)" },
    ], { duration: motion.slow, easing: motionEase });
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const stop = () => { if (media.matches) animation.cancel(); };
    media.addEventListener("change", stop);
    return () => { animation.cancel(); media.removeEventListener("change", stop); };
  }, [path]);
  return <div ref={ref} data-route-motion>{children}</div>;
}
