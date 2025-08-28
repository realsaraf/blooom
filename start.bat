@echo off
echo Building Blooom Screen Recorder...
call npm run build
if %errorlevel% neq 0 (
    echo Build failed!
    pause
    exit /b %errorlevel%
)

echo Starting Blooom...
call npm start
