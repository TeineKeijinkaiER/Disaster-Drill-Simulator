@echo off
setlocal
cd /d "%~dp0"

set "PORT=8787"
set "APP_URL=http://127.0.0.1:%PORT%/"

if not exist "%~dp0dist\index.html" (
  echo Built app was not found. Please run pnpm run build, then run this launcher again.
  pause
  exit /b 1
)

where python >nul 2>nul
if errorlevel 1 (
  echo Python was not found. Please install Python, then run this launcher again.
  pause
  exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -Command "try { $response = Invoke-WebRequest -Uri '%APP_URL%' -UseBasicParsing -TimeoutSec 1; if ($response.StatusCode -lt 200 -or $response.StatusCode -ge 500) { exit 1 } } catch { exit 1 }" >nul 2>nul
if errorlevel 1 (
  start "Disaster Simulator Server" /min python -m http.server %PORT% --bind 127.0.0.1 --directory "%~dp0dist"
  timeout /t 2 /nobreak >nul
)

start "" "%APP_URL%"
