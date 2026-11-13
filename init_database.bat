@echo off
echo ========================================================
echo  UniSphere: Re-initializing MySQL Database...
echo ========================================================

set MYSQL="C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
if not exist %MYSQL% (
    set MYSQL=mysql
)

cd /d "%~dp0database"

echo Executing DDL Schema (01_schema.sql)...
%MYSQL% -u root -padmin < 01_schema.sql
if %ERRORLEVEL% NEQ 0 (
    echo Error executing 01_schema.sql!
    pause
    exit /b %ERRORLEVEL%
)

echo Executing Views (02_views.sql)...
%MYSQL% -u root -padmin unisphere_db < 02_views.sql
if %ERRORLEVEL% NEQ 0 (
    echo Error executing 02_views.sql!
    pause
    exit /b %ERRORLEVEL%
)

echo Executing Triggers (03_triggers.sql)...
%MYSQL% -u root -padmin unisphere_db < 03_triggers.sql
if %ERRORLEVEL% NEQ 0 (
    echo Error executing 03_triggers.sql!
    pause
    exit /b %ERRORLEVEL%
)

echo Executing Stored Procedures (04_procedures.sql)...
%MYSQL% -u root -padmin unisphere_db < 04_procedures.sql
if %ERRORLEVEL% NEQ 0 (
    echo Error executing 04_procedures.sql!
    pause
    exit /b %ERRORLEVEL%
)

echo Inserting Seed Data (05_seed_data.sql)...
%MYSQL% -u root -padmin unisphere_db < 05_seed_data.sql
if %ERRORLEVEL% NEQ 0 (
    echo Error executing 05_seed_data.sql!
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ========================================================
echo  Database unisphere_db successfully initialized and seeded!
echo ========================================================
pause
