#!/bin/bash
# ==============================================================================
# Teer.club - Fully Automated VPS Droplet Provisioning & Deployment Script
# Operating System: Ubuntu 22.04 LTS / 24.04 LTS
# ==============================================================================

# Exit immediately if a command exits with a non-zero status
set -e

# Colored Console Output
RED='\x1b[31m'
GREEN='\x1b[32m'
YELLOW='\x1b[33m'
BLUE='\x1b[34m'
RESET='\x1b[0m'

log_info() { echo -e "${BLUE}[INFO]${RESET} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${RESET} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${RESET} $1"; }
log_error() { echo -e "${RED}[ERROR]${RESET} $1"; }

# ─── 1. Prerequisite Validation ───
if [ "$EUID" -ne 0 ]; then
  log_error "Please run this script as root (sudo)."
  exit 1
fi

log_info "Starting automated environment provisioning for Teer.club..."

# ─── 2. Define Variables (Pre-Configured Security Defaults) ───
DB_PASSWORD="ProdSecurePassword2026_XkL9"
ADMIN_KEY="teer-admin-prod-2026-X9k2mP"
GEMINI_KEY="AIzaSyCgbeb-VdLad2ITeEkwSIB4bz4l96-LZSQ" # Dev key fallback

# Domains
DOMAIN="teer.club"
SUB_ADMIN="admin.teer.club"
SUB_API="api.teer.club"

# ─── 3. System Update & Dependencies ───
log_info "Updating system packages..."
apt-get update -y && apt-get upgrade -y
apt-get install -y curl wget git build-essential fail2ban ufw nginx certbot python3-certbot-nginx net-tools

# ─── 4. Configure Secure Firewall ───
log_info "Configuring UFW Firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
log_success "Firewall active. Database ports locked from external access."

# ─── 5. Install Node.js (v20 LTS) & PM2 ───
log_info "Installing Node.js 20.x and PM2..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
npm install -g pm2
log_success "Node.js $(node -v) and PM2 $(pm2 -v) successfully installed."

# ─── 6. Install & Configure PostgreSQL 16 ───
log_info "Installing PostgreSQL 16..."
sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
apt-get update
apt-get install -y postgresql-16 postgresql-contrib-16
systemctl start postgresql
systemctl enable postgresql

# Create postgres user, database, and secure password
log_info "Initializing database..."
sudo -i -u postgres psql -c "ALTER USER postgres PASSWORD '${DB_PASSWORD}';"
sudo -i -u postgres psql -c "DROP DATABASE IF EXISTS teerclub;"
sudo -i -u postgres psql -c "CREATE DATABASE teerclub;"
log_success "PostgreSQL database initialized securely."

# ─── 7. Install & Configure Redis ───
log_info "Installing Redis Server..."
apt-get install -y redis-server
systemctl start redis-server
systemctl enable redis-server
# Secure Redis: Ensure bind is localhost only (standard default on Ubuntu)
sed -i 's/^bind.*/bind 127.0.0.1 ::1/' /etc/redis/redis.conf
systemctl restart redis-server
log_success "Redis initialized and locked to localhost."

# ─── 8. Setup Nginx Server Blocks ───
log_info "Generating Nginx reverse proxy configurations..."
NGINX_CONF="/etc/nginx/sites-available/teer.club"

cat <<EOF > $NGINX_CONF
# Upstreams
upstream frontend_server {
    server 127.0.0.1:3000;
    keepalive 32;
}

upstream admin_server {
    server 127.0.0.1:3001;
    keepalive 16;
}

upstream backend_api {
    server 127.0.0.1:5000;
    keepalive 32;
}

# 1. Frontend Server (teer.club & www.teer.club)
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};

    # Gzip Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    gzip_comp_level 5;

    location / {
        proxy_pass http://frontend_server;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded-for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}

# 2. Admin Panel (admin.teer.club)
server {
    listen 80;
    server_name ${SUB_ADMIN};

    location / {
        proxy_pass http://admin_server;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded-for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}

# 3. Backend API (api.teer.club)
server {
    listen 80;
    server_name ${SUB_API};
    client_max_body_size 15M;

    location / {
        proxy_pass http://backend_api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded-for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Keep-Alive for Server-Sent Events (SSE) and WebSockets
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
    }
}
EOF

# Enable configurations
rm -f /etc/nginx/sites-enabled/default
rm -f /etc/nginx/sites-enabled/teer.club
ln -s $NGINX_CONF /etc/nginx/sites-enabled/teer.club
nginx -t
systemctl restart nginx
log_success "Nginx proxy servers configured successfully."

# ─── 9. Prepare Workspace ───
log_info "Preparing app directory at /var/www/teer.club..."
mkdir -p /var/www/teer.club
cd /var/www/teer.club

# Clone the Git repo into the folder (Make sure repo is accessible or copy files)
# Note: Since files are local, the user will upload the files to this folder,
# or we clone. If git is not setup, we instruct them.
# For resiliency, we write a placeholder or wait for upload.
log_warn "Remember to copy your codebase files to /var/www/teer.club if not already there!"

# ─── 10. Generate Environment Files ───
log_info "Configuring production environment variables..."

# Create directories if not existing
mkdir -p backend frontend admin-panel

# Backend .env
cat <<EOF > backend/.env
PORT=5000
NODE_ENV=production
DATABASE_URL="postgresql://postgres:${DB_PASSWORD}@127.0.0.1:5432/teerclub?connection_limit=25&pool_timeout=15"
REDIS_HOST="127.0.0.1"
REDIS_PORT=6379
REDIS_PASSWORD=""
SCRAPER_CONCURRENCY=5
SCRAPER_TIMEOUT=30000
PLAYWRIGHT_TIMEOUT=15000
HEADLESS_BROWSER=true
GEMINI_API_KEY="${GEMINI_KEY}"
API_KEY="${ADMIN_KEY}"
ADMIN_API_KEY="${ADMIN_KEY}"
GOOGLE_CLIENT_EMAIL="teer-club-indexing@teer-club.iam.gserviceaccount.com"
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDaqr9/78W4tiFN\nN7SS43CbbJEYNJDv4UdAMaxYNjrynO1whvApzFyNAoOUIiqnCkmKlDF1JXd310yg\nHehlpqhIcXHfu5joW7EXuX5I2+jF472vRTJn2A/5LDzFsFqXWg9zU4hNA5UgzEW2\n59dj2S7ZZR6JsCf5lQTm71BC3vdDrUShLcL6KF+yOrSHcNrMB9SQ+s4rawoOtxW8\nftTyChoj3zJ/3+erzaV3xFhcbIPF1ifwkKXmi4iebsaC9wfdqPhnUwcZFwckosK8\nQaCEgUjMJtOl6qkp3w/aNdR7L2cf1yiStLv2kOFB3Oy48QnvpvW1RiYxPp9xqf5q\nOciiw8qhAgMBAAECggEAR2YPZ1/MKLbXgtYYkQnQn/9AFS480Qa29CAEDT2P294f\nrWlyC8PdyHE0s27AjJBQWP5wc7bLHodfTrzVQDO9qQHZ09r2X5Bo770ynemoRM1L\nB2rJvZyQAqVOJqKhwd+3QcnZrIPp8q6gaMukycaFhJh+8yhgtR7SXfFwPJV/GUpk\ncb/ZwtwS4zDwDFIvzbtIIhe2Qe2MnE7K+cEqtpTFCGNOh7mDOyKZ1uOIuimaHGNB\nSE5MC6aEme4JI/uxBjcUM6SiBGLMyF7Obx3PTzBO8/OXq4z32BH7z1OecdI/iw3C\nZtiytWxlya92OleHswyIB5iyWNsKTktKMHD2VAuHHQKBgQD5MCCGuHKFWkRLkPQQ\nsM883rryqMsIE5+L1UL0nJaE5D4a0GEb2U4qtWvLPgR2HanP1xTmFD2pl1j5T9mw\naXygQuJosZIXSJU7k5E82H/2vQ/mDuf7iHM4nEya203EG3lrP+wTmQ46OcuA2yUH\nA7g226rNdbD+hYOvWc4Q7CU8fwKBgQDgpQc2N/+MkV0ru3JFuQnLUysAX4PymQ+U\nbJ8hEc5Q/Brj/gVk95LodKP+4VesKDwRVKV18AOTraD+BWrTt2ewSlRLRaRKWNVs\nSmLpJSMLBLwh0cQVCi9SDVXdjPimSpYd1cR2w7XjYn6lbG/Pi3iDMznrT5Gog9wJ\nIXFLk//o3wKBgBOXzibpn8+ObmpGpnodfN37YVWtIfGroVLcXNxg55DhZWS0V75Z\n0sSW6Tfc03r6EB0Qe0sv8j1AcjWAKsytLqhnOegjdiowgdNiYfwXxc//w51CNMlZ\nTD36RCe08KNnyZ8+MnDECxNW8gJauMmZaEWf9gkbpOQOWXFTLVm1R6Q/AoGBALeb\nippxCIieoxVEXrDH/U5XCpWCe/kDyy0X3rQLtqKQe3YPP993TnZ6JzQCgELwm6/a\njGYppvLD/grA6MBkbfYzulPPdulhVAbvgYpnVQ4Db7UAmxBLQ8P/rEepme1oluuJ\ntcsQSRCxhyuzxmtO5k/txZAjd7zRET3RPKV2MLrnAoGBAOXjfeU0cGXAIApOtFZc\nFH/EZuIO6n2Gwa6JDC2ZFYLpJkuWv4dw193mYvci3JngBebxXUoQ8/5qcvrYxjoZ\nKiNBH1FN9TiknVIlRu3XcOCZAaSiqQsSAtiFNYecXBrBfddpSDKxsWoJWlqSoSrg\nPCRY1fW+C5DPMlMreYRmL7te\n-----END PRIVATE KEY-----\n"
EOF

# Frontend .env.local
cat <<EOF > frontend/.env.local
NEXT_PUBLIC_API_URL="https://${SUB_API}/api"
INTERNAL_API_URL="http://localhost:5000/api"
EOF

# Admin .env.local
cat <<EOF > admin-panel/.env.local
NEXT_PUBLIC_API_URL="https://${SUB_API}/api"
NEXT_PUBLIC_API_KEY="${ADMIN_KEY}"
INTERNAL_API_URL="http://localhost:5000/api"
EOF

log_success "All environment variable files configured."
log_info "VPS Server Setup is complete! Database, Redis, Firewalls, and Nginx are fully optimized."
log_info "Now copy the codebase files to /var/www/teer.club and run: ./build-and-run.sh"
