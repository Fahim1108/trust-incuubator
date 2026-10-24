# Attires Arena — Storefront Frontend

A complete, responsive, configuration-driven **frontend** for the Attires Arena fashion e-commerce store, built with **Next.js 15 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS 3 · Lucide icons**.

> **Frontend only.** There is no database, auth server, payment gateway or courier integration. All data comes from local mock adapters, and every action that needs a backend (place order, sign in, save settings…) honestly returns *"not connected"*. See **[CODEX_HANDOFF.md](./CODEX_HANDOFF.md)** for the integration guide.

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
```

| Script | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run lint` | ESLint (next/core-web-vitals + TypeScript) |
| `npm run typecheck` | `tsc --noEmit` (strict, `noUncheckedIndexedAccess`) |
| `npm run generate:placeholders` | Regenerates the placeholder SVG artwork in `public/images` |

Requires Node.js 18.18+ (tested on Node 22). No environment variables are needed.

## What's included

- **Storefront:** home, shop (filters, sort, search, pagination), category pages, brand pages, product detail (gallery + zoom, variants, size guide, reviews, related), cart + cart drawer, 3-step checkout with Bangladesh division/district/area fields.
- **Account:** login, register, forgot password, profile, address book, order history, order detail, wishlist, order tracking.
- **Info pages:** about, contact, FAQ, shipping, returns & exchange, privacy, terms.
- **Website Appearance Editor** at **`/admin/appearance`**: theme colours, fonts, radius, banners/slides, homepage section order & visibility, header/footer, product-card options — with a live iframe preview for mobile / tablet / laptop / desktop and JSON export/import.

## Customising

Almost everything visual is configured in **`src/config/`**:

| File | Controls |
| --- | --- |
| `theme.ts` | Brand colours, fonts, heading weight, corner radius |
| `brand.ts` | Logo file paths and sizes, site name/URL |
| `header.ts` | Announcement bar, navigation, search placeholder |
| `homepage.ts` | Hero slides, side tiles, promo banners, value props, **section order & visibility** |
| `footer.ts` | Footer columns, contact details, socials, newsletter text |
| `product-card.ts` | Card image shape, badges, swatches, quick add, wishlist |
| `commerce.ts` | Currency, delivery charges, free-delivery threshold, demo coupons, demo notices |

Page copy for policies and FAQ lives in `src/content/policies.ts`.

## Assets

- `public/brand/` — the **official Attires Arena logo** (maroon for light backgrounds, white for the footer, badge/icon). These are recolourings of the supplied logo file, not redrawn. Replace them with the master files if you have them.
- `public/images/mockup/` — hero and category **photos cropped from the approved mobile mockup** (used by the phone layout). They are low resolution and the sneaker photo shows a third-party logo — replace with your own product photography before launch.
- `public/images/` (other folders) — original **placeholder** SVG illustrations (no third-party photos or brand marks). Replace with real product photography during integration.
- Brand names (Gucci, Zara, Lacoste, H&M, Nike, Adidas) are **demonstration entries** rendered as plain text wordmarks. No logos are shipped and no affiliation is implied.
