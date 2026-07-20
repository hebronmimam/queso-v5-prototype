# Queso Final Integration Plan

Last updated: 20 July 2026

## Locked decision

The homepage remains section-by-section using separate Wix Custom Elements.

The page loader is intentionally the final implementation step. It must not be added until the full homepage, navigation and Wix integrations are complete and tested. This prevents the loader from hiding incomplete sections, broken links or integration errors during development.

## Current build status

The following homepage sections have been added and confirmed working in Wix:

1. Hero — `queso-hero`
2. Fresh Intro — `queso-fresh-intro`
3. Menu Showcase — `queso-menu-showcase`
4. Flavor Showcase — `queso-flavor-showcase`
5. Proof Grid — `queso-proof-grid`
6. Events — `queso-events`
7. Reviews — `queso-reviews`
8. Social Grid — `queso-social-grid`
9. Site Footer — `queso-site-footer`

The existing stable GitHub Pages URLs remain unchanged.

## Current implementation step

### Site Header verification

Tag: `queso-site-header`

Stable URL:
`https://hebronmimam.github.io/queso-v5-prototype/wix-components/dist/queso-site-header.js`

Implemented in the verification pass:

- Applied the confirmed Wix iframe sizing pattern: Wix controls the height; the internal header fills the iframe with `position: fixed; inset: 0`.
- Removed the old forced `min-height` behaviour.
- Preserved the 296px desktop structure and 170px tablet/mobile structure.
- Preserved the announcement marquee, logo, desktop navigation, cake preview menu, mobile category strip and mobile navigation.
- Preserved all lowercase editable attributes.
- Preserved the `queso-cart-open` Custom Event.
- Corrected cart fallback behaviour: the normal `/cart` link remains active unless the future Wix/Velo bridge explicitly prevents the Custom Event.
- No approved homepage component was changed.

Recommended starting Wix heights:

- Desktop: `296px`
- Tablet/mobile: `170px`

Status: code updated; awaiting visual confirmation in Wix before marking the header complete.

## Remaining implementation order

### 1. Confirm Site Header in Wix

- Confirm desktop and mobile heights.
- Verify logo, announcement bar, cake preview menu and mobile navigation.
- Confirm the cart link still follows its fallback route before the Velo bridge is connected.

### 2. Homepage link and route pass

- Verify every CTA, product card, flavour link, popup link, Instagram link and footer link.
- Replace prototype-only routes with the final Wix routes.
- Confirm external links open safely in a new tab.

### 3. Wix Stores bridge

- Connect `queso-cart-open` to the Wix cart.
- Connect `queso-add-to-cart` to the matching Wix Stores products and variants.
- Update the header cart count after successful additions.
- Keep the component fallback URLs usable when the bridge is unavailable.

### 4. Newsletter bridge

- Connect `queso-newsletter-submit` from the footer to the selected Wix contact/newsletter workflow.
- Provide success, validation and failure messages inside the footer component.
- Prevent duplicate submissions while a request is running.

### 5. Full responsive and visual QA

- Check desktop, tablet and mobile section heights.
- Check section boundaries, typography, image crops, overflow and interactive states.
- Test the mobile header navigation and all horizontal carousels.
- Test keyboard focus and reduced-motion behaviour.
- Fix only confirmed issues without changing previously approved sections unnecessarily.

### 6. Published-site integration testing

- Test the Wix published/test site rather than relying only on Editor Preview.
- Test navigation, cart, newsletter, external links and responsive layouts.
- Confirm the stable GitHub Pages assets load correctly without editor caching.

### 7. Performance pass

- Prioritise the active hero image and essential above-the-fold assets.
- Keep lower-page imagery lazy-loaded.
- Set matching native Wix section background colours to remove white loading flashes.
- Remove avoidable repeated work without merging the section-level architecture.

### 8. Page loader — final step

- Build the loader using native Wix elements so it appears immediately.
- Add the `queso-component-ready` readiness protocol only after every component is final.
- Wait for the visually critical content, not every below-the-fold lazy image.
- Include a minimum display time, completion transition and safety timeout.
- Test the loader last on the published site under both fast and throttled connections.

## Regression rules

- Do not merge the homepage into one Custom Element.
- Do not reintroduce `100vh`, `window.innerHeight`, iframe-height syncing or forced mobile minimum heights.
- Do not change stable component URLs for normal updates.
- Do not change approved fonts or section layouts while working on unrelated integrations.
- Do not let the future loader conceal broken or incomplete content during development.
