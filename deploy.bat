@echo off
echo ==============================================
echo   Teer.club Automated Deployment Script
echo ==============================================
echo.

:: Prompt for commit message
set /p commit_msg="Enter commit message (e.g., 'Fixed admin ticket page'): "

if "%commit_msg%"=="" (
    echo Error: Commit message cannot be empty.
    pause
    exit /b
)

echo.
echo [1/3] Adding changes to Git...
git add .

echo.
echo [2/3] Committing changes...
git commit -m "%commit_msg%"

echo.
echo [3/3] Pushing to GitHub...
git push origin main

echo.
if %errorlevel% equ 0 (
    echo ==============================================
    echo  SUCCESS! Code pushed to GitHub.
    echo  GitHub Actions will now deploy it to your server automatically.
    echo ==============================================
) else (
    echo ==============================================
    echo  ERROR! Failed to push code. Please check the output above.
    echo ==============================================
)

pause
