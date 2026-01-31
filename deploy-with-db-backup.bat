@echo off
REM Deployment script with database backup
REM Server: 144.31.212.184
REM User: root
REM Password: eh5gRDe4yCsK

echo ========================================
echo 🚀 Deployment with DB backup
echo ========================================
echo.

echo 📦 Step 1: Building application...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed!
    exit /b %errorlevel%
)
echo ✅ Build complete
echo.

echo 💾 Step 2: Backing up database from server...
scp -o StrictHostKeyChecking=no root@144.31.212.184:/opt/parrot-shop/data/parrot_shop.db ./data/parrot_shop_server_backup.db 2>nul
if %errorlevel% equ 0 (
    echo ✅ Database backup downloaded
) else (
    echo ⚠️  No database found on server (first deploy?)
)
echo.

echo 📤 Step 3: Uploading files to server...
scp -o StrictHostKeyChecking=no -r dist package.json package-lock.json root@144.31.212.184:/opt/parrot-shop/
if %errorlevel% neq 0 (
    echo ❌ Upload failed!
    exit /b %errorlevel%
)
echo ✅ Files uploaded
echo.

echo 📦 Step 4: Installing dependencies on server...
ssh -o StrictHostKeyChecking=no root@144.31.212.184 "cd /opt/parrot-shop && npm ci --omit=dev"
if %errorlevel% neq 0 (
    echo ❌ Dependencies installation failed!
    exit /b %errorlevel%
)
echo ✅ Dependencies installed
echo.

echo 💾 Step 5: Restoring database on server...
scp -o StrictHostKeyChecking=no ./data/parrot_shop_server_backup.db root@144.31.212.184:/opt/parrot-shop/data/parrot_shop.db 2>nul
if %errorlevel% equ 0 (
    echo ✅ Database restored
) else (
    echo ⚠️  Using new database
)
echo.

echo 🔄 Step 6: Restarting application...
ssh -o StrictHostKeyChecking=no root@144.31.212.184 "systemctl restart parrot-shop && sleep 2 && systemctl status parrot-shop --no-pager"
if %errorlevel% neq 0 (
    echo ⚠️  Service restart may have issues
) else (
    echo ✅ Service restarted
)
echo.

echo ========================================
echo ✅ Deployment complete!
echo ========================================
echo.
echo 🔗 Access: http://144.31.212.184
echo 📊 Check logs: ssh root@144.31.212.184 "journalctl -u parrot-shop -f"
echo.
pause
