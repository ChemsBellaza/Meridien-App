@echo off
rem Double-clic pour construire dist\meridien.html (aucune installation requise).
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\build.ps1"
pause
