#!/usr/bin/env bash
cd "$(dirname "$0")"

echo "======================================================================"
echo "  Technokrate Hire - Web App Launcher"
echo "======================================================================"

# Free port 8081 if occupied by any stale process
PID_8081=$(lsof -ti :8081 2>/dev/null || fuser 8081/tcp 2>/dev/null | awk '{print $1}')
if [ -n "$PID_8081" ]; then
  echo "[*] Cleaning up previous process on port 8081 (PID: $PID_8081)..."
  kill -9 $PID_8081 2>/dev/null || true
  sleep 1
fi

# Automatically open browser in background once server starts
(
  sleep 3
  URL="http://localhost:8081"
  echo "[*] Opening browser: $URL"
  if command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$URL" >/dev/null 2>&1 &
  elif command -v open >/dev/null 2>&1; then
    open "$URL" >/dev/null 2>&1 &
  elif command -v sensible-browser >/dev/null 2>&1; then
    sensible-browser "$URL" >/dev/null 2>&1 &
  fi
) &

echo "  Metro Web Server starting on: http://localhost:8081"
echo "  Press 'r' to reload, 'c' to clear cache, Ctrl+C to stop."
echo "======================================================================"
npx expo start --web --localhost
