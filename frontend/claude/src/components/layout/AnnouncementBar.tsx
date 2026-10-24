"use client";

import { Tag, Truck } from "lucide-react";
import { useStorefront } from "@/context/StorefrontContext";

/** Desktop/tablet only — the approved mobile mockup has no announcement strip. */
export function AnnouncementBar() {
  const { header } = useStorefront();
  const { announcement: a } = header;
  if (!a.enabled) return null;
  return (
    <div className="hidden bg-primary text-white sm:block">
      <div className="container grid h-9 grid-cols-[1fr_auto_1fr] items-center gap-4 text-xs">
        <p className="flex items-center gap-2 truncate">
          {a.left && (
            <>
              <Truck className="h-4 w-4 shrink-0" strokeWidth={1.6} aria-hidden /> {a.left}
            </>
          )}
        </p>
        <p className="hidden truncate text-center md:block">
          {a.items.map((item, i) => (
            <span key={item}>
              {i > 0 && <span className="mx-3 opacity-50" aria-hidden>|</span>}
              {item}
            </span>
          ))}
        </p>
        <p className="flex items-center justify-end gap-2 truncate">
          {a.promo && (
            <>
              <Tag className="h-4 w-4 shrink-0" strokeWidth={1.6} aria-hidden /> {a.promo}
            </>
          )}
        </p>
      </div>
    </div>
  );
}
