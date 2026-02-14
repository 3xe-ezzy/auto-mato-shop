# Webserver Configuration & SSL Script

$server = "root@178.254.9.68"
$domain = "mato-automobile.de"
$email = "info@mato-automobile.de"

Write-Host "Configuring Nginx and SSL for $domain..." -ForegroundColor Cyan

# 1. Upload Nginx Config
# We assume nginx.conf is in the current directory and valid
$nginxConfig = Get-Content .\nginx.conf -Raw
# Escape special characters for bash if needed, but scp is safer.
# Let's use SCP to a temp file then move it.

scp .\nginx.conf "$($server):/tmp/auto-shop.conf"

# 2. Apply Config & Run Certbot
$setupCmds = @"
set -e

echo '--- Setting up Nginx ---'
mv /tmp/auto-shop.conf /etc/nginx/sites-available/auto-shop
ln -sf /etc/nginx/sites-available/auto-shop /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Validate and Reload
nginx -t
systemctl reload nginx

echo '--- Requesting SSL Certificate ---'
# We use --nginx plugin which automatically edits the config to add HTTPS
certbot --nginx -d $domain -d www.$domain --non-interactive --agree-tos -m $email --redirect

echo '--- Webserver Setup Complete! ---'
"@

Write-Host "Executing setup on server..." -ForegroundColor Yellow

# Fix Windows CRLF to Linux LF for the remote command
$cleanCmds = $setupCmds -replace "`r", ""

ssh $server $cleanCmds

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nWebserver is fully configured with HTTPS!" -ForegroundColor Green
} else {
    Write-Host "`nSetup failed. Check output." -ForegroundColor Red
}
