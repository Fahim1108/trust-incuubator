import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductRail } from "@/components/product/ProductRail";
import { Reveal, SectionHeading } from "@/components/ui";
import type { Brand, Category, HomepageSection, Product, StorefrontSettings } from "@/types";
import { CategoryBrandTabs, TopBrandsRow } from "./CategoryBrandTabs";
import { Hero } from "./Hero";
import { NewsletterSection } from "./NewsletterSection";
import { PromoBanners } from "./PromoBanners";
import { ValueProps } from "./ValueProps";

export interface HomepageData {
  categories: Category[];
  brands: Brand[];
  newArrivals: Product[];
  featured: Product[];
  bestSellers: Product[];
}

/** Major editorial sections get a one-time scroll reveal; individual product cards never animate in. */
const REVEAL_SECTIONS = new Set<HomepageSection["type"]>(["promo-banners", "featured", "best-sellers", "newsletter"]);

type HomepageSettings = Pick<StorefrontSettings, "homepage" | "hero" | "promoBanners" | "valueProps" | "footer" | "theme" | "logo">;

/**
 * Renders homepage sections in the configured order. Used by the real homepage
 * (server) and by the Appearance Editor preview (client) so both stay identical.
 */
export function HomepageView({ settings, data }: { settings: HomepageSettings; data: HomepageData }) {
  return (
    <div className="space-y-5 pb-4 has-[>[data-section=value-props]:last-child]:-mb-10 has-[>[data-section=value-props]:last-child]:pb-0 sm:space-y-6 [&>*:nth-child(n+5)]:mt-10 sm:[&>*:nth-child(n+5)]:mt-8">
      {settings.homepage
        .filter((s) => s.enabled)
        .map((section) => (
          <div key={section.id} data-section={section.type} className={section.type === "value-props" ? "hidden sm:block" : undefined}>
            {REVEAL_SECTIONS.has(section.type) ? (
              <Reveal>
                <SectionRenderer section={section} settings={settings} data={data} />
              </Reveal>
            ) : (
              <SectionRenderer section={section} settings={settings} data={data} />
            )}
          </div>
        ))}
    </div>
  );
}

function SectionRenderer({ section, settings, data }: { section: HomepageSection; settings: HomepageSettings; data: HomepageData }) {
  const title = section.title ?? section.adminLabel;
  switch (section.type) {
    case "hero":
      return <Hero hero={settings.hero} uppercase={settings.theme.typography.headingUppercaseHero} logoSrc={settings.logo.primary} />;
    case "value-props":
      // Hidden on phones to match the mobile mockup (hero → Categories/Brands).
      return <ValueProps items={settings.valueProps} />;
    case "categories":
      // Categories | Brands switcher (approved mobile + desktop mockups).
      return (
        <section className="container" aria-label={title}>
          <CategoryBrandTabs categories={data.categories} brands={data.brands} />
        </section>
      );
    case "brands":
      return (
        <section className="container" aria-label={title}>
          <div className="mb-3 flex items-end justify-between">
            <h2 className="font-display text-[22px] font-semibold text-ink sm:text-[26px]">
              <span className="sm:hidden">{section.mobileTitle ?? title}</span>
              <span className="hidden sm:inline">{title}</span>
            </h2>
            {section.cta && (
              <Link href={section.cta.href} className="group flex items-center gap-1 pb-1 text-[13px] font-medium text-primary">
                {section.cta.label} <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-[5px]" aria-hidden />
              </Link>
            )}
          </div>
          <TopBrandsRow brands={data.brands} />
        </section>
      );
    case "new-arrivals":
      return (
        <section className="container" aria-label={title}>
          <SectionHeading title={title} subtitle={section.subtitle} cta={section.cta} />
          <ProductRail products={data.newArrivals.slice(0, section.limit ?? 6)} brands={data.brands} />
        </section>
      );
    case "featured":
      return (
        <section className="container" aria-label={title}>
          <SectionHeading title={title} subtitle={section.subtitle} cta={section.cta} />
          <ProductGrid products={data.featured.slice(0, section.limit ?? 8)} brands={data.brands} columns={6} />
        </section>
      );
    case "best-sellers":
      return (
        <section className="container" aria-label={title}>
          <SectionHeading title={title} subtitle={section.subtitle} cta={section.cta} />
          <ProductGrid products={data.bestSellers.slice(0, section.limit ?? 4)} brands={data.brands} />
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
