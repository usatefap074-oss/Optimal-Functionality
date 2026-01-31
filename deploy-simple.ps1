param(
    [string]$ServerIP = "144.31.212.184",
    [string]$Username = "root",
    [string]$Password = "eh5gRDe4yCsK"
)

Write-Host "1. Compressing images..." -ForegroundColor Yellow
npm run compress:images
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error during compression" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "2. Building application..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error during build" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "3. Uploading to server..." -ForegroundColor Yellow

Write-Host "   Uploading dist..." -ForegroundColor Gray
scp -r dist "${Username}@${ServerIP}:/opt/parrot-shop/" 2>&1

Write-Host "   Uploading package files..." -ForegroundColor Gray
scp package.json "${Username}@${ServerIP}:/opt/parrot-shop/" 2>&1
scp package-lock.json "${Username}@${ServerIP}:/opt/parrot-shop/" 2>&1

Write-Host "   Uploading images (210 files)..." -ForegroundColor Gray
scp -r client/public/images/products "${Username}@${ServerIP}:/opt/parrot-shop/client/public/images/" 2>&1

Write-Host ""
Write-Host "4. Restarting application on server..." -ForegroundColor Yellow
ssh "${Username}@${ServerIP}" "cd /opt/parrot-shop && systemctl restart parrot-shop" 2>&1

Write-Host ""
Write-Host "Deployment complete!" -ForegroundColor Green
Write-Host "Access at: http://$ServerIP" -ForegroundColor Cyan
Write-Host "Catalog: http://$ServerIP/catalog" -ForegroundColor Cyan
