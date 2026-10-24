import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { CtaLink } from "@/types";
import { cn } from "@/lib/cn";

export function SectionHeading({ title, subtitle, cta, className, as: Tag = "h2" }: { title: string; subtitle?: string; cta?: CtaLink; className?: string; as?: "h1" | "h2" }) {
  return (
    <div className={cn("mb-3 flex items-end justify-between gap-4 sm:mb-4", className)}>
      <div>
        <Tag className="font-display text-[22px] font-semibold leading-tight text-ink sm:text-[26px]">{title}</Tag>
        {subtitle && <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>}
      </div>
      {cta && (
        <Link href={cta.href} className="group inline-flex shrink-0 items-center gap-1 pb-1 text-xs font-medium text-primary hover:text-primary-dark sm:text-sm">
          {cta.label}
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover:translate-x-[5px]" aria-hidden />
        </Link>
      )}
    </div>
  );
}
