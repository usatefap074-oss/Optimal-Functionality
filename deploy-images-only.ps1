param(
    [string]$ServerIP = "144.31.212.184",
    [string]$Username = "root",
    [string]$Password = "eh5gRDe4yCsK"
)

Write-Host "Uploading 210 images to server..." -ForegroundColor Yellow

# Create directory on server first
ssh "${Username}@${ServerIP}" "mkdir -p /opt/parrot-shop/client/public/images/products" 2>&1

# Upload all images at once using tar for speed
Write-Host "Compressing images for transfer..." -ForegroundColor Gray
tar -czf images.tar.gz -C client/public/images products

Write-Host "Uploading compressed archive..." -ForegroundColor Gray
scp images.tar.gz "${Username}@${ServerIP}:/tmp/" 2>&1

Write-Host "Extracting on server..." -ForegroundColor Gray
ssh "${Username}@${ServerIP}" "cd /opt/parrot-shop/client/public/images && tar -xzf /tmp/images.tar.gz && rm /tmp/images.tar.gz" 2>&1

# Clean up local archive
Remove-Item images.tar.gz -Force

Write-Host ""
Write-Host "Restarting application..." -ForegroundColor Yellow
ssh "${Username}@${ServerIP}" "systemctl restart parrot-shop" 2>&1

Write-Host ""
Write-Host "Done! Images uploaded successfully." -ForegroundColor Green
Write-Host "Check: http://$ServerIP/catalog" -ForegroundColor Cyan
