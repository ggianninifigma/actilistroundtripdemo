#!/usr/bin/env bash
# Convenience launcher for the ActiList demo.
# Uses the Node runtime bundled in ../.tooling (no system Node required).
set -euo pipefail
cd "$(dirname "$0")"
export PATH="$(cd .. && pwd)/.tooling/node-v22.14.0-darwin-arm64/bin:$PATH"
[ -d node_modules ] || npm install
npm run dev
