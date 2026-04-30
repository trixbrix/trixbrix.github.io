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

### Publish a new firmware build (recommended)

Run the **`/publish`** Claude skill from inside this repo:

```
/publish                    # default: only-configured device, next integer version
/publish multi-switch       # explicit device
```

The skill builds the firmware, picks the next version number, generates a customer-friendly changelog from the firmware repo's git log since the last release, asks you to confirm/edit it, then commits and pushes.

### Manual publish (fallback)

```bash
./scripts/publish-device.sh multi-switch        # next integer (1, 2, 3, ...)
./scripts/publish-device.sh multi-switch 5      # explicit version
$EDITOR multi-switch/firmware/<n>/changelog.md  # write release notes
git add -A && git commit -m "Publish multi-switch v<n>" && git push
```

`publish-device.sh` does:

1. Runs `pio run` in `../<device>/`
2. Copies the four `.bin` files into `<device>/firmware/<version>/`
3. Records the firmware-repo commit SHA in `source-sha.txt` (used by `/publish` next time)
4. Rewrites `<device>/manifest.json` to point at the new version
5. Creates a placeholder `changelog.md` if none exists yet
6. Regenerates `<device>/versions.json` and the landing page

GitHub Pages picks the change up in about a minute.

### Versioning

Versions are simple integers (1, 2, 3, ...). No semver — the audience is end users, not developers. The release date appears next to each version in the website's history. The firmware itself can carry its own internal `FIRMWARE_VERSION` (in `params.h` or wherever) — that's separate from the public release number and untouched by these scripts.

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
