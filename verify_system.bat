@echo off
echo ==========================================
echo System Verification
echo ==========================================

echo [1] Checking Node version...
node -v || echo Node not found!

echo [2] Checking NPM version...
npm -v || echo NPM not found!

echo [3] Checking MongoDB Connection...
echo const mongoose = require('mongoose'); > test_db.js
echo mongoose.connect('mongodb://localhost:27017/csc_insurance_tracker') >> test_db.js
echo   .then(() => { console.log('Mongo CONNECTED'); process.exit(0); }) >> test_db.js
echo   .catch(err => { console.error('Mongo FAILED:', err.message); process.exit(1); }); >> test_db.js

cd server
call node ../test_db.js
if %errorlevel% neq 0 (
    echo [ERROR] MongoDB is NOT reachable. Please start mongod.
) else (
    echo [SUCCESS] MongoDB is reachable.
)
del ..\test_db.js

echo.
echo ==========================================
echo If Node/NPM are missing, please install them.
echo If Mongo failed, please start MongoDB Service.
echo ==========================================
pause
