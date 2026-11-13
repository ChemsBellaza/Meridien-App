$ErrorActionPreference = "Stop"
# Test de bout en bout du multijoueur (lot 3) : 3 joueurs anonymes, groupe, essais, scores, triches, chat, nettoyage.
# Utilise uniquement l'URL du projet et la clé PUBLIQUE (publishable/anon). Ne jamais y mettre la clé service_role.
# À lancer sur un projet DE TEST :
#   $env:MERIDIEN_SUPABASE_URL = "https://<ref>.supabase.co"; $env:MERIDIEN_SUPABASE_KEY = "sb_publishable_..."
#   powershell -ExecutionPolicy Bypass -File supabase\tests\e2e.ps1
# Durée : environ 40 s (attente de 22 s : durée minimale d'un essai). Les comptes de test sont supprimés à la fin.
$base = $env:MERIDIEN_SUPABASE_URL; $key = $env:MERIDIEN_SUPABASE_KEY
if (-not $base -or -not $key) { Write-Host "Définir MERIDIEN_SUPABASE_URL et MERIDIEN_SUPABASE_KEY (voir l'en-tête du fichier)."; exit 2 }
$fails = @(); $users = @{}
function Call($tok, $method, $path, $body, $extra) {
  $h = @{ apikey = $key; "Content-Type" = "application/json; charset=utf-8" }; if ($tok) { $h.Authorization = "Bearer $tok" }; if ($extra) { $extra.GetEnumerator() | ForEach-Object { $h[$_.Key] = $_.Value } }
  try { if ($body -ne $null) { return Invoke-RestMethod -Uri "$base$path" -Method $method -Headers $h -Body ([Text.Encoding]::UTF8.GetBytes(($body | ConvertTo-Json -Depth 8 -Compress))) -TimeoutSec 40 } else { return Invoke-RestMethod -Uri "$base$path" -Method $method -Headers $h -TimeoutSec 40 } }
  catch { $resp = $_.Exception.Response; $b = ""; if ($resp) { try { $b = (New-Object IO.StreamReader($resp.GetResponseStream())).ReadToEnd() } catch {} }; return [pscustomobject]@{ __http_error = $(if ($resp) { [int]$resp.StatusCode } else { 0 }); body = $b } }
}
function Check($name, $cond, $detail) { if ($cond) { "OK    $name" } else { "ECHEC $name :: $detail"; $script:fails += $name } }
function N($r) { if ($null -eq $r -or "$r" -eq "") { return 0 } elseif (($r -isnot [array]) -and $r.__http_error) { return "ERR" + $r.__http_error } else { return @($r).Count } }
function Cnt($tok, $path) { $r = Call $tok "Get" $path $null $null; if ($null -eq $r -or "$r" -eq "") { return 0 } elseif (($r -isnot [array]) -and $r.__http_error) { return "ERR" + $r.__http_error } else { return @($r).Count } }
function Rpc($tok, $fn, $args2) { Call $tok "Post" "/rest/v1/rpc/$fn" $(if ($args2) { $args2 } else { @{} }) $null }
function Signup($name) { $s = Call $null "Post" "/auth/v1/signup" @{} $null; $users[$name] = @{ tok = $s.access_token; id = $s.user.id }; $p = Call $s.access_token "Post" "/rest/v1/profiles" @{ id = $s.user.id; pseudo = $name } @{ Prefer = "return=minimal" }; Check "profil $name créé" (-not $p.__http_error) ($p.body) }

"--- Session : trois joueurs anonymes ---"
Signup "Alice"; Signup "Bob"; Signup "Carol"
$A = $users.Alice.tok; $B = $users.Bob.tok; $C = $users.Carol.tok

"--- Groupes ---"
$g = Rpc $A "create_group" @{ p_name = "Les Aventuriers" }
Check "Alice crée un groupe (code à 6 caractères)" ($g.ok -and $g.group.code.Length -eq 6) ($g | ConvertTo-Json -Compress)
$code = $g.group.code; $gid = $g.group.id
$j = Rpc $B "join_group" @{ p_code = $code }
Check "Bob rejoint avec le code ; le nom du groupe est conservé" ($j.ok -and $j.group.name -eq "Les Aventuriers") ($j | ConvertTo-Json -Compress)
$res = $null; 1..10 | ForEach-Object { $res = Rpc $C "join_group" @{ p_code = "ZZZZZ$_" } }
Check "codes faux refusés (invalid_code)" ($res.error -eq "invalid_code") ($res | ConvertTo-Json -Compress)
$res = Rpc $C "join_group" @{ p_code = $code }
Check "freinage après 10 essais ratés (même avec le bon code)" ($res.error -eq "too_many_attempts") ($res | ConvertTo-Json -Compress)
$m = Call $A "Get" "/rest/v1/group_members?select=user_id" $null $null
Check "Alice voit 2 membres" (@($m).Count -eq 2) ("" + @($m).Count)
$mc = Call $C "Get" "/rest/v1/group_members?select=user_id" $null $null
Check "Carol (hors groupe) ne voit aucun membre" (@($mc).Count -eq 0) ("" + @($mc).Count)
$gc = Call $C "Get" "/rest/v1/groups?select=*" $null $null
Check "Carol ne voit aucun groupe (les codes ne fuient pas)" (@($gc).Count -eq 0) ("" + @($gc).Count)

"--- Essais ---"
$t1 = Rpc $A "start_try"; $t2 = Rpc $A "start_try"; $t3 = Rpc $A "start_try"
Check "Alice : 2 essais acceptés" ($t1.ok -and $t2.ok) (($t1, $t2 | ConvertTo-Json -Compress))
Check "Alice : le 3e essai du jour est refusé" ($t3.error -eq "no_tries_left") ($t3 | ConvertTo-Json -Compress)
Check "jour et jeu décidés par le serveur" ($t1.day -match '^\d{4}-\d\d-\d\d$' -and $t1.fmt) ($t1 | ConvertTo-Json -Compress)
$tb = Rpc $B "start_try"
$fmtMax = (Call $A "Get" "/rest/v1/formats?select=max_points&key=eq.$($t1.fmt)" $null $null)[0].max_points
"      jeu du jour (serveur) : $($t1.fmt), barème $fmtMax, jour $($t1.day)"

"--- Scores ---"
$half = [int]($fmtMax / 2); $rounds = @(@{ m = "a"; diff = 0; pts = $half }, @{ m = "b"; diff = 0; pts = $half }, @{ m = "c"; diff = 0; pts = $half })
$r = Rpc $A "submit_score" @{ p_attempt = $t1.attempt_id; p_rounds = $rounds }
Check "score envoyé en moins de 20 s refusé" ($r.error -eq "too_fast") ($r | ConvertTo-Json -Compress)
$d = Call $A "Patch" "/rest/v1/attempts?id=eq.$($t1.attempt_id)" @{ score = 99999 } @{ Prefer = "return=representation" }
Check "modifier son score directement : interdit" ($d.__http_error -eq 403) ($d | ConvertTo-Json -Compress)
$d2 = Call $A "Patch" "/rest/v1/attempts?id=eq.$($t1.attempt_id)" @{ started_at = "2020-01-01T00:00:00Z" } @{ Prefer = "return=representation" }
Check "antidater un essai directement : interdit" ($d2.__http_error -eq 403) ($d2 | ConvertTo-Json -Compress)
$lg = Call $A "Post" "/rest/v1/gem_ledger" @{ user_id = $users.Alice.id; day = $t1.day; amount = 100000 } $null
Check "s'inscrire des boussoles directement : interdit" ($lg.__http_error -eq 403) ($lg | ConvertTo-Json -Compress)
$ga = Call $C "Post" "/rest/v1/group_members" @{ group_id = $gid; user_id = $users.Carol.id } $null
Check "s'ajouter à un groupe directement : interdit" ($ga.__http_error -eq 403) ($ga | ConvertTo-Json -Compress)
"      attente de 22 s (durée minimale d'un essai)…"; Start-Sleep -Seconds 22
$bad = @(@{ diff = 0; pts = 99999 }, @{ diff = 0; pts = 1 }, @{ diff = 0; pts = 1 })
$r = Rpc $A "submit_score" @{ p_attempt = $t1.attempt_id; p_rounds = $bad }
Check "score truqué (99 999) refusé" ($r.error -eq "bad_rounds") ($r | ConvertTo-Json -Compress)
$r = Rpc $A "submit_score" @{ p_attempt = $t1.attempt_id; p_rounds = $rounds; p_slow = 2 }
Check "score valide : total recalculé par le serveur ($($half * 3))" ($r.ok -and $r.score -eq $half * 3) ($r | ConvertTo-Json -Compress)
$r = Rpc $A "submit_score" @{ p_attempt = $t1.attempt_id; p_rounds = $rounds }
Check "double envoi refusé" ($r.error -eq "already_submitted") ($r | ConvertTo-Json -Compress)
$r = Rpc $B "submit_score" @{ p_attempt = $t1.attempt_id; p_rounds = $rounds }
Check "Bob ne peut pas envoyer sur l'essai d'Alice" ($r.error -eq "unknown_attempt") ($r | ConvertTo-Json -Compress)
$better = @(@{ diff = 1; pts = $half + 10 }, @{ diff = 1; pts = $half + 10 }, @{ diff = 1; pts = $half + 10 })
$r = Rpc $B "submit_score" @{ p_attempt = $tb.attempt_id; p_rounds = $better }
Check "score de Bob accepté" ($r.ok) ($r | ConvertTo-Json -Compress)

"--- Confidentialité et classement ---"
$ab = Call $B "Get" "/rest/v1/attempts?select=id" $null $null
Check "Bob ne voit que ses propres essais (1)" (@($ab).Count -eq 1) ("" + @($ab).Count)
$dr = Rpc $B "day_results"
$bob = $dr | Where-Object { $_.pseudo -eq "Bob" }; $ali = $dr | Where-Object { $_.pseudo -eq "Alice" }
Check "classement du jour : Bob 1er (base 32 et 16 + bonus du jour)" ($bob.pos -eq 1 -and $bob.gems -ge 32 -and $ali.pos -eq 2 -and $ali.gems -ge 16 -and $bob.gems -gt $ali.gems) ($dr | ConvertTo-Json -Compress)
Check "pastille « temps rallongé » visible pour Alice, pas pour Bob" ($ali.slow -eq $true -and $bob.slow -eq $false) ($dr | ConvertTo-Json -Compress)
Check "résultats provisoires (jour non clos)" ($bob.is_final -eq $false) ($dr | ConvertTo-Json -Compress)
$drc = Rpc $C "day_results"
Check "Carol (hors groupe) ne voit aucun résultat" ((N $drc) -eq 0) ($drc | ConvertTo-Json -Compress)
"--- Classement de la saison, résumé, horloge (migration 20261113) ---"
$sn = Rpc $B "server_now"
Check "heure du serveur lisible et proche de l'heure réelle" ($sn -and [math]::Abs(([datetimeoffset]::Parse(($sn -replace '(\.\d{3})\d+', '$1')) - [datetimeoffset]::UtcNow).TotalSeconds) -lt 120) ("$sn")
$so = Rpc $B "season_overview"
$sb = $so | Where-Object { $_.pseudo -eq "Bob" }; $sa = $so | Where-Object { $_.pseudo -eq "Alice" }
Check "saison : une ligne par joueur et par jour joué (2)" (@($so).Count -eq 2) ($so | ConvertTo-Json -Compress)
Check "saison : Bob 1er (base 32) et Alice 2e (base 16), bonus du jour compris sur 2 joueurs" ($sb.pos -eq 1 -and $sb.base -eq 32 -and $sb.gems -eq (32 + [math]::Round(32*$sb.pct/100,[MidpointRounding]::AwayFromZero)) -and $sa.pos -eq 2 -and $sa.base -eq 16 -and $sa.gems -eq (16 + [math]::Round(16*$sa.pct/100,[MidpointRounding]::AwayFromZero)) -and $sb.n -eq 2) ($so | ConvertTo-Json -Compress)
Check "saison : aucune ligne pour Carol (hors groupe)" ((N (Rpc $C "season_overview")) -eq 0) ""
$sm = Rpc $B "my_summary"
Check "résumé de Bob : boussoles = classement, 1 victoire, 1 jour, série 1, solde 0 (non réglé)" ($sm.gems_total -eq $bob.gems -and $sm.wins -eq 1 -and $sm.days -eq 1 -and $sm.streak -eq 1 -and $sm.wallet -eq 0) ($sm | ConvertTo-Json -Compress)
$sma = Rpc $A "my_summary"
Check "résumé d'Alice : boussoles = classement, 0 victoire" ($sma.gems_total -eq $ali.gems -and $sma.wins -eq 0) ($sma | ConvertTo-Json -Compress)
$ic = Rpc $A "_group_scores" @{ gid = $gid; d1 = "2000-01-01"; d2 = "2100-01-01" }
Check "la fonction interne _group_scores n'est pas appelable par l'application" ($ic.__http_error -ge 400) ($ic | ConvertTo-Json -Compress)
Check "série d'Alice = 1" ((Rpc $A "my_streak") -eq 1) ("" + (Rpc $A "my_streak"))
Check "portefeuille vide avant règlement" ((Rpc $B "my_wallet") -eq 0) ("" + (Rpc $B "my_wallet"))
$sp = Rpc $B "spend_gems" @{ p_reason = "joker" }
Check "joker refusé sans boussoles" ($sp.error -eq "not_enough_gems") ($sp | ConvertTo-Json -Compress)

"--- Discussion, blocage, signalement ---"
$mm = Call $A "Post" "/rest/v1/messages" @{ group_id = $gid; user_id = $users.Alice.id; body = "Bienvenue dans le groupe !" } @{ Prefer = "return=representation" }
Check "Alice écrit dans son groupe" (-not $mm.__http_error) ($mm | ConvertTo-Json -Compress)
$mid = $mm[0].id
$spoof = Call $B "Post" "/rest/v1/messages" @{ group_id = $gid; user_id = $users.Alice.id; body = "Je suis Alice" } $null
Check "usurper un autre joueur : interdit" ($spoof.__http_error -ge 400) ($spoof | ConvertTo-Json -Compress)
$out = Call $C "Post" "/rest/v1/messages" @{ group_id = $gid; user_id = $users.Carol.id; body = "J'écris sans être membre" } $null
Check "écrire hors de son groupe : interdit" ($out.__http_error -ge 400) ($out | ConvertTo-Json -Compress)
$dbg = Call $B "Get" "/rest/v1/messages?select=id,user_id,body" $null $null; $null
Check "Bob lit le message d'Alice (et lui seul)" (($dbg.body -like "Bienvenue*") -and (@($dbg | Where-Object { $_.body }).Count -eq 1)) ($dbg | ConvertTo-Json -Compress)
Check "Carol ne lit aucun message" ((Cnt $C "/rest/v1/messages?select=id") -eq 0) "lecture"
"--- Réactions et clé de score (migration 20261114 : à appliquer avant ces contrôles) ---"
$so2 = Rpc $B "season_overview"; $sk = @($so2)[0].score_key
Check "season_overview fournit une clé de score (uuid)" ("$sk" -match '^[0-9a-f]{8}-[0-9a-f]{4}-') ($so2 | ConvertTo-Json -Compress)
$rx1 = Call $B "Post" "/rest/v1/reactions" @{ group_id = $gid; user_id = $users.Bob.id; target_type = "message"; target_id = $mid; emoji = "🔥" } @{ Prefer = "return=minimal" }
Check "réaction à un message du groupe acceptée" (-not $rx1.__http_error) ($rx1 | ConvertTo-Json -Compress)
$rx2 = Call $B "Post" "/rest/v1/reactions" @{ group_id = $gid; user_id = $users.Bob.id; target_type = "message"; target_id = "00000000-0000-0000-0000-000000000001"; emoji = "👍" } @{ Prefer = "return=minimal" }
Check "réaction à un message inexistant refusée" ($rx2.__http_error -ge 400) ($rx2 | ConvertTo-Json -Compress)
$rx3 = Call $B "Post" "/rest/v1/reactions" @{ group_id = $gid; user_id = $users.Bob.id; target_type = "score"; target_id = $sk; emoji = "👏" } @{ Prefer = "return=minimal" }
Check "réaction à un score acceptée" (-not $rx3.__http_error) ($rx3 | ConvertTo-Json -Compress)
$rx4 = Call $C "Post" "/rest/v1/reactions" @{ group_id = $gid; user_id = $users.Carol.id; target_type = "message"; target_id = $mid; emoji = "😂" } @{ Prefer = "return=minimal" }
Check "Carol (hors groupe) ne peut pas réagir" ($rx4.__http_error -ge 400) ($rx4 | ConvertTo-Json -Compress)
$rx5 = Call $B "Post" "/rest/v1/reactions" @{ group_id = $gid; user_id = $users.Alice.id; target_type = "message"; target_id = $mid; emoji = "😮" } @{ Prefer = "return=minimal" }
Check "réagir au nom d'un autre joueur : interdit" ($rx5.__http_error -ge 400) ($rx5 | ConvertTo-Json -Compress)
Check "les membres lisent les réactions de leur groupe (2)" ((Cnt $B "/rest/v1/reactions?select=target_id") -eq 2) ("" + (Cnt $B "/rest/v1/reactions?select=target_id"))
Check "Carol ne lit aucune réaction" ((Cnt $C "/rest/v1/reactions?select=target_id") -eq 0) ""
$pg = Rpc $A "purge_old_chat"
Check "le nettoyage des vieux messages n'est pas appelable par l'application" ($pg.__http_error -ge 400) ($pg | ConvertTo-Json -Compress)
$rp = Call $B "Post" "/rest/v1/reports" @{ reporter_id = $users.Bob.id; message_id = $mid; reason = "test" } @{ Prefer = "return=minimal" }
Check "Bob signale un message" (-not $rp.__http_error) ($rp | ConvertTo-Json -Compress)
$bl = Call $B "Post" "/rest/v1/blocks" @{ blocker_id = $users.Bob.id; blocked_id = $users.Alice.id } @{ Prefer = "return=minimal" }
Check "Bob bloque Alice" (-not $bl.__http_error) ($bl | ConvertTo-Json -Compress)
Check "après blocage, Bob ne voit plus les messages d'Alice" ((Cnt $B "/rest/v1/messages?select=id") -eq 0) "lecture"
$rd = Call $B "Get" "/rest/v1/reports?select=*" $null $null
Check "les signalements ne sont pas lisibles par les joueurs" (@($rd).Count -eq 0 -or $rd.__http_error) ($rd | ConvertTo-Json -Compress)

"--- Photo de profil (migration 20261116) ---"
$jpg = "data:image/jpeg;base64," + ("QUJD" * 200)
$ph = Call $B "Patch" "/rest/v1/profiles?id=eq.$($users.Bob.id)" @{ photo = $jpg; photo_v = 1700000000 } @{ Prefer = "return=minimal" }
Check "Bob enregistre sa photo (JPEG)" (-not $ph.__http_error) ($ph | ConvertTo-Json -Compress)
$ra = Call $A "Get" "/rest/v1/profiles?select=photo_v,photo&id=eq.$($users.Bob.id)" $null $null
Check "Alice (même groupe) voit la photo de Bob" ($ra -and $ra.photo_v -eq 1700000000 -and $ra.photo.StartsWith("data:image/jpeg")) (($ra | ConvertTo-Json -Compress).Substring(0, 80))
$rc = Call $C "Get" "/rest/v1/profiles?select=photo&id=eq.$($users.Bob.id)" $null $null
Check "Carol (hors groupe) ne voit pas la photo de Bob" ((Cnt $C "/rest/v1/profiles?select=photo&id=eq.$($users.Bob.id)") -eq 0) ""
$bad1 = Call $B "Patch" "/rest/v1/profiles?id=eq.$($users.Bob.id)" @{ photo = "data:text/html;base64,PHNjcmlwdD4=" } @{ Prefer = "return=minimal" }
Check "un fichier qui n'est pas un JPEG est refusé" ($bad1.__http_error -ge 400) ($bad1 | ConvertTo-Json -Compress)
$bad2 = Call $B "Patch" "/rest/v1/profiles?id=eq.$($users.Bob.id)" @{ photo = ("data:image/jpeg;base64," + ("A" * 70000)) } @{ Prefer = "return=minimal" }
Check "une photo trop lourde (> 60 Ko) est refusée" ($bad2.__http_error -ge 400) ($bad2 | ConvertTo-Json -Compress)
$bad3 = Call $A "Patch" "/rest/v1/profiles?id=eq.$($users.Bob.id)" @{ photo = $null } @{ Prefer = "return=representation" }
$still = Call $A "Get" "/rest/v1/profiles?select=photo_v&id=eq.$($users.Bob.id)" $null $null
Check "Alice ne peut pas modifier la photo de Bob" ($still.photo_v -eq 1700000000) ($still | ConvertTo-Json -Compress)
"--- Plusieurs groupes (migration 20261117) ---"
$g2 = Rpc $B "create_group" @{ p_name = "Second groupe" }
Check "Bob crée un second groupe (il est déjà dans le premier)" ($g2.ok -eq $true) ($g2 | ConvertTo-Json -Compress)
$gid2 = $g2.group.id
Check "Bob appartient à 2 groupes" ((Cnt $B "/rest/v1/group_members?select=group_id&user_id=eq.$($users.Bob.id)") -eq 2) ""
"--- Boost et jeu spécial (migration 20261121) ---"
$ab1 = Rpc $A "use_boost" @{ p_group = $gid }
Check "boost refusé après le premier essai du jour dans ce groupe" ($ab1.error -eq "already_started") ($ab1 | ConvertTo-Json -Compress)
$mb0 = Rpc $B "my_boost" @{ p_group = $gid2 }
Check "boost disponible dans un groupe où je n'ai pas encore joué" ($mb0.can_use -eq $true -and $mb0.used -eq $false) ($mb0 | ConvertTo-Json -Compress)
$bb1 = Rpc $B "use_boost" @{ p_group = $gid2 }
Check "Bob active son boost" ($bb1.ok -eq $true) ($bb1 | ConvertTo-Json -Compress)
$bb2 = Rpc $B "use_boost" @{ p_group = $gid }
Check "un seul boost par saison" ($bb2.error -eq "boost_already_used") ($bb2 | ConvertTo-Json -Compress)
$mb1 = Rpc $B "my_boost" @{ p_group = $gid2 }
Check "le boost est actif aujourd'hui dans ce groupe" ($mb1.active_today -eq $true -and $mb1.used -eq $true) ($mb1 | ConvertTo-Json -Compress)
$fmtsp = Rpc $B "format_of" @{ p_day = "2026-11-15" }
Check "le dimanche, le jeu du jour est le méga-quiz" ($fmtsp -eq "megaquiz") "$fmtsp"
$fmtlu = Rpc $B "format_of" @{ p_day = "2026-11-16" }
Check "le lundi, la rotation reprend (jeu normal)" ($fmtlu -ne "megaquiz" -and $fmtlu) "$fmtlu"
$tg = Rpc $B "start_try" @{ p_group = $gid2 }
Check "essai dans le second groupe : indépendant du premier (essai n°0)" ($tg.ok -eq $true -and $tg.try_idx -eq 0 -and $tg.group_id -eq $gid2) ($tg | ConvertTo-Json -Compress)
$fo = Rpc $B "format_of" @{ p_day = $tg.day; p_group = $gid2 }
Check "le jeu de l'essai est celui du groupe" ($fo -eq $tg.fmt) "$fo / $($tg.fmt)"
$tg2 = Rpc $B "start_try" @{ p_group = $gid2 }; $tg3 = Rpc $B "start_try" @{ p_group = $gid2 }
Check "2 essais par jour et par groupe : le 3e est refusé" ($tg2.ok -eq $true -and $tg3.error -eq "no_tries_left") ($tg3 | ConvertTo-Json -Compress)
Start-Sleep -Seconds 22
$brounds = @(@{ m = "a"; diff = 0; pts = 40 }, @{ m = "b"; diff = 0; pts = 40 }, @{ m = "c"; diff = 0; pts = 40 })
$bs = Rpc $B "submit_score" @{ p_attempt = $tg.attempt_id; p_rounds = $brounds }
$bov = Rpc $B "season_overview" @{ p_group = $gid2 }; $bme = $bov | Where-Object { $_.pseudo -eq "Bob" } | Select-Object -First 1
Check "le boost multiplie le score du classement par 1,5 (120 → 180)" ($bs.ok -eq $true -and $bme.boost -eq $true -and $bme.best -eq 180) (($bs | ConvertTo-Json -Compress) + " / " + ($bme | ConvertTo-Json -Compress))
Check "Alice (hors du second groupe) ne le voit pas" ((Cnt $A "/rest/v1/groups?select=id&id=eq.$gid2") -eq 0) ""
$sox = Rpc $A "season_overview" @{ p_group = $gid2 }
Check "Alice ne lit pas le classement du second groupe" ((N $sox) -eq 0) ($sox | ConvertTo-Json -Compress)
$nig = Rpc $C "start_try" @{ p_group = $gid2 }
Check "Carol ne peut pas jouer dans un groupe qui n'est pas le sien" ($nig.error -eq "not_in_group") ($nig | ConvertTo-Json -Compress)
$extra = @(); foreach ($i in 1..3) { $x = Rpc $B "create_group" @{ p_name = "Extra $i" }; $extra += $x.group.id }
$six = Rpc $B "create_group" @{ p_name = "Sixième" }
Check "limite de 5 groupes par joueur" ($six.error -eq "too_many_groups") ($six | ConvertTo-Json -Compress)
$extra += $gid2; $lv = @(); foreach ($e in $extra) { $lv += (Rpc $B "leave_group" @{ p_group = $e }) }
$raw = Call $B "Get" "/rest/v1/group_members?select=group_id,user_id" $null $null
$left = @($raw | Where-Object { $_.user_id -eq $users.Bob.id }).Count
Check "Bob a quitté les groupes ajoutés (il reste dans le premier)" ($left -eq 1) ("restants=$left ; " + ($lv | ConvertTo-Json -Compress))
$pc = ($sb.pct); $exp = 5 * ((([datetime]$sb.play_day - [datetime]"2026-10-19").Days % 21 + 21) % 21)
Check "bonus de saison = 5 % par jour (jour 1 = 0 %)" ($pc -eq $exp) "pct=$pc attendu=$exp"

"--- Rattrapage (migration 20261118) ---"
$yd = ([datetime]::UtcNow.Date.AddDays(-1)).ToString("yyyy-MM-dd")
$cu = Rpc $B "my_catchup" @{ p_group = $gid }
Check "membre arrivé le jour même du groupe : rien à rattraper" ((N $cu) -eq 0) ($cu | ConvertTo-Json -Compress)
$cx = Rpc $B "start_try" @{ p_group = $gid; p_day = $yd }
Check "rattraper un jour non autorisé est refusé" ($cx.error -eq "catchup_unavailable") ($cx | ConvertTo-Json -Compress)

"--- Propriété du groupe ---"
$rm = Rpc $B "remove_member" @{ p_user = $users.Alice.id }
Check "un simple membre ne peut pas retirer un joueur" ($rm.error -eq "not_owner") ($rm | ConvertTo-Json -Compress)

"--- Nettoyage (suppression des comptes de test) ---"
Rpc $A "delete_my_account" | Out-Null
$gleft = Call $B "Get" "/rest/v1/groups?select=name,owner_id" $null $null
Check "Alice (propriétaire) supprimée : le groupe survit et Bob en devient propriétaire" (@($gleft).Count -eq 1 -and $gleft[0].owner_id -eq $users.Bob.id) ($gleft | ConvertTo-Json -Compress)
Rpc $B "delete_my_account" | Out-Null; Rpc $C "delete_my_account" | Out-Null
"      comptes de test supprimés."
"=== BILAN : " + $(if ($fails.Count -eq 0) { "TOUS LES CONTRÔLES PASSENT" } else { "" + $fails.Count + " échec(s) : " + ($fails -join " | ") }) + " ==="
