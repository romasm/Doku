@echo off
title Doku Server
cd /d "%~dp0"

set DOCS_PATH=%~1
if "%DOCS_PATH%"=="" set DOCS_PATH=./docs

echo Cleaning previous build...
if exist dist (
    rd /s /q dist 2>nul
    if exist dist (
        timeout /t 2 /nobreak >nul
        rd /s /q dist 2>nul
    )
)

echo Building frontend...
cmd /c npx vite build
if errorlevel 1 (
    echo Build failed!
    pause
    exit /b 1
)

REM Kill any existing process on port 3001
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3001.*LISTENING"') do taskkill /f /pid %%a >nul 2>&1

echo.
echo Doku will be available at http://localhost:3001
echo Close this window to stop the server.
echo.

start "" http://localhost:3001

node server/index.js %DOCS_PATH%

echo.
echo Server stopped.
pause
