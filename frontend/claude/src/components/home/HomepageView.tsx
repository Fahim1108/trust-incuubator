import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ProductGrid } from "@/components/product/ProductGrid";
import { resolveLook, selectHomepageCollections, type MerchandisingCandidate } from "@/lib/merchandising";
import styles from "./MerchandisingSection.module.css";
import { Reveal, SectionHeading, SmartImage } from "@/components/ui";
import type { Brand, Category, HomepageSection, Product, StorefrontSettings } from "@/types";
import { HomeCategories, HomeBrands } from "./HomeBrowse";
import { Hero } from "./Hero";
import { NewsletterSection } from "./NewsletterSection";
import { PromoBanners } from "./PromoBanners";
import { ValueProps } from "./ValueProps";

export interface HomepageData {
  candidates?: MerchandisingCandidate[];
  categories: Category[];
  brands: Brand[];
  newArrivals: Product[];
  featured: Product[];
  bestSellers: Product[];
}

/** Major editorial sections get a one-time scroll reveal; individual product cards never animate in. */
const REVEAL_SECTIONS = new Set<HomepageSection["type"]>(["categories", "brands", "new-arrivals", "featured", "trending", "complete-look", "most-popular", "promo-banners", "best-sellers", "newsletter"]);

type HomepageSettings = Pick<StorefrontSettings, "homepage" | "hero" | "promoBanners" | "valueProps" | "footer" | "theme" | "logo">;

/**
 * Renders homepage sections in the configured order. Used by the real homepage
 * (server) and by the Appearance Editor preview (client) so both stay identical.
 */
export function HomepageView({ settings, data }: { settings: HomepageSettings; data: HomepageData }) {
  const selected = selectHomepageCollections(settings.homepage, data.candidates ?? []);
  const sections = settings.homepage.filter(s => s.enabled && (!selected.has(s.id) || selected.get(s.id)!.length > 0) && (s.type !== "complete-look" || s.looks?.some(look => resolveLook(look, data.candidates ?? []).length)));
  return (
    <div className="space-y-5 pb-4 has-[>[data-section=value-props]:last-child]:-mb-10 has-[>[data-section=value-props]:last-child]:pb-0 sm:space-y-6 [&>*:nth-child(n+5)]:mt-10 sm:[&>*:nth-child(n+5)]:mt-8">
      {sections
        .map((section) => (
          <div key={section.id} data-section={section.type} className={section.type === "value-props" ? "hidden sm:block" : undefined}>
            {REVEAL_SECTIONS.has(section.type) ? (
              <Reveal>
                <SectionRenderer section={section} settings={settings} data={data} products={selected.get(section.id) ?? []} />
              </Reveal>
            ) : (
              <SectionRenderer section={section} settings={settings} data={data} products={selected.get(section.id) ?? []} />
            )}
          </div>
        ))}
    </div>
  );
}

function SectionRenderer({ section, settings, data, products }: { section: HomepageSection; settings: HomepageSettings; data: HomepageData; products: Product[] }) {
  const title = section.title ?? section.adminLabel;
  switch (section.type) {
    case "hero":
      return <Hero hero={settings.hero} uppercase={settings.theme.typography.headingUppercaseHero} logoSrc={settings.logo.primary} />;
    case "value-props":
      // Hidden on phones to match the mobile mockup (hero → Categories/Brands).
      return <ValueProps items={settings.valueProps} />;
    case "categories":
      return (
        <section className="container" aria-label="Shop by Categories">
          <h2 className="mb-3 font-display text-[22px] font-semibold text-ink sm:text-[26px]">Shop by Categories</h2>
          <HomeCategories categories={data.categories} />
        </section>
      );
    case "brands":
      return (
        <section className="container" aria-label="Shop by Brands">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="font-display text-[22px] font-semibold text-ink sm:text-[26px]">Shop by Brands</h2>
            {section.cta && (
              <Link href={section.cta.href} className="group flex items-center gap-1 text-[11px] font-medium text-primary sm:text-[13px]">
                {section.cta.label} <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
              </Link>
            )}
          </div>
          <HomeBrands brands={data.brands} />
        </section>
      );
    case "new-arrivals":
    case "featured":
    case "trending":
    case "most-popular":
    case "best-sellers":
      return (
        <section className="container" aria-label={title}>
          <SectionHeading title={title} subtitle={section.subtitle} cta={section.cta} />
          <ProductGrid products={products} brands={data.brands} columns={4} className={styles.grid} />
        </section>
      );
    case "complete-look":
      return (
        <section className="container" aria-label={title}>
          <SectionHeading title={title} subtitle={section.subtitle} cta={section.cta} />
          <div className="space-y-8">
            {section.looks?.map(look => {
              const items = resolveLook(look, data.candidates ?? []);
              return items.length ? (
                <article key={look.id} className={styles.look} aria-label={look.title}>
                  <div className={styles.lookPhoto}>
                    <SmartImage src={look.image.src} alt={look.image.alt} fill sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" />
                  </div>
                  <div>
                    <h3 className="mb-4 font-display text-2xl">{look.title}</h3>
                    <ProductGrid products={items} brands={data.brands} columns={4} className="!grid-cols-2" />
                  </div>
                </article>
              ) : null;
            })}
          </div>
        </section>
      );
    case "promo-banners":
      return <PromoBanners banners={settings.promoBanners} />;
    case "newsletter":
      return <NewsletterSection title={settings.footer.newsletter.title} description={settings.footer.newsletter.description} />;
    default:
      return null;
  }
}
