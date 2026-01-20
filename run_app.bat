@echo off
echo ==========================================
echo Starting Insurance Remainder App Setup...
echo ==========================================

:: Server Setup
set "PATH=%PATH%;C:\Program Files\nodejs"
echo.
echo [1/4] Setting up Server...
cd server
if not exist node_modules (
    echo Installing server dependencies...
    call npm install
) else (
    echo Server dependencies already installed.
)

echo.
echo [2/4] Seeding Database...
:: .env is loaded by seeder.js internally via dotenv
call node seeder.js
if %errorlevel% neq 0 (
    echo Warning: Seeding failed. Check if MongoDB is running.
) else (
    echo Database seeded successfully!
)

echo.
echo [3/4] Starting Server...
start "Insurance Server" cmd /k "npm run dev"

:: Client Setup
cd ..\client
echo.
echo [4/4] Setting up Client...
if not exist node_modules (
    echo Installing client dependencies...
    call npm install
) else (
    echo Client dependencies already installed.
)

echo.
echo Starting Client...
start "Insurance Client" cmd /k "npm run dev"

echo.
echo ==========================================
echo Application Started!
echo Server: http://localhost:5000
echo Client: http://localhost:5173 (likely)
echo ==========================================
pause
