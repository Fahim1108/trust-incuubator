# Attires Arena — mandatory white surface update

Status: handoff specification only. No Figma variables, components or screens have been edited or verified; Figma editing tools and a target file are unavailable in this session.

This update overrides the background, warm-neutral, text and border instructions in the supplied master Figma brief. Preserve the official supplied logo, its proportions and its colors. Do not recolor or reconstruct logo artwork.

## Semantic color variables

Apply these values consistently in every existing color mode; remove ivory or grey overrides from instances and nested components.

| Suggested Figma variable | Value | Use |
| --- | --- | --- |
| color/background/page | #FFFFFF | Every main page and section background |
| color/surface/default | #FFFFFF | Cards, forms, inputs, search, navigation, header, footer, drawers and dialogs |
| color/border/default | #EAEAEA | Subtle component outlines and dividers |
| color/text/primary | #171717 | Headings, body copy and primary labels |
| color/text/secondary | #74706C | Supporting text and secondary labels |
| color/brand/primary | #6B0202 | Primary buttons, selected variants, active tabs, icons and navigation accents |
| color/state/selected-subtle | #F6EAEA | Small selected controls only; never a page, section or card fill |
| color/text/on-brand | #FFFFFF | Text and icons on maroon buttons |

Keep existing semantic error and success indicators where needed. Keep the supplied dark brand hover color where already established; do not change the primary brand color. Disabled controls retain a white surface with a clear disabled treatment. Visible keyboard focus indicators remain required.

## Component and screen changes

- Product, category and brand cards: white container; #EAEAEA outline or an extremely soft shadow. Product photography may retain natural neutral tones within the image bounds.
- Header, announcement strip, search, menus, footer and mobile bottom navigation: white surfaces. Use maroon text, icons or active indicators for emphasis. This supersedes the earlier maroon announcement-strip background instruction.
- Catalogue: white page, filter controls, filter drawer and product grid containers.
- Product details: white gallery surround, information panel, quantity controls and purchasing bar. Selected controls may use maroon or the restrained selected tint. Do not recolor actual product swatches.
- Cart and checkout: white item rows, forms, payment options and order summary; borders separate sections. Do not use tinted full-card selected payment backgrounds.
- Customer account: white authentication forms, profile panels, address cards and order views, including loading, empty and error states.
- Hero and promotional campaigns: neutral colors are permitted inside photography. Surrounding UI and captions use white surfaces. Replace the earlier cream/beige promotional section fills with white.

## Figma application and verification procedure

1. Inspect the existing variable collections, styles, component variants and all desktop/mobile screens before changing them. Reuse current semantic names rather than creating duplicate collections.
2. Update shared variable aliases first, then shared component definitions. Replace hardcoded cream, beige, ivory and grey UI fills and inspect instance overrides.
3. Audit default, hover, active, selected, disabled, loading, error and focus variants. Restrict the selected tint to small controls.
4. Check homepage, catalogue, product details, cart, checkout and customer accounts at 390px, 768px and 1440px, plus 375px and 1024px responsive checks.
5. Confirm every UI page/card/navigation fill is exactly #FFFFFF. Inspect photography and supplied logo separately; do not globally replace colors inside image assets.
6. Verify text contrast and focus visibility; a subtle border alone must not be the only identifying cue for an interactive control. Export comparison screenshots only after actual changes.

Completion requires inspection of the actual editable Figma file. The attached screenshots are references, not evidence of an updated Figma document.
