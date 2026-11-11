# Assemble src/ en dist\meridien.html — PowerShell uniquement (présent sur tout Windows, aucune installation, aucun droit administrateur).
# Usage (depuis le dossier du projet) :  powershell -ExecutionPolicy Bypass -File scripts\build.ps1
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$order = Get-Content -Raw -Encoding UTF8 (Join-Path $root "scripts\order.json") | ConvertFrom-Json
$srcDir = Join-Path $root "src"
$missing = @($order | Where-Object { -not (Test-Path (Join-Path $srcDir $_)) })
if ($missing.Count) { throw "Fichiers manquants : $($missing -join ', ')" }
$extra = @(Get-ChildItem $srcDir -Filter *.js | Where-Object { $order -notcontains $_.Name } | ForEach-Object Name)
if ($extra.Count) { throw "Fichiers .js non listés dans scripts/order.json : $($extra -join ', ')" }

$ms = New-Object System.IO.MemoryStream
function Add-Bytes([byte[]]$b) { $ms.Write($b, 0, $b.Length) }
Add-Bytes ([IO.File]::ReadAllBytes((Join-Path $srcDir "head.html")))
Add-Bytes ([Text.Encoding]::UTF8.GetBytes("<div id=`"app`" class=`"app`"></div>`n<script>`n"))
foreach ($f in $order) { Add-Bytes ([IO.File]::ReadAllBytes((Join-Path $srcDir $f))) }
Add-Bytes ([Text.Encoding]::UTF8.GetBytes("</script>`n"))

$distDir = Join-Path $root "dist"
New-Item -ItemType Directory -Force $distDir | Out-Null
$out = Join-Path $distDir "meridien.html"
[IO.File]::WriteAllBytes($out, $ms.ToArray())
"dist\meridien.html : {0} Ko ({1} fichiers)" -f [int]($ms.Length / 1024), $order.Count
