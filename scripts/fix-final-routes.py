from pathlib import Path

FILES = [
    Path("wix-components/dist/queso-site-header.js"),
    Path("wix-components/dist/queso-site-footer.js"),
]

REPLACEMENTS = {
    '"/our-story"': '"/about"',
}

changed = []

for path in FILES:
    source = path.read_text(encoding="utf-8")
    corrected = source

    for old, new in REPLACEMENTS.items():
        corrected = corrected.replace(old, new)

    if '"/our-story"' in corrected:
        raise RuntimeError(f"Old story route remains in {path}")

    if corrected != source:
        path.write_text(corrected, encoding="utf-8")
        changed.append(str(path))

print(f"Updated {len(changed)} route files: {', '.join(changed) if changed else 'none'}")
