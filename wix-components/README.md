# Queso Wix Custom Elements

Fork-ready Custom Elements used to rebuild the Queso Classic Wix website without relying on Wix-native styling.

## Architecture

- One meaningful visual section per Custom Element.
- One blank, full-width Wix section per page-level Custom Element.
- The Wix section owns only page order and outer height.
- The Custom Element owns all internal markup, styling, responsive behaviour and interaction.
- Editable content is exposed only through intentional lowercase attributes.
- CMS connections are added only when explicitly planned.
- Each production component is standalone so one section can be updated or rolled back without affecting the rest.
- Wix integrations such as cart and newsletter actions use Custom Events and a small Velo bridge.

## Current production components

| File | Tag | Recommended Wix height |
| --- | --- | --- |
| `dist/queso-site-header.js` | `queso-site-header` | Desktop 296px; tablet/mobile 170px |
| `dist/queso-hero.js` | `queso-hero` | Desktop 680–720px; mobile 680px |
| `dist/queso-fresh-intro.js` | `queso-fresh-intro` | Desktop 390–460px; mobile 360–430px |
| `dist/queso-menu-showcase.js` | `queso-menu-showcase` | Desktop 860–980px; tablet/mobile based on stacked cards |
| `dist/queso-flavor-showcase.js` | `queso-flavor-showcase` | Desktop 720–820px; tablet/mobile 1120–1450px |
| `dist/queso-proof-grid.js` | `queso-proof-grid` | Desktop 520–650px; mobile 760–900px |
| `dist/queso-events.js` | `queso-events` | Desktop 760–900px; tablet/mobile 1250–1500px |
| `dist/queso-reviews.js` | `queso-reviews` | Desktop 620–700px; mobile 660–760px |
| `dist/queso-social-grid.js` | `queso-social-grid` | Desktop 760–900px; tablet/mobile based on stacked tiles |
| `dist/queso-site-footer.js` | `queso-site-footer` | Desktop 900–1050px; tablet/mobile 1250–1600px |

## Assets

The components currently resolve fonts, logos and prototype images from the repository root, so every component is immediately usable through a versioned jsDelivr URL.

The supplied AVIF files will replace the remaining PNG, JPG and WebP defaults when the local repository workflow is connected. Image attributes can already override any default with a public HTTPS image URL.

## Wix setup rule

For each page component:

1. Create a new blank Wix section.
2. Remove section padding and unnecessary children.
3. Add one Custom Element and stretch it to full width.
4. Set its Server URL to a versioned jsDelivr URL.
5. Set the exact tag name from the table above.
6. Set the Custom Element and Wix section to the same intentional height.
7. Test on the published page.

## Event bridge

The following Custom Events are ready for Velo:

- `queso-cart-open`
- `queso-add-to-cart`
- `queso-newsletter-submit`

Visual components work without Velo. The bridge is only required when the component must call Wix Stores, newsletter or other Wix APIs.

## Fork and handoff

A client can fork this repository without affecting the current site. The existing Wix site keeps loading the original immutable commit URL until its Server URLs are deliberately switched to the fork and tested.
