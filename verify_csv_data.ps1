# Compare decoded Base64 in csv_data.js to productList_20260424.csv (byte-exact)
$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$jsPath = Join-Path $root 'csv_data.js'
$csvPath = Join-Path $root 'productList_20260424.csv'
if (-not (Test-Path $jsPath)) { Write-Error "Missing: $jsPath" }
if (-not (Test-Path $csvPath)) { Write-Error "Missing: $csvPath" }
$all = [System.IO.File]::ReadAllText($jsPath, (New-Object System.Text.UTF8Encoding $false))
if ($all -notmatch "CSV_MASTER_B64\s*=\s*'([^']*)'") {
  Write-Error "Could not parse single-quoted CSV_MASTER_B64 in csv_data.js"
}
$b64 = $Matches[1]
$dec = [System.Convert]::FromBase64String($b64)
$csvBytes = [System.IO.File]::ReadAllBytes($csvPath)
$ok = $dec.Length -eq $csvBytes.Length
$idx = 0
if ($ok) {
  for ($i = 0; $i -lt $dec.Length; $i++) {
    if ($dec[$i] -ne $csvBytes[$i]) { $ok = $false; $idx = $i; break }
  }
}
if ($ok) {
  Write-Host "OK: csv_data.js Base64 decodes to the same bytes as productList_20260424.csv" -ForegroundColor Green
  Write-Host "Size:" $dec.Length "bytes"
} else {
  Write-Host "MISMATCH: decoded length" $dec.Length "CSV length" $csvBytes.Length "first diff at" $idx -ForegroundColor Red
  Write-Host "Run .\regenerate_csv_data.ps1 in this folder, then re-check."
  exit 1
}
