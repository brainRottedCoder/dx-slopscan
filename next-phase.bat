@echo off
echo =====================================
echo SLOP SCANNER PHASE IMPLEMENTATION
echo =====================================
echo.
powershell -ExecutionPolicy Bypass -File "%~dp0run-next-phase.ps1" %*
