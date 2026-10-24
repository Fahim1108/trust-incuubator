# Editorial image provenance

campaign.webp and category-editorial.webp are generated editorial illustrations created for this frontend increment. They are not photographs of actual store stock and contain no third-party brand marks. The category contact sheet is used only to illustrate planned categories; no products, prices, inventory or affiliations are inferred from these images.

Images were compressed to WebP for delivery. The campaign uses Next.js responsive image optimization. The category contact sheet uses six CSS positions from one shared local asset.

The official logo supplied in the conversation was not available as a workspace file. The header currently displays plain brand-name text, not a recreated or substitute logo. Replace that text with the exact supplied artwork once the original PNG/SVG is available in the repository; preserve its colors and proportions.

## Reference-aligned revision

editorial-main.webp, editorial-tailoring.webp, editorial-footwear.webp and editorial-knitwear.webp are generated campaign photographs for the reference-aligned revision. A generated four-panel source was split into separate assets so CSS can crop each photograph with `background-size: cover` without stretching people or products. These are editorial illustrations, not actual inventory. The previous campaign.webp is retained but is no longer rendered on the homepage.

The exact supplied logo remains unavailable as a repository-accessible file. No traced, generated or substitute emblem was introduced. A PNG/SVG file attachment is required to finish the official artwork integration; the current plain text is a disclosed fallback.

## Official artwork integrated — current status

The user uploaded BRAND-LOGO.png, BRAND-LOGO.jpg and cover pic copy.jpg in commit 9f5fbe8. This resolves the earlier missing-asset notes above.

- BRAND-LOGO.jpg is now rendered in the header and footer. The complete symbol and original ATTIRES ARENA lettering are part of this exact image; no replacement typeface, tracing, recoloring or generated logo is used. CSS clips only the empty outer maroon canvas. The visible logo artwork is preserved at its original proportions.
- BRAND-LOGO.png is the supplied transparent white version and is retained unchanged. The maroon-background JPG is used on the white storefront so the white artwork remains visible without recoloring it.
- cover pic copy.jpg is the first homepage campaign. Next.js serves responsive versions with object-fit: contain and a matching 3:2 image stage; the entire cover, brand name, embedded typography and contact strip remain visible. There is no added text overlay over this cover.
- All three uploaded source files remain byte-for-byte unchanged. Existing generated campaign assets are retained for the secondary slides, side panels and editorial category illustrations; they are not misidentified as uploaded stock.
