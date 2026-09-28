@echo off
cd /d "%~dp0"

cmake --build build-release --config Release >nul 2>&1

if errorlevel 1 exit /b 1

set "PATH=C:\Libraries\mysql-connector-c++-26.7.0-winx64\lib64;%PATH%"

start "" /min /b ".\build-release\backend\Release\SmartExpenseBackend.exe"

timeout /t 3 /nobreak >nul

start "" /min /b py -m http.server 5500 --directory "%~dp0frontend"

timeout /t 2 /nobreak >nul

start "" "http://127.0.0.1:5500/login.html"

exit