-- =====================================================================================
-- Test de fumée du schéma du lot 3 : vérifie que les triches de docs/AUDIT-MULTIJOUEUR.md sont bloquées.
-- À exécuter sur un projet DE TEST (jamais sur les vraies données) APRÈS la migration et le seed.
-- Tout se passe dans une transaction annulée à la fin (rollback) : rien ne reste en base.
-- Chaque contrôle affiche « OK … » ; au premier échec, le script s'arrête avec « ÉCHEC … ».
-- =====================================================================================
begin;

insert into auth.users (id, aud, role) values
  ('00000000-0000-0000-0000-0000000000a1', 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-0000000000b2', 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-0000000000c3', 'authenticated', 'authenticated');
insert into public.profiles (id, pseudo) values
  ('00000000-0000-0000-0000-0000000000a1', 'Alice'),
  ('00000000-0000-0000-0000-0000000000b2', 'Bob'),
  ('00000000-0000-0000-0000-0000000000c3', 'Carol');

-- ---------- Alice crée un groupe, Bob le rejoint ----------
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}', true);
do $$
declare r jsonb; code text;
begin
  r := public.create_group('Les Aventuriers');
  if not (r ->> 'ok')::boolean or char_length(r -> 'group' ->> 'code') <> 6 then raise exception 'ÉCHEC création de groupe : %', r; end if;
  perform set_config('test.code', r -> 'group' ->> 'code', true);
  raise notice 'OK création de groupe, code %', r -> 'group' ->> 'code';
end $$;

select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000b2","role":"authenticated"}', true);
do $$
declare r jsonb;
begin
  r := public.join_group(current_setting('test.code'));
  if not (r ->> 'ok')::boolean or r -> 'group' ->> 'name' <> 'Les Aventuriers' then raise exception 'ÉCHEC jonction : %', r; end if;
  raise notice 'OK Bob rejoint « % » (le nom est conservé)', r -> 'group' ->> 'name';
end $$;

-- ---------- code faux et freinage des essais au hasard (Carol) ----------
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000c3","role":"authenticated"}', true);
do $$
declare r jsonb; i int;
begin
  for i in 1..10 loop r := public.join_group('ZZZZZ' || i); end loop;
  if r ->> 'error' <> 'invalid_code' then raise exception 'ÉCHEC code faux : %', r; end if;
  r := public.join_group(current_setting('test.code'));
  if r ->> 'error' <> 'too_many_attempts' then raise exception 'ÉCHEC freinage : % (le bon code devrait être refusé après 10 essais ratés)', r; end if;
  raise notice 'OK codes faux refusés, puis freinage après 10 essais';
end $$;

-- ---------- essais : jamais plus de 2 par jour ----------
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}', true);
do $$
declare r jsonb;
begin
  r := public.start_try(); if not (r ->> 'ok')::boolean then raise exception 'ÉCHEC essai 1 : %', r; end if;
  perform set_config('test.attempt_a', r ->> 'attempt_id', true);
  r := public.start_try(); if not (r ->> 'ok')::boolean then raise exception 'ÉCHEC essai 2 : %', r; end if;
  r := public.start_try(); if r ->> 'error' <> 'no_tries_left' then raise exception 'ÉCHEC 3e essai accepté : %', r; end if;
  raise notice 'OK le 3e essai du jour est refusé';
end $$;

-- ---------- scores : trop rapide, trop gros, puis valide ----------
do $$
declare r jsonb; fmt text;
begin
  r := public.submit_score(current_setting('test.attempt_a')::uuid, '[{"diff":1,"pts":10},{"diff":1,"pts":10},{"diff":1,"pts":10}]');
  if r ->> 'error' <> 'too_fast' then raise exception 'ÉCHEC score instantané accepté : %', r; end if;
  raise notice 'OK score envoyé en moins de 20 s refusé';
end $$;

reset role;
update public.attempts set started_at = now() - interval '3 minutes' where id = current_setting('test.attempt_a')::uuid;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}', true);
do $$
declare r jsonb;
begin
  r := public.submit_score(current_setting('test.attempt_a')::uuid, '[{"diff":1,"pts":99999},{"diff":1,"pts":10},{"diff":1,"pts":10}]');
  if r ->> 'error' <> 'bad_rounds' then raise exception 'ÉCHEC score truqué accepté : %', r; end if;
  r := public.submit_score(current_setting('test.attempt_a')::uuid, '[{"diff":1,"pts":100},{"diff":1,"pts":150},{"diff":1,"pts":200}]', 2);
  if not (r ->> 'ok')::boolean or (r ->> 'score')::int <> 450 then raise exception 'ÉCHEC score valide : %', r; end if;
  r := public.submit_score(current_setting('test.attempt_a')::uuid, '[{"diff":1,"pts":1},{"diff":1,"pts":1},{"diff":1,"pts":1}]');
  if r ->> 'error' <> 'already_submitted' then raise exception 'ÉCHEC double envoi : %', r; end if;
  raise notice 'OK score truqué refusé, score valide recalculé (450), double envoi refusé';
end $$;

-- ---------- écritures directes interdites (modifier son score, se donner des boussoles, s'ajouter à un groupe) ----------
do $$
begin
  begin update public.attempts set score = 99999; raise exception 'ÉCHEC modification directe du score permise';
  exception when insufficient_privilege then raise notice 'OK modification directe d''un score interdite'; end;
  begin insert into public.gem_spend (user_id, amount, reason) values (auth.uid(), 1, 'x'); raise exception 'ÉCHEC écriture directe des boussoles permise';
  exception when insufficient_privilege then raise notice 'OK écriture directe des boussoles interdite'; end;
  begin insert into public.group_members (group_id, user_id) select id, auth.uid() from public.groups limit 1; raise exception 'ÉCHEC ajout direct à un groupe permis';
  exception when insufficient_privilege then raise notice 'OK ajout direct à un groupe interdit'; end;
  begin update public.attempts set started_at = now() - interval '1 day'; raise exception 'ÉCHEC modification directe de la date permise';
  exception when insufficient_privilege then raise notice 'OK modification de la date d''un essai interdite'; end;
end $$;

-- ---------- confidentialité : on ne voit que ses propres essais ----------
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000b2","role":"authenticated"}', true);
do $$
declare n int; r jsonb;
begin
  select count(*) into n from public.attempts;
  if n <> 0 then raise exception 'ÉCHEC Bob voit % essai(s) d''autrui', n; end if;
  -- Bob joue et fait mieux qu'Alice
  r := public.start_try();
  perform set_config('test.attempt_b', r ->> 'attempt_id', true);
  raise notice 'OK Bob ne voit aucun essai d''Alice';
end $$;

reset role;
update public.attempts set started_at = now() - interval '3 minutes' where id = current_setting('test.attempt_b')::uuid;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000b2","role":"authenticated"}', true);
do $$
declare r jsonb; n int; first_gems int; second_gems int;
begin
  r := public.submit_score(current_setting('test.attempt_b')::uuid, '[{"diff":2,"pts":150},{"diff":2,"pts":250},{"diff":2,"pts":280}]');
  if not (r ->> 'ok')::boolean then raise exception 'ÉCHEC score de Bob : %', r; end if;
  -- classement du groupe : 2 joueurs → 32 boussoles au premier, 16 au second ; la pastille « temps rallongé » est visible
  select gems into first_gems from public.day_results() where pseudo = 'Bob';
  select gems into second_gems from public.day_results() where pseudo = 'Alice';
  if first_gems <> 32 or second_gems <> 16 then raise exception 'ÉCHEC boussoles du jour : Bob %, Alice % (attendu 32 et 16)', first_gems, second_gems; end if;
  if not (select slow from public.day_results() where pseudo = 'Alice') then raise exception 'ÉCHEC la pastille « temps rallongé » d''Alice est absente'; end if;
  raise notice 'OK classement du jour : Bob +32, Alice +16, pastille temps rallongé visible';
end $$;

-- ---------- règlement des boussoles à la clôture du jour ----------
reset role;
update public.attempts set day = day - 2;   -- on fait « vieillir » les essais : le jour est clos
do $$
declare n int; w int;
begin
  n := public.settle_closed_days();
  if n < 1 then raise exception 'ÉCHEC aucun jour réglé'; end if;
  if (select count(*) from public.gem_ledger) <> 2 then raise exception 'ÉCHEC registre : % ligne(s) au lieu de 2', (select count(*) from public.gem_ledger); end if;
  if public.settle_closed_days() <> 0 then raise exception 'ÉCHEC le règlement n''est pas idempotent'; end if;
  raise notice 'OK boussoles réglées une seule fois (2 lignes au registre)';
end $$;

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-0000000000b2","role":"authenticated"}', true);
do $$
declare r jsonb;
begin
  if public.my_wallet() <> 32 then raise exception 'ÉCHEC portefeuille de Bob : % (attendu 32)', public.my_wallet(); end if;
  r := public.spend_gems('joker');
  if not (r ->> 'ok')::boolean or (r ->> 'balance')::int <> 7 then raise exception 'ÉCHEC achat de joker : %', r; end if;
  r := public.spend_gems('joker');
  if r ->> 'error' <> 'not_enough_gems' then raise exception 'ÉCHEC solde négatif permis : %', r; end if;
  raise notice 'OK joker acheté (32 → 7), second achat refusé faute de boussoles';
end $$;

-- ---------- suppression de compte ----------
do $$
begin
  perform public.delete_my_account();
end $$;
reset role;
do $$
begin
  if exists (select 1 from public.profiles where pseudo = 'Bob') or exists (select 1 from public.attempts a where a.user_id = '00000000-0000-0000-0000-0000000000b2') then
    raise exception 'ÉCHEC des données de Bob subsistent après suppression';
  end if;
  raise notice 'OK suppression de compte : profil et essais effacés';
  raise notice '=== TOUS LES CONTRÔLES SONT PASSÉS ===';
end $$;

rollback;
