#!/usr/bin/env bash
# Build firmware for <device> in ../<device>, then copy the resulting
# .bin files into <device>/firmware/<version>/, update <device>/manifest.json
# to point at this version, and regenerate the landing page.
#
# Usage: ./scripts/publish-device.sh <device> [version]
#
# If no version is given, this script picks the next sequential integer:
# (max integer in <device>/firmware/*/ ) + 1, or 1 if none exist yet.
# Versions are simple integers (1, 2, 3, ...) — no semver — because the
# audience is non-technical end users.

set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <device> [version]" >&2
  exit 64
fi

device="$1"
version="${2:-}"

repo_root="$(cd "$(dirname "$0")/.." && pwd)"
firmware_root="$(cd "$repo_root/.." && pwd)/$device"
device_dir="$repo_root/$device"

if [[ ! -d "$firmware_root" ]]; then
  echo "Error: firmware repo not found at $firmware_root" >&2
  exit 1
fi

if [[ ! -d "$device_dir" ]]; then
  echo "Error: device folder not found at $device_dir" >&2
  echo "Create $device_dir/ with index.html, manifest.json, meta.json first." >&2
  exit 1
fi

# 1. Build firmware. Prefer a venv-local pio (firmware-updater/.venv) so the
# tool stays scoped to this repo and isn't required system-wide.
PIO_BIN="pio"
if [[ -x "$repo_root/.venv/bin/pio" ]]; then
  PIO_BIN="$repo_root/.venv/bin/pio"
elif ! command -v pio >/dev/null 2>&1; then
  echo "Error: 'pio' not found. Either install PlatformIO globally, or create" >&2
  echo "a venv inside this repo and install it there:" >&2
  echo "  python3 -m venv .venv && .venv/bin/pip install platformio" >&2
  exit 1
fi
echo "==> Building firmware in $firmware_root"
( cd "$firmware_root" && "$PIO_BIN" run )

# 2. Resolve version: explicit arg, or next integer after the highest existing
if [[ -z "$version" ]]; then
  highest=0
  shopt -s nullglob
  for d in "$device_dir/firmware"/*/; do
    name=$(basename "$d")
    if [[ "$name" =~ ^[0-9]+$ ]] && (( name > highest )); then
      highest=$name
    fi
  done
  shopt -u nullglob
  version=$((highest + 1))
fi
echo "==> Publishing version $version"

# 3. Locate binaries
build_dir="$firmware_root/.pio/build/esp32dev"
for f in partitions.bin firmware.bin; do
  if [[ ! -f "$build_dir/$f" ]]; then
    echo "Error: $build_dir/$f not found" >&2
    exit 1
  fi
done

# Bootloader: Arduino-ESP32 v2.x doesn't emit bootloader.bin from the build.
# It ships pre-built bootloaders per flash_mode/freq. Default for esp32dev
# (no override in platformio.ini) is DIO @ 40MHz.
if [[ -f "$build_dir/bootloader.bin" ]]; then
  bootloader_src="$build_dir/bootloader.bin"
else
  bootloader_src=$(find "$HOME/.platformio/packages/framework-arduinoespressif32/tools/sdk/bin" \
                     -name 'bootloader_dio_40m.bin' 2>/dev/null | head -1)
  if [[ -z "$bootloader_src" || ! -f "$bootloader_src" ]]; then
    echo "Error: could not locate bootloader.bin or framework bootloader_dio_40m.bin" >&2
    exit 1
  fi
fi

# boot_app0.bin lives in the framework package; PIO downloads it on first build.
boot_app0=$(find "$HOME/.platformio/packages" -type f -name boot_app0.bin 2>/dev/null | head -1)
if [[ -z "$boot_app0" || ! -f "$boot_app0" ]]; then
  echo "Error: could not locate boot_app0.bin under ~/.platformio/packages" >&2
  echo "Tip: run 'pio run' in $firmware_root once to download the framework, then retry." >&2
  exit 1
fi

# 4. Copy bins into versioned directory
out_dir="$device_dir/firmware/$version"
mkdir -p "$out_dir"
cp "$bootloader_src"           "$out_dir/bootloader.bin"
cp "$build_dir/partitions.bin" "$out_dir/"
cp "$build_dir/firmware.bin"   "$out_dir/"
cp "$boot_app0"                "$out_dir/boot_app0.bin"

# Record which firmware-repo commit produced these binaries so the next
# publish can diff git log <prev>..HEAD and write release notes from it.
src_sha=$(git -C "$firmware_root" rev-parse HEAD 2>/dev/null || true)
if [[ -n "$src_sha" ]]; then
  echo "$src_sha" > "$out_dir/source-sha.txt"
  if [[ -n "$(git -C "$firmware_root" status --porcelain 2>/dev/null)" ]]; then
    echo "Warning: $firmware_root has uncommitted changes. Built from $src_sha plus uncommitted work." >&2
  fi
fi

# 5. Update manifest.json: version + parts paths
manifest="$device_dir/manifest.json"
if [[ -f "$manifest" ]]; then
  if command -v jq >/dev/null 2>&1; then
    tmp=$(mktemp)
    jq --arg v "$version" '
      .version = $v
      | .builds[].parts |= map(
          .path = "firmware/" + $v + "/" + (.path | split("/") | last)
        )
    ' "$manifest" > "$tmp" && mv "$tmp" "$manifest"
  else
    echo "Warning: jq not found; manifest.json paths not updated. Edit $manifest by hand." >&2
  fi
fi

# 6. Ensure a changelog.md exists for this version (placeholder if new)
changelog_file="$out_dir/changelog.md"
if [[ ! -f "$changelog_file" ]]; then
  cat > "$changelog_file" <<EOF
Release notes for $version. Edit this file before committing.

-
EOF
  echo "==> Created placeholder $changelog_file — fill it in before commit."
fi

# 7. Regenerate versions.json (lists all published versions for the device page)
python3 - "$device_dir" <<'PY'
import json, pathlib, datetime
device_dir = pathlib.Path(__import__("sys").argv[1])
fw_root = device_dir / "firmware"

def vkey(name):
    parts = []
    for x in name.split('.'):
        try:
            parts.append((0, int(x)))
        except ValueError:
            parts.append((1, x))
    return parts

versions = []
if fw_root.is_dir():
    dirs = sorted(
        (d for d in fw_root.iterdir() if d.is_dir()),
        key=lambda p: vkey(p.name),
        reverse=True,
    )
    for d in dirs:
        firmware_bin = d / "firmware.bin"
        if not firmware_bin.is_file():
            continue
        # Collect all changelog files: changelog.md (en), changelog.<lang>.md (other langs)
        changelogs = {}
        for cl in d.glob("changelog*.md"):
            stem = cl.stem  # e.g. "changelog" or "changelog.de"
            if stem == "changelog":
                lang = "en"
            elif stem.startswith("changelog."):
                lang = stem.split(".", 1)[1]
            else:
                continue
            changelogs[lang] = cl.read_text()
        try:
            date = datetime.date.fromtimestamp(firmware_bin.stat().st_mtime).isoformat()
        except Exception:
            date = ""
        versions.append({
            "version": d.name,
            "date": date,
            "changelog": changelogs,
        })

out = {
    "current": versions[0]["version"] if versions else None,
    "versions": versions,
}
(device_dir / "versions.json").write_text(json.dumps(out, indent=2) + "\n")
print(f"==> versions.json: {len(versions)} version(s)")
PY

# 8. Regenerate landing page so a new device shows up automatically
"$repo_root/scripts/update-landing.sh"

# 9. Summary
total=$(du -cb "$out_dir"/*.bin 2>/dev/null | tail -1 | awk '{print $1}')
echo
echo "==> Published $device $version"
echo "    Output:    $out_dir"
echo "    Files:     $(ls "$out_dir" | tr '\n' ' ')"
echo "    Total:     $((total / 1024)) KiB"
echo "    Manifest:  $manifest"
echo
echo "Next:"
echo "  1. Edit $changelog_file with release notes (or use the /publish skill which writes them automatically)."
echo "  2. Review the diff, then: git add -A && git commit -m 'Publish $device v$version' && git push"
echo "  The site will be live on GitHub Pages in ~1 minute."
