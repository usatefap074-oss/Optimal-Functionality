# 🚀 Deploy Setup Instructions

⚠️ **RUN THESE COMMANDS ON YOUR LOCAL MACHINE, NOT ON THE SERVER**

## SSH Private Key

```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACDPwxE1kOeMvERedwBVMjCRm8N1vemxScQdv6qwiprBsgAAAKBt9d5zbfXe
cwAAAAtzc2gtZWQyNTUxOQAAACDPwxE1kOeMvERedwBVMjCRm8N1vemxScQdv6qwiprBsg
AAAEBhByuLWSzGIxx2oYOdK9S3dCqO4Z3Q6B9eXp97+o6+OM/DETWQ54y8RF53AFUyMJGb
w3W96bFJxB2/qrCKmsGyAAAAGmdpdGh1Yi1hY3Rpb25zQHBhcnJvdC1zaG9wAQID
-----END OPENSSH PRIVATE KEY-----
```

## Step 1: Copy SSH Key Files

```bash
# On YOUR LOCAL MACHINE, copy these into ~/.ssh/

mkdir -p ~/.ssh

# Option A: Copy the key above to file
cat > ~/.ssh/parrot_shop_deploy << 'EOF'
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACDPwxE1kOeMvERedwBVMjCRm8N1vemxScQdv6qwiprBsgAAAKBt9d5zbfXe
cwAAAAtzc2gtZWQyNTUxOQAAACDPwxE1kOeMvERedwBVMjCRm8N1vemxScQdv6qwiprBsg
AAAEBhByuLWSzGIxx2oYOdK9S3dCqO4Z3Q6B9eXp97+o6+OM/DETWQ54y8RF53AFUyMJGb
w3W96bFJxB2/qrCKmsGyAAAAGmdpdGh1Yi1hY3Rpb25zQHBhcnJvdC1zaG9wAQID
-----END OPENSSH PRIVATE KEY-----
EOF

chmod 600 ~/.ssh/parrot_shop_deploy
```

## Step 2: Install SSH Key on Server

```bash
# Copy public key to server
ssh-copy-id -i ~/.ssh/parrot_shop_deploy.pub root@144.31.212.184

# When prompted, enter password: eh5gRDe4yCsK
```

## Step 3: Test SSH Connection

```bash
# Should work WITHOUT password prompt
ssh -i ~/.ssh/parrot_shop_deploy root@144.31.212.184 "echo 'SSH works!'"
```

## Step 4: Add GitHub Secrets

Go to: https://github.com/YOUR_USERNAME/Optimal-Functionality

1. Click **Settings**
2. Click **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add these 4 secrets:

### Secret 1: SSH_PRIVATE_KEY
```
Name: SSH_PRIVATE_KEY
Value: [paste entire content of ~/.ssh/parrot_shop_deploy including BEGIN/END lines]
```

### Secret 2: SERVER_HOST
```
Name: SERVER_HOST
Value: 144.31.212.184
```

### Secret 3: SERVER_USER
```
Name: SERVER_USER
Value: root
```

### Secret 4: DEPLOY_PATH
```
Name: DEPLOY_PATH
Value: /opt/parrot-shop
```

## Step 5: Deploy!

```bash
# From your project directory
git push origin main

# Watch deployment:
# GitHub → Actions → Deploy to VPS → select latest run
```

## Verify Deployment

```bash
# Check API
curl http://144.31.212.184/api/products

# Check health
curl http://144.31.212.184/health
```

---

## Troubleshooting

### SSH Connection Fails
```bash
# Make sure key file exists and has correct permissions
ls -la ~/.ssh/parrot_shop_deploy
# Should show: -rw------- (600)

# Try connecting with verbose output
ssh -i ~/.ssh/parrot_shop_deploy -vvv root@144.31.212.184
```

### GitHub Actions Fails
- Go to GitHub Actions tab
- Click on the failed run
- Check the logs of each step
- Common issues:
  - SSH_PRIVATE_KEY secret not correctly copied (must include BEGIN/END lines)
  - SERVER_HOST secret has extra spaces
  - Public key not on server

### Service Fails to Start
```bash
# Check server logs
ssh -i ~/.ssh/parrot_shop_deploy root@144.31.212.184
journalctl -u parrot-shop -n 50
```

---

## Quick Commands Reference

```bash
# Show private key (for GitHub)
cat ~/.ssh/parrot_shop_deploy

# Show public key
cat ~/.ssh/parrot_shop_deploy.pub

# Test SSH
ssh -i ~/.ssh/parrot_shop_deploy root@144.31.212.184

# Check deployment logs
ssh -i ~/.ssh/parrot_shop_deploy root@144.31.212.184 "journalctl -u parrot-shop -f"

# Check if app is running
curl http://144.31.212.184/health
```
