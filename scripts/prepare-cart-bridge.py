from pathlib import Path

path = Path("wix-components/dist/queso-menu-showcase.js")
source = path.read_text(encoding="utf-8")

source = source.replace(
    "          `item-${index}-secondary-label`,\n          `item-${index}-secondary-url`\n",
    "          `item-${index}-secondary-label`,\n          `item-${index}-secondary-url`,\n          `item-${index}-product-name`,\n          `item-${index}-product-id`\n",
    1,
)

source = source.replace(
    "          secondaryLabel: this.value(`item-${number}-secondary-label`, fallback.secondaryLabel),\n          secondaryUrl: this.value(`item-${number}-secondary-url`, fallback.secondaryUrl)\n",
    "          secondaryLabel: this.value(`item-${number}-secondary-label`, fallback.secondaryLabel),\n          secondaryUrl: this.value(`item-${number}-secondary-url`, fallback.secondaryUrl),\n          productName: this.value(`item-${number}-product-name`, fallback.productName),\n          productId: this.value(`item-${number}-product-id`, \"\")\n",
    1,
)

old = '''          this.dispatchEvent(new CustomEvent("queso-add-to-cart", {
            bubbles: true,
            composed: true,
            cancelable: true,
            detail: {
              index,
              productName: item.productName,
              price: item.productPrice,
              image: item.image,
              fallbackUrl: item.primaryUrl
            }
          }));

          if (event.defaultPrevented) event.preventDefault();
'''

new = '''          const customEvent = new CustomEvent("queso-add-to-cart", {
            bubbles: true,
            composed: true,
            cancelable: true,
            detail: {
              index,
              productId: item.productId,
              productName: item.productName,
              price: item.productPrice,
              image: item.image,
              fallbackUrl: item.primaryUrl
            }
          });

          this.dispatchEvent(customEvent);

          if (customEvent.defaultPrevented) {
            event.preventDefault();
          }
'''

if old not in source:
    raise RuntimeError("Expected queso-add-to-cart block was not found")

source = source.replace(old, new, 1)

required = [
    "item-${index}-product-name",
    "item-${index}-product-id",
    "productId: item.productId",
    "if (customEvent.defaultPrevented)",
]
for marker in required:
    if marker not in source:
        raise RuntimeError(f"Missing expected cart bridge marker: {marker}")

path.write_text(source, encoding="utf-8")
print("Prepared queso-menu-showcase.js for the Wix cart bridge")
