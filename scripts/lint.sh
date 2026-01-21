#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "==> Linting JavaScript files with node --check"

if command -v rg >/dev/null 2>&1; then
  FILES=$(rg --files -g "*.js" -g "!node_modules/**" -g "!coverage/**" -g "!dist/**" || true)
else
  FILES=$(find . -type f -name "*.js" -not -path "./node_modules/*" -not -path "./coverage/*" -not -path "./dist/*")
fi

if [[ -z "$FILES" ]]; then
  echo "No JavaScript files found to lint."
  exit 0
fi

while IFS= read -r file; do
  if [[ -n "$file" ]]; then
    node --check "$file"
  fi
done <<< "$FILES"

echo "==> Lint complete"
