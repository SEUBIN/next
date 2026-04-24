# productList_20260424.csv (UTF-8) -> csv_data.js (Base64 in window.CSV_MASTER_B64)
$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$csvPath = Join-Path $root 'productList_20260424.csv'
$outPath = Join-Path $root 'csv_data.js'
if (-not (Test-Path $csvPath)) {
  Write-Error "File not found: $csvPath"
}
$bytes = [System.IO.File]::ReadAllBytes($csvPath)
$b64 = [Convert]::ToBase64String($bytes)
$js = "window.CSV_MASTER_B64 =`r`n'" + $b64 + "'`r`n;"
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($outPath, $js, $utf8NoBom)
Write-Host "Wrote" $outPath "bytes in CSV:" $bytes.Length "Base64 len:" $b64.Length
