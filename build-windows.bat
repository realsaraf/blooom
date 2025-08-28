@echo off
echo Building Blooom for Windows Distribution...
call npm run build
if %errorlevel% neq 0 (
    echo Build failed!
    pause
    exit /b %errorlevel%
)

echo Creating Windows installer...
call npm run dist:win
echo.
echo Distribution complete! Check the 'release' folder for the installer.
pause
