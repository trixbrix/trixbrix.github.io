#!/usr/bin/env bash
# Regenerate the device-card region of index.html in place from each
# <device>/meta.json. Idempotent — safe to run multiple times.
#
# The cards live between two HTML comment markers:
#   <!-- DEVICES_START -->
#   ...
#   <!-- DEVICES_END -->
#
# Usage: ./scripts/update-landing.sh

set -euo pipefail

repo_root="$(cd "$(dirname "$0")/.." && pwd)"
landing="$repo_root/index.html"

if [[ ! -f "$landing" ]]; then
  echo "Error: $landing not found" >&2
  exit 1
fi

cards=""
shopt -s nullglob
for meta in "$repo_root"/*/meta.json; do
  device_dir=$(dirname "$meta")
  device=$(basename "$device_dir")

  if command -v jq >/dev/null 2>&1; then
    name=$(jq -r '.name // empty' "$meta")
    desc=$(jq -r '.description // empty' "$meta")
    chip=$(jq -r '.chip // empty' "$meta")
    usb=$(jq -r '.usb // empty' "$meta")
    i18n_key=$(jq -r '.i18n_key // empty' "$meta")
  else
    name=$(grep -oE '"name"[[:space:]]*:[[:space:]]*"[^"]*"' "$meta" | head -1 | sed -E 's/.*"([^"]*)"$/\1/')
    desc=$(grep -oE '"description"[[:space:]]*:[[:space:]]*"[^"]*"' "$meta" | head -1 | sed -E 's/.*"([^"]*)"$/\1/')
    chip=$(grep -oE '"chip"[[:space:]]*:[[:space:]]*"[^"]*"' "$meta" | head -1 | sed -E 's/.*"([^"]*)"$/\1/')
    usb=$(grep -oE '"usb"[[:space:]]*:[[:space:]]*"[^"]*"' "$meta" | head -1 | sed -E 's/.*"([^"]*)"$/\1/')
    i18n_key=$(grep -oE '"i18n_key"[[:space:]]*:[[:space:]]*"[^"]*"' "$meta" | head -1 | sed -E 's/.*"([^"]*)"$/\1/')
  fi
  [[ -z "$name" ]] && name="$device"
  case "$usb" in
    micro-usb) usb_label="Micro-USB" ;;
    usb-c)     usb_label="USB-C" ;;
    "")        usb_label="" ;;
    *)         usb_label="$usb" ;;
  esac

  cards+="    <a class=\"card\" href=\"$device/\">"$'\n'
  if [[ -f "$device_dir/product.webp" ]]; then
    cards+="      <img class=\"card-image\" src=\"$device/product.webp\" alt=\"\" loading=\"lazy\">"$'\n'
  elif [[ -f "$device_dir/product.png" ]]; then
    cards+="      <img class=\"card-image\" src=\"$device/product.png\" alt=\"\" loading=\"lazy\">"$'\n'
  elif [[ -f "$device_dir/product.jpg" ]]; then
    cards+="      <img class=\"card-image\" src=\"$device/product.jpg\" alt=\"\" loading=\"lazy\">"$'\n'
  fi
  cards+="      <div class=\"card-body\">"$'\n'
  cards+="        <h3>$name</h3>"$'\n'
  if [[ -n "$desc" ]]; then
    if [[ -n "$i18n_key" ]]; then
      cards+="        <p class=\"desc\" data-i18n=\"card.${i18n_key}.desc\">$desc</p>"$'\n'
    else
      cards+="        <p class=\"desc\">$desc</p>"$'\n'
    fi
  fi
  if [[ -n "$chip" || -n "$usb_label" ]]; then
    chip_upper=$(echo "$chip" | tr '[:lower:]' '[:upper:]')
    parts=""
    [[ -n "$chip_upper" ]] && parts="$chip_upper"
    [[ -n "$usb_label" ]] && parts="${parts:+$parts · }$usb_label"
    cards+="        <span class=\"chip\">$parts</span>"$'\n'
  fi
  cards+="      </div>"$'\n'
  cards+="    </a>"$'\n'
done
shopt -u nullglob

if [[ -z "$cards" ]]; then
  cards="    <p class=\"muted\">No devices configured yet.</p>"$'\n'
fi

# Substitute between markers using python (multi-line safe)
python3 - "$landing" "$cards" <<'PY'
import sys, pathlib, re
path = pathlib.Path(sys.argv[1])
cards = sys.argv[2]
text = path.read_text()
pattern = re.compile(
    r'(<!-- DEVICES_START -->\n).*?(\s*<!-- DEVICES_END -->)',
    re.DOTALL,
)
if not pattern.search(text):
    print(f"Error: marker pair not found in {path}", file=sys.stderr)
    sys.exit(1)
new_text = pattern.sub(lambda m: m.group(1) + cards.rstrip('\n') + '\n' + m.group(2).lstrip('\n'), text)
path.write_text(new_text)
PY

# Count devices that actually have firmware published
published=0
shopt -s nullglob
for meta in "$repo_root"/*/meta.json; do
  device_dir=$(dirname "$meta")
  if compgen -G "$device_dir/firmware/*/firmware.bin" >/dev/null; then
    published=$((published + 1))
  fi
done
shopt -u nullglob

echo "==> Landing page regenerated. Published devices: $published"
