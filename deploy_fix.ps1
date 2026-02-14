
param(
    [string]$RemoteHost
)

# 1. Configuration
$LocalFile = "src\app\api\contact\route.ts"
$RemotePath = "/var/www/auto-shop/src/app/api/contact/route.ts"
$AppDir = "/var/www/auto-shop"

# 2. Get Remote Host if missing
if (-not $RemoteHost) {
    $RemoteHost = Read-Host "Bitte geben Sie User@Host ein (z.B. root@123.456.78.90)"
}

# 3. Upload File
Write-Host "Lade Datei hoch..." -ForegroundColor Cyan
scp $LocalFile "${RemoteHost}:${RemotePath}"

if ($LASTEXITCODE -ne 0) {
    Write-Error "Fehler beim Hochladen der Datei!"
    exit 1
}

# 4. Rebuild and Restart on Server
Write-Host "Führe Build und Restart auf dem Server aus..." -ForegroundColor Cyan
$commands = "cd $AppDir && npm run build && pm2 restart auto-shop"
ssh $RemoteHost $commands

if ($LASTEXITCODE -eq 0) {
    Write-Host "Deployment erfolgreich abgeschlossen!" -ForegroundColor Green
    Write-Host "Bitte testen Sie nun das Kontaktformular." -ForegroundColor Yellow
} else {
    Write-Error "Fehler beim Build/Restart auf dem Server."
}
