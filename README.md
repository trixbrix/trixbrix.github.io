# trixbrix.github.io

Public hub for Trixbrix firmware releases, documentation, and end-user tools. Hosted on GitHub Pages at [https://trixbrix.github.io/](https://trixbrix.github.io/).

The first thing here is a **browser-based firmware updater** for Trixbrix ESP32 devices: end users open the page in Chrome/Edge, plug in the device via USB, and click a button to flash. No installer, no Python, no PlatformIO. Powered by [esp-web-tools](https://github.com/esphome/esp-web-tools) and the WebSerial API.

## Browser support

WebSerial is **Chromium-only**: Chrome, Edge, Brave, Arc, Opera (desktop and Android Chrome). Firefox and Safari users see a banner asking them to switch browsers.

## Repo layout

This repo *is* the published site. GitHub Pages serves it from the `main` branch root, so the URL structure on disk matches the URL structure end-users see.

```
trixbrix.github.io/
├── index.html                    # landing: device cards
├── assets/                       # css, favicon
├── <device>/                     # one folder per device
│   ├── index.html                # updater page
│   ├── manifest.json             # esp-web-tools manifest (paths + current version)
│   ├── meta.json                 # display name + description (used on landing)
│   ├── versions.json             # generated: list of all published versions + changelogs
│   └── firmware/<version>/       # versioned bin files (committed to git)
│       ├── bootloader.bin
│       ├── partitions.bin
│       ├── boot_app0.bin
│       ├── firmware.bin
│       └── changelog.md          # release notes for this version (Markdown)
└── scripts/
    ├── publish-device.sh         # build firmware + copy bins + bump manifest + regen versions/landing
    └── update-landing.sh         # regenerate landing-page cards from each <device>/meta.json
```

## One-time setup

GitHub repo is `trixbrix/trixbrix.github.io`, public. Pages serves it from `main:/` automatically — the site is live at `https://trixbrix.github.io/`.

## Workflow

### Publish a new firmware build

```bash
./scripts/publish-device.sh multi-switch              # auto-detects version from include/params.h
./scripts/publish-device.sh multi-switch 1.2.0        # explicit version
```

What it does:

1. Runs `pio run` in `../<device>/`
2. Copies `bootloader.bin`, `partitions.bin`, `firmware.bin` (from `.pio/build/esp32dev/`) and `boot_app0.bin` (from PlatformIO framework) into `<device>/firmware/<version>/`
3. Rewrites `<device>/manifest.json` to point at the new version
4. Creates `<device>/firmware/<version>/changelog.md` (placeholder if new) — **edit this with the release notes before committing**
5. Regenerates `<device>/versions.json` from all `firmware/*/changelog.md` files
6. Regenerates the landing page

Then commit and push:

```bash
$EDITOR multi-switch/firmware/<version>/changelog.md   # write release notes
git add -A
git commit -m "Publish multi-switch <version>"
git push
```

GitHub Pages picks the change up in about a minute.

### Test locally before pushing

```bash
python3 -m http.server 8000
# open http://localhost:8000 in Chrome
```

### Adding a new device

1. Create `<device>/` with:
   - `index.html` (copy `multi-switch/index.html`, change device name + warning text)
   - `manifest.json` (set `"name"` and `chipFamily` if not classic ESP32)
   - `meta.json` (`{"name": "...", "description": "...", "chip": "esp32"}`)
2. Run `./scripts/publish-device.sh <device>` to populate `firmware/` and generate `versions.json`.
3. The landing page picks up the new device automatically.

## Requirements

- `pio` (PlatformIO Core) — to build firmware
- `jq` — for safe manifest editing (script falls back to a warning if missing)
- A POSIX shell + Python 3 (for the in-place HTML edit)
