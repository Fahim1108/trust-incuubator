import Link from "next/link";
import { Campaign } from "@/components/storefront/campaign";
import { BrandSection, StoreFooter } from "@/components/storefront/sections";
import {
  ArrowRight,
  ArrowUpRight,
  Shirt,
  Footprints,
  Watch,
  Wallet,
  RectangleEllipsis,
  Grid2X2,
  Home as HomeIcon,
  UserRound,
  Sparkles,
  PackageCheck,
  Heart,
  SlidersHorizontal,
} from "lucide-react";
import { StoreHeader } from "@/components/storefront/header";
import { getPublicCatalogue } from "@/lib/catalogue/public-catalogue";
export const dynamic = "force-dynamic";
const categoryPositions: Record<string, string> = {
  shirts: "0% 0%",
  pants: "50% 0%",
  sneakers: "100% 0%",
  belt: "0% 100%",
  wallets: "50% 100%",
  watches: "100% 100%",
};
const editorialCategories = [
  {
    name: "Shirts",
    slug: "shirts",
    icon: Shirt,
    detail: "The everyday essential",
  },
  {
    name: "Pants",
    slug: "pants",
    icon: Grid2X2,
    detail: "An effortless foundation",
  },
  {
    name: "Sneakers",
    slug: "sneakers",
    icon: Footprints,
    detail: "A fresh point of view",
  },
  {
    name: "Belt",
    slug: "belt",
    icon: RectangleEllipsis,
    detail: "Finishing touches",
  },
  {
    name: "Wallets",
    slug: "wallets",
    icon: Wallet,
    detail: "Details that matter",
  },
  {
    name: "Watches",
    slug: "watches",
    icon: Watch,
    detail: "Make time for style",
  },
];
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.slice(0, 100) : "";
  const category =
    typeof params.category === "string" ? params.category.slice(0, 120) : "";
  const sort = params.sort === "name" ? "name" : "newest";
  const catalogue = await getPublicCatalogue(q, category, sort);
  const categories = catalogue.categories.length
    ? catalogue.categories.map((item) => ({
        ...item,
        icon:
          editorialCategories.find((c) => c.slug === item.slug)?.icon ?? Shirt,
        detail: "Explore the collection",
      }))
    : editorialCategories;
  return (
    <>
      <StoreHeader query={q} />
      <main id="main" className="store-main">
        <Campaign />
        <div className="principles">
          <div>
            <Sparkles />
            <span>
              Considered style<small>A focus on the details</small>
            </span>
          </div>
          <div>
            <PackageCheck />
            <span>
              Made for everyday<small>Discover your essentials</small>
            </span>
          </div>
          <div>
            <Heart />
            <span>
              A personal approach<small>Your style, your perspective</small>
            </span>
          </div>
        </div>
        <section className="store-section" id="categories">
          <div className="section-heading">
            <div>
              <p className="eyebrow">BUILD YOUR EVERYDAY</p>
              <h2>Shop by category</h2>
            </div>
            <Link href="#arrivals">
              Explore all <ArrowRight size={16} />
            </Link>
          </div>
          <div className="category-grid">
            {categories.map(({ name, slug, icon: Icon, detail }) => (
              <Link
                key={slug}
                href={`/?category=${encodeURIComponent(slug)}#arrivals`}
                className="category-card"
              >
                <div
                  className={`category-art${categoryPositions[slug] ? " category-photography" : ""}`}
                  style={
                    categoryPositions[slug]
                      ? { backgroundPosition: categoryPositions[slug] }
                      : undefined
                  }
                >
                  {!categoryPositions[slug] && (
                    <Icon size={56} strokeWidth={0.8} aria-hidden="true" />
                  )}
                </div>
                <div>
                  <h3>{name}</h3>
                  <p>{detail}</p>
                </div>
                <ArrowUpRight size={17} aria-hidden="true" />
              </Link>
            ))}
          </div>
          {!catalogue.categories.length && (
            <p className="section-note">
              An introduction to our planned collections. Published products
              will appear as they become available.
            </p>
          )}
        </section>
        <BrandSection />
        <section className="store-section" id="arrivals">
          <div className="section-heading">
            <div>
              <p className="eyebrow">THE LATEST FROM ATTIRES ARENA</p>
              <h2>
                {q
                  ? `Results for “${q}”`
                  : category
                    ? `${categories.find((c) => c.slug === category)?.name ?? "Collection"}`
                    : "New arrivals"}
              </h2>
            </div>
            <span className="small-label">Published catalogue</span>
          </div>
          <form action="/#arrivals" className="catalogue-tools">
            <label>
              <SlidersHorizontal size={16} /> Category
              <select name="category" defaultValue={category}>
                <option value="">All categories</option>
                {categories.map((item) => (
                  <option key={item.slug} value={item.slug}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Sort by
              <select name="sort" defaultValue={sort}>
                <option value="newest">Newest first</option>
                <option value="name">Name: A–Z</option>
              </select>
            </label>
            <input type="hidden" name="q" value={q} />
            <button type="submit" className="outline-button">
              Apply
            </button>
            {(q || category) && <Link href="/#arrivals">Clear filters</Link>}
          </form>
          {catalogue.products.length ? (
            <>
              <div className="product-preview-grid">
                {catalogue.products.map((product) => (
                  <article className="product-preview" key={product.id}>
                    <span className="eyebrow">CATALOGUE PREVIEW</span>
                    <h3>{product.name}</h3>
                    <p>{product.description.slice(0, 180)}</p>
                    <small>
                      Product details and purchasing are not yet available.
                    </small>
                  </article>
                ))}
              </div>
              <p className="section-note">
                Showing up to 24 published products. Product photography,
                pricing and purchasing will be integrated in the next increment.
              </p>
            </>
          ) : (
            <div className="catalogue-empty" role="status">
              <Shirt size={36} strokeWidth={1} />
              <h3>
                {catalogue.state === "error"
                  ? "The collection is temporarily unavailable"
                  : q || category
                    ? "No matching pieces just yet"
                    : "Something considered is on its way"}
              </h3>
              <p>
                {catalogue.state === "error"
                  ? "Please try again shortly. Your account is still available."
                  : "Our catalogue is being prepared. Published pieces will appear here — no sample products, just the real collection."}
              </p>
              {(q || category) && (
                <Link href="/#arrivals">
                  View all arrivals <ArrowRight size={16} />
                </Link>
              )}
            </div>
          )}
        </section>
        <section className="story-banner store-section" id="about">
          <p className="eyebrow">THE ATTIRES ARENA PHILOSOPHY</p>
          <h2>
            Everyday dressing.
            <br />
            <em>Exceptionally considered.</em>
          </h2>
          <p>
            Style is in the details. We’re creating a fresh fashion destination
            for Bangladesh, with a simple idea: make finding your everyday
            favourites feel effortless.
          </p>
          <Link href="/account">
            Make yourself at home <ArrowUpRight size={17} />
          </Link>
        </section>
      </main>
      <StoreFooter />
      <nav className="mobile-bottom" aria-label="Quick navigation">
        <Link href="/" aria-current="page">
          <HomeIcon size={20} />
          Home
        </Link>
        <Link href="#categories">
          <Grid2X2 size={20} />
          Categories
        </Link>
        <Link href="/account">
          <UserRound size={20} />
          Account
        </Link>
      </nav>
    </>
  );
}
