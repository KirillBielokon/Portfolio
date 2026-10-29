#!/usr/bin/env python3
"""Compare the published HTTPS pages and assets with the local production build."""
import argparse
import hashlib
import json
from html.parser import HTMLParser
from pathlib import Path
from urllib.request import urlopen


class AssetLinks(HTMLParser):
    def __init__(self):
        super().__init__()
        self.paths = set()

    def handle_starttag(self, tag, attributes):
        for name, value in attributes:
            if name in {"src", "href"} and value and value.startswith("/assets/"):
                self.paths.add(value)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--cache-key", required=True, help="Published gh-pages commit")
    parser.add_argument("--output", type=Path, help="Optional JSON report")
    options = parser.parse_args()
    root = Path(__file__).resolve().parents[1] / "dist"
    if (root / "CNAME").read_text().strip() != "kirillbielokon.com":
        raise SystemExit("Unexpected domain in dist/CNAME.")
    origin = "https://kirillbielokon.com"
    checked = []
    assets = set()
    pages = {"/": "index.html", "/demo/forma/": "demo/forma/index.html"}

    def check(path, local_path, base=origin):
        with urlopen(f"{base}{path}?release={options.cache_key}", timeout=30) as response:
            data = response.read()
            status, final_url = response.status, response.url
        expected = (root / local_path).read_bytes()
        if data != expected:
            raise SystemExit(f"Published file differs from the tested build: {path}")
        checked.append({"path": path, "status": status, "url": final_url,
                        "sha256": hashlib.sha256(data).hexdigest()})
        return data

    for path, local_path in pages.items():
        links = AssetLinks()
        links.feed(check(path, local_path).decode())
        assets.update(links.paths)
    assets.update({"/favicon.svg", "/social-preview.png"})
    assets.update("/" + path.relative_to(root).as_posix()
                  for path in (root / "images/forma-demo").glob("*.webp"))
    for path in sorted(assets):
        check(path, path.lstrip("/"))
    check("/", "index.html", "https://www.kirillbielokon.com")
    report = {"release": options.cache_key, "matches_build": True, "files": checked}
    if options.output:
        options.output.write_text(json.dumps(report, indent=2) + "\n")
    print(f"HTTPS verified: {len(checked)} pages/assets match the local build.")


if __name__ == "__main__":
    main()
