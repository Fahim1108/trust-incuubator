"use client";

import { ChevronDown, Heart, Package, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Drawer } from "@/components/ui";
import { useStorefront } from "@/context/StorefrontContext";
import { cn } from "@/lib/cn";

export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { header } = useStorefront();
  const [expanded, setExpanded] = useState<string | null>(null);
  return (
    <Drawer open={open} onClose={onClose} title="Menu" side="left">
      <nav aria-label="Mobile" className="px-2 py-3">
        <ul>
          {header.navigation.map((item) => (
            <li key={item.label} className="border-b border-line/70 last:border-0">
              {item.children?.length ? (
                <>
                  <button
                    type="button"
                    onClick={() => setExpanded((e) => (e === item.label ? null : item.label))}
                    aria-expanded={expanded === item.label}
                    className="flex w-full items-center justify-between px-3 py-4 text-left text-[15px] text-ink"
                  >
                    {item.label}
                    <ChevronDown className={cn("h-4 w-4 text-ink-muted transition-transform", expanded === item.label && "rotate-180")} aria-hidden />
                  </button>
                  {expanded === item.label && (
                    <ul className="grid grid-cols-2 gap-1 px-3 pb-4">
                      {item.children.map((c) => (
                        <li key={c.href}>
                          <Link href={c.href} onClick={onClose} className="block rounded-control bg-[#F7F6F5] px-3 py-2.5 text-sm text-ink hover:bg-selected hover:text-primary">
                            {c.label}
                          </Link>
                        </li>
                      ))}
                      <li className="col-span-2">
                        <Link href={item.href} onClick={onClose} className="block px-3 py-2 text-sm font-medium text-primary">
                          View all {item.label.toLowerCase()}
                        </Link>
                      </li>
                    </ul>
                  )}
                </>
              ) : (
                <Link href={item.href} onClick={onClose} className={cn("block px-3 py-4 text-[15px]", item.highlight ? "text-primary" : "text-ink")}>
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
        <div className="mt-6 grid grid-cols-3 gap-2 px-1">
          {[
            { href: "/account", label: "Account", Icon: User },
            { href: "/wishlist", label: "Wishlist", Icon: Heart },
            { href: "/track-order", label: "Track", Icon: Package },
          ].map(({ href, label, Icon }) => (
            <Link key={href} href={href} onClick={onClose} className="flex flex-col items-center gap-1.5 rounded-card border border-line py-4 text-xs text-ink hover:border-primary/40 hover:text-primary">
              <Icon className="h-5 w-5" aria-hidden />
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </Drawer>
  );
}
