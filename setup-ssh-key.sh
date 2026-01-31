#!/bin/bash

# Setup SSH key for GitHub Actions deployment
# Run this script on YOUR LOCAL MACHINE, not on the server

set -e

SERVER="144.31.212.184"
USER="root"

echo "=========================================="
echo "🔐 Setup SSH key for GitHub Actions"
echo "=========================================="
echo ""

# SSH key details
PRIVATE_KEY="$HOME/.ssh/parrot_shop_deploy"
PUBLIC_KEY="$PRIVATE_KEY.pub"

# Check if keys already exist
if [ -f "$PRIVATE_KEY" ] && [ -f "$PUBLIC_KEY" ]; then
    echo "✅ SSH keys already exist:"
    echo "   Private: $PRIVATE_KEY"
    echo "   Public:  $PUBLIC_KEY"
    echo ""
else
    echo "❌ SSH keys not found"
    echo "Please generate them first:"
    echo "ssh-keygen -t ed25519 -C \"github-actions@parrot-shop\" -f ~/.ssh/parrot_shop_deploy -N \"\""
    exit 1
fi

# Display public key
echo "📋 Your public SSH key:"
echo "=========================================="
cat "$PUBLIC_KEY"
echo "=========================================="
echo ""

# Install key on server
echo "📤 Installing public key on server..."
echo "   Server: $SERVER"
echo "   User: $USER"
echo ""
echo "When prompted, enter the password: eh5gRDe4yCsK"
echo ""

# Use ssh-copy-id if available
if command -v ssh-copy-id &> /dev/null; then
    echo "Using ssh-copy-id..."
    ssh-copy-id -i "$PUBLIC_KEY" "$USER@$SERVER"
    INSTALL_SUCCESS=$?
else
    echo "Using manual installation..."
    # Manual installation
    ssh "$USER@$SERVER" << 'EOSSH'
mkdir -p ~/.ssh
chmod 700 ~/.ssh
cat >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
EOSSH
    INSTALL_SUCCESS=$?

    # If using manual method, paste the public key
    if [ $INSTALL_SUCCESS -ne 0 ]; then
        echo ""
        echo "Paste the public key above and press Ctrl+D when done"
        cat "$PUBLIC_KEY" | ssh "$USER@$SERVER" "cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
        INSTALL_SUCCESS=$?
    fi
fi

if [ $INSTALL_SUCCESS -eq 0 ]; then
    echo ""
    echo "✅ Public key installed successfully"
else
    echo ""
    echo "❌ Failed to install public key"
    exit 1
fi

# Test the connection
echo ""
echo "🧪 Testing SSH connection..."
if ssh -i "$PRIVATE_KEY" "$USER@$SERVER" "echo 'SSH connection works!'" 2>/dev/null; then
    echo "✅ SSH connection successful!"
else
    echo "⚠️  SSH connection test failed"
    echo "Try: ssh -i $PRIVATE_KEY $USER@$SERVER"
    exit 1
fi

echo ""
echo "=========================================="
echo "✅ SSH setup complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Copy the PRIVATE KEY to GitHub Secrets:"
echo "   cat $PRIVATE_KEY"
echo ""
echo "2. Add to GitHub Secrets (Settings → Secrets and variables → Actions):"
echo "   Name: SSH_PRIVATE_KEY"
echo "   Value: [paste the entire content of $PRIVATE_KEY]"
echo ""
echo "3. Make sure these secrets are also added:"
echo "   - SERVER_HOST: $SERVER"
echo "   - SERVER_USER: $USER"
echo "   - DEPLOY_PATH: /opt/parrot-shop"
echo ""
