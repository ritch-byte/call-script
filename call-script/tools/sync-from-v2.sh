#!/usr/bin/env bash
# Copy the v2 source into v1, except the files the two are meant to differ on.
#
# v1 and v2 are the same product on two URLs, so almost everything is shared and the sync is
# a wholesale copy. The exceptions below are deliberate divergences. Without this list the
# copy silently reverts them, which is the failure it exists to prevent: the divergence is
# invisible in the diff, because the file is simply overwritten rather than conflicted.
#
# Run from the repo root:  bash call-script/tools/sync-from-v2.sh
set -euo pipefail

SRC="call-script-v2/src"
DST="call-script/src"

# Files v1 keeps its own copy of. One line each, with the reason and the date it split.
DIVERGED=(
  # 2026-09-05. The Hiring Script spiel is being reworked for v2 only. v1 holds the version
  # that was live on this date. Delete this line to put the two back in step.
  "components/HiringScript.tsx"
)

[ -d "$SRC" ] || { echo "run me from the repo root" >&2; exit 1; }

STASH="$(mktemp -d)"
for f in "${DIVERGED[@]}"; do
  if [ -f "$DST/$f" ]; then
    mkdir -p "$STASH/$(dirname "$f")"
    cp "$DST/$f" "$STASH/$f"
  fi
done

rm -rf "$DST"
cp -r "$SRC" "$DST"

for f in "${DIVERGED[@]}"; do
  if [ -f "$STASH/$f" ]; then
    cp "$STASH/$f" "$DST/$f"
    echo "kept v1's own $f"
  fi
done
rm -rf "$STASH"

echo "synced $SRC -> $DST, ${#DIVERGED[@]} file(s) held back"
