@echo off
title Technokrate Hire - Android Launcher
cd /d "%~dp0"
echo ======================================================================
echo   Starting Technokrate Hire on Android...
echo   Metro Dev Server will start and launch on your connected device/emulator.
echo   Press Ctrl+C to stop.
echo ======================================================================
echo.
npx expo start --android
pause
