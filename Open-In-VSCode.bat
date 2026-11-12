@echo off
title Technokrate Hire - Open In VS Code
cd /d "%~dp0"
echo Opening Technokrate Hire project in VS Code...
code .
echo Done!
timeout /t 2 >nul
exit
