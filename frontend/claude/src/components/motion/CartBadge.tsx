"use client";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/** Emphasize actual quantity changes once; hydration and idle counts do not pulse. */
export function CartBadge({ count, ready, className }: { count: number; ready: boolean; className?: string }) {
  const previous = useRef<number | null>(null);
  const [version, setVersion] = useState(0);
  useEffect(() => {
    if (!ready) return;
    const changed = previous.current !== null && previous.current !== count;
    previous.current = count;
    if (!changed) return;
    const frame = requestAnimationFrame(() => setVersion(v => v + 1));
    return () => cancelAnimationFrame(frame);
  }, [count, ready]);
  return <span className={className}><span key={version} className={cn(version > 0 && "aa-badge-update")} data-cart-count>{ready ? count : 0}</span></span>;
}
