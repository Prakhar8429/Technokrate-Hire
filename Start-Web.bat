@echo off
title Technokrate Hire - Web App Launcher
cd /d "%~dp0"

echo ======================================================================
echo   Technokrate Hire - Starting Web App...
echo ======================================================================

start "" "http://localhost:8081"
npx expo start --web --localhost

pause
