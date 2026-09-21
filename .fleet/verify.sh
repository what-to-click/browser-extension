#!/usr/bin/env bash
# Code-quality gate, run inside the sandbox after each agent iteration.
# Exit 0 = pass. Anything non-zero feeds the failure back to the next iteration.
set -euo pipefail

echo "[fleet] verify: web-ext lint"
./node_modules/.bin/web-ext lint --source-dir src
