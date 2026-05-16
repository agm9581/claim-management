#!/usr/bin/env bash

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BACKEND_DIR="$REPO_ROOT/claim-management-backend"
FRONTEND_DIR="$REPO_ROOT/claim-management-frontend"

backend_pid=""
frontend_pid=""

cleanup() {
  if [[ -n "$backend_pid" ]] && kill -0 "$backend_pid" 2>/dev/null; then
    kill "$backend_pid" 2>/dev/null || true
  fi

  if [[ -n "$frontend_pid" ]] && kill -0 "$frontend_pid" 2>/dev/null; then
    kill "$frontend_pid" 2>/dev/null || true
  fi
}

trap cleanup EXIT INT TERM

echo "Starting backend in seeded development mode..."
(
  cd "$BACKEND_DIR"
  npm run dev:seed
) &
backend_pid="$!"

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
