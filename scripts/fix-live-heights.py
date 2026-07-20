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
    else:
        raise RuntimeError(f"Unexpected host height in {path}")

    corrected = source[: match.start()] + corrected_host + source[match.end() :]
    corrected = DIRECT_FALLBACK.sub("\n", corrected)

    verified_host = HOST_BLOCK.search(corrected)
    if not verified_host or not re.search(r"height:\s*100%;", verified_host.group(0)):
        raise RuntimeError(f"Live height correction failed for {path}")
    if not re.search(r"min-height:\s*0;", verified_host.group(0)):
        raise RuntimeError(f"min-height: 0 is missing from {path}")
    if ":host:not([data-wix-frame])" in corrected:
        raise RuntimeError(f"Direct-browser height override remains in {path}")

    if corrected != source:
        path.write_text(corrected, encoding="utf-8")
        changed.append(filename)

print(f"Corrected {len(changed)} component files: {', '.join(changed) if changed else 'none'}")
