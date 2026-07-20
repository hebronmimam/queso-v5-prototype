from pathlib import Path
import re

COMPONENTS = [
    "queso-site-header.js",
    "queso-hero.js",
    "queso-fresh-intro.js",
    "queso-menu-showcase.js",
    "queso-flavor-showcase.js",
    "queso-proof-grid.js",
    "queso-events.js",
    "queso-reviews.js",
    "queso-social-grid.js",
    "queso-site-footer.js",
]

ABSOLUTE_ROOT_COMPONENTS = {
    "queso-hero.js": ".hero",
    "queso-fresh-intro.js": ".intro",
}

DIST = Path("wix-components/dist")
HOST_BLOCK = re.compile(r":host\s*\{[\s\S]*?\}")
PIXEL_HEIGHT = re.compile(r"height:\s*\d+px;")
DIRECT_FALLBACK = re.compile(
    r"\n\s*:host:not\(\[data-wix-frame\]\)\s*\{\s*height:\s*\d+px;\s*\}\s*",
    re.MULTILINE,
)

changed = []

for filename in COMPONENTS:
    path = DIST / filename
    source = path.read_text(encoding="utf-8")

    match = HOST_BLOCK.search(source)
    if not match:
        raise RuntimeError(f"No :host block found in {path}")

    host_block = match.group(0)
    if PIXEL_HEIGHT.search(host_block):
        corrected_host = PIXEL_HEIGHT.sub("height: 100%;", host_block, count=1)
    elif re.search(r"height:\s*100%;", host_block):
        corrected_host = host_block
    elif filename in ABSOLUTE_ROOT_COMPONENTS and "position: relative;" in host_block:
        corrected_host = host_block
    else:
        raise RuntimeError(f"Unexpected host height in {path}")

    corrected = source[: match.start()] + corrected_host + source[match.end() :]
    corrected = DIRECT_FALLBACK.sub("\n", corrected)
    corrected = corrected.replace(
        "\n.desktop-cake-menu,\n",
        "\n            .desktop-cake-menu,\n",
    )

    if filename in ABSOLUTE_ROOT_COMPONENTS:
        corrected = corrected.replace(
            "            display: block;\n"
            "            width: 100%;\n"
            "            height: 100%;\n"
            "            min-height: 0;",
            "            position: relative;\n"
            "            display: block;\n"
            "            width: 100%;\n"
            "            min-height: 0;",
            1,
        )

        root_selector = ABSOLUTE_ROOT_COMPONENTS[filename]
        root_pattern = re.compile(
            rf"({re.escape(root_selector)}\s*\{{\s*)"
            r"position:\s*relative;\s*"
            r"width:\s*100%;\s*"
            r"height:\s*100%;",
            re.MULTILINE,
        )
        corrected, root_count = root_pattern.subn(
            rf"\1position: absolute;\n"
            "            inset: 0;\n"
            "            width: auto;\n"
            "            height: auto;",
            corrected,
            count=1,
        )

        if root_count == 0 and not re.search(
            rf"{re.escape(root_selector)}\s*\{{[\s\S]*?position:\s*absolute;[\s\S]*?inset:\s*0;",
            corrected,
        ):
            raise RuntimeError(f"Could not contain {root_selector} in {path}")

    verified_host = HOST_BLOCK.search(corrected)
    if not verified_host:
        raise RuntimeError(f"Host verification failed for {path}")
    if not re.search(r"min-height:\s*0;", verified_host.group(0)):
        raise RuntimeError(f"min-height: 0 is missing from {path}")
    if filename in ABSOLUTE_ROOT_COMPONENTS:
        if "position: relative;" not in verified_host.group(0):
            raise RuntimeError(f"Host containment is missing from {path}")
        if re.search(r"height:\s*100%;", verified_host.group(0)):
            raise RuntimeError(f"Percentage host height remains in {path}")
    elif not re.search(r"height:\s*100%;", verified_host.group(0)):
        raise RuntimeError(f"Live height correction failed for {path}")
    if ":host:not([data-wix-frame])" in corrected:
        raise RuntimeError(f"Direct-browser height override remains in {path}")

    if corrected != source:
        path.write_text(corrected, encoding="utf-8")
        changed.append(filename)

print(f"Corrected {len(changed)} component files: {', '.join(changed) if changed else 'none'}")
