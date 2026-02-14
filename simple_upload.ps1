# Simple Upload & Restart Script
# This uploads the pre-built application without running prisma generate on the server

$server = "root@178.254.9.68"

Write-Host "Uploading pre-built application..." -ForegroundColor Cyan

# Upload only the essential files
scp -r .next $server:/var/www/auto-shop/
scp package.json $server:/var/www/auto-shop/
scp -r prisma $server:/var/www/auto-shop/

Write-Host "Restarting application..." -ForegroundColor Yellow
ssh $server "cd /var/www/auto-shop && pm2 restart auto-shop"

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nDeployment successful!" -ForegroundColor Green
    Write-Host "Test your site: https://mato-automobile.de" -ForegroundColor Cyan
} else {
    Write-Host "`nDeployment failed." -ForegroundColor Red
}
