# Homepage review checkpoint

Scope: homepage only, on feature/attires-arena-premium-storefront. No other page, database or Auth workflow was changed.

| Reference area | Implemented / verified | Remaining difference |
| --- | --- | --- |
| Header | Original supplied JPG symbol and embedded wordmark, compact/centered; working search directly below it | Supplied full logo differs from the simplified emblem in the mockup. Latest explicit logo/search feedback takes precedence. |
| Hero | Editorial STYLE ELEVATED first slide, desktop side campaigns, compact mobile ratio; automatic rotation every 3 seconds | Photography is existing generated editorial imagery, not the exact mockup photo. Original uploaded cover remains intact on slide 3. |
| Motion | Pause/play, hover/focus suspension, no background-tab advancement, reduced-motion pause | No autoplay timing or CLS field-performance claim beyond executable local checks. |
| Colors | #6B0202 action token; #FFFFFF page, cards and navigation; #171717 primary and #74706C secondary text | White announcement/navigation surfaces deliberately follow the mandatory white rules, rather than the maroon announcement fill in the reference. |
| Categories | Six desktop cards, circular mobile cards, working real URL filters | Editorial pictures differ from reference; links without published category records lead to honest empty results. |
| Brands | Reachable section and clear empty state | No brands table/approved labels; no example luxury affiliations invented. |
| New/featured products | Existing public catalogue/variant reads, reusable price cards and empty states | No real published products or curated featured records; the mockup's stocked grids cannot be reproduced as live inventory. |
| Shopping controls | Existing unavailable controls remain labelled and disabled | No fake cart counts, prices, shipping claims or successful orders. |

Screenshots: artifacts/storefront/home-390.png and home-1440.png (full page); preview-390.png and preview-1440.png (first viewport). The production-rendered app is locally exercised inside Codex Cloud. This is not a public URL on the user's device.

Verification commands: npm run lint; npm run typecheck; npm test; npm run build; npm start; npm run test:storefront; npm run test:slideshow. Browser scripts use local Chromium and accept STOREFRONT_TEST_ORIGIN and CHROMIUM_PATH. Slideshow tests use controlled browser time to verify the 3-second delay, wraparound, hover/focus/manual pause and reduced motion.

Public preview blocker: no Vercel app/tool credentials, linked project or public preview URL are available. SITE_URL is loopback. Source can be reviewed on the feature branch; a Vercel deployment explicitly targeted to Preview and configured with development-only app variables is needed for a public live URL. Do not use --prod or change production Auth settings. Never paste credentials into chat. Homepage approval remains pending.
