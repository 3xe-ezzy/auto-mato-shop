# Simple File Upload Script
# Uploads files one by one so you can see progress

$server = "root@178.254.9.68"
$remotePath = "/var/www/auto-shop"

Write-Host "Starting file upload to server..." -ForegroundColor Cyan
Write-Host "Server: $server" -ForegroundColor Yellow
Write-Host "Remote path: $remotePath`n" -ForegroundColor Yellow

# Files to upload
$files = @(
    "package.json",
    "package-lock.json",
    "next.config.ts",
    "tsconfig.json",
    "postcss.config.mjs",
    "eslint.config.mjs",
    ".env"
)

# Folders to upload
$folders = @("src", "public", "prisma")

# Upload individual files
foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Uploading $file..." -ForegroundColor White
        scp $file "${server}:${remotePath}/"
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✓ Success" -ForegroundColor Green
        } else {
            Write-Host "  ✗ Failed" -ForegroundColor Red
        }
    } else {
        Write-Host "  ⚠ File not found: $file" -ForegroundColor Yellow
    }
}

# Upload folders
foreach ($folder in $folders) {
    if (Test-Path $folder) {
        Write-Host "Uploading folder $folder..." -ForegroundColor White
        scp -r $folder "${server}:${remotePath}/"
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✓ Success" -ForegroundColor Green
        } else {
            Write-Host "  ✗ Failed" -ForegroundColor Red
        }
    } else {
        Write-Host "  ⚠ Folder not found: $folder" -ForegroundColor Yellow
    }
}

Write-Host "`nUpload complete! Verifying..." -ForegroundColor Cyan
ssh $server "ls -lh $remotePath"

Write-Host "`nPress any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
