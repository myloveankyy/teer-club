# Teer Club - Service Manager
# This script manages all services (backend, frontend, admin-panel)

param(
    [Parameter(Position=0)]
    [ValidateSet("start", "stop", "restart", "status")]
    [string]$Action = "start"
)

$ErrorActionPreference = "Continue"
$ProjectRoot = "C:\Users\91863\OneDrive\Desktop\my-projects\project-teer.club"
$Ports = @(3000, 3001, 3002)
$PidsFile = "$ProjectRoot\.service-pids.json"

function Write-Status {
    param([string]$Message, [string]$Type = "INFO")
    $colors = @{
        "INFO" = "Cyan"
        "SUCCESS" = "Green"
        "WARN" = "Yellow"
        "ERROR" = "Red"
    }
    $prefix = @{
        "INFO" = "[INFO]"
        "SUCCESS" = "[OK]"
        "WARN" = "[WARN]"
        "ERROR" = "[ERROR]"
    }
    Write-Host "$($prefix[$Type]) $Message" -ForegroundColor $colors[$Type]
}

function Get-ProcessOnPort {
    param([int]$Port)
    $results = @()
    $output = netstat -ano | Select-String ":$Port\s+"
    foreach ($line in $output) {
        if ($line -match "LISTENING\s+(\d+)$") {
            $results += [int]$Matches[1]
        }
    }
    return $results
}

function Stop-ServiceOnPort {
    param([int]$Port)
    $pids = Get-ProcessOnPort -Port $Port
    if ($pids) {
        foreach ($svcPid in $pids) {
            try {
                $process = Get-Process -Id $svcPid -ErrorAction SilentlyContinue
                if ($process) {
                    Write-Status "Stopping process $svcPid on port $Port ($($process.Path))..." -Type "WARN"
                    Stop-Process -Id $svcPid -Force -ErrorAction SilentlyContinue
                    Start-Sleep -Milliseconds 500
                }
            } catch {
                Write-Status "Failed to stop process $svcPid`: $_" -Type "ERROR"
            }
        }
        # Verify port is free
        Start-Sleep -Milliseconds 500
        $remaining = Get-ProcessOnPort -Port $Port
        if ($remaining) {
            Write-Status "Port $Port still in use by: $($remaining -join ', ')" -Type "WARN"
        } else {
            Write-Status "Port $Port is now free" -Type "SUCCESS"
        }
    } else {
        Write-Status "Port $Port is already free" -Type "INFO"
    }
}

function Stop-AllServices {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Magenta
    Write-Host " STOPPING ALL SERVICES" -ForegroundColor Magenta
    Write-Host "========================================" -ForegroundColor Magenta
    Write-Host ""
    
    foreach ($port in $Ports) {
        Stop-ServiceOnPort -Port $port
    }
    
    # Clean up PID file
    if (Test-Path $PidsFile) {
        Remove-Item $PidsFile -Force
        Write-Status "Removed PID file" -Type "INFO"
    }
    
    Write-Host ""
    Write-Status "All services stopped" -Type "SUCCESS"
}

function Get-ServiceStatus {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host " SERVICE STATUS" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    $services = @(
        @{Name="Admin Panel"; Port=3000; ExpectedPath="admin-panel"},
        @{Name="Backend API"; Port=3001; ExpectedPath="backend"},
        @{Name="Frontend"; Port=3002; ExpectedPath="frontend"}
    )
    
    foreach ($svc in $services) {
        $pids = Get-ProcessOnPort -Port $svc.Port
        if ($pids) {
            Write-Host "  $($svc.Name): " -NoNewline
            Write-Host "RUNNING" -ForegroundColor Green -NoNewline
            Write-Host " (Port $($svc.Port))"
            foreach ($svcPid in $pids) {
                $proc = Get-Process -Id $svcPid -ErrorAction SilentlyContinue
                if ($proc) {
                    Write-Host "    PID: $svcPid | Start: $($proc.StartTime)" -ForegroundColor Gray
                }
            }
        } else {
            Write-Host "  $($svc.Name): " -NoNewline
            Write-Host "STOPPED" -ForegroundColor Red -NoNewline
            Write-Host " (Port $($svc.Port))"
        }
    }
    
    Write-Host ""
}

function Start-AllServices {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Magenta
    Write-Host " STARTING ALL SERVICES" -ForegroundColor Magenta
    Write-Host "========================================" -ForegroundColor Magenta
    Write-Host ""
    
    # Stop any existing services first
    Stop-AllServices
    Start-Sleep -Seconds 1
    
    # Check if Docker is running
    Write-Status "Checking infrastructure (Docker & Database)..." -Type "INFO"
    docker ps > $null 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Status "Docker Desktop is not running! Backend will likely fail to connect." -Type "ERROR"
        Write-Status "Please start Docker Desktop and try again." -Type "WARN"
        # We continue anyway, but the user is warned
    }

    Write-Status "Starting services in separate windows..."
    Write-Host ""
    
    # Start Backend (port 3001)
    Write-Status "Starting Backend API on port 3001..." -Type "INFO"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ProjectRoot\backend'; Write-Host '[BACKEND] Starting...' -ForegroundColor Green; npm run dev" -WorkingDirectory "$ProjectRoot\backend" -WindowStyle Normal
    
    # Wait for backend to start
    Write-Status "Waiting for backend to initialize..." -Type "INFO"
    Start-Sleep -Seconds 5
    
    # Check if backend started
    $backendPids = Get-ProcessOnPort -Port 3001
    if ($backendPids) {
        Write-Status "Backend API started successfully (PID: $($backendPids[0]))" -Type "SUCCESS"
    } else {
        Write-Status "Backend API may have failed to start. Check the window." -Type "WARN"
    }
    
    # Start Frontend (port 3002)
    Write-Status "Starting Frontend on port 3002..." -Type "INFO"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ProjectRoot\frontend'; Write-Host '[FRONTEND] Starting...' -ForegroundColor Cyan; npm run dev" -WorkingDirectory "$ProjectRoot\frontend" -WindowStyle Normal
    
    # Wait for frontend to start
    Write-Status "Waiting for frontend to initialize..." -Type "INFO"
    Start-Sleep -Seconds 4
    
    # Check if frontend started
    $frontendPids = Get-ProcessOnPort -Port 3002
    if ($frontendPids) {
        Write-Status "Frontend started successfully (PID: $($frontendPids[0]))" -Type "SUCCESS"
    } else {
        Write-Status "Frontend may have failed to start. Check the window." -Type "WARN"
    }
    
    # Start Admin Panel (port 3000)
    Write-Status "Starting Admin Panel on port 3000..." -Type "INFO"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ProjectRoot\admin-panel'; Write-Host '[ADMIN] Starting...' -ForegroundColor Yellow; npm run dev" -WorkingDirectory "$ProjectRoot\admin-panel" -WindowStyle Normal
    
    # Wait for admin panel to start
    Start-Sleep -Seconds 3
    
    # Check if admin panel started
    $adminPids = Get-ProcessOnPort -Port 3000
    if ($adminPids) {
        Write-Status "Admin Panel started successfully (PID: $($adminPids[0]))" -Type "SUCCESS"
    } else {
        Write-Status "Admin Panel may have failed to start. Check the window." -Type "WARN"
    }
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Magenta
    Write-Host " ALL SERVICES STARTED" -ForegroundColor Magenta
    Write-Host "========================================" -ForegroundColor Magenta
    Write-Host ""
    Write-Host "  Admin Panel:  http://localhost:3000" -ForegroundColor Yellow
    Write-Host "  Backend API:  http://localhost:3001" -ForegroundColor Green
    Write-Host "  Frontend:     http://localhost:3002" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Press Ctrl+C in the terminal windows to stop individual services" -ForegroundColor Gray
    Write-Host "Or run: .\manage-services.ps1 stop" -ForegroundColor Gray
    Write-Host ""
}

# Main execution
switch ($Action) {
    "start" { Start-AllServices }
    "stop" { Stop-AllServices }
    "restart" { 
        Stop-AllServices
        Start-Sleep -Seconds 2
        Start-AllServices
    }
    "status" { Get-ServiceStatus }
}

# Always show status at the end
Get-ServiceStatus
