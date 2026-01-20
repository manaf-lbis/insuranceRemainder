@echo off
set "PATH=%PATH%;C:\Program Files\nodejs"

echo Installing server dependencies...
cd server
call npm install
if %errorlevel% neq 0 (
    echo Error: Failed to install server dependencies
    pause
    exit /b 1
)

echo.
echo Starting server...
call npm run dev
