import { Banknote, Gem, Headphones, Lock, RotateCcw, ShieldCheck, Sparkles, Truck } from "lucide-react";
import type { ValueProp } from "@/types";

const icons = { "shield-check": ShieldCheck, truck: Truck, "rotate-ccw": RotateCcw, lock: Lock, sparkles: Sparkles, banknote: Banknote, gem: Gem, headphones: Headphones };

/** Full-width warm band with divided trust points (desktop mockup). */
export function ValueProps({ items }: { items: ValueProp[] }) {
  return (
    <section aria-label="Why shop with us" className="border-y border-line bg-[#F6F3EF]">
      <ul className="container grid grid-cols-2 gap-y-5 py-5 md:grid-cols-4 md:divide-x md:divide-ink/15">
        {items.map((v) => {
          const Icon = icons[v.icon];
          return (
            <li key={v.title} className="flex items-center justify-center gap-3 px-3">
              <Icon className="h-7 w-7 shrink-0 text-ink" strokeWidth={1.3} aria-hidden />
              <span>
                <span className="block text-[13px] font-medium text-ink">{v.title}</span>
                <span className="block text-xs text-ink-muted">{v.description}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
