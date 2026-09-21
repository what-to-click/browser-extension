#!/usr/bin/env bash
# Idempotent environment setup, run inside the sandbox before the agent.
set -euo pipefail

echo "[fleet] setting up what-to-click/browser-extension"

node --version
npm --version

# The repo's lint gate uses web-ext (see Makefile).
npm install --global web-ext@8

echo "[fleet] setup complete"
