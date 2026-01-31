#!/bin/bash

# Deployment script for Ubuntu 24.04 LTS
# Usage: ./deploy.sh <server_ip> <username> <password>

set -e

SERVER_IP="${1:-144.31.212.184}"
USERNAME="${2:-root}"
PASSWORD="${3}"
APP_DIR="/opt/parrot-shop"
APP_PORT="5000"

if [ -z "$PASSWORD" ]; then
    echo "Usage: ./deploy.sh <server_ip> <username> <password>"
    echo "Example: ./deploy.sh 144.31.212.184 root eh5gRDe4yCsK"
    exit 1
fi

echo "🚀 Starting deployment to $SERVER_IP..."
echo "📦 Building application..."

# Build the application locally
npm run build

echo "📤 Uploading files to server..."

# Create SSH command with password using sshpass
export SSHPASS="$PASSWORD"

# Create app directory on server
sshpass -e ssh -o StrictHostKeyChecking=no "$USERNAME@$SERVER_IP" << 'EOF'
set -e
echo "📁 Creating application directory..."
mkdir -p /opt/parrot-shop
mkdir -p /opt/parrot-shop/data
cd /opt/parrot-shop
echo "✅ Directory created"
EOF

# Upload files
echo "📤 Uploading application files..."
sshpass -e scp -o StrictHostKeyChecking=no -r \
    dist/ \
    package.json \
    package-lock.json \
    "$USERNAME@$SERVER_IP:$APP_DIR/"

echo "🔧 Installing dependencies and configuring..."

# Install dependencies and setup on server
sshpass -e ssh -o StrictHostKeyChecking=no "$USERNAME@$SERVER_IP" << 'EOF'
set -e
cd /opt/parrot-shop

echo "📦 Installing Node.js dependencies..."
npm ci --omit=dev

echo "🔐 Creating .env file..."
cat > .env << 'ENVEOF'
NODE_ENV=production
PORT=5000
DATABASE_PATH=/opt/parrot-shop/data/parrot_shop.db
ENVEOF

echo "✅ Environment configured"
EOF

echo "🐳 Setting up systemd service..."

# Create systemd service file
sshpass -e ssh -o StrictHostKeyChecking=no "$USERNAME@$SERVER_IP" << 'EOF'
set -e

echo "📝 Creating systemd service..."
sudo tee /etc/systemd/system/parrot-shop.service > /dev/null << 'SERVICEEOF'
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
SERVICEEOF

echo "🔄 Reloading systemd daemon..."
sudo systemctl daemon-reload

echo "✅ Service created"
EOF

echo "🚀 Starting application..."

sshpass -e ssh -o StrictHostKeyChecking=no "$USERNAME@$SERVER_IP" << 'EOF'
set -e

echo "Starting parrot-shop service..."
sudo systemctl enable parrot-shop
sudo systemctl restart parrot-shop

echo "⏳ Waiting for application to start..."
sleep 3

echo "✅ Service started"
EOF

echo "🌐 Setting up Nginx reverse proxy..."

sshpass -e ssh -o StrictHostKeyChecking=no "$USERNAME@$SERVER_IP" << 'EOF'
set -e

# Install Nginx if not installed
if ! command -v nginx &> /dev/null; then
    echo "📦 Installing Nginx..."
    sudo apt-get update
    sudo apt-get install -y nginx
fi

echo "📝 Creating Nginx configuration..."
sudo tee /etc/nginx/sites-available/parrot-shop > /dev/null << 'NGINXEOF'
server {
    listen 80;
    server_name _;

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINXEOF

echo "🔗 Enabling Nginx site..."
sudo ln -sf /etc/nginx/sites-available/parrot-shop /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

echo "✅ Testing Nginx configuration..."
sudo nginx -t

echo "🔄 Restarting Nginx..."
sudo systemctl enable nginx
sudo systemctl restart nginx

echo "✅ Nginx configured"
EOF

echo ""
echo "✅ Deployment completed successfully!"
echo ""
echo "📊 Application Status:"
echo "   Server: $SERVER_IP"
echo "   Port: 80 (via Nginx)"
echo "   Internal Port: $APP_PORT"
echo "   App Directory: $APP_DIR"
echo "   Database: $APP_DIR/data/parrot_shop.db"
echo ""
echo "🔗 Access your application at:"
echo "   http://$SERVER_IP"
echo ""
echo "📋 Useful commands:"
echo "   SSH: ssh root@$SERVER_IP"
echo "   View logs: ssh root@$SERVER_IP 'journalctl -u parrot-shop -f'"
echo "   Restart app: ssh root@$SERVER_IP 'sudo systemctl restart parrot-shop'"
echo "   Stop app: ssh root@$SERVER_IP 'sudo systemctl stop parrot-shop'"
echo "   Check status: ssh root@$SERVER_IP 'sudo systemctl status parrot-shop'"
echo ""
