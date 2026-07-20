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

## Current production components

| File | Tag | Recommended Wix height |
| --- | --- | --- |
| `dist/queso-hero.js` | `queso-hero` | Desktop 680–720px; mobile 680px |
| `dist/queso-fresh-intro.js` | `queso-fresh-intro` | Desktop 390–460px; mobile 360–430px |
| `dist/queso-proof-grid.js` | `queso-proof-grid` | Desktop 520–650px; mobile auto/760–900px |

## Required assets

```text
wix-components/
├── assets/
│   ├── fonts/
│   │   ├── Lovelo_Black.otf
│   │   └── Quicksand-VariableFont_wght.ttf
│   └── images/
│       ├── hero-rose-wide.avif
│       ├── hero-canvas-wide.avif
│       └── hero-artisan-wide.avif
└── dist/
```

The hero uses AVIF by default. Image attributes may still override a slide with any public HTTPS image URL.

## Wix setup rule

For each page component:

1. Create a new blank Wix section.
2. Remove section padding and unnecessary children.
3. Add one Custom Element and stretch it to full width.
4. Set its Server URL to a versioned jsDelivr URL.
5. Set the exact tag name from the table above.
6. Set the Custom Element and Wix section to the same intentional height.
7. Test on the published page.

## Fork/handoff

A client can fork this repository without affecting the current site. The existing Wix site keeps loading the original immutable commit URL until its Server URLs are deliberately switched to the fork and tested.
