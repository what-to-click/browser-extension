#!/usr/bin/env bash
# Idempotent environment setup, run inside the sandbox before the agent.
set -euo pipefail

echo "[fleet] setting up what-to-click/browser-extension"

node --version
npm --version

# The repo's lint gate uses web-ext (see Makefile). setup/agent/verify run in
# separate ephemeral containers, so install it into the workspace (git-ignored
# node_modules) rather than globally, or verify can't find it.
npm install --no-save --no-package-lock web-ext@8

echo "[fleet] setup complete"
