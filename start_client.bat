@echo off
set "PATH=%PATH%;C:\Program Files\nodejs"

echo Starting client...
cd client
call npm run dev
