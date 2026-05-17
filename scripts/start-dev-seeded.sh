#!/usr/bin/env bash

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BACKEND_DIR="$REPO_ROOT/claim-management-backend"
FRONTEND_DIR="$REPO_ROOT/claim-management-frontend"

backend_pid=""
frontend_pid=""

require_command() {
  local command_name="$1"

  if ! command -v "$command_name" >/dev/null 2>&1; then
    echo "Required command not found: $command_name"
    exit 1
  fi
}

require_supported_node() {
  local node_version
  node_version="$(node -p 'process.versions.node')"

  if ! node -e 'const [major, minor] = process.versions.node.split(".").map(Number); process.exit(((major === 20 && minor >= 19) || (major === 22 && minor >= 12) || major >= 24) ? 0 : 1)'; then
    echo "Unsupported Node.js version: $node_version"
    echo "This repository requires Node.js ^20.19.0 || ^22.12.0 || >=24.0.0."
    echo "Recommended local version: 22.22.0"
    echo "If you use nvm, run: nvm use"
    exit 1
  fi
}

install_dependencies_if_missing() {
  local app_dir="$1"
  local app_name="$2"

  if [[ -d "$app_dir/node_modules" ]]; then
    return
  fi

  echo "Dependencies missing for $app_name. Installing..."

  (
    cd "$app_dir"

    if [[ -f package-lock.json ]]; then
      npm ci
    else
      npm install
    fi
  )
}

cleanup() {
  if [[ -n "$backend_pid" ]] && kill -0 "$backend_pid" 2>/dev/null; then
    kill "$backend_pid" 2>/dev/null || true
  fi

  if [[ -n "$frontend_pid" ]] && kill -0 "$frontend_pid" 2>/dev/null; then
    kill "$frontend_pid" 2>/dev/null || true
  fi
}

trap cleanup EXIT INT TERM

require_command node
require_command npm
require_supported_node

install_dependencies_if_missing "$BACKEND_DIR" "claim-management-backend"
install_dependencies_if_missing "$FRONTEND_DIR" "claim-management-frontend"

echo "Starting backend in seeded development mode..."
(
  cd "$BACKEND_DIR"
  npm run dev:seed
) &
backend_pid="$!"

echo "Frontend startup note: Angular is launched with the local project CLI via:"
echo "  cd claim-management-frontend && npm start"
echo "If frontend boot fails, check Node.js compatibility and local dependency installation first."
echo "Starting frontend..."
(
  cd "$FRONTEND_DIR"
  npm start
) &
frontend_pid="$!"

echo "Backend PID: $backend_pid"
echo "Frontend PID: $frontend_pid"
echo "Frontend: http://localhost:4200"
echo "Backend API: http://localhost:3000/api"
echo "Swagger UI: http://localhost:3000/api/docs"

wait "$backend_pid" "$frontend_pid"
