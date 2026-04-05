@echo off
cd /d "%~dp0"
call npx vitest run --reporter=verbose
echo.
echo Exit code: %ERRORLEVEL%
pause
