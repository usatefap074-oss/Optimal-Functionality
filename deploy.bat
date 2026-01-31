@echo off
REM Deployment script for Ubuntu 24.04 LTS (Windows)
REM Usage: deploy.bat <server_ip> <username> <password>

setlocal enabledelayedexpansion

set SERVER_IP=%1
set USERNAME=%2
set PASSWORD=%3

if "%SERVER_IP%"=="" (
    set SERVER_IP=144.31.212.184
)

if "%USERNAME%"=="" (
    set USERNAME=root
)

if "%PASSWORD%"=="" (
    echo Usage: deploy.bat [server_ip] [username] [password]
    echo Example: deploy.bat 144.31.212.184 root eh5gRDe4yCsK
    echo.
    echo Default values:
    echo   server_ip: 144.31.212.184
    echo   username: root
    echo.
    set /p PASSWORD="Enter password: "
)

echo.
echo ========================================
echo 🚀 Starting deployment to !SERVER_IP!
echo ========================================
echo.

echo 📦 Building application...
call npm run build
if errorlevel 1 (
    echo ❌ Build failed
    exit /b 1
)

echo.
echo 📤 Uploading files to server...
echo.

REM Check if sshpass is available (for Git Bash or similar)
where sshpass >nul 2>&1
if errorlevel 1 (
    echo ⚠️  sshpass not found. Using alternative method...
    echo.
    echo Please ensure you have one of the following installed:
    echo   - Git Bash (includes ssh)
    echo   - PuTTY with plink
    echo   - Windows 10+ built-in OpenSSH
    echo.
    echo For automated deployment, install sshpass via:
    echo   - Chocolatey: choco install sshpass
    echo   - Or use Git Bash with: pacman -S openssh sshpass
    echo.
    echo Alternatively, use the manual deployment steps below.
    exit /b 1
)

REM Create app directory on server
echo 📁 Creating application directory...
set SSHPASS=!PASSWORD!
sshpass -e ssh -o StrictHostKeyChecking=no !USERNAME!@!SERVER_IP! ^
    "mkdir -p /opt/parrot-shop && mkdir -p /opt/parrot-shop/data && echo ✅ Directory created"

if errorlevel 1 (
    echo ❌ Failed to create directory on server
    exit /b 1
)

REM Upload files
echo 📤 Uploading application files...
sshpass -e scp -o StrictHostKeyChecking=no -r ^
    dist package.json package-lock.json ^
    !USERNAME!@!SERVER_IP!:/opt/parrot-shop/

if errorlevel 1 (
    echo ❌ Failed to upload files
    exit /b 1
)

echo.
echo 🔧 Installing dependencies and configuring...
sshpass -e ssh -o StrictHostKeyChecking=no !USERNAME!@!SERVER_IP! ^
    "cd /opt/parrot-shop && npm ci --omit=dev && echo ✅ Dependencies installed"

if errorlevel 1 (
    echo ❌ Failed to install dependencies
    exit /b 1
)

echo.
echo 🐳 Setting up systemd service...
sshpass -e ssh -o StrictHostKeyChecking=no !USERNAME!@!SERVER_IP! ^
    "sudo systemctl daemon-reload && sudo systemctl enable parrot-shop && sudo systemctl restart parrot-shop && echo ✅ Service started"

if errorlevel 1 (
    echo ⚠️  Service setup may have issues, but deployment continues...
)

echo.
echo ========================================
echo ✅ Deployment completed!
echo ========================================
echo.
echo 📊 Application Status:
echo    Server: !SERVER_IP!
echo    Port: 80 (via Nginx)
echo    App Directory: /opt/parrot-shop
echo.
echo 🔗 Access your application at:
echo    http://!SERVER_IP!
echo.
echo 📋 Useful commands:
echo    SSH: ssh root@!SERVER_IP!
echo    View logs: ssh root@!SERVER_IP! "journalctl -u parrot-shop -f"
echo    Restart: ssh root@!SERVER_IP! "sudo systemctl restart parrot-shop"
echo.
pause
