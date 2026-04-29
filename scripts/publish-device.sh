#!/usr/bin/env bash
# Build firmware for <device> in ../<device>, then copy the resulting
# .bin files into <device>/firmware/<version>/, update <device>/manifest.json
# to point at this version, and regenerate the landing page.
#
# Usage: ./scripts/publish-device.sh <device> [version]
#
# If no version is given, the script tries to parse FIRMWARE_VERSION
# from ../<device>/include/params.h.

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

# 1. Build firmware
echo "==> Building firmware in $firmware_root"
( cd "$firmware_root" && pio run )

# 2. Resolve version
if [[ -z "$version" ]]; then
  params="$firmware_root/include/params.h"
  if [[ -f "$params" ]]; then
    raw=$(grep -E '^\s*#define\s+FIRMWARE_VERSION\s+' "$params" | head -1 | awk '{print $3}' | tr -d '"')
    [[ -n "$raw" ]] && version="$raw"
  fi
fi
if [[ -z "$version" ]]; then
  echo "Error: could not auto-detect version. Pass it as the second argument." >&2
  exit 1
fi
echo "==> Publishing version $version"

# 3. Locate binaries
build_dir="$firmware_root/.pio/build/esp32dev"
for f in bootloader.bin partitions.bin firmware.bin; do
  if [[ ! -f "$build_dir/$f" ]]; then
    echo "Error: $build_dir/$f not found" >&2
    exit 1
  fi
done

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
cp "$build_dir/bootloader.bin" "$out_dir/"
cp "$build_dir/partitions.bin" "$out_dir/"
cp "$build_dir/firmware.bin"   "$out_dir/"
cp "$boot_app0"                "$out_dir/boot_app0.bin"

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

# 6. Sync the manual if the firmware repo has one
if [[ -f "$firmware_root/MANUAL.md" ]]; then
  cp "$firmware_root/MANUAL.md" "$device_dir/manual.md"
  echo "==> Manual synced from $firmware_root/MANUAL.md"
fi

# 7. Regenerate landing page so a new device shows up automatically
"$repo_root/scripts/update-landing.sh"

# 8. Summary
total=$(du -cb "$out_dir"/*.bin 2>/dev/null | tail -1 | awk '{print $1}')
echo
echo "==> Published $device $version"
echo "    Output:    $out_dir"
echo "    Files:     $(ls "$out_dir" | tr '\n' ' ')"
echo "    Total:     $((total / 1024)) KiB"
echo "    Manifest:  $manifest"
echo
echo "Next: review the diff, commit, and 'git push'."
echo "      The site will be live on GitHub Pages in ~1 minute."
