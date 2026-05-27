#!/bin/bash
# ==============================================================================
# Teer.club - Build & Run Script for PM2 Services
# ==============================================================================

set -e

# Colored Console Output
GREEN='\x1b[32m'
BLUE='\x1b[34m'
RED='\x1b[31m'
RESET='\x1b[0m'

log_info() { echo -e "${BLUE}[INFO]${RESET} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${RESET} $1"; }
log_error() { echo -e "${RED}[ERROR]${RESET} $1"; }

# Check that we are in /var/www/teer.club
if [ ! -d "backend" ] || [ ! -d "frontend" ] || [ ! -d "admin-panel" ]; then
  log_error "This script must be run inside /var/www/teer.club where your code is present."
  exit 1
fi

# ─── 1. Build Backend ───
log_info "Building Express API Backend..."
cd backend
npm install
npx playwright install --with-deps chromium
npx prisma generate
npx prisma migrate deploy
npm run build
log_success "Backend build and database migrations complete."

# ─── 2. Build Frontend ───
log_info "Building Next.js Frontend..."
cd ../frontend
npm install
npm run build
log_success "Frontend compilation complete."

# ─── 3. Build Admin Panel ───
log_info "Building Next.js Admin Panel..."
cd ../admin-panel
npm install
npm run build
log_success "Admin Panel compilation complete."

# ─── 4. Run Services under PM2 ───
log_info "Starting PM2 processes..."
cd ..
pm2 delete all || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup
log_success "🎉 Teer.club is now LIVE and running under PM2 process managers!"
pm2 status
