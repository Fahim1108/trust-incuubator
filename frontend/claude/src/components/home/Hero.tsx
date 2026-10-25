"use client";

import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { SmartImage } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { Banner, HeroSettings } from "@/types";

/** Played once per browser session on first mount — not on every slide change or remount. */
let heroIntroPlayed = false;

/** Staggered entrance (opacity + transform only, so no layout shift). */
const enter = (intro: boolean, step: number) =>
  intro ? { className: "animate-fade-up", style: { animationDelay: `${step * 60}ms` } as React.CSSProperties } : { className: "", style: undefined };

function Slide({ banner, active, priority, uppercase, intro }: { banner: Banner; active: boolean; priority: boolean; uppercase: boolean; intro: boolean }) {
  const light = banner.tone === "light";
  return (
    <div className={cn("aa-hero-slide absolute inset-0", active ? "opacity-100" : "pointer-events-none opacity-0")} aria-hidden={!active}>
      <SmartImage src={banner.image.src} alt={banner.image.alt} fill priority={priority} sizes="(min-width:1024px) 70vw, 100vw" className="object-cover object-[72%_center]" />
      <div className="absolute inset-0" style={{ background: `linear-gradient(90deg, rgba(20,10,8,${(banner.overlay ?? 30) / 100 + 0.25}) 0%, rgba(20,10,8,${(banner.overlay ?? 30) / 100}) 40%, rgba(20,10,8,0) 75%)` }} />
      <div className={cn("relative flex h-full flex-col justify-center px-6 sm:px-24 lg:px-[12%]", light ? "text-white" : "text-ink")}>
        {banner.eyebrow && <p className={cn("mb-3 text-[11px] font-medium uppercase tracking-[0.35em] opacity-90 sm:text-xs", enter(intro, 0).className)} style={enter(intro, 0).style}>{banner.eyebrow}</p>}
        <h2 className={cn("max-w-[11ch] font-serif text-[44px] leading-[0.95] sm:text-5xl lg:text-[64px]", uppercase && "uppercase", enter(intro, 0).className)} style={enter(intro, 0).style}>
          {banner.title}
        </h2>
        {banner.subtitle && <p className={cn("mt-4 max-w-sm text-sm opacity-90 sm:text-base lg:text-lg", enter(intro, 1).className)} style={enter(intro, 1).style}>{banner.subtitle}</p>}
        {banner.cta && (
          <Link href={banner.cta.href} tabIndex={active ? 0 : -1} style={enter(intro, 2).style} className={`aa-press group/cta mt-6 inline-flex h-11 w-fit items-center gap-2 rounded-control bg-primary px-6 text-xs font-semibold uppercase tracking-[0.14em] text-white shadow-lift transition-colors duration-300 hover:bg-primary-dark sm:h-12 sm:px-7 ${enter(intro, 2).className}`}>
            {banner.cta.label} <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover/cta:translate-x-[5px]" aria-hidden />
          </Link>
        )}
      </div>
    </div>
  );
}

const lines = (s?: string) => (s ? s.split("|").map((l) => l.trim()) : []);

/** Phone layout from the approved mobile mockup: light card, dark serif title, image on the right. */
function MobileEditorialSlide({ banner, active, priority, logoSrc, intro }: { banner: Banner; active: boolean; priority: boolean; logoSrc: string; intro: boolean }) {
  const accent = banner.titleAccent;
  const main = accent && banner.title.endsWith(accent) ? banner.title.slice(0, -accent.length).trim() : banner.title;
  return (
    <div className={cn("absolute inset-0 overflow-hidden bg-[#EFE9E2] aa-hero-slide", active ? "opacity-100" : "pointer-events-none opacity-0")} aria-hidden={!active}>
      {/* soft light from the left, like the mockup's sunlit wall */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_10%_20%,#FBF8F4_0%,#EFE9E2_55%,#E4DCD2_100%)]" />
      {banner.mobileImage && (
        <>
          <div className="absolute inset-y-0 right-[13%] w-[49%] [mask-image:linear-gradient(90deg,transparent_0%,#000_22%)] sm:hidden">
            <SmartImage src={banner.mobileImage.src} alt={banner.mobileImage.alt} fill priority={priority} sizes="60vw" className="object-cover object-left" />
          </div>
          <div className="absolute inset-y-0 left-[34%] right-[15%] hidden [mask-image:linear-gradient(90deg,transparent_0%,#000_12%,#000_88%,transparent_100%)] sm:block">
            <SmartImage src={(banner.desktopImage ?? banner.mobileImage).src} alt={(banner.desktopImage ?? banner.mobileImage).alt} fill priority={priority} sizes="55vw" className="object-cover object-bottom" />
          </div>
        </>
      )}
      {banner.script && (
        <p className="absolute right-[2%] top-[13%] rotate-[-8deg] text-right font-script text-[min(4.1vw,20px)] leading-[0.95] text-ink/85 sm:right-[10%] sm:top-[16%] sm:text-[clamp(26px,3vw,44px)] sm:leading-[1.05]" aria-hidden>
          {lines(banner.script).map((l) => (
            <span key={l} className="block">{l}</span>
          ))}
          <span className="ml-auto mt-1 block h-px w-10 rotate-[-6deg] bg-primary sm:h-0.5 sm:w-20" />
        </p>
      )}
      <div className="relative flex h-full w-[62%] flex-col justify-center pl-[5%] pr-1 sm:w-[40%] sm:pl-[12%]">
        {banner.showLogo && (
          <span className="mb-[2%] ml-[14%] block">
            <SmartImage src={logoSrc} alt="" width={312} height={300} className="h-auto w-[min(8.5vw,40px)] sm:w-[clamp(44px,5vw,72px)]" />
          </span>
        )}
        <h2 className={cn("font-display text-[min(8.4vw,38px)] font-bold sm:text-[clamp(44px,5.6vw,82px)] leading-[0.95] tracking-[-0.01em] text-ink", enter(intro, 0).className)} style={enter(intro, 0).style}>
          {main}
          {accent && <span className="block text-primary">{accent}</span>}
        </h2>
        {banner.tagline && (
          <p style={enter(intro, 1).style} className={cn(enter(intro, 1).className, "mt-[3%] text-[min(2.3vw,10px)] font-medium uppercase leading-[1.6] tracking-[0.3em] text-ink sm:text-[clamp(10px,1vw,15px)] sm:tracking-[0.45em]")}>
            {lines(banner.tagline).map((l) => (
              <span key={l} className="block">{l}</span>
            ))}
          </p>
        )}
        {banner.cta && (
          <Link href={banner.cta.href} tabIndex={active ? 0 : -1} style={enter(intro, 2).style} className={`${enter(intro, 2).className} aa-press group/cta mt-[4%] inline-flex h-[min(7.4vw,36px)] w-fit items-center gap-1 rounded-full bg-primary px-[min(4vw,20px)] text-[min(3.2vw,14px)] sm:h-[clamp(38px,3.4vw,50px)] sm:gap-2 sm:px-7 sm:text-[clamp(14px,1.25vw,18px)] font-medium text-white shadow-lift transition-colors duration-300 hover:bg-primary-dark`}>
            {banner.cta.label} <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover/cta:translate-x-[5px]" aria-hidden />
          </Link>
        )}
      </div>
    </div>
  );
}

function SideTile({ banner }: { banner: Banner }) {
  return (
    <Link href={banner.cta?.href ?? "#"} className="group relative block overflow-hidden rounded-card bg-[#EDE8E2]">
      <SmartImage src={banner.image.src} alt={banner.image.alt} fill sizes="25vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
      <div className="relative flex h-full flex-col justify-center p-6 xl:p-8">
        <h2 className="max-w-[8ch] font-serif text-[30px] leading-[1.05] text-ink xl:text-[36px]">{banner.title}</h2>
        {banner.cta && (
          <span className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
            {banner.cta.label} <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover:translate-x-[5px]" aria-hidden />
          </span>
        )}
      </div>
    </Link>
  );
}

export function Hero({ hero, uppercase = true, logoSrc = "/brand/logo-maroon.png" }: { hero: HeroSettings; uppercase?: boolean; logoSrc?: string }) {
  const slides = hero.slides;
  const [index, setIndex] = useState(0);
  // Same value on server and first client render (module flag is still false), so no hydration mismatch.
  const [intro, setIntro] = useState(false);
  useEffect(() => {
    const play = !heroIntroPlayed && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    heroIntroPlayed = true;
    const frame = requestAnimationFrame(() => { if (play) setIntro(true); });
    return () => cancelAnimationFrame(frame);
  }, []);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const go = useCallback((i: number) => setIndex((i + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    if (!hero.autoplayMs || paused || hovered || focused || slides.length < 2) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer: number | undefined;
    const sync = () => {
      window.clearInterval(timer);
      if (media.matches || document.hidden) return;
      timer = window.setInterval(() => setIndex(i => (i + 1) % slides.length), hero.autoplayMs);
    };
    sync();
    media.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => { window.clearInterval(timer); media.removeEventListener("change", sync); document.removeEventListener("visibilitychange", sync); };
  }, [hero.autoplayMs, paused, hovered, focused, slides.length]);

  if (slides.length && index >= slides.length) setIndex(0);

  if (!slides.length) return null;

  return (
    <section aria-roledescription="carousel" aria-label="Featured collections" className="container pt-1 sm:max-w-none sm:px-0 sm:pt-0">
      <div className={cn("grid gap-3 lg:gap-4", hero.side.length ? "lg:grid-cols-[2.6fr_1fr]" : "")}>
        <div className="relative aspect-[2/1] overflow-hidden rounded-2xl bg-[#8E7B6B] shadow-soft sm:aspect-auto sm:h-[clamp(300px,25vw,400px)] sm:rounded-none sm:shadow-none" onPointerEnter={e => { if (e.pointerType === "mouse") setHovered(true); }} onPointerLeave={() => setHovered(false)} onFocusCapture={() => setFocused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
          {slides.map((s, i) => (
            <div key={s.id} className="contents">
              {s.mobileImage ? (
                <MobileEditorialSlide banner={s} active={i === index} priority={i === 0} logoSrc={logoSrc} intro={intro && i === 0} />
              ) : (
                <Slide banner={s} active={i === index} priority={i === 0} uppercase={uppercase} intro={intro && i === 0} />
              )}
            </div>
          ))}

          {/* Phone dots (centred, maroon — as in the mobile mockup) */}
          {slides.length > 1 && (
            <div className="absolute bottom-0.5 left-1/2 flex -translate-x-1/2 gap-1 sm:bottom-2" role="tablist" aria-label="Choose slide">
              {slides.map((s, i) => (
                <button key={s.id} type="button" role="tab" aria-selected={i === index} aria-label={`Slide ${i + 1}: ${s.title}`} onClick={() => go(i)} className="flex h-6 w-5 items-center justify-center">
                  <span className={cn("block h-2 w-2 rounded-full transition-colors", i === index ? "bg-primary" : slides[index]?.mobileImage ? "bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.08)]" : "bg-white/60")} />
                </button>
              ))}
            </div>
          )}

          {/* Badges strip (desktop) */}
          {hero.badges.length > 0 && !slides[index]?.mobileImage && (
            <ul className="absolute bottom-5 left-6 hidden items-center gap-4 text-xs text-white/90 sm:left-10 md:flex lg:left-14">
              {hero.badges.map((b, i) => (
                <li key={b} className="flex items-center gap-4">
                  {i > 0 && <span className="h-3 w-px bg-white/40" aria-hidden />}
                  {b}
                </li>
              ))}
            </ul>
          )}

          {slides.length > 1 && (
            <>
              {/* White circular arrows at the sides (desktop mockup) */}
              <button type="button" onClick={() => go(index - 1)} className="aa-press absolute left-4 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-ink shadow-soft transition-colors hover:text-primary sm:flex lg:left-7" aria-label="Previous slide">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button type="button" onClick={() => go(index + 1)} className="aa-press absolute right-4 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-ink shadow-soft transition-colors hover:text-primary sm:flex lg:right-7" aria-label="Next slide">
                <ChevronRight className="h-5 w-5" />
              </button>
              {hero.autoplayMs > 0 && (
                <button type="button" onClick={() => setPaused((p) => !p)} className="aa-press absolute bottom-3 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-ink/70 shadow-sm hover:text-primary sm:flex lg:right-7" aria-label={paused ? "Play slideshow" : "Pause slideshow"}>
                  {paused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
                </button>
              )}
            </>
          )}
        </div>

        {hero.side.length > 0 && (
          <div className="hidden grid-rows-2 gap-4 lg:grid">
            {hero.side.slice(0, 2).map((b) => (
              <SideTile key={b.id} banner={b} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
