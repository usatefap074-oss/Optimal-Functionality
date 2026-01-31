# Deployment script for Ubuntu 24.04 LTS (Windows with built-in SSH)
# Usage: .\deploy-windows.ps1 -ServerIP "144.31.212.184" -Username "root" -Password "eh5gRDe4yCsK"

param(
    [string]$ServerIP = "144.31.212.184",
    [string]$Username = "root",
    [string]$Password = "eh5gRDe4yCsK"
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🚀 Starting deployment to $ServerIP" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Build the application
Write-Host "📦 Building application..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📤 Uploading files to server..." -ForegroundColor Yellow
Write-Host ""

# Create temporary script file for SSH commands
$tempScript = New-TemporaryFile -Suffix ".sh"

# Function to run SSH commands
function Invoke-SSHCommand {
    param(
        [string]$Command,
        [string]$Description = ""
    )
    
    if ($Description) {
        Write-Host $Description -ForegroundColor Yellow
    }
    
    # Create script with command
    $Command | Out-File -FilePath $tempScript -Encoding UTF8 -Force
    
    # Run via SSH
    $output = ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null `
        -o "PreferredAuthentications=password" `
        -o "PubkeyAuthentication=no" `
        "${Username}@${ServerIP}" `
        "bash -s" < $tempScript 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Command failed" -ForegroundColor Red
        Write-Host $output -ForegroundColor Red
        return $false
    }
    
    Write-Host $output
    return $true
}

# Create app directory
$createDirCmd = @"
set -e
mkdir -p /opt/parrot-shop
mkdir -p /opt/parrot-shop/data
echo '✅ Directory created'
"@

Invoke-SSHCommand -Command $createDirCmd -Description "📁 Creating application directory..."

# Upload files using SCP
Write-Host "📤 Uploading application files..." -ForegroundColor Yellow

$distPath = "dist"
$packagePath = "package.json"
$lockPath = "package-lock.json"

# Use SCP to upload
scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null `
    -o "PreferredAuthentications=password" `
    -o "PubkeyAuthentication=no" `
    -r $distPath "${Username}@${ServerIP}:/opt/parrot-shop/" 2>&1 | Out-Null

scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null `
    -o "PreferredAuthentications=password" `
    -o "PubkeyAuthentication=no" `
    $packagePath "${Username}@${ServerIP}:/opt/parrot-shop/" 2>&1 | Out-Null

scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null `
    -o "PreferredAuthentications=password" `
    -o "PubkeyAuthentication=no" `
    $lockPath "${Username}@${ServerIP}:/opt/parrot-shop/" 2>&1 | Out-Null

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to upload files" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Files uploaded" -ForegroundColor Green

# Install dependencies
Write-Host ""
Write-Host "🔧 Installing dependencies..." -ForegroundColor Yellow

$installCmd = @"
set -e
cd /opt/parrot-shop
npm ci --omit=dev
echo '✅ Dependencies installed'
"@

Invoke-SSHCommand -Command $installCmd

# Create .env file
Write-Host "🔐 Creating .env file..." -ForegroundColor Yellow

$envCmd = @"
cat > /opt/parrot-shop/.env << 'EOF'
NODE_ENV=production
PORT=5000
DATABASE_PATH=/opt/parrot-shop/data/parrot_shop.db
EOF
echo '✅ Environment configured'
"@

Invoke-SSHCommand -Command $envCmd

# Create systemd service
Write-Host "🐳 Setting up systemd service..." -ForegroundColor Yellow

$serviceCmd = @"
sudo tee /etc/systemd/system/parrot-shop.service > /dev/null << 'EOF'
[Unit]
Description=Parrot Shop E-commerce Application
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/parrot-shop
ExecStart=/usr/bin/node /opt/parrot-shop/dist/index.cjs
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
Environment="NODE_ENV=production"
Environment="PORT=5000"
Environment="DATABASE_PATH=/opt/parrot-shop/data/parrot_shop.db"

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable parrot-shop
sudo systemctl restart parrot-shop
sleep 3
echo '✅ Service started'
"@

Invoke-SSHCommand -Command $serviceCmd

# Setup Nginx
Write-Host "🌐 Setting up Nginx reverse proxy..." -ForegroundColor Yellow

$nginxCmd = @"
if ! command -v nginx &> /dev/null; then
    sudo apt-get update
    sudo apt-get install -y nginx
fi

sudo tee /etc/nginx/sites-available/parrot-shop > /dev/null << 'EOF'
server {
    listen 80;
    server_name _;

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/parrot-shop /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl enable nginx
sudo systemctl restart nginx
echo '✅ Nginx configured'
"@

Invoke-SSHCommand -Command $nginxCmd

# Cleanup
Remove-Item $tempScript -Force

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Application Status:" -ForegroundColor Cyan
Write-Host "   Server: $ServerIP" -ForegroundColor White
Write-Host "   Port: 80 (via Nginx)" -ForegroundColor White
Write-Host "   Internal Port: 5000" -ForegroundColor White
Write-Host "   App Directory: /opt/parrot-shop" -ForegroundColor White
Write-Host "   Database: /opt/parrot-shop/data/parrot_shop.db" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Access your application at:" -ForegroundColor Cyan
Write-Host "   http://$ServerIP" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Useful commands:" -ForegroundColor Cyan
Write-Host "   SSH: ssh root@$ServerIP" -ForegroundColor White
Write-Host "   View logs: ssh root@$ServerIP 'journalctl -u parrot-shop -f'" -ForegroundColor White
Write-Host "   Restart app: ssh root@$ServerIP 'sudo systemctl restart parrot-shop'" -ForegroundColor White
Write-Host "   Stop app: ssh root@$ServerIP 'sudo systemctl stop parrot-shop'" -ForegroundColor White
Write-Host "   Check status: ssh root@$ServerIP 'sudo systemctl status parrot-shop'" -ForegroundColor White
Write-Host ""
