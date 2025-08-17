#!/data/data/com.termux/files/usr/bin/bash
set -e

# ===== Config =====
HTDOCS_DEFAULT="/storage/emulated/0/htdocs"
HTDOCS="${1:-$HTDOCS_DEFAULT}"
PMA_VERSION="5.2.1"  # can be changed later

echo "[*] Using htdocs: $HTDOCS"

# Storage permission (only first time)
if [ ! -d "/storage/emulated" ]; then
  termux-setup-storage || true
fi

pkg update -y
pkg install -y php php-mysql mariadb wget unzip

# Prepare htdocs
mkdir -p "$HTDOCS"

# Initialize MariaDB (first time)
if [ ! -d "$PREFIX/var/lib/mysql/mysql" ]; then
  echo "[*] Initializing MariaDB data dir..."
  mysql_install_db
fi

# Start MariaDB to set root password (default empty -> set to 'root' here; change later)
echo "[*] Starting MariaDB temporarily..."
mysqld_safe --skip-grant-tables --nowatch &
sleep 3
mysql -u root <<'SQL'
FLUSH PRIVILEGES;
ALTER USER 'root'@'localhost' IDENTIFIED BY 'root';
FLUSH PRIVILEGES;
SQL
# Kill temp server
pkill -f mysqld || true
sleep 2

# Download phpMyAdmin
cd "$HTDOCS"
if [ ! -d "phpmyadmin" ]; then
  echo "[*] Downloading phpMyAdmin..."
  # Choose the English-only package (smaller) or full; here full for familiarity.
  wget -O pma.zip "https://files.phpmyadmin.net/phpMyAdmin/${PMA_VERSION}/phpMyAdmin-${PMA_VERSION}-all-languages.zip"
  unzip -q pma.zip
  rm -f pma.zip
  mv "phpMyAdmin-${PMA_VERSION}-all-languages" "phpmyadmin"
  # Create simple config (blowfish secret must be 32 chars)
  cat > phpmyadmin/config.inc.php <<'PHP'
<?php
$cfg['blowfish_secret'] = '0123456789abcdef0123456789abcdef';
$i = 0;
$i++;
$cfg['Servers'][$i]['auth_type'] = 'cookie';
$cfg['Servers'][$i]['host'] = '127.0.0.1';
$cfg['Servers'][$i]['compress'] = false;
$cfg['Servers'][$i]['AllowNoPassword'] = false;
PHP
fi

# Create a test index.php
if [ ! -f "$HTDOCS/index.php" ]; then
  cat > "$HTDOCS/index.php" <<'PHP'
<?php phpinfo();
PHP
fi

echo "[✓] Setup complete.
Next steps:
  1) Start MariaDB and PHP server: bash $(dirname "$0")/start.sh "$HTDOCS"
  2) Open http://127.0.0.1:8080/phpmyadmin/ (user: root, pass: root — CHANGE IT!)"
