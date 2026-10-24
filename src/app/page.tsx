import Link from "next/link";
import { ProductCard } from "@/components/storefront/product-card";
import { Campaign, PromotionalBanners } from "@/components/storefront/campaign";
import { BrandSection, StoreFooter } from "@/components/storefront/sections";
import {
  ArrowRight,
  Shirt,
  Footprints,
  Watch,
  Wallet,
  RectangleEllipsis,
  Grid2X2,
  Home as HomeIcon,
  UserRound,
  PackageCheck,
  ShieldCheck,
  Truck,
  ShoppingBag,
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
            <PackageCheck />
            <span>
              Premium edit<small>Considered everyday style</small>
            </span>
          </div>
          <div>
            <Truck />
            <span>
              For Bangladesh<small>Our home, your style</small>
            </span>
          </div>
          <div>
            <Heart />
            <span>
              Customer care<small>Here to help</small>
            </span>
          </div>
          <div>
            <ShieldCheck />
            <span>
              Your account<small>Secure sign-in</small>
            </span>
          </div>
        </div>
        <section className="store-section" id="categories">
          <div className="section-heading">
            <div>
              <h2>Shop by Category</h2>
            </div>
            <Link href="#arrivals">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <div className="category-grid">
            {categories.map(({ name, slug, icon: Icon }) => (
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
                </div>
              </Link>
            ))}
            {!catalogue.categories.length && (
              <Link
                className="category-card category-mobile-extra"
                href="/?category=accessories#arrivals"
              >
                <div className="category-art">
                  <Watch size={28} strokeWidth={1} />
                </div>
                <h3>Accessories</h3>
              </Link>
            )}
            <Link
              className="category-card category-mobile-extra"
              href="#arrivals"
            >
              <div className="category-art">
                <Grid2X2 size={25} strokeWidth={1} />
              </div>
              <h3>View All →</h3>
            </Link>
          </div>
          {!catalogue.categories.length && (
            <p className="section-note">
              Explore our upcoming collections. New pieces are on their way.
            </p>
          )}
        </section>
        <BrandSection />
        <section className="store-section" id="arrivals">
          <div className="section-heading">
            <div>
              <h2>
                {q
                  ? `Results for “${q}”`
                  : category
                    ? `${categories.find((c) => c.slug === category)?.name ?? "Collection"}`
                    : "New Arrivals"}
              </h2>
            </div>
            <span className="small-label">Published catalogue</span>
          </div>
          {(q || category) && (
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
          )}
          {catalogue.products.length ? (
            <>
              <div className="product-preview-grid">
                {catalogue.products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <p className="section-note">
                Discover the latest pieces from our published collection.
                Shopping opens at launch.
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
                  : "Our new collection is on its way. Check back soon to discover your next favourites."}
              </p>
              {(q || category) && (
                <Link href="/#arrivals">
                  View all arrivals <ArrowRight size={16} />
                </Link>
              )}
            </div>
          )}
        </section>
        <section
          id="featured"
          className="store-section featured-section"
          aria-labelledby="featured-heading"
        >
          <div className="section-heading">
            <h2 id="featured-heading">Featured Products</h2>
            <span className="small-label">The Attires Arena edit</span>
          </div>
          <div className="featured-empty">
            <p>A considered selection, coming soon.</p>
            <span>
              Discover our featured pieces here when the edit launches.
            </span>
          </div>
        </section>
        <PromotionalBanners />
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
        <button disabled title="Shopping bag is not available yet">
          <ShoppingBag size={20} />
          Cart
        </button>
        <button disabled title="Wishlist is not available yet">
          <Heart size={20} />
          Wishlist
        </button>
        <Link href="/account">
          <UserRound size={20} />
          Account
        </Link>
      </nav>
    </>
  );
}
