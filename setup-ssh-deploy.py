#!/usr/bin/env python3
"""
Setup SSH key for GitHub Actions deployment
Uses only built-in Python libraries (socket, ssl, etc.)
"""

import socket
import os
import sys
from pathlib import Path

# Server configuration
SERVER_HOST = "144.31.212.184"
SERVER_USER = "root"
SERVER_PASSWORD = "eh5gRDe4yCsK"
SERVER_PORT = 22

# SSH key path
SSH_DIR = Path.home() / ".ssh"
PRIVATE_KEY_PATH = SSH_DIR / "parrot_shop_deploy"
PUBLIC_KEY_PATH = SSH_DIR / "parrot_shop_deploy.pub"

def check_ssh_keys():
    """Check if SSH keys exist"""
    print("\n🔐 Checking SSH keys...")

    if not PRIVATE_KEY_PATH.exists() or not PUBLIC_KEY_PATH.exists():
        print(f"❌ SSH keys not found at:")
        print(f"   {PRIVATE_KEY_PATH}")
        print(f"   {PUBLIC_KEY_PATH}")
        print("\n❌ Please generate them first using:")
        print(f'ssh-keygen -t ed25519 -C "github-actions@parrot-shop" -f ~/.ssh/parrot_shop_deploy -N ""')
        return False

    print("✅ SSH keys found")
    return True

def read_public_key():
    """Read the public key"""
    with open(PUBLIC_KEY_PATH, 'r') as f:
        return f.read().strip()

def read_private_key():
    """Read the private key"""
    with open(PRIVATE_KEY_PATH, 'r') as f:
        return f.read()

def test_simple_connection():
    """Test basic socket connection to server"""
    print(f"\n🧪 Testing connection to {SERVER_HOST}:{SERVER_PORT}...")
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(5)
        result = sock.connect_ex((SERVER_HOST, SERVER_PORT))
        sock.close()

        if result == 0:
            print(f"✅ Server is reachable on port {SERVER_PORT}")
            return True
        else:
            print(f"❌ Cannot reach server on port {SERVER_PORT}")
            return False
    except Exception as e:
        print(f"❌ Connection test failed: {e}")
        return False

def main():
    print("=" * 50)
    print("🚀 GitHub Actions SSH Key Setup")
    print("=" * 50)

    # Check SSH keys
    if not check_ssh_keys():
        sys.exit(1)

    # Read public key
    public_key = read_public_key()
    print(f"\n📋 Public Key:")
    print("=" * 50)
    print(public_key)
    print("=" * 50)

    # Test connection
    if not test_simple_connection():
        print("\n⚠️  Server not reachable (maybe blocked by firewall)")
        print("Continue anyway? (y/n) ", end="")
        if input().lower() != 'y':
            sys.exit(1)

    # Try using paramiko if available
    try:
        print("\n📦 Trying to use paramiko for SSH setup...")
        import paramiko

        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

        print(f"Connecting to {SERVER_HOST} as {SERVER_USER}...")
        ssh.connect(SERVER_HOST, port=SERVER_PORT, username=SERVER_USER, password=SERVER_PASSWORD, timeout=10)
        print("✅ Connected to server")

        # Create .ssh directory
        print("Creating .ssh directory...")
        stdin, stdout, stderr = ssh.exec_command("mkdir -p ~/.ssh && chmod 700 ~/.ssh")
        stdout.channel.recv_exit_status()

        # Add public key
        print("Adding public key...")
        stdin, stdout, stderr = ssh.exec_command(f"echo '{public_key}' >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys")
        stdout.channel.recv_exit_status()

        # Verify
        print("Verifying key installation...")
        stdin, stdout, stderr = ssh.exec_command("grep 'github-actions' ~/.ssh/authorized_keys")
        output = stdout.read().decode()

        if "github-actions" in output:
            print("✅ Public key successfully installed on server!")
        else:
            print("⚠️  Public key may not be installed correctly")

        ssh.close()

    except ImportError:
        print("\n⚠️  paramiko not available")
        print("\nManual setup required. Run this on YOUR LOCAL MACHINE:")
        print("=" * 50)
        print(f"ssh-copy-id -i ~/.ssh/parrot_shop_deploy.pub {SERVER_USER}@{SERVER_HOST}")
        print("# Or manually:")
        print(f"ssh {SERVER_USER}@{SERVER_HOST}")
        print("mkdir -p ~/.ssh && chmod 700 ~/.ssh")
        print("cat >> ~/.ssh/authorized_keys  # paste public key, then Ctrl+D")
        print("chmod 600 ~/.ssh/authorized_keys")
        print("=" * 50)

    except Exception as e:
        print(f"\n❌ Failed to install key: {e}")
        print("\nTry manual setup:")
        print(f"ssh-copy-id -i {PUBLIC_KEY_PATH} {SERVER_USER}@{SERVER_HOST}")
        sys.exit(1)

    # Display private key for GitHub Secrets
    print("\n📋 Private Key (for GitHub Secrets):")
    print("=" * 50)
    private_key = read_private_key()
    print(private_key)
    print("=" * 50)

    print("\n✅ Setup complete!")
    print("\nNext steps:")
    print("1. Go to GitHub → Settings → Secrets and variables → Actions")
    print("2. Add these secrets:")
    print("   - SSH_PRIVATE_KEY: [paste private key above]")
    print("   - SERVER_HOST: 144.31.212.184")
    print("   - SERVER_USER: root")
    print("   - DEPLOY_PATH: /opt/parrot-shop")
    print("\n3. Push changes to main branch:")
    print("   git push origin main")
    print("\n4. Watch deployment in Actions tab")
    print("=" * 50)

if __name__ == "__main__":
    main()
