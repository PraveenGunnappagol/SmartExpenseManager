@echo off
cd /d "%~dp0"

cmake --build build-release --config Release

if errorlevel 1 (
    echo.
    echo Build failed.
    pause
    exit /b 1
)

set "PATH=C:\Libraries\mysql-connector-c++-26.7.0-winx64\lib64;%PATH%"

.\build-release\backend\Release\SmartExpenseBackend.exe