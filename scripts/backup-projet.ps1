# Sauvegarde du projet Méridien : une archive .zip datée (code, documents, migrations, historique git), hors fichiers générés.
# Usage : powershell -ExecutionPolicy Bypass -File scripts\backup-projet.ps1 [-Dest "D:\Sauvegardes"]
# Par défaut : <Documents>\Meridien App\Sauvegardes. Garde les 15 dernières archives.
param([string]$Dest = (Join-Path ([Environment]::GetFolderPath("MyDocuments")) "Meridien App\Sauvegardes"))
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
New-Item -ItemType Directory -Force $Dest | Out-Null
$stamp = Get-Date -Format "yyyy-MM-dd_HHmm"
$tmp = Join-Path $env:TEMP ("meridien-backup-" + $stamp)
$zip = Join-Path $Dest ("meridien-" + $stamp + ".zip")
# copie sans dist/ ni node_modules/ (régénérables) ni sorties de tests
robocopy $root $tmp /E /XD dist node_modules "tests\out" /XF *.log /NFL /NDL /NJH /NJS /NP | Out-Null
Compress-Archive -Path (Join-Path $tmp "*") -DestinationPath $zip -Force
Remove-Item $tmp -Recurse -Force
Get-ChildItem $Dest -Filter "meridien-*.zip" | Sort-Object LastWriteTime -Descending | Select-Object -Skip 15 | Remove-Item -Force
"Sauvegarde créée : $zip (" + [math]::Round((Get-Item $zip).Length / 1MB, 1) + " Mo)"
