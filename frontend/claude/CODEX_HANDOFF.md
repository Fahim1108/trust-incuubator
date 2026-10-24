# CODEX HANDOFF — Attires Arena Frontend

This document explains how the frontend is structured and exactly what to replace when integrating it into the existing **Next.js + Supabase** backend.

**Golden rule:** UI components never import mock data. All data flows through `src/services/`. Replace the adapter and the UI keeps working.

---

## 1. Project structure

```
src/
├─ app/                         Next.js App Router
│  ├─ layout.tsx                Root: fonts, <ThemeStyle>, providers (settings, toast, wishlist, cart)
│  ├─ (store)/                  Storefront route group (has Header/Footer/MobileBottomNav)
│  │  ├─ page.tsx               Homepage (renders <HomepageView> from config)
│  │  ├─ shop/                  Product listing (URL-driven filters)
│  │  ├─ category/[slug]/       Category listing
│  │  ├─ brand/[slug]/          Brand listing
│  │  ├─ categories/ brands/    Index pages
│  │  ├─ product/[slug]/        Product detail
│  │  ├─ cart/ checkout/
│  │  ├─ account/(auth)/        login, register, forgot-password
│  │  ├─ account/(dashboard)/   profile, addresses, orders, orders/[orderNumber]
│  │  ├─ wishlist/ track-order/
│  │  └─ about/ contact/ faq/ shipping-policy/ return-policy/ privacy-policy/ terms/
│  └─ admin/                    Admin (no store chrome)
│     ├─ appearance/            Website Appearance Editor
│     └─ appearance/preview/    Iframe preview target for the editor
├─ components/
│  ├─ ui/                       Button, Input/Select/Textarea/Checkbox, Badge, Modal/Drawer, Accordion,
│  │                            LoadingSkeleton, EmptyState, Price, Rating, Breadcrumbs, DemoNotice,
│  │                            SectionHeading, SmartImage, IconButton
│  ├─ layout/                   Header, Navigation (in Header), MobileMenu, SearchBar, AnnouncementBar,
│  │                            Logo, Footer, MobileBottomNav
│  ├─ home/                     Hero, ValueProps, PromoBanners, NewsletterSection/Form, HomepageView
│  ├─ product/                  ProductCard, ProductGrid, ProductRail, ProductGallery, VariantSelector
│  │                            (ColorSelector/SizeSelector), QuantitySelector, SizeGuideModal,
│  │                            ProductPurchasePanel, QuickAddModal, ReviewList, WishlistButton
│  ├─ catalog/                  CatalogView, CatalogContext, FilterPanel, FilterDrawer, SortSelect,
│  │                            ActiveFilters, Pagination
│  ├─ category/ brand/          CategoryCard, BrandCard (+ BrandWordmark)
│  ├─ cart/                     CartItem, CartDrawer, CartView, CouponField, OrderSummary
│  ├─ checkout/                 CheckoutForm, CheckoutSteps, PaymentMethodSelector
│  ├─ account/                  AuthForms, AccountNav, ProfileForm, AddressManager, OrderDetail,
│  │                            OrderTimeline, OrderStatusBadge, WishlistView, TrackOrderForm
│  ├─ info/                     InfoPage (headers/policy layout), ContactForm
│  ├─ admin/                    AppearanceEditor, PreviewClient, fields, panels/*
│  └─ theme/ThemeStyle.tsx      Turns theme config into CSS variables
├─ config/                      All editable design/storefront settings (see §5)
├─ content/policies.ts          Policy + FAQ copy
├─ context/                     StorefrontContext, CartContext, WishlistContext, ToastContext
├─ data/bangladesh.ts           8 divisions, 64 districts, areas for major districts
├─ lib/                         format, validation, catalog-query (filter/sort/paginate), product helpers,
│                               color, storage, cn
├─ mocks/                       ALL demonstration fixtures (products, categories, brands, reviews,
│                               orders, customer, cart seed, size guides, colors)
├─ services/                    Data access layer  ← integration point
│  ├─ index.ts                  Read functions used by Server Components
│  ├─ actions.ts                "use server" actions used by Client Components
│  ├─ types.ts                  StorefrontDataSource interface (the contract)
│  └─ adapters/
│     ├─ index.ts               `export const dataSource = mockDataSource`  ← swap here
│     └─ mock.ts                Mock implementation
└─ types/                       Shared TypeScript contracts (catalog, commerce, storefront)
```

## 2. Routes

| Route | Rendering | Notes |
| --- | --- | --- |
| `/` | static | Sections from `getHomepageConfiguration()` / settings |
| `/shop` | dynamic | Query params: `q, category, brand, sizes, colors, min, max, sort, offers, page` (comma-separated lists) |
| `/category/[slug]`, `/brand/[slug]` | SSG + dynamic params | Same params as `/shop`; category/brand is locked |
| `/categories`, `/brands` | static | |
| `/product/[slug]` | SSG | `?color=<colorId>` preselects a colour |
| `/cart`, `/checkout` | static shell, client state | |
| `/account`, `/account/addresses`, `/account/orders`, `/account/orders/[orderNumber]` | | Need auth guard |
| `/account/login`, `/account/register`, `/account/forgot-password` | | |
| `/wishlist`, `/track-order` | | |
| `/about`, `/contact`, `/faq`, `/shipping-policy`, `/return-policy`, `/privacy-policy`, `/terms` | static | |
| `/admin/appearance` (+ `/preview`) | | Needs admin guard |

When products come from Supabase, add `export const revalidate = 60` (or on-demand revalidation) to catalogue pages, or remove `generateStaticParams` if you prefer fully dynamic rendering.

## 3. TypeScript contracts (`src/types/`)

- **catalog.ts:** `Product`, `ProductVariant`, `ProductImage`, `ColorOption`, `Category`, `Brand`, `Review`, `SizeGuide`, `ProductQuery`, `SortOption`, `Paginated<T>`, `CatalogFacets`
- **commerce.ts:** `CartItem`, `Coupon`, `OrderSummary`, `PaymentMethod`, `CheckoutPayload`, `Address`, `Customer`, `Order`, `OrderLine`, `OrderStatus`, `OrderTimelineEvent`, `ActionResult<T>`
- **storefront.ts:** `StorefrontSettings`, `ThemeSettings`, `LogoSettings`, `HeaderSettings`, `FooterSettings`, `HeroSettings`, `Banner`, `HomepageSection`, `HomepageSectionType`, `ProductCardSettings`, `CommerceSettings`, `DemoSettings`, `NavItem`, `CtaLink`, `ValueProp`

Key modelling decisions:
- Money is **whole BDT integers** (`price`, `compareAtPrice`).
- Variants are **colour × size** with `stock`. `variant.price` overrides `product.price` if set.
- Images are stored **per colour** (`imagesByColor[colorId]`), falling back to `defaultImages`.
- `ActionResult` is a discriminated union: `{ ok: true, data }` or `{ ok: false, reason: "not_connected" | "validation" | "error", message }`.

Suggested Supabase tables: `products`, `product_variants`, `product_images (product_id, color_id, sort, src, alt)`, `categories`, `brands`, `reviews`, `customers`/`profiles`, `addresses`, `orders`, `order_items`, `order_events`, `wishlists`, `coupons`, `storefront_settings (id, status: draft|published, data jsonb, updated_at)`.

## 4. Service layer — what to replace

All functions are in `src/services/types.ts` → `StorefrontDataSource`. Implement it in `src/services/adapters/supabase.ts` and change one line in `src/services/adapters/index.ts`.

### Read functions (currently mock)
| Function | Used by | Backend notes |
| --- | --- | --- |
| `getProducts(query)` → `Paginated<Product> & { facets }` | shop/category/brand pages | Implement filters/sort/pagination in SQL. Semantics are defined in `lib/catalog-query.ts#queryProducts` (facet counts ignore size/colour/price/category/brand filters but respect search + offers). |
| `getProductBySlug(slug)` | PDP | Join variants + images |
| `getProductsByIds(ids)` | wishlist | |
| `getRelatedProducts(product, limit)` | PDP | |
| `getCollection("new-arrivals" \| "featured" \| "best-sellers", limit)` | homepage | Flags on product or curated collections table |
| `searchSuggestions(term, limit)` | header search (via server action) | Use `ilike` or full-text search |
| `getCategories()`, `getCategoryBySlug()` | | |
| `getBrands()`, `getBrandBySlug()` | | |
| `getReviews(productId)` | PDP | Only approved reviews |
| `getSizeGuide(id)` | PDP | |
| `getStorefrontSettings()` | root layout, editor | Return **published** settings merged over `defaultStorefrontSettings` |
| `getHomepageConfiguration()` | — | Subset of settings |
| `getInitialCart()` | root layout | Demo seed only. With a server cart, return the user's cart (or `[]`) |
| `getCurrentCustomer()` | account pages | From Supabase session; return `null` when signed out |
| `getOrders()`, `getOrderByNumber(number, phone?)` | account, tracking | Guest tracking should require matching phone |

### Mutations (all currently return `not_connected`)
| Function | Called from |
| --- | --- |
| `placeOrder(payload: CheckoutPayload)` | `CheckoutForm` → `placeOrderAction`. **Re-price on the server** from `variantId`s; never trust client prices. On success return `{ ok: true, data: { orderNumber } }`; the form then redirects to `/account/orders?placed=<number>` (add a confirmation UI there or create a dedicated success page). Clear the cart after success. |
| `signIn`, `register`, `requestPasswordReset` | `AuthForms` (identifier may be email **or** BD phone) |
| `updateProfile`, `saveAddress`, `deleteAddress` | `ProfileForm`, `AddressManager` |
| `subscribeNewsletter`, `submitContactForm` | `NewsletterForm`, `ContactForm` |
| `saveStorefrontDraft`, `publishStorefrontSettings` | Appearance Editor buttons |
| `uploadMedia(file)` | Appearance Editor banner "Upload" (currently shows a temporary local `blob:` preview). Switch the action to accept `FormData` and upload to Supabase Storage, return the public URL, then add the host to `next.config.ts → images.remotePatterns`. |

Add authorisation + input validation inside `src/services/actions.ts` (it is the server boundary).

## 5. Configuration system

`src/config/index.ts` composes `defaultStorefrontSettings: StorefrontSettings` from the files in `src/config/`. Flow:

```
config/*.ts ──► getStorefrontSettings() ──► <StorefrontProvider> (client: useStorefront())
                                         └► <ThemeStyle> → CSS variables (--aa-primary …)
                                                         → tailwind.config.ts colours (bg-primary, text-ink-muted, border-line …)
```

- Colours **must** be changed in `config/theme.ts` (or via the editor), not in Tailwind — Tailwind reads CSS variables.
- Homepage order/visibility = the `homepageSections` array in `config/homepage.ts`.
- `HomepageView` renders sections by `type` — to add a new section type, extend `HomepageSectionType` and add a `case` in `SectionRenderer`.

## 5b. Mobile homepage (approved phone mockup)

Below the `sm` breakpoint (640px) the homepage follows the mobile mockup:

- Header: maroon menu icon, centred logo, maroon account bubble; cart moves to the bottom nav. Announcement bar hidden.
- Search: boxed input with a maroon search button (`<SearchBar variant="boxed" />`).
- Hero: a slide with `mobileImage` renders the light editorial layout (`MobileEditorialSlide` in `Hero.tsx`) using `titleAccent`, `tagline`, `script` and `showLogo` from the banner config. Slides without `mobileImage` use the standard dark layout.
- `categories` section → `CategoryBrandTabs` (Categories | Brands switcher, 3-column photo cards using `Category.thumbnail`).
- `brands` section → "Top Brands" row (`TopBrandsRow`), title from `HomepageSection.mobileTitle`.
- Value props are hidden on phones.
- Fonts: Playfair Display (`font-display`) and Allura (`font-script`) are loaded for these elements.

Brand tiles render text wordmarks. To show real brand logos (as in the mockup), set `Brand.logo` with files you are licensed to use; every brand card picks it up automatically.

## 5c. Motion & micro-interactions

All CSS (Tailwind transitions + keyframes in `tailwind.config.ts`); no animation library.

| Interaction | Where |
| --- | --- |
| Product card: image 1.05 zoom + cross-fade to secondary image, "Quick View" fades up (opens `QuickAddModal` preview) | `product/ProductCard.tsx` — pointer devices only; on touch the card links to the PDP |
| Category cards: 1.05 zoom, brightness 1.04, arrow drifts up-right | `category/CategoryCard.tsx`, `home/CategoryBrandTabs.tsx` |
| Buttons: `#6B0202 → #460101`, trailing arrow slides 5px | `ui/Button.tsx` (`ArrowSlot`), hero/promo CTAs |
| Nav underline draws left→right (250ms); also on keyboard focus | `layout/Header.tsx` |
| Hero entrance: headline → text → CTA stagger, once per session | `home/Hero.tsx` (`heroIntroPlayed`) |
| Drawer/modal enter + exit (slide / scale-fade), Escape, focus trap + restore, scroll lock without layout shift | `ui/Modal.tsx` (`usePresence`) |
| Wishlist heart fill + small pop | `product/WishlistButton.tsx` |
| One-time scroll reveal for editorial sections only | `ui/Reveal.tsx`, used in `home/HomepageView.tsx` (`REVEAL_SECTIONS`) |

`future.hoverOnlyWhenSupported` is on, so hover styles never "stick" after a tap. `prefers-reduced-motion` disables animations, delays and reveals (`globals.css`, `Reveal`, `usePresence`). Only `transform`/`opacity`/`filter`/colours are animated — measured CLS is 0 at 390/768/1440px.

## 6. Appearance Editor (`/admin/appearance`)

- Holds a cloned `StorefrontSettings` in React state; panels mutate it through an `update(draft => …)` helper.
- Live preview is an **iframe** of `/admin/appearance/preview`, so mobile/tablet previews use real CSS breakpoints. Messages: editor → iframe `aa:preview-settings` with full settings; iframe → editor `aa:preview-ready`. Same-origin only.
- **Save draft / Publish** call server actions → currently "Not saved" dialog. Implement them to write `storefront_settings` rows (`draft` / `published`) and call `revalidatePath("/", "layout")` on publish.
- **Export JSON / Import JSON** work locally today and are useful for moving settings into `src/config` before the backend exists.
- Some settings (sub-menu children, social links, demo coupons) are config-file only by design.

## 7. Frontend state & interactions

| State | Where | Persistence |
| --- | --- | --- |
| Cart (+ coupon, drawer) | `context/CartContext.tsx` | `localStorage` (`aa.cart.v1`). Seeded once from `getInitialCart()` when `demo.seedCart` is true |
| Wishlist | `context/WishlistContext.tsx` | `localStorage` (`aa.wishlist.v1`) |
| Catalogue filters | URL search params (`CatalogContext`) | URL |
| Toasts | `context/ToastContext.tsx` | — |

Delivery charge logic (`CartContext#getSummary`): inside Dhaka district → ৳80, else ৳130, free above ৳2,000 or with `FREESHIP`. Coupons `WELCOME10`/`FREESHIP` are **demo-only**; move coupon validation to the server (`coupons` table) and keep the client display.

Implemented interactions: mobile menu drawer, desktop dropdown nav, live search suggestions (keyboard accessible), category/brand/price/size/colour filters, sorting, pagination, gallery thumbnails/swipe/hover-zoom/zoom modal, colour & size selection with stock awareness, quantity controls, quick-add modal, wishlist toggle, cart drawer, coupon field, 3-step checkout with validation (BD phone regex `^(?:\+?88)?01[3-9]\d{8}$`), dependent division/district/area selects, accordions, size-guide modal, review filter, address book CRUD (local), order tracking, editor preview.

## 8. Replacing mock data — checklist

1. `src/services/adapters/supabase.ts` implementing `StorefrontDataSource`; map DB rows → types in `src/types`.
2. Switch `src/services/adapters/index.ts`.
3. Set `demo.seedCart = false` and, once real data is live, `demo.showNotices = false` (`src/config/commerce.ts`).
4. Remove the `DemoNotice` on the brands page/brand pages once brand listings reflect authorised stock.
5. Replace review fixtures; remove the "Sample verified badge" wording in `ReviewList` once reviews are real.
6. Add auth middleware for `/account/(dashboard)` and `/admin`.
7. Replace placeholder images; add storage host to `next.config.ts`.
8. Delete `src/mocks/` when nothing imports it (only `services/adapters/mock.ts` does).
9. Update footer contact details in `src/config/footer.ts` (currently placeholders).
10. Legal review of `src/content/policies.ts`.

## 9. Known limitations

- No real auth, orders, payments, courier tracking, review submission, or media upload (by design).
- Area/thana lists cover Dhaka, Chattogram, Gazipur, Narayanganj and Sylhet; other districts use a free-text area field. A courier location API can replace `data/bangladesh.ts`.
- Online payment option is shown as "coming soon" (`commerce.onlinePaymentEnabled = false`).
- Product/banner images are illustrated placeholders; the hero lacks real model photography from the mockup.
- `DemoNotice` reads the static `demo` config, so toggling notices in the editor only affects the footer line in the preview.
- The editor's uploaded images are temporary `blob:` URLs and disappear on reload.
- Bengali (বাংলা) UI copy is not included; the ৳ glyph renders via system font fallback.
