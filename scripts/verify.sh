#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "==> Running verification suite"

if [[ -f package.json ]]; then
  echo "==> Detected Node.js project"

  has_script() {
    node -e "const pkg=require('./package.json'); process.exit(pkg.scripts && pkg.scripts['$1'] ? 0 : 1);"
  }

  run_script() {
    local script_name="$1"
    if has_script "$script_name"; then
      echo "==> npm run $script_name"
      npm run "$script_name"
    fi
  }

  run_script "format"
  run_script "fmt"

  if has_script "lint"; then
    echo "==> npm run lint"
    npm run lint
  elif [[ -x scripts/lint.sh ]]; then
    echo "==> scripts/lint.sh"
    bash scripts/lint.sh
  fi

  run_script "typecheck"

  if rg --files -g "*.test.js" -g "*.spec.js" tests 1>/dev/null 2>&1; then
    echo "==> node --test"
    node --test
  fi

  if has_script "test"; then
    echo "==> npm test"
    npm test
  fi

  run_script "build"

  if [[ -f scripts/smoke_test.js ]] && ! has_script "test"; then
    echo "==> node scripts/smoke_test.js"
    node scripts/smoke_test.js
  fi

  echo "==> Verification complete"
else
  echo "No supported stack detected."
  exit 1
fi
