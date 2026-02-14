# Deployment Script
# 1. Build Locally
Write-Host "Building application locally..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Local build failed! Stopping deployment." -ForegroundColor Red
    Pause
    Exit
}

# 2. Transfer Files
Write-Host "Starting file transfer to 178.254.9.68..." -ForegroundColor Cyan
# We transfer .next (build artifacts), public, and config files. 
# We excldue 'src' to save time since we are sending the build, but keeping it is fine too. 
# Impt: Send .next folder.
$files = "package.json", "package-lock.json", "next.config.ts", ".env", "public", "prisma", ".next"
$destination = "root@178.254.9.68:/var/www/auto-shop"

scp -r $files $destination

if ($LASTEXITCODE -eq 0) {
    Write-Host "Transfer successful!" -ForegroundColor Green

    # 3. Server-side commands
    Write-Host "Updating application on server..." -ForegroundColor Cyan
    # We use --omit=dev to save memory on install
    ssh root@178.254.9.68 "cd /var/www/auto-shop && npm install --omit=dev && npx prisma generate && (pm2 reload auto-shop || pm2 start npm --name 'auto-shop' -- start)"

    if ($LASTEXITCODE -eq 0) {
        Write-Host "Server update successful!" -ForegroundColor Green
    } else {
        Write-Host "Server update failed." -ForegroundColor Red
    }
} else {
    Write-Host "Transfer failed. Please check the error messages above." -ForegroundColor Red
}

Pause
