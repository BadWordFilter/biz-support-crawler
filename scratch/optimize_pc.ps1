Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "BizSupport PC Optimization Script Starting" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# 1. DNS Cache Cleanup
Write-Host "`n[1/3] Clearing DNS Cache..." -ForegroundColor Yellow
try {
    Clear-DnsClientCache -ErrorAction Stop
    Write-Host "✓ DNS Cache cleared successfully." -ForegroundColor Green
} catch {
    try {
        ipconfig /flushdns | Out-Null
        Write-Host "✓ DNS Cache cleared successfully via ipconfig." -ForegroundColor Green
    } catch {
        Write-Warning "Could not clear DNS Cache."
    }
}

# 2. User Temp Directory Cleanup
Write-Host "`n[2/3] Cleaning User Temp Folder ($env:TEMP)..." -ForegroundColor Yellow
$userTemp = $env:TEMP
if (Test-Path $userTemp) {
    $items = Get-ChildItem -Path $userTemp -Force -ErrorAction SilentlyContinue
    $successCount = 0
    $failCount = 0
    foreach ($item in $items) {
        try {
            Remove-Item -Path $item.FullName -Force -Recurse -ErrorAction Stop
            $successCount++
        } catch {
            $failCount++
        }
    }
    Write-Host "✓ Cleaned User Temp: Removed $successCount items (Skipped $failCount locked items)." -ForegroundColor Green
}

# 3. System Temp Directory Cleanup
Write-Host "`n[3/3] Cleaning System Temp Folder (C:\Windows\Temp)..." -ForegroundColor Yellow
$sysTemp = "C:\Windows\Temp"
if (Test-Path $sysTemp) {
    $items = Get-ChildItem -Path $sysTemp -Force -ErrorAction SilentlyContinue
    $successCount = 0
    $failCount = 0
    foreach ($item in $items) {
        try {
            Remove-Item -Path $item.FullName -Force -Recurse -ErrorAction Stop
            $successCount++
        } catch {
            $failCount++
        }
    }
    Write-Host "✓ Cleaned System Temp: Removed $successCount items (Skipped $failCount locked/unauthorized items)." -ForegroundColor Green
}

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host "PC Optimization Completed Successfully!" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
