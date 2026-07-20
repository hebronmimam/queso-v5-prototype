# Queso Wix Rebuild Progress

Last updated: 20 July 2026

## Locked implementation rules

These rules are confirmed and must not be changed without an explicit reason:

1. The Wix Classic page uses one blank Wix section per major Custom Element.
2. Wix owns only the outer section order and section/element dimensions.
3. Each Custom Element owns its internal HTML, CSS, responsive behaviour and interaction.
4. Development Server URLs use stable GitHub Pages paths. Do not return to commit-specific URLs for routine changes.
5. Inside Wix Editor/Preview frames, the visible component uses `position: fixed; inset: 0` so it fills the Custom Element iframe without forcing `100vh`.
6. Do not use `window.innerHeight`, iframe-height syncing, `100vh`, or forced mobile minimum heights. Those previously prevented resizing.
7. The Custom Element itself must have `min-height: 0`.
8. Desktop fallback heights may exist for direct browser testing, but Wix-frame mode must use `height: auto` and let Wix determine the iframe height.
9. Lovelo Black is used for the main bold display headings unless the prototype explicitly uses Queso Display.
10. `queso font.ttf` is registered as Queso Display and is used for “we make them freshhhhh”.
11. Quicksand is the body/UI font.
12. Mobile layouts must be copied from the prototype rather than improvised.
13. Preserve working components when moving to the next section; do not make unrelated changes.
14. All editable Wix attributes remain lowercase and intentional.
15. CMS connections are added only when Hebronmimam specifies the content and field structure.

## Stable development URLs

- Hero: `https://hebronmimam.github.io/queso-v5-prototype/wix-components/dist/queso-hero.js`
- Fresh Intro: `https://hebronmimam.github.io/queso-v5-prototype/wix-components/dist/queso-fresh-intro.js`
- Menu Showcase: `https://hebronmimam.github.io/queso-v5-prototype/wix-components/dist/queso-menu-showcase.js`

## Completed and confirmed

### 1. Hero

Tag: `queso-hero`

Status:
- Rendering correctly in Wix.
- Resizable below 100vh on mobile.
- Uses Lovelo for hero display headings and Quicksand for supporting text.
- Three-slide carousel, sticker and controls work.
- Stable GitHub Pages URL confirmed.

### 2. Fresh Intro

Tag: `queso-fresh-intro`

Status:
- Rendering correctly in Wix.
- Resizable independently of the browser viewport.
- “we make them freshhhhh” uses `queso font.ttf` / Queso Display.
- Quicksand used for eyebrow and body copy.
- Stable GitHub Pages URL confirmed.

## Current section

### 3. Menu Showcase

Tag: `queso-menu-showcase`

Implemented:
- Exact prototype content for Birthday Suit, Artisan, Canvas and Monthly Flavor Drop.
- Lovelo headings and Quicksand body/UI typography.
- Four-column desktop grid.
- Two-column tablet grid.
- Prototype mobile horizontal swipe carousel using `82vw` cards and scroll snapping, instead of stacking all four cards vertically.
- Image hover swap on pointer devices.
- Intentional editable attributes retained.
- `queso-add-to-cart` Custom Event retained for the later Velo/Wix Stores bridge.
- Uses the confirmed Wix iframe sizing pattern with no `100vh` or iframe-height synchronization.

Recommended starting Wix heights:
- Desktop: `960px`
- Tablet: `1500px` when using the two-column layout; adjust visually.
- Mobile: `850px`

## Next section after Menu Showcase

Flavor Showcase: `queso-flavor-showcase`
