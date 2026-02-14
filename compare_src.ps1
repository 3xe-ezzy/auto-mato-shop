param(
    [string]$RemoteUser,
    [string]$RemoteHost,
    [string]$LocalPath = ".\src",
    [string]$RemotePath = "/var/www/auto-shop/src"
)

# Check if SSH is available
if (-not (Get-Command ssh -ErrorAction SilentlyContinue)) {
    Write-Error "SSH client is not installed or not in PATH."
    exit 1
}

if (-not $RemoteHost) {
    $RemoteHost = Read-Host "Please enter the server IP or Hostname"
}
if (-not $RemoteUser) {
    if ($RemoteHost -match "@") {
        # Split user@host if provided textually
        $parts = $RemoteHost -split "@"
        $RemoteUser = $parts[0]
        $RemoteHost = $parts[1]
    } else {
        $RemoteUser = Read-Host "Please enter the username (e.g. root)"
    }
}

Write-Host "Comparing '$LocalPath' with '$RemoteUser@$RemoteHost`:$RemotePath'..." -ForegroundColor Cyan

# 1. Get Local Hashes
Write-Host "Computing local hashes..."
$localFiles = Get-ChildItem -Path $LocalPath -Recurse -File
$localHashes = @{}

foreach ($file in $localFiles) {
    $relativePath = $file.FullName.Substring((Resolve-Path $LocalPath).Path.Length + 1).Replace("\", "/")
    $hash = (Get-FileHash -Path $file.FullName -Algorithm SHA256).Hash.ToLower()
    $localHashes[$relativePath] = $hash
}

# 2. Get Remote Hashes
Write-Host "Retrieving remote hashes (requires SSH access)..."
$remoteCommand = "find $RemotePath -type f -exec sha256sum {} +"
try {
    # We use -o BatchMode=yes to fail fast if auth fails, but remove if password needed.
    # Actually, let's allow standard SSH behavior (password prompt if needed).
    $remoteOutput = ssh "$RemoteUser@$RemoteHost" $remoteCommand
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "SSH command failed. Please check connection/auth."
        exit 1
    }
} catch {
    Write-Error "Failed to execute SSH command: $_"
    exit 1
}

$remoteHashes = @{}
if ($remoteOutput) {
    foreach ($line in ($remoteOutput -split "`n")) {
        $line = $line.Trim()
        if ($line) {
            # Linux sha256sum output: hash  filename
            $parts = $line -split "\s+", 2
            if ($parts.Count -ge 2) {
                $hash = $parts[0]
                $fullRemotePath = $parts[1]
                
                # Normalize remote path to relative path
                # Assuming remote path structure follows requested path
                # We need to strip the prefix $RemotePath + "/"
                # Note: find output usually starts with the path provided.
                
                if ($fullRemotePath.StartsWith($RemotePath)) {
                   $relPath = $fullRemotePath.Substring($RemotePath.Length).TrimStart("/")
                   $remoteHashes[$relPath] = $hash
                } else {
                   # Fallback if find returns relative paths (unlikely with find /abs/path)
                   $remoteHashes[$fullRemotePath] = $hash
                }
            }
        }
    }
}

# 3. Compare
$allKeys = ($localHashes.Keys + $remoteHashes.Keys) | Select-Object -Unique | Sort-Object

$diffCount = 0
Write-Host "`nComparison Results:" -ForegroundColor Yellow

foreach ($file in $allKeys) {
    $l = $localHashes[$file]
    $r = $remoteHashes[$file]

    if (-not $l) {
        Write-Host "[MISSING LOCAL] $file" -ForegroundColor Red
        $diffCount++
    } elseif (-not $r) {
        Write-Host "[MISSING REMOTE] $file" -ForegroundColor Red
        $diffCount++
    } elseif ($l -ne $r) {
        Write-Host "[DIFFERENT]     $file" -ForegroundColor Red
        $diffCount++
    } else {
        # Write-Host "[OK]            $file" -ForegroundColor Green
    }
}

if ($diffCount -eq 0) {
    Write-Host "`nSUCCESS: Directories are identical!" -ForegroundColor Green
} else {
    Write-Host "`nFOUND $diffCount DIFFERENCES." -ForegroundColor Red
}
