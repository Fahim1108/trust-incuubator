import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { SmartImage } from "@/components/ui";
import type { Banner } from "@/types";

export function PromoBanners({ banners }: { banners: Banner[] }) {
  if (!banners.length) return null;
  return (
    <section aria-label="Promotions" className="container">
      <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
        {banners.map((b) => (
          <Link key={b.id} href={b.cta?.href ?? "#"} className="group relative block h-[220px] overflow-hidden rounded-card bg-[#E2D8CB] sm:h-[260px]">
            <SmartImage src={b.image.src} alt={b.image.alt} fill sizes="(min-width:768px) 50vw, 100vw" className="object-cover object-right transition-transform duration-700 group-hover:scale-[1.03]" />
            <div className="relative flex h-full max-w-[60%] flex-col justify-center p-6 sm:p-9">
              <h2 className="font-serif text-[30px] leading-tight text-ink sm:text-4xl">{b.title}</h2>
              {b.subtitle && <p className="mt-2 text-sm text-ink/70">{b.subtitle}</p>}
              {b.cta && (
                <span className="mt-5 inline-flex h-10 w-fit items-center gap-2 rounded-control border border-primary/70 px-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-white">
                  {b.cta.label} <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover:translate-x-[5px]" aria-hidden />
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
