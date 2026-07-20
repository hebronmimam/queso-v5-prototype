from pathlib import Path

DIST = Path("wix-components/dist")


def replace_once(source: str, old: str, new: str, label: str) -> str:
    if old not in source:
        if new in source:
            return source
        raise RuntimeError(f"Could not find {label}")
    return source.replace(old, new, 1)


# Header: declare the bridge attribute and stop iframe navigation synchronously
# whenever Velo has explicitly enabled the cart bridge.
header_path = DIST / "queso-site-header.js"
header = header_path.read_text(encoding="utf-8")
header = replace_once(
    header,
    '        "cart-url",\n        "cart-count"',
    '        "cart-url",\n        "cart-count",\n        "cart-bridge"',
    "header cart-bridge observed attribute",
)
header = replace_once(
    header,
    '''      cartLink?.addEventListener("click", (clickEvent) => {\n        const customEvent = new CustomEvent("queso-cart-open", {''',
    '''      cartLink?.addEventListener("click", (clickEvent) => {\n        const bridgeEnabled = ["true", "1", "on", "yes"].includes(\n          (this.getAttribute("cart-bridge") || "").toLowerCase()\n        );\n\n        if (bridgeEnabled) {\n          clickEvent.preventDefault();\n        }\n\n        const customEvent = new CustomEvent("queso-cart-open", {''',
    "header synchronous bridge prevention",
)
header = replace_once(
    header,
    '''        if (customEvent.defaultPrevented) {\n          clickEvent.preventDefault();\n        }''',
    '''        if (customEvent.defaultPrevented) {\n          clickEvent.preventDefault();\n        }''',
    "header cancellation fallback",
)
header_path.write_text(header, encoding="utf-8")


# Menu: use the same explicit bridge handshake for Add to Cart links.
menu_path = DIST / "queso-menu-showcase.js"
menu = menu_path.read_text(encoding="utf-8")
menu = replace_once(
    menu,
    '      const attributes = ["eyebrow", "title", "link-label", "link-url"];',
    '      const attributes = ["eyebrow", "title", "link-label", "link-url", "cart-bridge"];',
    "menu cart-bridge observed attribute",
)
menu = replace_once(
    menu,
    '''          if (!item || !item.primaryLabel.toLowerCase().includes("add")) return;\n\n          const customEvent = new CustomEvent("queso-add-to-cart", {''',
    '''          if (!item || !item.primaryLabel.toLowerCase().includes("add")) return;\n\n          const bridgeEnabled = ["true", "1", "on", "yes"].includes(\n            (this.getAttribute("cart-bridge") || "").toLowerCase()\n          );\n\n          if (bridgeEnabled) {\n            event.preventDefault();\n          }\n\n          const customEvent = new CustomEvent("queso-add-to-cart", {''',
    "menu synchronous bridge prevention",
)
menu_path.write_text(menu, encoding="utf-8")

print("Prepared header and menu for an explicit Wix cart-bridge handshake.")
