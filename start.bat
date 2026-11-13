@echo off
echo ========================================================
echo  UniSphere: University Management ^& Academic ERP
echo  Starting Backend API ^& Frontend Dashboard...
echo ========================================================

start "UniSphere Backend API (Port 5000)" cmd /k "cd /d \"%~dp0server\" && npm start"
timeout /t 3 /nobreak > nul
start "UniSphere Frontend Portal (Port 3000)" cmd /k "cd /d \"%~dp0client\" && npm run dev"

echo.
echo Services launched!
echo - Frontend: http://localhost:3000
echo - Backend API: http://localhost:5000/api
echo ========================================================
