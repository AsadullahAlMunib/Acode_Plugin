#!/data/data/com.termux/files/usr/bin/bash
set -e
HTDOCS_DEFAULT="/storage/emulated/0/htdocs"
HTDOCS="${1:-$HTDOCS_DEFAULT}"

# Stop PHP server
if [ -f "$HTDOCS/.phpserver.pid" ]; then
  PID=$(cat "$HTDOCS/.phpserver.pid" 2>/dev/null || true)
  if [ -n "$PID" ]; then
    echo "[*] Killing PHP server PID $PID"
    kill "$PID" || true
  fi
  rm -f "$HTDOCS/.phpserver.pid"
else
  # Fallback: kill any php -S process on 127.0.0.1
  pkill -f "php -S 127.0.0.1" || true
fi

# Stop MariaDB
pkill -f mysqld || true

echo "[✓] Stopped."
