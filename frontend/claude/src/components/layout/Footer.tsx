"use client";

import { Facebook, Instagram, Music2, MessageCircle, Youtube } from "lucide-react";
import Link from "next/link";
import { NewsletterForm } from "@/components/home/NewsletterForm";
import { useStorefront } from "@/context/StorefrontContext";
import type { SocialLink } from "@/types";
import { Logo } from "./Logo";

const socialIcons: Record<SocialLink["network"], typeof Facebook> = {
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
  tiktok: Music2,
  whatsapp: MessageCircle,
};

/** Light footer from the approved desktop mockup. */
export function Footer() {
  const { footer, demo } = useStorefront();
  return (
    <footer className="mt-10 border-t border-line bg-surface pb-20 md:pb-0">
      <div className="container py-7">
        <div className="grid gap-8 sm:grid-cols-3 lg:grid-cols-[1fr_1fr_1fr_1fr_1.6fr] [&>*]:min-w-0">
          <div className="sm:col-span-3 lg:col-span-1">
            <Logo small />
            <p className="mt-3 max-w-xs text-xs leading-relaxed text-ink-muted lg:hidden">{footer.tagline}</p>
          </div>
          {footer.columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="text-[13px] font-semibold text-ink">{col.title}</h2>
              <ul className="mt-2 space-y-1">
                {col.links.map((l) => (
                  <li key={l.href + l.label}>
                    <Link href={l.href} className="text-xs text-ink-muted transition-colors hover:text-primary">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
          {footer.newsletter.enabled && (
            <div className="sm:col-span-3 lg:col-span-1">
              <h2 className="text-[13px] font-semibold text-ink">{footer.newsletter.title}</h2>
              <p className="mt-1 text-xs text-ink-muted">{footer.newsletter.description}</p>
              <NewsletterForm className="mt-3" compact />
            </div>
          )}
        </div>
      </div>
      <div className="border-t border-line">
        <div className="container flex flex-col items-center gap-3 py-3 text-xs text-ink-muted sm:flex-row sm:justify-between">
          <p>{footer.copyright.replace("{year}", String(new Date().getFullYear()))}</p>
          <div className="flex items-center gap-4">
            <ul className="flex items-center gap-3">
              {footer.social.map((s) => {
                const Icon = socialIcons[s.network];
                return (
                  <li key={s.network}>
                    <a href={s.href} aria-label={s.network} className="flex h-8 w-8 items-center justify-center rounded-full text-ink transition-colors hover:text-primary">
                      <Icon className="h-4 w-4" aria-hidden />
                    </a>
                  </li>
                );
              })}
            </ul>
            <span className="h-4 w-px bg-line" aria-hidden />
            <span>Style Elevated. Always.</span>
          </div>
        </div>
        {demo.showNotices && (
          <p className="container pb-4 text-center text-[11px] leading-relaxed text-ink-muted/70 sm:text-left">
            Frontend demonstration: products, prices, reviews and brand listings are sample data. Brand names are shown for interface demonstration only and do not imply affiliation or authorised resale.
          </p>
        )}
      </div>
    </footer>
  );
}
