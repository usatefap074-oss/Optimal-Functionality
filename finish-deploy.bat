@echo off
echo Finishing deployment on server...
ssh -o StrictHostKeyChecking=no root@144.31.212.184 "cd /opt/parrot-shop && npm ci --omit=dev && systemctl restart parrot-shop && systemctl status parrot-shop"
echo.
echo Done! Check http://144.31.212.184
