@echo off
cd /d "%~dp0"

echo Cleaning previous build...
if exist dist (
    rd /s /q dist 2>nul
    if exist dist (
        timeout /t 2 /nobreak >nul
        rd /s /q dist 2>nul
    )
)

echo Building frontend...
call npx vite build
if errorlevel 1 (
    echo Build failed!
    pause
    exit /b 1
)

echo.
echo Starting Doku server...
start "" http://localhost:3001
timeout /t 1 /nobreak >nul

echo Doku is running at http://localhost:3001
echo Close this window to stop the server.
node server/index.js
