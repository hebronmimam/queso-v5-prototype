import wixData from "wix-data";
import { currentCart } from "wix-ecom-backend";
import wixEcomFrontend from "wix-ecom-frontend";
import wixLocationFrontend from "wix-location-frontend";

const WIX_STORES_APP_ID = "215238eb-22a5-4c36-9e7b-e7c08025e04e";
const HEADER_ELEMENT_ID = "#quesoHeader";
const MENU_ELEMENT_ID = "#quesoMenuShowcase";

$w.onReady(async function () {
  const header = $w(HEADER_ELEMENT_ID);
  const menu = $w(MENU_ELEMENT_ID);

  header.on("queso-cart-open", (event) => {
    event.preventDefault();
    openCart();
  });

  menu.on("queso-add-to-cart", async (event) => {
    event.preventDefault();

    const detail = event.detail || {};

    try {
      const product = await resolveStoreProduct(detail);

      if (requiresProductPage(product)) {
        const destination = product.productPageUrl || detail.fallbackUrl;
        if (!destination) {
          throw new Error(`No product page URL found for ${detail.productName || "this item"}.`);
        }

        wixLocationFrontend.to(destination);
        return;
      }

      await currentCart.addToCurrentCart({
        lineItems: [
          {
            catalogReference: {
              appId: WIX_STORES_APP_ID,
              catalogItemId: product._id,
            },
            quantity: 1,
          },
        ],
      });

      await wixEcomFrontend.refreshCart();
      await syncHeaderCartCount();
      openCart();
    } catch (error) {
      console.error("Queso add-to-cart failed:", error);

      if (detail.fallbackUrl) {
        wixLocationFrontend.to(detail.fallbackUrl);
      }
    }
  });

  await syncHeaderCartCount();
});

async function resolveStoreProduct(detail) {
  if (detail.productId) {
    const product = await wixData.get("Stores/Products", detail.productId);
    if (product) return product;
  }

  const productName = String(detail.productName || "").trim();
  if (!productName) {
    throw new Error("The Custom Element did not provide a product ID or product name.");
  }

  const exact = await wixData
    .query("Stores/Products")
    .eq("name", productName)
    .limit(1)
    .find();

  if (exact.items.length) return exact.items[0];

  const closeMatch = await wixData
    .query("Stores/Products")
    .contains("name", productName)
    .limit(1)
    .find();

  if (closeMatch.items.length) return closeMatch.items[0];

  throw new Error(`No Wix Stores product matched “${productName}”.`);
}

function requiresProductPage(product) {
  const hasVariants = Boolean(product.manageVariants);
  const hasOptions = Boolean(
    product.productOptions && Object.keys(product.productOptions).length,
  );
  const hasCustomFields = Boolean(
    Array.isArray(product.customTextFields) && product.customTextFields.length,
  );

  return hasVariants || hasOptions || hasCustomFields;
}

async function syncHeaderCartCount() {
  try {
    const cart = await currentCart.getCurrentCart();
    const count = (cart.lineItems || []).reduce(
      (total, lineItem) => total + Number(lineItem.quantity || 0),
      0,
    );

    $w(HEADER_ELEMENT_ID).setAttribute("cart-count", String(count));
  } catch (error) {
    $w(HEADER_ELEMENT_ID).setAttribute("cart-count", "0");
  }
}

function openCart() {
  try {
    wixEcomFrontend.openSideCart();
  } catch (error) {
    wixEcomFrontend.navigateToCartPage();
  }
}
