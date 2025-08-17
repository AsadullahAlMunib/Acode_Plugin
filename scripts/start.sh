#!/data/data/com.termux/files/usr/bin/bash
set -e
HTDOCS_DEFAULT="/storage/emulated/0/htdocs"
HTDOCS="${1:-$HTDOCS_DEFAULT}"
PORT="${2:-8080}"

echo "[*] htdocs=$HTDOCS, port=$PORT"

# Start MariaDB
if ! pgrep -f mysqld >/dev/null 2>&1; then
  echo "[*] Starting MariaDB..."
  mysqld_safe --nowatch &
  sleep 3
fi

# Start PHP built-in server
if ! pgrep -f "php -S 127.0.0.1:$PORT" >/dev/null 2>&1; then
  echo "[*] Starting PHP server on 127.0.0.1:$PORT ..."
  # Route all requests through PHP if index.php exists; else serve static.
  cd "$HTDOCS"
  nohup php -S 127.0.0.1:$PORT -t "$HTDOCS" >/dev/null 2>&1 &
  echo $! > "$HTDOCS/.phpserver.pid"
fi

echo "[✓] Running. Open: http://127.0.0.1:$PORT/  (phpMyAdmin at /phpmyadmin/)"
