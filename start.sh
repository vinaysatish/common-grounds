#!/usr/bin/env bash
# One command to run Common Grounds locally:
#   - Firebase Realtime Database emulator (with persistent data)
#   - Vite dev server
#
# Data is saved to ./.emulator-data and reloaded on the next start.
# Press Ctrl+C to stop; the latest data is exported automatically on exit.
set -euo pipefail
cd "$(dirname "$0")"

# The Firebase emulator needs Java (installed via Homebrew, keg-only).
export PATH="/opt/homebrew/opt/openjdk/bin:${PATH}"
export JAVA_HOME="/opt/homebrew/opt/openjdk"

DATA_DIR="./.emulator-data"
mkdir -p "$DATA_DIR"

# Only import if a previous export exists (avoids "invalid export" on first run).
IMPORT_ARGS=()
if [ -f "$DATA_DIR/firebase-export-metadata.json" ]; then
  IMPORT_ARGS=(--import="$DATA_DIR")
fi

# emulators:exec starts the emulator, runs the dev server, and on exit
# (Ctrl+C) shuts the emulator down — exporting data thanks to --export-on-exit.
exec npx firebase emulators:exec \
  --only database \
  --project common-grounds-local \
  ${IMPORT_ARGS[@]+"${IMPORT_ARGS[@]}"} \
  --export-on-exit="$DATA_DIR" \
  "npm run dev -- --host"
