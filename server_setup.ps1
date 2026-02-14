# Server Bootstrap & Security Script

$server = "root@178.254.9.68"

Write-Host "Bootstrapping fresh server..." -ForegroundColor Cyan

# 1. Remove old host key (just in case)
ssh-keygen -R 178.254.9.68

# 2. Define the Bootstrap Commands (Bash script)
$bootstrapCmds = @"
set -e

echo '--- 1. Updating System ---'
export DEBIAN_FRONTEND=noninteractive
apt-get update && apt-get upgrade -y

echo '--- 2. Installing Security (UFW & Fail2Ban) ---'
apt-get install -y ufw fail2ban
# Configure UFW
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow http
ufw allow https
ufw --force enable
# Configure Fail2Ban (default ssh protection)
systemctl enable fail2ban
systemctl start fail2ban

echo '--- 3. Installing Node.js 20 ---'
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

echo '--- 4. Installing Web Server & Tools ---'
apt-get install -y nginx certbot python3-certbot-nginx
npm install -g pm2 unzip

echo '--- 5. Preparing App Directory ---'
mkdir -p /var/www/auto-shop
chown -R root:root /var/www/auto-shop

echo '--- Bootstrap Complete! ---'
node -v
npm -v
nginx -v
"@

# 3. Execute with Line-Ending Fix
Write-Host "Connecting and running installation (this may take 2-3 minutes)..." -ForegroundColor Yellow

# Fix Windows CRLF to Linux LF for the specific command string
$cleanCmds = $bootstrapCmds -replace "`r", ""

ssh -o StrictHostKeyChecking=no $server $cleanCmds

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nServer is successfully secured and ready for deployment!" -ForegroundColor Green
} else {
    Write-Host "`nBootstrap failed. Check output." -ForegroundColor Red
}
