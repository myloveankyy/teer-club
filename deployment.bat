@echo off
color 0A
echo ===================================================
echo     TEER.CLUB AUTOMATIC DEPLOYMENT SCRIPT
echo ===================================================
echo.
echo Adding all changes to Git...
git add .

echo Committing changes...
git commit -m "Production Deployment Auto-Sync"

echo Pushing directly to Production Server...
git push origin main

echo.
echo ===================================================
echo DEPLOYMENT PUSHED SUCCESSFULLY! 
echo DigitalOcean is now building and deploying the live site.
echo Please allow 3-5 minutes for teer.club to fully update.
echo ===================================================
pause
