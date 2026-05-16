#!/usr/bin/env bash

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FRONTEND_DIR="$REPO_ROOT/claim-management-frontend"
BACKEND_DIR="$REPO_ROOT/claim-management-backend"

echo "Running frontend tests..."
(
  cd "$FRONTEND_DIR"
  npm test
)

echo "Running backend tests..."
(
  cd "$BACKEND_DIR"
  npm test
)

echo "Pre-commit test check passed."
