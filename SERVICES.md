# Teer Club - Service Management Scripts

This directory contains scripts to manage all three services (Backend, Frontend, Admin Panel) without port conflicts.

## Quick Start

### Start All Services
```powershell
.\manage-services.ps1 start
```

### Stop All Services
```powershell
.\manage-services.ps1 stop
```

Or use the quick stop script:
```powershell
.\stop-services.ps1
```

### Restart All Services
```powershell
.\manage-services.ps1 restart
```

### Check Service Status
```powershell
.\manage-services.ps1 status
```

## Services Overview

| Service | Port | URL |
|---------|------|-----|
| Admin Panel | 3000 | http://localhost:3000 |
| Backend API | 3001 | http://localhost:3001 |
| Frontend | 3002 | http://localhost:3002 |

## How It Works

1. **Before starting**: The script automatically stops any existing services on ports 3000, 3001, 3002
2. **Starting**: Each service opens in its own terminal window with colored output
3. **Monitoring**: You can run `.\manage-services.ps1 status` anytime to check if services are running
4. **Stopping**: Close individual terminal windows or use `.\stop-services.ps1`

## Troubleshooting

### Port Still In Use
If you get "Address already in use" errors:
```powershell
# Force kill all node processes (careful - this affects ALL node apps)
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# Then restart services
.\manage-services.ps1 start
```

### Services Won't Start
1. Check if the port is free: `netstat -ano | Select-String "300"`
2. Check the individual terminal windows for error messages
3. Ensure dependencies are installed: `npm install` in each directory

## Manual Commands (Alternative)

If you prefer to run services manually:

```powershell
# Terminal 1: Backend
cd backend
npm install  # if needed
npm run dev

# Terminal 2: Frontend  
cd frontend
npm install  # if needed
npm run dev -p 3002

# Terminal 3: Admin Panel
cd admin-panel
npm install  # if needed
npm run dev
```

## Environment Files

Make sure these environment files exist:

- `backend/.env` - Backend configuration
- `admin-panel/.env.local` - Admin panel API URL

See `.env.example` files for templates.
