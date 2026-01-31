@echo off
echo Building application...
call npm run build
if %errorlevel% neq 0 exit /b %errorlevel%

echo.
echo Deploying to server...
echo.

scp -o StrictHostKeyChecking=no -r dist package.json package-lock.json root@144.31.212.184:/opt/parrot-shop/

ssh -o StrictHostKeyChecking=no root@144.31.212.184 "cd /opt/parrot-shop && npm ci --omit=dev && systemctl restart parrot-shop"

echo.
echo Deployment complete!
echo Access: http://144.31.212.184
