@echo off
setlocal

:: 1. Login to get token
echo Logging in...
curl -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"username\": \"admin\", \"password\": \"password123\"}" > login_response.json

:: Extract token using simple string processing (since we can't reliably use jq on all windows envs)
:: This is a hacky way to extract the token from the JSON response in batch
set /p LOGIN_RESPONSE=<login_response.json
for /f "tokens=4 delims=:," %%a in ('type login_response.json ^| findstr "token"') do set TOKEN=%%~a
set TOKEN=%TOKEN: "=%
set TOKEN=%TOKEN:"=%
:: Trim spaces
set TOKEN=%TOKEN: =%

echo.
echo Token obtained: %TOKEN%

:: 2. Test Invalid Create (Expect 400)
echo.
echo Testing Invalid Create (Missing Fields)...
curl -X POST http://localhost:5000/api/insurances ^
  -H "Authorization: Bearer %TOKEN%" ^
  -H "Content-Type: application/json" ^
  -d "{}"
  
:: 3. Test Valid Create
echo.
echo.
echo Testing Valid Create...
curl -X POST http://localhost:5000/api/insurances ^
  -H "Authorization: Bearer %TOKEN%" ^
  -H "Content-Type: application/json" ^
  -d "{\"registrationNumber\": \"KA01AB1234\", \"customerName\": \"John Doe\", \"mobileNumber\": \"9876543210\", \"vehicleType\": \"Two Wheeler\", \"insuranceType\": \"Third Party\", \"policyStartDate\": \"2023-01-01\", \"policyExpiryDate\": \"2024-01-01\", \"remarks\": \"Test Entry\"}"

:: 4. Test Get All
echo.
echo.
echo Testing Get All...
curl -X GET http://localhost:5000/api/insurances ^
  -H "Authorization: Bearer %TOKEN%"

endlocal
