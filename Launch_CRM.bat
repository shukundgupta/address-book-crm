@echo off
setlocal
title Address Book CRM Launcher

echo ==========================================
echo    Address Book CRM - Professional
echo ==========================================
echo.

:: 1. Check/Start WAMP
echo [1/3] Verifying Database Services (WAMP)...
tasklist /FI "IMAGENAME eq wampmanager.exe" 2>NUL | find /I /N "wampmanager.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo --- WAMP is already running.
) else (
    echo --- Starting WAMP Server...
    start "" "C:\wamp64\wampmanager.exe"
    echo --- Please wait for WAMP icon to turn GREEN.
    timeout /t 5
)

:: 2. Ensure Frontend is built (Optional if already built, but good for first run)
if not exist "address-book-frontend\dist" (
    echo [2/3] First-time setup: Building Frontend...
    cd address-book-frontend && npm run build && cd ..
) else (
    echo [2/3] Frontend build found.
)

:: 3. Launch Desktop Application
echo [3/3] Launching Desktop App...
npm start

echo.
echo App closed.
pause
