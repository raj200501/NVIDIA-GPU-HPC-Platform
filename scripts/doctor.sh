#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "==> Environment diagnostics"

if command -v node >/dev/null 2>&1; then
  echo "Node.js: $(node -v)"
else
  echo "Node.js is not installed. Install Node.js 18+ before running the demo."
fi

if command -v npm >/dev/null 2>&1; then
  echo "npm: $(npm -v)"
else
  echo "npm is not installed. Install npm to run scripts." 
fi

if command -v rg >/dev/null 2>&1; then
  echo "ripgrep: $(rg --version | head -n 1)"
else
  echo "ripgrep is not installed. Some scripts will fall back to find." 
fi

echo "Workspace: $ROOT_DIR"

echo "==> Doctor checks complete"
