---
name: publish
description: Build, version, write a customer-friendly changelog, and ship a Trixbrix device firmware update. Run from the trixbrix.github.io repo root.
user-invocable: true
---

# /publish — ship a firmware update

You are publishing a new firmware release for one of the Trixbrix devices configured in this repo. End-to-end: build the firmware, pick a version number, write release notes from git history, commit, push.

Arguments: `$ARGUMENTS` (optional device name, e.g. `all-in-one-controller` or `switch-controller`).

## Pre-flight

1. Confirm cwd is the trixbrix.github.io repo root: `index.html`, `scripts/publish-device.sh`, and `scripts/update-landing.sh` must all exist. If not, stop and tell the user where to run from.

2. Resolve the device:
   - If `$ARGUMENTS` is non-empty, use it.
   - Else list directories that contain a `meta.json` (`for d in */; do [[ -f "$d/meta.json" ]] && echo "$d"; done`). If exactly one, use it. If multiple, ask the user which.
   - Verify `../<device>/` exists (the firmware source repo, sibling of this one).

3. Refuse to proceed if the **firmware source repo** has uncommitted changes. Run `git -C ../<device> status --porcelain`. If output is non-empty, show it and stop with: *"The firmware repo has uncommitted changes. Commit or stash them first — we want releases to map to a real SHA."* Don't offer to commit them ourselves; that's the user's call.

   Uncommitted changes in *this* repo (trixbrix.github.io) are fine — that's where the new files will land.

## Determine the version

Sequential integers — **no semver**. The audience is non-technical end users.

```bash
# next version = max integer in <device>/firmware/*/ + 1, or 1 if none
ls <device>/firmware/ 2>/dev/null | grep -E '^[0-9]+$' | sort -n | tail -1
```

If empty: this is version **1**. Otherwise: that number + 1.

## Find the changelog cutoff

Read `<device>/firmware/<prev-version>/source-sha.txt` (where `<prev-version>` is the highest existing integer version). That file contains the firmware-repo commit SHA that the previous release was built from — it's the cutoff for the new release notes.

If the file doesn't exist (first release ever, or older releases predate the SHA-tracking change): fall back to `git -C ../<device> log -20 --pretty=format:'%h %s' --no-merges` and frame the changelog as an initial release.

## Generate the changelog

```bash
cur_sha=$(git -C ../<device> rev-parse HEAD)
prev_sha=$(cat <device>/firmware/<prev-version>/source-sha.txt 2>/dev/null || echo "")

if [[ -n "$prev_sha" ]]; then
  git -C ../<device> log "$prev_sha..$cur_sha" --pretty=format:'%h %s' --no-merges
else
  git -C ../<device> log -20 --pretty=format:'%h %s' --no-merges
fi
```

Then **rewrite the raw subjects into customer-friendly notes**. This is the most important part of this skill — the raw `git log` is for engineers; the page is for end users. Apply this judgment:

- **Drop noise**: merge commits, "WIP", "fix typo", "bump dep", build-system tweaks, `.gitignore` changes, formatting-only commits, README updates, refactors with no user-facing effect.
- **Read the diff if a subject is cryptic** (`git -C ../<device> show <sha>`). A commit like "tweak BatteryMonitor::checkLevel" is meaningless to a customer until you read the diff and discover it changed when the low-battery LED comes on.
- **Group related commits**: if three commits all chip away at the same feature, write one bullet about the feature.
- **Audience and voice**: the user is plugging in their LEGO controller and reading a webpage. No code references, no internal class names, no file paths, no abbreviations. Plain present-tense English. Lead with the *experience*: "Battery indicator now blinks faster when below 5%" not "Refactor BatteryMonitor::checkLevel".
- **Be honest about empty releases**: if the diff is purely internal (refactors, build, docs), say so: "Internal improvements and stability fixes. No new user-facing features in this release." Don't pad the list.
- **Format**: one short sentence per bullet, max ~8 bullets. Markdown unordered list. No section headers, no "What's new" preamble — the page already has a "Version history" heading and a per-version date stamp, so the changelog body is just the bullets.

## Show, confirm, ship

1. Print the proposed changelog to the user as plain markdown (inside a code fence or just verbatim).

2. Ask once: *"Ship as v\<n\> with these notes? Reply 'ok', or paste edits / tell me what to change."*

3. Wait for the user's response. Iterate on the notes until they say ok. **Don't proceed without an explicit go-ahead.**

4. Once approved:
   - `mkdir -p <device>/firmware/<n>/`
   - Write the approved changelog to `<device>/firmware/<n>/changelog.md`
   - Run `./scripts/publish-device.sh <device> <n>`
     - This builds via `pio run`, copies the four bins, writes `source-sha.txt`, updates `manifest.json`, regenerates `versions.json` and the landing page.
     - It will *not* overwrite our `changelog.md` (it only writes a placeholder if the file is missing).
   - Show the user `git status --short` so they see what changed.
   - Commit:
     ```bash
     git add -A
     git commit -m "Publish <device> v<n>"
     ```
     If the changelog has a clear theme, append a short body to the commit message describing it; otherwise the subject alone is fine.
   - **Ask before pushing.** Pushing is visible to others and triggers a deploy. Default to *not* pushing without explicit confirmation. Once they say yes: `git push`.

5. After push, briefly note the URL: `https://trixbrix.github.io/<device>/`. Pages takes ~1 minute to redeploy.

## Failure modes — handle, don't paper over

- `pio run` fails → surface the build error verbatim, stop. Don't try to continue without binaries. Suggest the user fix the firmware and re-run `/publish`.
- Firmware repo dirty → stop pre-flight (see above).
- No commits between `prev_sha` and `HEAD` → this would be a no-op release. Confirm with the user that they really want to re-publish the same source code as a new version. If yes, proceed; the changelog is "Republished build of v\<prev\>." Otherwise abort.
- `source-sha.txt` missing for the previous version → fall back to "initial-release" mode (last 20 commits). Mention this in your message so the user knows the changelog is best-effort.
