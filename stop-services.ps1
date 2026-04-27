# Quick Stop Script - Stops all services immediately
$ErrorActionPreference = "Continue"

$Ports = @(3000, 3001, 3002)

Write-Host "Stopping all services on ports: $($Ports -join ', ')..." -ForegroundColor Yellow

foreach ($port in $Ports) {
    $output = netstat -ano | Select-String ":$port\s+"
    foreach ($line in $output) {
        if ($line -match "LISTENING\s+(\d+)$") {
            $targetPid = [int]$Matches[1]
            try {
                $proc = Get-Process -Id $targetPid -ErrorAction SilentlyContinue
                if ($proc) {
                    Write-Host "  Stopping PID $targetPid on port $port..." -ForegroundColor Gray -NoNewline
                    Stop-Process -Id $targetPid -Force -ErrorAction SilentlyContinue
                    Write-Host " Done" -ForegroundColor Green
                }
            }
            catch {
                Write-Host "  Failed to stop PID $targetPid" -ForegroundColor Red
            }
        }
    }
}

Write-Host ""
Write-Host "All services stopped!" -ForegroundColor Green
