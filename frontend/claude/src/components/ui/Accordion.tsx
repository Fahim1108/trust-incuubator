"use client";

import { ChevronDown } from "lucide-react";
import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface AccordionItem {
  id: string;
  title: ReactNode;
  content: ReactNode;
}

export function Accordion({ items, defaultOpen = [], allowMultiple = true, className }: { items: AccordionItem[]; defaultOpen?: string[]; allowMultiple?: boolean; className?: string }) {
  const [open, setOpen] = useState<string[]>(defaultOpen);
  const baseId = useId();
  const toggle = (id: string) =>
    setOpen((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : allowMultiple ? [...cur, id] : [id]));

  return (
    <div className={cn("divide-y divide-line border-y border-line", className)}>
      {items.map((item) => {
        const isOpen = open.includes(item.id);
        const panelId = `${baseId}-${item.id}`;
        return (
          <div key={item.id}>
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(item.id)}
                className="flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-medium text-ink hover:text-primary"
              >
                {item.title}
                <ChevronDown className={cn("h-4 w-4 shrink-0 text-ink-muted transition-transform duration-200", isOpen && "rotate-180")} aria-hidden />
              </button>
            </h3>
            <div id={panelId} role="region" hidden={!isOpen} className="pb-5 text-sm leading-relaxed text-ink-muted">
              {item.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}
