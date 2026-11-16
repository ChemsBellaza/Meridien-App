# Génère supabase/apply_all.sql : tout le schéma à jour en UN fichier (migrations dans l'ordre + réglages), pour reconstruire une base VIDE.
# Usage : powershell -ExecutionPolicy Bypass -File scripts\gen-apply-all.ps1   (après avoir relancé python scripts/gen-supabase-seed.py)
$root = Split-Path -Parent $PSScriptRoot
$mig = Get-ChildItem (Join-Path $root "supabase\migrations") -Filter *.sql | Sort-Object Name
$utf8 = New-Object Text.UTF8Encoding($false)
$sb = New-Object Text.StringBuilder
[void]$sb.AppendLine("-- =====================================================================================")
[void]$sb.AppendLine("-- Méridien : schéma COMPLET à jour (reconstruction d'une base VIDE). GÉNÉRÉ par scripts/gen-apply-all.ps1 : ne pas modifier à la main.")
[void]$sb.AppendLine("-- À coller dans Supabase > SQL Editor d'un projet NEUF, puis Run. NE JAMAIS le lancer sur une base qui contient déjà des données :")
[void]$sb.AppendLine("-- les tables existent déjà (erreur) et les réglages seraient remis à zéro.")
[void]$sb.AppendLine("-- Contenu, dans l'ordre : " + (($mig | ForEach-Object { $_.BaseName.Substring(0,8) }) -join ", ") + " (réglages et liste des jeux insérés juste après la première).")
[void]$sb.AppendLine("-- Après l'exécution : Authentication > Providers > activer « Anonymous sign-ins » ; régler les modèles d'e-mail (voir CLAUDE.md).")
[void]$sb.AppendLine("-- =====================================================================================")
[void]$sb.AppendLine("")
$first = $true
foreach ($m in $mig) {
  [void]$sb.AppendLine("-- ######## " + $m.Name + " ########")
  [void]$sb.AppendLine([IO.File]::ReadAllText($m.FullName, [Text.Encoding]::UTF8))
  if ($first) {
    [void]$sb.AppendLine("-- ######## réglages et liste des jeux (supabase/seed.sql) ########")
    [void]$sb.AppendLine([IO.File]::ReadAllText((Join-Path $root "supabase\seed.sql"), [Text.Encoding]::UTF8))
    $first = $false
  }
}
[IO.File]::WriteAllText((Join-Path $root "supabase\apply_all.sql"), $sb.ToString(), $utf8)
"supabase\apply_all.sql écrit : " + $mig.Count + " migrations, " + [math]::Round($sb.Length/1KB) + " Ko"