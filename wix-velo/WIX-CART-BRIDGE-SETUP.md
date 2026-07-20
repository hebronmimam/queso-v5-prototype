# Queso Wix Cart Bridge Setup

## Element IDs

Rename the two homepage Custom Elements in Wix:

- Site Header Custom Element: `quesoHeader`
- Menu Showcase Custom Element: `quesoMenuShowcase`

The IDs are case-sensitive. Wix shows the leading `#` in code, but do not type `#` into the element ID field.

## Page code

Open the homepage code panel and replace its code with the contents of:

`wix-velo/home-cart-bridge.js`

The bridge uses:

- `queso-cart-open` from the header
- `queso-add-to-cart` from the Menu Showcase
- the current Wix eCommerce cart API
- the Wix eCommerce frontend refresh and side-cart APIs
- the read-only `Stores/Products` collection to resolve a product by ID or exact product name

## Product matching

The Menu Showcase now supports these optional lowercase Custom Element attributes for each card:

- `item-1-product-id`
- `item-1-product-name`
- through `item-4-product-id`
- `item-4-product-name`

A product ID is the most reliable match. When no product ID is supplied, the bridge queries `Stores/Products` using the product name emitted by the component.

Current default names:

1. `Birthday Suit`
2. `Artisan`
3. `Canvas`
4. `Lotus Biscoff Cheesecake`

Canvas uses a Customize action rather than direct add-to-cart, so it continues to its product/customisation page.

## Variant and custom-field safety

When a Wix product has variants, product options or custom text fields, the bridge sends the visitor to that product's Wix product page instead of adding an incomplete line item.

Simple products are added directly, the Wix cart UI is refreshed, the header count is updated and the side cart opens.

## Test order

1. Publish the site.
2. Open the live homepage in a private browser tab.
3. Click the header cart link and confirm the Wix side cart opens.
4. Click each Menu Showcase primary action.
5. Confirm simple products add directly.
6. Confirm products requiring choices open their product page.
7. Confirm the header cart quantity updates.

Cart APIs and product queries should be tested on the published site, not only inside Wix Preview.
