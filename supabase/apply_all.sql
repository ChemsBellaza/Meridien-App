-- =====================================================================================
-- Méridien : schéma COMPLET à jour (reconstruction d'une base VIDE). GÉNÉRÉ par scripts/gen-apply-all.ps1 : ne pas modifier à la main.
-- À coller dans Supabase > SQL Editor d'un projet NEUF, puis Run. NE JAMAIS le lancer sur une base qui contient déjà des données :
-- les tables existent déjà (erreur) et les réglages seraient remis à zéro.
-- Contenu, dans l'ordre : 20261112, 20261113, 20261114, 20261115, 20261116, 20261117, 20261118, 20261119, 20261120, 20261121, 20261122, 20261123, 20261124, 20261125, 20261126, 20261127, 20261128, 20261129, 20261130, 20261202, 20261203 (réglages et liste des jeux insérés juste après la première).
-- Après l'exécution : Authentication > Providers > activer « Anonymous sign-ins » ; régler les modèles d'e-mail (voir CLAUDE.md).
-- =====================================================================================

-- ######## 20261112000000_lot3_init.sql ########
-- =====================================================================================
-- Méridien — lot 3 : multijoueur réel (schéma Supabase / Postgres)
-- Principe : le SERVEUR décide de tout ce qui se compare (jour, essais, score enregistré,
-- boussoles, série). Le téléphone n'écrit JAMAIS directement dans attempts / groups /
-- group_members / gem_* : il appelle les fonctions ci-dessous (security definer).
-- Voir docs/LOT3-MAQUETTE.md. Ce fichier est une MAQUETTE : à relire avant de l'appliquer.
-- =====================================================================================

create extension if not exists pgcrypto with schema extensions;

-- ---------- 1. Réglages et formats (alimentés par supabase/seed.sql, généré depuis le code) ----------
create table public.app_config (
  id             int primary key check (id = 1),
  tries_per_day  smallint not null,
  gems_per_rank  int not null,
  joker_cost     int not null,
  mult           numeric[] not null,
  format_anchor  date not null,
  season_anchor  date not null,
  season_days    int not null,
  timezone       text not null default 'Europe/Paris'
);

create table public.formats (
  position    smallint primary key,
  key         text not null unique,
  max_points  int not null check (max_points > 0)   -- points de base maximum d'une manche, avant multiplicateur
);

-- ---------- 2. Profils, groupes ----------
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  pseudo      text not null check (char_length(pseudo) between 2 and 16),
  pet         jsonb not null default '{"species":"renard","stage":"1","shiny":"normal","bg":"type"}'::jsonb
              check (jsonb_typeof(pet) = 'object' and octet_length(pet::text) < 400),
  created_at  timestamptz not null default now()
);

create table public.groups (
  id           uuid primary key default gen_random_uuid(),
  code         text not null unique check (code ~ '^[A-HJ-NP-Z2-9]{6}$'),  -- sans 0, 1, I, O
  name         text not null check (char_length(name) between 2 and 24),
  owner_id     uuid not null references public.profiles (id) on delete cascade,
  max_members  smallint not null default 30,
  created_at   timestamptz not null default now()
);

-- un joueur appartient à UN seul groupe à la fois (unique sur user_id)
create table public.group_members (
  group_id   uuid not null references public.groups (id) on delete cascade,
  user_id    uuid not null unique references public.profiles (id) on delete cascade,
  role       text not null default 'member' check (role in ('owner', 'member')),
  joined_at  timestamptz not null default now(),
  primary key (group_id, user_id)
);
create index on public.group_members (group_id);

-- tentatives de code de groupe (freine la recherche de codes au hasard)
create table public.join_attempts (
  id        bigint generated always as identity primary key,
  user_id   uuid not null references public.profiles (id) on delete cascade,
  ok        boolean not null,
  at        timestamptz not null default now()
);
create index on public.join_attempts (user_id, at desc);

-- ---------- 3. Essais et scores ----------
create table public.attempts (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles (id) on delete cascade,
  day           date not null,                         -- jour du SERVEUR (fuseau app_config.timezone)
  try_idx       smallint not null check (try_idx >= 0),
  fmt           text not null references public.formats (key),
  started_at    timestamptz not null default now(),    -- horloge du serveur
  submitted_at  timestamptz,
  score         int check (score >= 0),                -- somme des manches, calculée par le serveur
  rounds        jsonb,                                 -- [{m, diff, pts}, ...] (3 manches)
  slow          numeric(2, 1) not null default 1 check (slow in (1, 1.5, 2)),   -- « temps rallongé » (affiché comme pastille)
  flags         text[] not null default '{}',          -- ex. 'fast' : à relire si besoin
  unique (user_id, day, try_idx),
  check ((submitted_at is null) = (score is null))
);
create index on public.attempts (day, user_id);

-- ---------- 4. Boussoles : un registre, jamais un compteur modifiable par le téléphone ----------
create table public.settled_days (
  day         date primary key,
  settled_at  timestamptz not null default now()
);

create table public.gem_ledger (
  user_id   uuid not null references public.profiles (id) on delete cascade,
  day       date not null,
  group_id  uuid references public.groups (id) on delete set null,
  amount    int not null check (amount >= 0),
  primary key (user_id, day)
);

create table public.gem_spend (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  amount      int not null check (amount > 0),
  reason      text not null,
  created_at  timestamptz not null default now()
);
create index on public.gem_spend (user_id);

-- ---------- 5. Discussion, réactions, signalement et blocage (exigés par les stores) ----------
create table public.messages (
  id          uuid primary key default gen_random_uuid(),
  group_id    uuid not null references public.groups (id) on delete cascade,
  user_id     uuid not null references public.profiles (id) on delete cascade,
  body        text not null check (char_length(body) between 1 and 200),
  created_at  timestamptz not null default now()
);
create index on public.messages (group_id, created_at desc);

create table public.reactions (
  group_id     uuid not null references public.groups (id) on delete cascade,
  user_id      uuid not null references public.profiles (id) on delete cascade,
  target_type  text not null check (target_type in ('message', 'score')),
  target_id    uuid not null,
  emoji        text not null check (emoji in ('👍', '😂', '🔥', '😮', '👏')),
  primary key (user_id, target_type, target_id)
);

create table public.blocks (
  blocker_id  uuid not null references public.profiles (id) on delete cascade,
  blocked_id  uuid not null references public.profiles (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

create table public.reports (
  id           uuid primary key default gen_random_uuid(),
  reporter_id  uuid references public.profiles (id) on delete set null,
  message_id   uuid not null references public.messages (id) on delete cascade,
  reason       text check (char_length(reason) <= 200),
  created_at   timestamptz not null default now()
);

-- ---------- 6. Fonctions utilitaires ----------
create or replace function public.game_day() returns date
language sql stable set search_path = public as $$
  select (now() at time zone (select timezone from app_config where id = 1))::date
$$;

-- jeu d'un jour : même rotation que le code (fmtOf) à partir de format_anchor
create or replace function public.format_of(p_day date) returns text
language sql stable set search_path = public as $$
  select f.key
  from formats f, app_config c
  where c.id = 1
    and f.position = (((p_day - c.format_anchor) % (select count(*) from formats)) + (select count(*) from formats)) % (select count(*) from formats)
$$;

create or replace function public.my_group() returns uuid
language sql stable security definer set search_path = public as $$
  select group_id from group_members where user_id = auth.uid()
$$;

-- ---------- 7. Fonctions appelées par l'application (seul moyen d'écrire sur les tables sensibles) ----------
-- Les erreurs « normales » (code faux, plus d'essais…) sont rendues dans un objet {ok:false, error:'…'} :
-- une exception annulerait la transaction (et donc le comptage des tentatives).

create or replace function public.create_group(p_name text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';  -- 32 caractères : pas de biais avec un octet aléatoire
  c text; i int; gid uuid;
begin
  if uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  if not exists (select 1 from profiles where profiles.id = uid) then return jsonb_build_object('ok', false, 'error', 'no_profile'); end if;
  if exists (select 1 from group_members where user_id = uid) then return jsonb_build_object('ok', false, 'error', 'already_in_group'); end if;
  if char_length(btrim(p_name)) not between 2 and 24 then return jsonb_build_object('ok', false, 'error', 'bad_name'); end if;
  loop
    c := '';
    for i in 1..6 loop c := c || substr(alphabet, 1 + (get_byte(extensions.gen_random_bytes(1), 0) % 32), 1); end loop;
    exit when not exists (select 1 from groups g where g.code = c);
  end loop;
  insert into groups (code, name, owner_id) values (c, btrim(p_name), uid) returning groups.id into gid;
  insert into group_members (group_id, user_id, role) values (gid, uid, 'owner');
  return jsonb_build_object('ok', true, 'group', jsonb_build_object('id', gid, 'code', c, 'name', btrim(p_name)));
end $$;

create or replace function public.join_group(p_code text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  g record; n int; fails int;
begin
  if uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  if not exists (select 1 from profiles where profiles.id = uid) then return jsonb_build_object('ok', false, 'error', 'no_profile'); end if;
  if exists (select 1 from group_members where user_id = uid) then return jsonb_build_object('ok', false, 'error', 'already_in_group'); end if;
  select count(*) into fails from join_attempts where user_id = uid and not ok and at > now() - interval '1 hour';
  if fails >= 10 then return jsonb_build_object('ok', false, 'error', 'too_many_attempts'); end if;
  select * into g from groups where code = upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g'));
  if not found then
    insert into join_attempts (user_id, ok) values (uid, false);
    return jsonb_build_object('ok', false, 'error', 'invalid_code');
  end if;
  select count(*) into n from group_members where group_id = g.id;
  if n >= g.max_members then return jsonb_build_object('ok', false, 'error', 'group_full'); end if;
  insert into group_members (group_id, user_id) values (g.id, uid);
  insert into join_attempts (user_id, ok) values (uid, true);
  return jsonb_build_object('ok', true, 'group', jsonb_build_object('id', g.id, 'code', g.code, 'name', g.name));
end $$;

create or replace function public.leave_group() returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  m record; heir uuid;
begin
  if uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  select * into m from group_members where user_id = uid;
  if not found then return jsonb_build_object('ok', false, 'error', 'not_in_group'); end if;
  delete from group_members where user_id = uid;
  select user_id into heir from group_members where group_id = m.group_id order by joined_at limit 1;
  if heir is null then
    delete from groups where id = m.group_id;                       -- dernier membre : le groupe disparaît
  elsif m.role = 'owner' then
    update group_members set role = 'owner' where group_id = m.group_id and user_id = heir;  -- le plus ancien reprend le groupe
    update groups set owner_id = heir where id = m.group_id;
  end if;
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.remove_member(p_user uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); gid uuid;
begin
  if uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  select group_id into gid from group_members where user_id = uid and role = 'owner';
  if gid is null then return jsonb_build_object('ok', false, 'error', 'not_owner'); end if;
  if p_user = uid then return jsonb_build_object('ok', false, 'error', 'cannot_remove_self'); end if;
  delete from group_members where group_id = gid and user_id = p_user;
  return jsonb_build_object('ok', true);
end $$;

-- Démarre un essai : jour et jeu décidés par le serveur ; au plus tries_per_day par jour ;
-- l'essai est compté dès qu'il démarre (comme dans l'application).
create or replace function public.start_try() returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  d date := game_day(); f text; n int; maxtries int; a attempts;
begin
  if uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  if not exists (select 1 from profiles where profiles.id = uid) then return jsonb_build_object('ok', false, 'error', 'no_profile'); end if;
  perform pg_advisory_xact_lock(hashtext('try:' || uid::text));   -- évite deux démarrages simultanés
  select tries_per_day into maxtries from app_config where id = 1;
  select count(*) into n from attempts where user_id = uid and day = d;
  if n >= maxtries then return jsonb_build_object('ok', false, 'error', 'no_tries_left', 'day', d); end if;
  f := format_of(d);
  insert into attempts (user_id, day, try_idx, fmt) values (uid, d, n, f) returning * into a;
  return jsonb_build_object('ok', true, 'attempt_id', a.id, 'day', d, 'fmt', f, 'try_idx', n, 'started_at', a.started_at);
end $$;

-- Enregistre le score d'un essai. Le serveur ne croit pas le total envoyé : il le recalcule à partir des 3 manches,
-- après avoir vérifié les plafonds (max × multiplicateur) et la durée.
create or replace function public.submit_score(p_attempt uuid, p_rounds jsonb, p_slow numeric default 1) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  a attempts; mx int; mults numeric[]; r jsonb; d int; p int; total int := 0; elapsed interval; fl text[] := '{}';
begin
  if uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  select * into a from attempts where id = p_attempt and user_id = uid for update;
  if not found then return jsonb_build_object('ok', false, 'error', 'unknown_attempt'); end if;
  if a.submitted_at is not null then return jsonb_build_object('ok', false, 'error', 'already_submitted'); end if;
  if p_slow not in (1, 1.5, 2) then return jsonb_build_object('ok', false, 'error', 'bad_slow'); end if;
  elapsed := now() - a.started_at;
  if elapsed > interval '60 minutes' then return jsonb_build_object('ok', false, 'error', 'expired'); end if;
  if elapsed < interval '20 seconds' then return jsonb_build_object('ok', false, 'error', 'too_fast'); end if;
  if jsonb_typeof(p_rounds) <> 'array' or jsonb_array_length(p_rounds) <> 3 then return jsonb_build_object('ok', false, 'error', 'bad_rounds'); end if;
  select max_points into mx from formats where key = a.fmt;
  select mult into mults from app_config where id = 1;
  begin
    for r in select * from jsonb_array_elements(p_rounds) loop
      d := (r ->> 'diff')::int; p := (r ->> 'pts')::int;
      if d is null or d not between 0 and 2 or p is null or p < 0 or p > ceil(mx * mults[d + 1]) then
        return jsonb_build_object('ok', false, 'error', 'bad_rounds');
      end if;
      total := total + p;
    end loop;
  exception when invalid_text_representation or numeric_value_out_of_range then
    return jsonb_build_object('ok', false, 'error', 'bad_rounds');
  end;
  if elapsed < interval '45 seconds' then fl := array_append(fl, 'fast'); end if;
  update attempts set submitted_at = now(), score = total, rounds = p_rounds, slow = p_slow, flags = fl where id = a.id;
  return jsonb_build_object('ok', true, 'score', total);
end $$;

-- ---------- 8. Lecture des résultats (le téléphone ne lit jamais attempts des autres directement) ----------
-- Résultats d'un jour pour le groupe de l'appelant. Même formule que le code actuel :
-- boussoles = gems_per_rank × (N − nombre de joueurs ayant au moins le même score + 1) ; aucun gain si N < 2.
create or replace function public.day_results(p_day date default null)
returns table (player_id uuid, pseudo text, best int, tries int, pos int, gems int, slow boolean, is_final boolean)
language sql stable security definer set search_path = public as $$
  with cfg as (select gems_per_rank, timezone from app_config where id = 1),
  dd as (select coalesce(p_day, game_day()) as day),
  played as (
    select a.user_id, max(a.score) as best, count(*)::int as tries, bool_or(a.slow > 1) as slow
    from attempts a
    join group_members gm on gm.user_id = a.user_id and gm.group_id = public.my_group()
    join dd on a.day = dd.day
    where a.submitted_at is not null
    group by a.user_id
  ),
  ranked as (
    select p.*, rank() over (order by p.best desc)::int as pos, count(*) over ()::int as n,
           (select count(*) from played q where q.best >= p.best)::int as at_least
    from played p
  )
  select r.user_id, pr.pseudo, r.best, r.tries, r.pos,
         case when r.n >= 2 then cfg.gems_per_rank * (r.n - r.at_least + 1) else 0 end,
         r.slow,
         (((dd.day + 1)::timestamp at time zone cfg.timezone) + interval '1 hour' < now())
  from ranked r join profiles pr on pr.id = r.user_id, cfg, dd
  order by r.pos, pr.pseudo
$$;

-- Classement de saison du groupe (boussoles déjà réglées ; le jour en cours s'ajoute côté application, marqué « provisoire »)
create or replace function public.season_standings(p_day date default null)
returns table (player_id uuid, pseudo text, total int, days_played int, pos int)
language sql stable security definer set search_path = public as $$
  with cfg as (select season_anchor, season_days from app_config where id = 1),
  s as (
    select c.season_anchor + (((coalesce(p_day, game_day()) - c.season_anchor) / c.season_days) * c.season_days) as start_day, c.season_days
    from cfg c
  ),
  t as (
    select gm.user_id,
           coalesce(sum(l.amount) filter (where l.day >= s.start_day and l.day < s.start_day + s.season_days), 0)::int as total,
           (count(l.day) filter (where l.day >= s.start_day and l.day < s.start_day + s.season_days and l.amount > 0))::int as days_played
    from group_members gm
    cross join s
    left join gem_ledger l on l.user_id = gm.user_id
    where gm.group_id = public.my_group()
    group by gm.user_id
  )
  select t.user_id, pr.pseudo, t.total, t.days_played, rank() over (order by t.total desc)::int
  from t join profiles pr on pr.id = t.user_id
  order by 5, pr.pseudo
$$;

create or replace function public.my_wallet() returns int
language sql stable security definer set search_path = public as $$
  select (coalesce((select sum(amount) from gem_ledger where user_id = auth.uid()), 0)
        - coalesce((select sum(amount) from gem_spend where user_id = auth.uid()), 0))::int
$$;

create or replace function public.my_streak() returns int
language sql stable security definer set search_path = public as $$
  with d as (select distinct day from attempts where user_id = auth.uid() and submitted_at is not null),
  g as (select day, day - (row_number() over (order by day))::int as grp from d),
  runs as (select max(day) as last_day, count(*)::int as len from g group by grp order by max(day) desc limit 1)
  select coalesce((select len from runs where last_day >= game_day() - 1), 0)
$$;

-- Achat d'un joker : seul usage autorisé des boussoles, au prix fixé par app_config
create or replace function public.spend_gems(p_reason text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); cost int; bal int;
begin
  if uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  if p_reason <> 'joker' then return jsonb_build_object('ok', false, 'error', 'bad_reason'); end if;
  perform pg_advisory_xact_lock(hashtext('gems:' || uid::text));
  select joker_cost into cost from app_config where id = 1;
  select public.my_wallet() into bal;
  if bal < cost then return jsonb_build_object('ok', false, 'error', 'not_enough_gems', 'balance', bal); end if;
  insert into gem_spend (user_id, amount, reason) values (uid, cost, p_reason);
  return jsonb_build_object('ok', true, 'balance', bal - cost);
end $$;

-- Règle les boussoles des jours clos (terminés depuis plus d'une heure : la fenêtre d'envoi des scores est fermée).
-- Idempotent : peut être relancée sans risque.
create or replace function public.settle_closed_days() returns int
language plpgsql security definer set search_path = public as $$
declare tz text; gpr int; d date; done int := 0;
begin
  select timezone, gems_per_rank into tz, gpr from app_config where id = 1;
  for d in
    select distinct a.day from attempts a
    where a.submitted_at is not null
      and ((a.day + 1)::timestamp at time zone tz) + interval '1 hour' < now()
      and not exists (select 1 from settled_days s where s.day = a.day)
    order by a.day
  loop
    with played as (
      select a.user_id, gm.group_id, max(a.score) as best
      from attempts a join group_members gm on gm.user_id = a.user_id
      where a.day = d and a.submitted_at is not null
      group by a.user_id, gm.group_id
    ),
    ranked as (
      select p.user_id, p.group_id, count(*) over (partition by p.group_id)::int as n,
             (select count(*) from played q where q.group_id = p.group_id and q.best >= p.best)::int as at_least
      from played p
    )
    insert into gem_ledger (user_id, day, group_id, amount)
    select user_id, d, group_id, case when n >= 2 then gpr * (n - at_least + 1) else 0 end from ranked
    on conflict (user_id, day) do nothing;
    insert into settled_days (day) values (d) on conflict do nothing;
    done := done + 1;
  end loop;
  return done;
end $$;

-- Suppression du compte et de toutes ses données (RGPD) : tout est supprimé en cascade
create or replace function public.delete_my_account() returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  perform public.leave_group();   -- si le joueur est propriétaire, le plus ancien membre reprend le groupe (il n'est pas supprimé avec lui)
  delete from auth.users where id = auth.uid();
end $$;

-- ---------- 9. Garde-fous du chat ----------
create or replace function public.messages_guard() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from messages where user_id = new.user_id and created_at > now() - interval '1 minute') >= 12 then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;
  new.body := btrim(new.body);
  return new;
end $$;

create trigger messages_guard before insert on public.messages
  for each row execute function public.messages_guard();

-- ---------- 10. Sécurité par ligne (RLS) : tout est interdit sauf ce qui est ouvert ci-dessous ----------
alter table public.app_config   enable row level security;
alter table public.formats      enable row level security;
alter table public.profiles     enable row level security;
alter table public.groups       enable row level security;
alter table public.group_members enable row level security;
alter table public.join_attempts enable row level security;
alter table public.attempts     enable row level security;
alter table public.settled_days enable row level security;
alter table public.gem_ledger   enable row level security;
alter table public.gem_spend    enable row level security;
alter table public.messages     enable row level security;
alter table public.reactions    enable row level security;
alter table public.blocks       enable row level security;
alter table public.reports      enable row level security;

create policy config_read  on public.app_config for select to authenticated using (true);
create policy formats_read on public.formats    for select to authenticated using (true);

create policy profiles_read on public.profiles for select to authenticated
  using (id = auth.uid() or exists (select 1 from public.group_members gm where gm.user_id = profiles.id and gm.group_id = public.my_group()));
create policy profiles_insert on public.profiles for insert to authenticated with check (id = auth.uid());
create policy profiles_update on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy groups_read  on public.groups        for select to authenticated using (id = public.my_group());
create policy members_read on public.group_members for select to authenticated using (group_id = public.my_group());

create policy attempts_read_own on public.attempts   for select to authenticated using (user_id = auth.uid());
create policy ledger_read_own   on public.gem_ledger for select to authenticated using (user_id = auth.uid());
create policy spend_read_own    on public.gem_spend   for select to authenticated using (user_id = auth.uid());

create policy messages_read on public.messages for select to authenticated
  using (group_id = public.my_group()
         and user_id not in (select b.blocked_id from public.blocks b where b.blocker_id = auth.uid()));
create policy messages_insert on public.messages for insert to authenticated
  with check (group_id = public.my_group() and user_id = auth.uid());
create policy messages_delete_own on public.messages for delete to authenticated using (user_id = auth.uid());

create policy reactions_read   on public.reactions for select to authenticated using (group_id = public.my_group());
create policy reactions_insert on public.reactions for insert to authenticated with check (group_id = public.my_group() and user_id = auth.uid());
create policy reactions_update on public.reactions for update to authenticated using (user_id = auth.uid()) with check (group_id = public.my_group() and user_id = auth.uid());
create policy reactions_delete on public.reactions for delete to authenticated using (user_id = auth.uid());

create policy blocks_own on public.blocks for all to authenticated using (blocker_id = auth.uid()) with check (blocker_id = auth.uid());
create policy reports_insert on public.reports for insert to authenticated
  with check (reporter_id = auth.uid() and exists (select 1 from public.messages m where m.id = message_id and m.group_id = public.my_group()));
-- (aucune lecture de reports par l'application : la modération se fait depuis le tableau de bord)

-- Droits sur les tables : le téléphone ne peut écrire que là où une politique l'autorise ;
-- tables « serveur seulement » : aucun droit d'écriture du tout.
revoke all on public.app_config, public.formats, public.settled_days, public.join_attempts from anon, authenticated;
grant select on public.app_config, public.formats to authenticated;
revoke insert, update, delete, truncate on public.groups, public.group_members, public.attempts, public.gem_ledger, public.gem_spend from anon, authenticated;
revoke all on public.profiles, public.groups, public.group_members, public.attempts, public.gem_ledger, public.gem_spend,
             public.messages, public.reactions, public.blocks, public.reports from anon;

-- TRUNCATE n'est pas soumis à la sécurité par ligne : on le retire explicitement (ainsi que REFERENCES et TRIGGER)
revoke truncate, references, trigger on all tables in schema public from anon, authenticated;

-- Fonctions : réservées aux utilisateurs connectés (la connexion anonyme de Supabase compte comme « authenticated »)
revoke execute on function public.create_group(text), public.join_group(text), public.leave_group(), public.remove_member(uuid),
  public.start_try(), public.submit_score(uuid, jsonb, numeric), public.day_results(date), public.season_standings(date),
  public.my_wallet(), public.my_streak(), public.spend_gems(text), public.delete_my_account(), public.my_group(),
  public.settle_closed_days() from public, anon;
grant execute on function public.create_group(text), public.join_group(text), public.leave_group(), public.remove_member(uuid),
  public.start_try(), public.submit_score(uuid, jsonb, numeric), public.day_results(date), public.season_standings(date),
  public.my_wallet(), public.my_streak(), public.spend_gems(text), public.delete_my_account(), public.my_group() to authenticated;
-- settle_closed_days() : réservée à la tâche planifiée (aucun droit pour l'application)

-- ---------- 11. Tâche planifiée : règlement des boussoles chaque heure (idempotent, indépendant de l'heure d'été) ----------
do $$
begin
  create extension if not exists pg_cron;
  perform cron.schedule('meridien-settle-days', '7 * * * *', 'select public.settle_closed_days()');
exception when others then
  raise notice 'pg_cron indisponible (%). Activer l''extension pg_cron dans le tableau de bord, puis planifier select public.settle_closed_days() chaque heure.', sqlerrm;
end $$;

-- Étape 6 (chat en direct), à activer le moment venu :
--   alter publication supabase_realtime add table public.messages, public.reactions;

-- ######## réglages et liste des jeux (supabase/seed.sql) ########
-- GÉNÉRÉ par scripts/gen-supabase-seed.py à partir de src/p1_config.js : ne pas modifier à la main.

insert into public.app_config (id, tries_per_day, gems_per_rank, joker_cost, mult, format_anchor, season_anchor, season_days, timezone)
values (1, 2, 16, 25, '{1,1.25,1.5}', date '2026-10-25', date '2026-10-19', 21, 'Europe/Paris')
on conflict (id) do update set tries_per_day = excluded.tries_per_day, gems_per_rank = excluded.gems_per_rank, joker_cost = excluded.joker_cost,
  mult = excluded.mult, format_anchor = excluded.format_anchor, season_anchor = excluded.season_anchor, season_days = excluded.season_days;

insert into public.formats (position, key, max_points) values
  (0, 'sprint', 300),
  (1, 'quiz', 300),
  (2, 'motdujour', 300),
  (3, 'carte', 200),
  (4, 'petitbac', 300),
  (5, 'paysmystere', 300),
  (6, 'drapeaux', 300),
  (7, 'connexions', 300),
  (8, 'anagrammes', 300),
  (9, 'frise', 200),
  (10, 'capitales', 300),
  (11, 'neavant', 300),
  (12, 'intrus', 300),
  (13, 'plusmoins', 300),
  (14, 'comptebon', 300),
  (15, 'quisuisje', 200),
  (16, 'top10', 300),
  (17, 'distance', 300),
  (18, 'silhouettes', 300),
  (19, 'relier', 300),
  (20, 'sigles', 300),
  (21, 'vraifaux', 300),
  (22, 'rebus', 300),
  (23, 'chaine', 300),
  (24, 'voisins', 300),
  (25, 'citations', 200),
  (26, 'classement', 300),
  (27, 'blocs', 300),
  (28, 'expressions', 300),
  (29, 'inventions', 300),
  (30, 'monuments', 300),
  (31, 'corps', 300),
  (32, 'popculture', 300),
  (33, 'chanson', 300),
  (34, 'mythes', 300),
  (35, 'histoirefr', 300),
  (36, 'histoiremonde', 300),
  (37, 'sports', 300),
  (38, 'gastronomie', 300),
  (39, 'nature', 300),
  (40, 'langues', 300)
on conflict (position) do update set key = excluded.key, max_points = excluded.max_points;

-- ######## 20261113000000_season_overview.sql ########
-- =====================================================================================
-- Lot 3, étape 4 : lecture du classement réel.
--   server_now()       : heure du serveur (l'application s'en sert pour ignorer l'horloge du téléphone)
--   _group_scores()    : calcul unique des rangs et des boussoles d'un groupe (interne, non appelable par l'application)
--   season_overview()  : toute la saison du groupe de l'appelant en une seule requête (classement du jour,
--                        jours précédents, totaux, victoires, courbes)
--   my_summary()       : boussoles totales, victoires, série, solde disponible
-- Même formule que le jeu : boussoles = gems_per_rank × (N − joueurs ayant au moins le même score + 1), rien si N < 2.
-- Aucune donnée écrite : lecture seule. À appliquer après 20261112000000_lot3_init.sql.
-- =====================================================================================

create or replace function public.server_now() returns timestamptz
language sql stable as $$ select now() $$;

create or replace function public._group_scores(gid uuid, d1 date, d2 date)
returns table (play_day date, user_id uuid, best int, tries int, slow boolean, at timestamptz, pos int, n int, gems int)
language sql stable security definer set search_path = public as $$
  with cfg as (select gems_per_rank from app_config where id = 1),
  played as (
    select a.day as play_day, a.user_id, max(a.score) as best, count(*)::int as tries,
           bool_or(a.slow > 1) as slow, max(a.submitted_at) as at
    from attempts a
    join group_members gm on gm.user_id = a.user_id and gm.group_id = gid
    where a.submitted_at is not null and a.day between d1 and d2
    group by a.day, a.user_id
  ),
  ranked as (
    select p.play_day, p.user_id, p.best, p.tries, p.slow, p.at,
           rank() over (partition by p.play_day order by p.best desc)::int as pos,
           count(*) over (partition by p.play_day)::int as n,
           count(*) over (partition by p.play_day order by p.best desc)::int as at_least
    from played p
  )
  select r.play_day, r.user_id, r.best, r.tries, r.slow, r.at, r.pos, r.n,
         case when r.n >= 2 then cfg.gems_per_rank * (r.n - r.at_least + 1) else 0 end
  from ranked r, cfg
$$;

create or replace function public.season_overview(p_day date default null)
returns table (play_day date, player_id uuid, pseudo text, best int, tries int, pos int, n int, gems int, slow boolean, at timestamptz)
language sql stable security definer set search_path = public as $$
  with cfg as (select season_anchor, season_days from app_config where id = 1),
  s as (
    select c.season_anchor + (((coalesce(p_day, public.game_day()) - c.season_anchor) / c.season_days) * c.season_days) as d1, c.season_days
    from cfg c
  )
  select g.play_day, g.user_id, pr.pseudo, g.best, g.tries, g.pos, g.n, g.gems, g.slow, g.at
  from s
  cross join lateral public._group_scores(public.my_group(), s.d1, s.d1 + s.season_days - 1) g
  join profiles pr on pr.id = g.user_id
  order by g.play_day, g.pos, pr.pseudo
$$;

create or replace function public.my_summary() returns jsonb
language sql stable security definer set search_path = public as $$
  with sc as (
    select * from public._group_scores(public.my_group(), date '2000-01-01', public.game_day() + 1) where user_id = auth.uid()
  )
  select jsonb_build_object(
    'gems_total', coalesce((select sum(gems) from sc), 0),
    'wins',       (select count(*) from sc where pos = 1 and n >= 2),
    'days',       (select count(*) from sc),
    'wallet',     public.my_wallet(),
    'streak',     public.my_streak()
  )
$$;

-- droits : réservées aux utilisateurs connectés ; _group_scores reste interne
revoke execute on function public._group_scores(uuid, date, date) from public, anon, authenticated;
revoke execute on function public.server_now(), public.season_overview(date), public.my_summary() from public, anon;
grant execute on function public.server_now(), public.season_overview(date), public.my_summary() to authenticated;

-- ######## 20261114000000_chat.sql ########
-- =====================================================================================
-- Lot 3, étape 6 : chat des amis (messages, réactions, signalement, blocage).
-- Les tables et la plupart des règles existent déjà (20261112000000_lot3_init.sql). Cette migration :
--   1. ajoute une clé de réaction aux scores dans season_overview (score_key) ;
--   2. durcit les réactions : on ne réagit à un message que s'il appartient au groupe de l'appelant ;
--   3. limite le nombre de réactions par joueur ;
--   4. nettoie chaque nuit les messages de plus de 30 jours (base gratuite : 500 Mo) et les réactions orphelines.
-- À appliquer après 20261113000000_season_overview.sql, AVANT de publier le code du chat.
-- =====================================================================================

-- 1. season_overview : ajoute score_key (identifiant stable d'un score du jour, cible des réactions)
drop function if exists public.season_overview(date);
create function public.season_overview(p_day date default null)
returns table (play_day date, player_id uuid, pseudo text, best int, tries int, pos int, n int, gems int, slow boolean, at timestamptz, score_key uuid)
language sql stable security definer set search_path = public as $$
  with cfg as (select season_anchor, season_days from app_config where id = 1),
  s as (
    select c.season_anchor + (((coalesce(p_day, public.game_day()) - c.season_anchor) / c.season_days) * c.season_days) as d1, c.season_days
    from cfg c
  )
  select g.play_day, g.user_id, pr.pseudo, g.best, g.tries, g.pos, g.n, g.gems, g.slow, g.at,
         md5(g.play_day::text || g.user_id::text)::uuid
  from s
  cross join lateral public._group_scores(public.my_group(), s.d1, s.d1 + s.season_days - 1) g
  join profiles pr on pr.id = g.user_id
  order by g.play_day, g.pos, pr.pseudo
$$;
revoke execute on function public.season_overview(date) from public, anon;
grant execute on function public.season_overview(date) to authenticated;

-- 2. réactions : un message ciblé doit appartenir au même groupe (les cibles « score » sont des clés dérivées, non vérifiables ici)
drop policy if exists reactions_insert on public.reactions;
drop policy if exists reactions_update on public.reactions;
create policy reactions_insert on public.reactions for insert to authenticated
  with check (group_id = public.my_group() and user_id = auth.uid()
              and (target_type <> 'message' or exists (select 1 from public.messages m where m.id = target_id and m.group_id = reactions.group_id)));
create policy reactions_update on public.reactions for update to authenticated
  using (user_id = auth.uid())
  with check (group_id = public.my_group() and user_id = auth.uid()
              and (target_type <> 'message' or exists (select 1 from public.messages m where m.id = target_id and m.group_id = reactions.group_id)));

-- 3. plafond de réactions par joueur
create or replace function public.reactions_guard() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from reactions where user_id = new.user_id) >= 2000 then
    raise exception 'too_many_reactions' using errcode = 'P0001';
  end if;
  return new;
end $$;
drop trigger if exists reactions_guard on public.reactions;
create trigger reactions_guard before insert on public.reactions for each row execute function public.reactions_guard();

-- 4. nettoyage nocturne
create or replace function public.purge_old_chat() returns int
language plpgsql security definer set search_path = public as $$
declare n int;
begin
  delete from messages where created_at < now() - interval '30 days';
  get diagnostics n = row_count;
  delete from reactions r where r.target_type = 'message' and not exists (select 1 from messages m where m.id = r.target_id);
  return n;
end $$;
revoke execute on function public.purge_old_chat() from public, anon, authenticated;

do $$
begin
  create extension if not exists pg_cron;
  perform cron.schedule('meridien-purge-chat', '30 3 * * *', 'select public.purge_old_chat()');
exception when others then
  raise notice 'pg_cron indisponible (%). Planifier select public.purge_old_chat() chaque nuit depuis le tableau de bord.', sqlerrm;
end $$;

-- ######## 20261115000000_reactions_fix.sql ########
-- =====================================================================================
-- Correctif de 20261114000000_chat.sql : les politiques d'insertion des réactions que cette migration avait
-- réécrites (avec une sous-requête) refusaient TOUTES les réactions. On rétablit les politiques d'origine, simples,
-- et la vérification « le message appartient au groupe » passe dans un déclencheur (il ne dépend pas de la sécurité par ligne).
-- À appliquer APRÈS 20261114000000_chat.sql.
-- =====================================================================================

drop policy if exists reactions_insert on public.reactions;
drop policy if exists reactions_update on public.reactions;
create policy reactions_insert on public.reactions for insert to authenticated
  with check (group_id = public.my_group() and user_id = auth.uid());
create policy reactions_update on public.reactions for update to authenticated
  using (user_id = auth.uid())
  with check (group_id = public.my_group() and user_id = auth.uid());

create or replace function public.reactions_guard() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' and (select count(*) from reactions where user_id = new.user_id) >= 2000 then
    raise exception 'too_many_reactions' using errcode = 'P0001';
  end if;
  if new.target_type = 'message'
     and not exists (select 1 from messages m where m.id = new.target_id and m.group_id = new.group_id) then
    raise exception 'unknown_message' using errcode = 'P0001';
  end if;
  return new;
end $$;

drop trigger if exists reactions_guard on public.reactions;
create trigger reactions_guard before insert or update on public.reactions
  for each row execute function public.reactions_guard();

-- ######## 20261116000000_photo.sql ########
-- =====================================================================================
-- Photo de profil visible par les amis du groupe.
-- La photo (JPEG 240 px, environ 15 Ko) est stockée dans le profil ; photo_v est sa « version » : les téléphones ne
-- retéléchargent une photo que lorsque sa version change (économie de transfert sur l'offre gratuite).
-- Lecture : membres du même groupe seulement (règle profiles_read existante). Écriture : le joueur, sur son propre profil
-- (règle profiles_update existante). À appliquer après 20261115000000_reactions_fix.sql.
-- =====================================================================================
alter table public.profiles
  add column if not exists photo text
    check (photo is null or (length(photo) < 60000 and photo like 'data:image/jpeg;base64,%')),
  add column if not exists photo_v int not null default 0;

-- ######## 20261117000000_multigroups.sql ########
-- =====================================================================================
-- Lot 4 : plusieurs groupes, un jeu par groupe, saison de 21 jours avec bonus de gemmes.
--   1. Un joueur peut être dans jusqu'à 5 groupes. Chaque groupe a SON jeu du jour (rotation propre au groupe :
--      groups.fmt_offset / fmt_stride). Les groupes existants gardent la rotation d'origine (décalage 0, pas 1).
--   2. Chaque essai appartient à un groupe (attempts.group_id) : 2 essais par jour ET PAR GROUPE.
--   3. Les boussoles sont gagnées par groupe et par jour, avec un bonus qui monte avec la saison :
--      jour 1 = +0 %, jour 2 = +5 %, … jour 9 = +40 %, jour 21 = +100 % (saison de 21 jours).
--   4. Les fonctions de lecture acceptent un groupe (p_group) ; sans groupe, elles utilisent le plus ancien
--      (l'ancienne version de l'application continue donc de fonctionner).
-- À appliquer après 20261116000000_photo.sql, AVANT de publier le code qui en dépend.
-- =====================================================================================

-- ---------- 1. Schéma ----------
update public.app_config set season_days = 21 where id = 1;

alter table public.groups
  add column if not exists fmt_offset smallint not null default 0,
  add column if not exists fmt_stride smallint not null default 1;

alter table public.group_members drop constraint if exists group_members_user_id_key;
create index if not exists group_members_user_idx on public.group_members (user_id);

alter table public.attempts add column if not exists group_id uuid references public.groups (id) on delete cascade;
update public.attempts a set group_id = (select gm.group_id from public.group_members gm where gm.user_id = a.user_id order by gm.joined_at limit 1)
  where a.group_id is null;
alter table public.attempts drop constraint if exists attempts_user_id_day_try_idx_key;
create unique index if not exists attempts_user_group_day_try
  on public.attempts (user_id, (coalesce(group_id, '00000000-0000-0000-0000-000000000000'::uuid)), day, try_idx);
create index if not exists attempts_group_day on public.attempts (group_id, day);

-- registre des boussoles : une ligne par joueur, jour et groupe (on le recalcule entièrement ci-dessous)
alter table public.gem_ledger drop constraint if exists gem_ledger_pkey;
delete from public.gem_ledger;
delete from public.settled_days;
create unique index if not exists gem_ledger_user_day_group
  on public.gem_ledger (user_id, day, (coalesce(group_id, '00000000-0000-0000-0000-000000000000'::uuid)));

-- ---------- 2. Fonctions utilitaires ----------
create or replace function public.my_group() returns uuid       -- compatibilité : le plus ancien groupe
language sql stable security definer set search_path = public as $$
  select group_id from group_members where user_id = auth.uid() order by joined_at, group_id limit 1
$$;

create or replace function public.my_groups() returns setof uuid
language sql stable security definer set search_path = public as $$
  select group_id from group_members where user_id = auth.uid()
$$;

-- groupe visé : celui demandé s'il fait partie de ceux de l'appelant, sinon le plus ancien
create or replace function public._pick_group(p_group uuid) returns uuid
language sql stable security definer set search_path = public as $$
  select case when p_group is null then public.my_group()
              when exists (select 1 from group_members where user_id = auth.uid() and group_id = p_group) then p_group
              else null end
$$;

-- jeu d'un jour pour un groupe : pas premier avec 28, donc aucun jeu ne revient avant 28 jours
create or replace function public.format_of(p_day date, p_group uuid) returns text
language sql stable set search_path = public as $$
  select f.key
  from formats f, app_config c, (select count(*)::int as n from formats) t
  left join groups g on g.id = p_group
  where c.id = 1
    and f.position = (((coalesce(g.fmt_offset, 0)::bigint + coalesce(g.fmt_stride, 1)::bigint * (p_day - c.format_anchor)) % t.n) + t.n) % t.n
$$;

-- ---------- 3. Groupes ----------
create or replace function public.create_group(p_name text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  strides constant smallint[] := array[1,3,5,9,11,13,15,17,19,23,25,27];
  c text; i int; gid uuid; nf int;
begin
  if uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  if not exists (select 1 from profiles where profiles.id = uid) then return jsonb_build_object('ok', false, 'error', 'no_profile'); end if;
  if (select count(*) from group_members where user_id = uid) >= 5 then return jsonb_build_object('ok', false, 'error', 'too_many_groups'); end if;
  if char_length(btrim(p_name)) not between 2 and 24 then return jsonb_build_object('ok', false, 'error', 'bad_name'); end if;
  select count(*) into nf from formats;
  loop
    c := '';
    for i in 1..6 loop c := c || substr(alphabet, 1 + (get_byte(extensions.gen_random_bytes(1), 0) % 32), 1); end loop;
    exit when not exists (select 1 from groups g where g.code = c);
  end loop;
  insert into groups (code, name, owner_id, fmt_offset, fmt_stride)
    values (c, btrim(p_name), uid, floor(random() * nf)::smallint, strides[1 + floor(random() * array_length(strides, 1))::int])
    returning groups.id into gid;
  insert into group_members (group_id, user_id, role) values (gid, uid, 'owner');
  return jsonb_build_object('ok', true, 'group', jsonb_build_object('id', gid, 'code', c, 'name', btrim(p_name)));
end $$;

create or replace function public.join_group(p_code text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  g record; n int; fails int;
begin
  if uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  if not exists (select 1 from profiles where profiles.id = uid) then return jsonb_build_object('ok', false, 'error', 'no_profile'); end if;
  select count(*) into fails from join_attempts where user_id = uid and not ok and at > now() - interval '1 hour';
  if fails >= 10 then return jsonb_build_object('ok', false, 'error', 'too_many_attempts'); end if;
  select * into g from groups where code = upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g'));
  if not found then
    insert into join_attempts (user_id, ok) values (uid, false);
    return jsonb_build_object('ok', false, 'error', 'invalid_code');
  end if;
  if exists (select 1 from group_members where user_id = uid and group_id = g.id) then return jsonb_build_object('ok', false, 'error', 'already_in_group'); end if;
  if (select count(*) from group_members where user_id = uid) >= 5 then return jsonb_build_object('ok', false, 'error', 'too_many_groups'); end if;
  select count(*) into n from group_members where group_id = g.id;
  if n >= g.max_members then return jsonb_build_object('ok', false, 'error', 'group_full'); end if;
  insert into group_members (group_id, user_id) values (g.id, uid);
  insert into join_attempts (user_id, ok) values (uid, true);
  return jsonb_build_object('ok', true, 'group', jsonb_build_object('id', g.id, 'code', g.code, 'name', g.name));
end $$;

drop function if exists public.leave_group();
create function public.leave_group(p_group uuid default null) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  gid uuid; m record; heir uuid;
begin
  if uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  gid := public._pick_group(p_group);
  select * into m from group_members where user_id = uid and group_id = gid;
  if not found then return jsonb_build_object('ok', false, 'error', 'not_in_group'); end if;
  delete from group_members where user_id = uid and group_id = gid;
  select user_id into heir from group_members where group_id = gid order by joined_at limit 1;
  if heir is null then
    delete from groups where id = gid;
  elsif m.role = 'owner' then
    update group_members set role = 'owner' where group_id = gid and user_id = heir;
    update groups set owner_id = heir where id = gid;
  end if;
  return jsonb_build_object('ok', true);
end $$;

drop function if exists public.remove_member(uuid);
create function public.remove_member(p_user uuid, p_group uuid default null) returns jsonb
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); gid uuid;
begin
  if uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  gid := public._pick_group(p_group);
  if gid is null or not exists (select 1 from group_members where user_id = uid and group_id = gid and role = 'owner') then
    return jsonb_build_object('ok', false, 'error', 'not_owner');
  end if;
  if p_user = uid then return jsonb_build_object('ok', false, 'error', 'cannot_remove_self'); end if;
  delete from group_members where group_id = gid and user_id = p_user;
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.delete_my_account() returns void
language plpgsql security definer set search_path = public as $$
declare g uuid;
begin
  if auth.uid() is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  for g in select group_id from group_members where user_id = auth.uid() loop
    perform public.leave_group(g);
  end loop;
  delete from auth.users where id = auth.uid();
end $$;

-- ---------- 4. Essais : un jeu par groupe ----------
drop function if exists public.start_try();
create function public.start_try(p_group uuid default null) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  d date := game_day(); f text; n int; maxtries int; a attempts; gid uuid;
begin
  if uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  if not exists (select 1 from profiles where profiles.id = uid) then return jsonb_build_object('ok', false, 'error', 'no_profile'); end if;
  gid := public._pick_group(p_group);
  if p_group is not null and gid is null then return jsonb_build_object('ok', false, 'error', 'not_in_group'); end if;
  perform pg_advisory_xact_lock(hashtext('try:' || uid::text));
  select tries_per_day into maxtries from app_config where id = 1;
  select count(*) into n from attempts where user_id = uid and day = d and group_id is not distinct from gid;
  if n >= maxtries then return jsonb_build_object('ok', false, 'error', 'no_tries_left', 'day', d); end if;
  f := format_of(d, gid);
  insert into attempts (user_id, group_id, day, try_idx, fmt) values (uid, gid, d, n, f) returning * into a;
  return jsonb_build_object('ok', true, 'attempt_id', a.id, 'day', d, 'fmt', f, 'try_idx', n, 'started_at', a.started_at, 'group_id', gid);
end $$;

-- ---------- 5. Classement et boussoles ----------
-- base = gems_per_rank × (N − joueurs ayant au moins le même score + 1) ; bonus = base × 5 % × (jour de saison − 1)
drop function if exists public._group_scores(uuid, date, date);
create function public._group_scores(gid uuid, d1 date, d2 date)
returns table (play_day date, user_id uuid, best int, tries int, slow boolean, at timestamptz, pos int, n int, gems int,
               base int, bonus int, pct int, beaten int, fmt text)
language sql stable security definer set search_path = public as $$
  with cfg as (select gems_per_rank, season_anchor, season_days from app_config where id = 1),
  played as (
    select a.day as play_day, a.user_id, max(a.score) as best, count(*)::int as tries,
           bool_or(a.slow > 1) as slow, max(a.submitted_at) as at
    from attempts a
    join group_members gm on gm.user_id = a.user_id and gm.group_id = gid
    where a.group_id = gid and a.submitted_at is not null and a.day between d1 and d2
    group by a.day, a.user_id
  ),
  ranked as (
    select p.play_day, p.user_id, p.best, p.tries, p.slow, p.at,
           rank() over (partition by p.play_day order by p.best desc)::int as pos,
           count(*) over (partition by p.play_day)::int as n,
           count(*) over (partition by p.play_day order by p.best desc)::int as at_least
    from played p
  ),
  calc as (
    select r.*, case when r.n >= 2 then cfg.gems_per_rank * (r.n - r.at_least + 1) else 0 end as base,
           (5 * (((r.play_day - cfg.season_anchor) % cfg.season_days + cfg.season_days) % cfg.season_days))::int as pct
    from ranked r, cfg
  )
  select c.play_day, c.user_id, c.best, c.tries, c.slow, c.at, c.pos, c.n,
         c.base + round(c.base * c.pct / 100.0)::int, c.base, round(c.base * c.pct / 100.0)::int, c.pct,
         c.n - c.at_least, public.format_of(c.play_day, gid)
  from calc c
$$;

drop function if exists public.season_overview(date);
create function public.season_overview(p_day date default null, p_group uuid default null)
returns table (play_day date, player_id uuid, pseudo text, best int, tries int, pos int, n int, gems int, slow boolean, at timestamptz,
               score_key uuid, base int, bonus int, pct int, beaten int, fmt text)
language sql stable security definer set search_path = public as $$
  with gx as (select public._pick_group(p_group) as gid),
  cfg as (select season_anchor, season_days from app_config where id = 1),
  s as (
    select c.season_anchor + (((coalesce(p_day, public.game_day()) - c.season_anchor) / c.season_days) * c.season_days) as d1, c.season_days
    from cfg c
  )
  select g.play_day, g.user_id, pr.pseudo, g.best, g.tries, g.pos, g.n, g.gems, g.slow, g.at,
         md5(g.play_day::text || g.user_id::text || gx.gid::text)::uuid,
         g.base, g.bonus, g.pct, g.beaten, g.fmt
  from gx, s
  cross join lateral public._group_scores(gx.gid, s.d1, s.d1 + s.season_days - 1) g
  join profiles pr on pr.id = g.user_id
  where gx.gid is not null
  order by g.play_day, g.pos, pr.pseudo
$$;

-- Historique d'un joueur : tous ses jeux joués, tous groupes confondus (« mois glissant » / « all time » filtrés côté appli)
create or replace function public.my_history(p_days int default 3650)
returns table (play_day date, group_id uuid, group_name text, fmt text, best int, pos int, n int, gems int)
language sql stable security definer set search_path = public as $$
  select s.play_day, gm.group_id, g.name, s.fmt, s.best, s.pos, s.n, s.gems
  from group_members gm
  join groups g on g.id = gm.group_id
  cross join lateral public._group_scores(gm.group_id, public.game_day() - greatest(1, least(p_days, 3650)), public.game_day()) s
  where gm.user_id = auth.uid() and s.user_id = auth.uid()
  order by s.play_day desc, g.name
$$;

drop function if exists public.day_results(date);
create function public.day_results(p_day date default null, p_group uuid default null)
returns table (player_id uuid, pseudo text, best int, tries int, pos int, gems int, slow boolean, is_final boolean)
language sql stable security definer set search_path = public as $$
  with gx as (select public._pick_group(p_group) as gid), cfg as (select timezone from app_config where id = 1),
  dd as (select coalesce(p_day, game_day()) as day)
  select g.user_id, pr.pseudo, g.best, g.tries, g.pos, g.gems, g.slow,
         (((dd.day + 1)::timestamp at time zone cfg.timezone) + interval '1 hour' < now())
  from gx, dd, cfg
  cross join lateral public._group_scores(gx.gid, dd.day, dd.day) g
  join profiles pr on pr.id = g.user_id
  where gx.gid is not null
  order by g.pos, pr.pseudo
$$;

drop function if exists public.season_standings(date);
create function public.season_standings(p_day date default null, p_group uuid default null)
returns table (player_id uuid, pseudo text, total int, days_played int, pos int)
language sql stable security definer set search_path = public as $$
  with gx as (select public._pick_group(p_group) as gid),
  cfg as (select season_anchor, season_days from app_config where id = 1),
  s as (
    select c.season_anchor + (((coalesce(p_day, game_day()) - c.season_anchor) / c.season_days) * c.season_days) as start_day, c.season_days
    from cfg c
  ),
  t as (
    select gm.user_id,
           coalesce(sum(l.amount) filter (where l.day >= s.start_day and l.day < s.start_day + s.season_days), 0)::int as total,
           (count(l.day) filter (where l.day >= s.start_day and l.day < s.start_day + s.season_days and l.amount > 0))::int as days_played
    from gx cross join s
    join group_members gm on gm.group_id = gx.gid
    left join gem_ledger l on l.user_id = gm.user_id and l.group_id = gx.gid
    group by gm.user_id
  )
  select t.user_id, pr.pseudo, t.total, t.days_played, rank() over (order by t.total desc)::int
  from t join profiles pr on pr.id = t.user_id
  order by 5, pr.pseudo
$$;

-- Total tous groupes : boussoles, victoires, jours joués (nourrit l'évolution du familier)
drop function if exists public.my_summary();
create function public.my_summary(p_group uuid default null) returns jsonb
language sql stable security definer set search_path = public as $$
  with sc as (
    select s.* from group_members gm
    cross join lateral public._group_scores(gm.group_id, date '2000-01-01', public.game_day() + 1) s
    where gm.user_id = auth.uid() and s.user_id = auth.uid()
  )
  select jsonb_build_object(
    'gems_total', coalesce((select sum(gems) from sc), 0),
    'wins',       (select count(*) from sc where pos = 1 and n >= 2),
    'days',       (select count(*) from sc),
    'wallet',     public.my_wallet(),
    'streak',     public.my_streak()
  )
$$;

-- Règlement : par groupe, avec la même formule (bonus compris) ; recalcule tout ce qui a été effacé plus haut
create or replace function public.settle_closed_days() returns int
language plpgsql security definer set search_path = public as $$
declare tz text; d date; g uuid; done int := 0;
begin
  select timezone into tz from app_config where id = 1;
  for d in
    select distinct a.day from attempts a
    where a.submitted_at is not null
      and ((a.day + 1)::timestamp at time zone tz) + interval '1 hour' < now()
      and not exists (select 1 from settled_days s where s.day = a.day)
    order by a.day
  loop
    for g in select distinct a.group_id from attempts a where a.day = d and a.submitted_at is not null and a.group_id is not null loop
      insert into gem_ledger (user_id, day, group_id, amount)
      select s.user_id, d, g, s.gems from public._group_scores(g, d, d) s
      on conflict (user_id, day, (coalesce(group_id, '00000000-0000-0000-0000-000000000000'::uuid))) do nothing;
    end loop;
    insert into settled_days (day) values (d) on conflict do nothing;
    done := done + 1;
  end loop;
  return done;
end $$;

-- ---------- 6. Sécurité par ligne : « un de mes groupes » au lieu de « mon groupe » ----------
drop policy if exists profiles_read on public.profiles;
create policy profiles_read on public.profiles for select to authenticated
  using (id = auth.uid() or exists (select 1 from public.group_members gm where gm.user_id = profiles.id and gm.group_id in (select public.my_groups())));

drop policy if exists groups_read on public.groups;
create policy groups_read on public.groups for select to authenticated using (id in (select public.my_groups()));
drop policy if exists members_read on public.group_members;
create policy members_read on public.group_members for select to authenticated using (group_id in (select public.my_groups()));

drop policy if exists messages_read on public.messages;
create policy messages_read on public.messages for select to authenticated
  using (group_id in (select public.my_groups())
         and user_id not in (select b.blocked_id from public.blocks b where b.blocker_id = auth.uid()));
drop policy if exists messages_insert on public.messages;
create policy messages_insert on public.messages for insert to authenticated
  with check (group_id in (select public.my_groups()) and user_id = auth.uid());

drop policy if exists reactions_read on public.reactions;
create policy reactions_read on public.reactions for select to authenticated using (group_id in (select public.my_groups()));
drop policy if exists reactions_insert on public.reactions;
create policy reactions_insert on public.reactions for insert to authenticated
  with check (group_id in (select public.my_groups()) and user_id = auth.uid());
drop policy if exists reactions_update on public.reactions;
create policy reactions_update on public.reactions for update to authenticated
  using (user_id = auth.uid())
  with check (group_id in (select public.my_groups()) and user_id = auth.uid());

drop policy if exists reports_insert on public.reports;
create policy reports_insert on public.reports for insert to authenticated
  with check (reporter_id = auth.uid() and exists (select 1 from public.messages m where m.id = message_id and m.group_id in (select public.my_groups())));

-- ---------- 7. Droits ----------
revoke execute on function public._group_scores(uuid, date, date), public._pick_group(uuid), public.settle_closed_days() from public, anon, authenticated;
revoke execute on function public.my_groups(), public.my_history(int), public.format_of(date, uuid),
  public.start_try(uuid), public.leave_group(uuid), public.remove_member(uuid, uuid),
  public.season_overview(date, uuid), public.day_results(date, uuid), public.season_standings(date, uuid), public.my_summary(uuid)
  from public, anon;
grant execute on function public.my_groups(), public.my_history(int),
  public.start_try(uuid), public.leave_group(uuid), public.remove_member(uuid, uuid),
  public.season_overview(date, uuid), public.day_results(date, uuid), public.season_standings(date, uuid), public.my_summary(uuid)
  to authenticated;

-- Recalcule les boussoles des jours déjà clos avec la nouvelle formule
select public.settle_closed_days();

-- ######## 20261118000000_catchup.sql ########
-- =====================================================================================
-- Rattrapage : un joueur qui arrive dans un groupe en cours de saison peut jouer UN SEUL essai sur chacun des jeux
-- précédents de la saison (jours depuis le début de la saison ou la création du groupe, jusqu'à la veille de son arrivée).
--   - le score de rattrapage est classé face aux joueurs qui ont joué ce jour-là, SANS changer leur place ni leurs boussoles ;
--   - le bonus de saison est celui du jour rattrapé ;
--   - les boussoles du joueur sont inscrites dans son registre au moment de l'envoi du score ;
--   - un rattrapage ne compte pas dans la série (flamme).
-- À appliquer après 20261117000000_multigroups.sql, AVANT de publier le code qui en dépend.
-- =====================================================================================

alter table public.attempts add column if not exists catchup boolean not null default false;

-- jours rattrapables par un joueur dans un groupe (interne)
create or replace function public._catchup_days(p_user uuid, p_group uuid)
returns table (day date)
language sql stable security definer set search_path = public as $$
  with c as (select season_anchor, season_days, timezone from app_config where id = 1),
  t as (select (now() at time zone c.timezone)::date as today, c.* from c),
  b as (
    select greatest(
             t.season_anchor + (((t.today - t.season_anchor) / t.season_days) * t.season_days),
             (select (g.created_at at time zone t.timezone)::date from groups g where g.id = p_group)
           ) as first_day,
           least(t.today - 1,
                 (select (gm.joined_at at time zone t.timezone)::date from group_members gm where gm.group_id = p_group and gm.user_id = p_user) - 1) as last_day
    from t
  )
  select d::date
  from b, generate_series(b.first_day::timestamp, b.last_day::timestamp, interval '1 day') d
  where not exists (select 1 from attempts a where a.user_id = p_user and a.group_id = p_group and a.day = d::date)
$$;

create or replace function public.my_catchup(p_group uuid default null)
returns table (day date, fmt text)
language sql stable security definer set search_path = public as $$
  with gx as (select public._pick_group(p_group) as gid)
  select x.day, public.format_of(x.day, gx.gid)
  from gx cross join lateral public._catchup_days(auth.uid(), gx.gid) x
  where gx.gid is not null
  order by x.day desc
$$;

-- start_try : p_day (facultatif) = jour à rattraper ; sans lui, le jeu du jour comme avant
drop function if exists public.start_try(uuid);
create function public.start_try(p_group uuid default null, p_day date default null) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  d date := game_day(); f text; n int; maxtries int; a attempts; gid uuid; late boolean := false;
begin
  if uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  if not exists (select 1 from profiles where profiles.id = uid) then return jsonb_build_object('ok', false, 'error', 'no_profile'); end if;
  gid := public._pick_group(p_group);
  if p_group is not null and gid is null then return jsonb_build_object('ok', false, 'error', 'not_in_group'); end if;
  perform pg_advisory_xact_lock(hashtext('try:' || uid::text));
  select tries_per_day into maxtries from app_config where id = 1;
  if p_day is not null and p_day <> d then
    if gid is null or not exists (select 1 from public._catchup_days(uid, gid) x where x.day = p_day) then
      return jsonb_build_object('ok', false, 'error', 'catchup_unavailable');
    end if;
    d := p_day; maxtries := 1; late := true;
  end if;
  select count(*) into n from attempts where user_id = uid and day = d and group_id is not distinct from gid;
  if n >= maxtries then return jsonb_build_object('ok', false, 'error', 'no_tries_left', 'day', d); end if;
  f := format_of(d, gid);
  insert into attempts (user_id, group_id, day, try_idx, fmt, catchup) values (uid, gid, d, n, f, late) returning * into a;
  return jsonb_build_object('ok', true, 'attempt_id', a.id, 'day', d, 'fmt', f, 'try_idx', n, 'started_at', a.started_at, 'group_id', gid, 'catchup', late);
end $$;

-- classement : les rattrapages se placent face aux joueurs « normaux » du jour sans les déplacer
drop function if exists public._group_scores(uuid, date, date);
create function public._group_scores(gid uuid, d1 date, d2 date)
returns table (play_day date, user_id uuid, best int, tries int, slow boolean, at timestamptz, pos int, n int, gems int,
               base int, bonus int, pct int, beaten int, fmt text)
language sql stable security definer set search_path = public as $$
  with cfg as (select gems_per_rank, season_anchor, season_days from app_config where id = 1),
  played as (
    select a.day as play_day, a.user_id, max(a.score) as best, count(*)::int as tries,
           bool_or(a.slow > 1) as slow, max(a.submitted_at) as at, bool_or(a.catchup) as late
    from attempts a
    join group_members gm on gm.user_id = a.user_id and gm.group_id = gid
    where a.group_id = gid and a.submitted_at is not null and a.day between d1 and d2
    group by a.day, a.user_id
  ),
  reg as (
    select p.*, rank() over (partition by p.play_day order by p.best desc)::int as pos,
           count(*) over (partition by p.play_day)::int as n,
           count(*) over (partition by p.play_day order by p.best desc)::int as at_least
    from played p where not p.late
  ),
  lat as (
    select p.*,
           (select count(*) from reg r where r.play_day = p.play_day and r.best > p.best)::int + 1 as pos,
           (select count(*) from reg r where r.play_day = p.play_day)::int + 1 as n,
           (select count(*) from reg r where r.play_day = p.play_day and r.best >= p.best)::int + 1 as at_least
    from played p where p.late
  ),
  ranked as (select * from reg union all select * from lat),
  calc as (
    select r.*, case when r.n >= 2 then cfg.gems_per_rank * (r.n - r.at_least + 1) else 0 end as base,
           (5 * (((r.play_day - cfg.season_anchor) % cfg.season_days + cfg.season_days) % cfg.season_days))::int as pct
    from ranked r, cfg
  )
  select c.play_day, c.user_id, c.best, c.tries, c.slow, c.at, c.pos, c.n,
         c.base + round(c.base * c.pct / 100.0)::int, c.base, round(c.base * c.pct / 100.0)::int, c.pct,
         c.n - c.at_least, public.format_of(c.play_day, gid)
  from calc c
$$;

-- envoi du score : un rattrapage inscrit tout de suite les boussoles du joueur (le jour est déjà réglé pour les autres)
create or replace function public.submit_score(p_attempt uuid, p_rounds jsonb, p_slow numeric default 1) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  a attempts; mx int; mults numeric[]; r jsonb; d int; p int; total int := 0; elapsed interval; fl text[] := '{}';
begin
  if uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  select * into a from attempts where id = p_attempt and user_id = uid for update;
  if not found then return jsonb_build_object('ok', false, 'error', 'unknown_attempt'); end if;
  if a.submitted_at is not null then return jsonb_build_object('ok', false, 'error', 'already_submitted'); end if;
  if p_slow not in (1, 1.5, 2) then return jsonb_build_object('ok', false, 'error', 'bad_slow'); end if;
  elapsed := now() - a.started_at;
  if elapsed > interval '60 minutes' then return jsonb_build_object('ok', false, 'error', 'expired'); end if;
  if elapsed < interval '20 seconds' then return jsonb_build_object('ok', false, 'error', 'too_fast'); end if;
  if jsonb_typeof(p_rounds) <> 'array' or jsonb_array_length(p_rounds) <> 3 then return jsonb_build_object('ok', false, 'error', 'bad_rounds'); end if;
  select max_points into mx from formats where key = a.fmt;
  select mult into mults from app_config where id = 1;
  begin
    for r in select * from jsonb_array_elements(p_rounds) loop
      d := (r ->> 'diff')::int; p := (r ->> 'pts')::int;
      if d is null or d not between 0 and 2 or p is null or p < 0 or p > ceil(mx * mults[d + 1]) then
        return jsonb_build_object('ok', false, 'error', 'bad_rounds');
      end if;
      total := total + p;
    end loop;
  exception when invalid_text_representation or numeric_value_out_of_range then
    return jsonb_build_object('ok', false, 'error', 'bad_rounds');
  end;
  if elapsed < interval '45 seconds' then fl := array_append(fl, 'fast'); end if;
  update attempts set submitted_at = now(), score = total, rounds = p_rounds, slow = p_slow, flags = fl where id = a.id;
  if a.catchup and a.group_id is not null then
    insert into gem_ledger (user_id, day, group_id, amount)
    select s.user_id, a.day, a.group_id, s.gems from public._group_scores(a.group_id, a.day, a.day) s where s.user_id = uid
    on conflict (user_id, day, (coalesce(group_id, '00000000-0000-0000-0000-000000000000'::uuid))) do nothing;
  end if;
  return jsonb_build_object('ok', true, 'score', total);
end $$;

-- la série (flamme) ignore les rattrapages
create or replace function public.my_streak() returns int
language sql stable security definer set search_path = public as $$
  with d as (select distinct day from attempts where user_id = auth.uid() and submitted_at is not null and not catchup),
  g as (select day, day - (row_number() over (order by day))::int as grp from d),
  runs as (select max(day) as last_day, count(*)::int as len from g group by grp order by max(day) desc limit 1)
  select coalesce((select len from runs where last_day >= game_day() - 1), 0)
$$;

-- droits
revoke execute on function public._catchup_days(uuid, uuid), public._group_scores(uuid, date, date) from public, anon, authenticated;
revoke execute on function public.my_catchup(uuid), public.start_try(uuid, date) from public, anon;
grant execute on function public.my_catchup(uuid), public.start_try(uuid, date) to authenticated;

-- ######## 20261119000000_try_scores.sql ########
-- =====================================================================================
-- Score de chaque essai : _group_scores / season_overview renvoient aussi la liste des scores des essais (dans l'ordre),
-- pour afficher « Essai 1 : 410 pts · Essai 2 : 527 pts » dans le détail d'un score.
-- Ne change aucune règle de classement ni de boussoles. À appliquer après 20261118000000_catchup.sql,
-- AVANT de publier le code qui en dépend (l'ancien code ignore simplement la colonne en plus).
-- =====================================================================================

drop function if exists public._group_scores(uuid, date, date);
create function public._group_scores(gid uuid, d1 date, d2 date)
returns table (play_day date, user_id uuid, best int, tries int, slow boolean, at timestamptz, pos int, n int, gems int,
               base int, bonus int, pct int, beaten int, fmt text, try_scores int[])
language sql stable security definer set search_path = public as $$
  with cfg as (select gems_per_rank, season_anchor, season_days from app_config where id = 1),
  played as (
    select a.day as play_day, a.user_id, max(a.score) as best, count(*)::int as tries,
           bool_or(a.slow > 1) as slow, max(a.submitted_at) as at, bool_or(a.catchup) as late,
           array_agg(a.score order by a.try_idx) as try_scores
    from attempts a
    join group_members gm on gm.user_id = a.user_id and gm.group_id = gid
    where a.group_id = gid and a.submitted_at is not null and a.day between d1 and d2
    group by a.day, a.user_id
  ),
  reg as (
    select p.*, rank() over (partition by p.play_day order by p.best desc)::int as pos,
           count(*) over (partition by p.play_day)::int as n,
           count(*) over (partition by p.play_day order by p.best desc)::int as at_least
    from played p where not p.late
  ),
  lat as (
    select p.*,
           (select count(*) from reg r where r.play_day = p.play_day and r.best > p.best)::int + 1 as pos,
           (select count(*) from reg r where r.play_day = p.play_day)::int + 1 as n,
           (select count(*) from reg r where r.play_day = p.play_day and r.best >= p.best)::int + 1 as at_least
    from played p where p.late
  ),
  ranked as (select * from reg union all select * from lat),
  calc as (
    select r.*, case when r.n >= 2 then cfg.gems_per_rank * (r.n - r.at_least + 1) else 0 end as base,
           (5 * (((r.play_day - cfg.season_anchor) % cfg.season_days + cfg.season_days) % cfg.season_days))::int as pct
    from ranked r, cfg
  )
  select c.play_day, c.user_id, c.best, c.tries, c.slow, c.at, c.pos, c.n,
         c.base + round(c.base * c.pct / 100.0)::int, c.base, round(c.base * c.pct / 100.0)::int, c.pct,
         c.n - c.at_least, public.format_of(c.play_day, gid), c.try_scores
  from calc c
$$;

drop function if exists public.season_overview(date, uuid);
create function public.season_overview(p_day date default null, p_group uuid default null)
returns table (play_day date, player_id uuid, pseudo text, best int, tries int, pos int, n int, gems int, slow boolean, at timestamptz,
               score_key uuid, base int, bonus int, pct int, beaten int, fmt text, try_scores int[])
language sql stable security definer set search_path = public as $$
  with gx as (select public._pick_group(p_group) as gid),
  cfg as (select season_anchor, season_days from app_config where id = 1),
  s as (
    select c.season_anchor + (((coalesce(p_day, public.game_day()) - c.season_anchor) / c.season_days) * c.season_days) as d1, c.season_days
    from cfg c
  )
  select g.play_day, g.user_id, pr.pseudo, g.best, g.tries, g.pos, g.n, g.gems, g.slow, g.at,
         md5(g.play_day::text || g.user_id::text || gx.gid::text)::uuid,
         g.base, g.bonus, g.pct, g.beaten, g.fmt, g.try_scores
  from gx, s
  cross join lateral public._group_scores(gx.gid, s.d1, s.d1 + s.season_days - 1) g
  join profiles pr on pr.id = g.user_id
  where gx.gid is not null
  order by g.play_day, g.pos, pr.pseudo
$$;

revoke execute on function public._group_scores(uuid, date, date) from public, anon, authenticated;
revoke execute on function public.season_overview(date, uuid) from public, anon;
grant execute on function public.season_overview(date, uuid) to authenticated;

-- ######## 20261120000000_more_formats.sql ########
-- =====================================================================================
-- 4 nouveaux jeux de culture générale (v26) : Expressions françaises, Inventions et découvertes, Monuments du monde,
-- Corps humain et santé. Le serveur compte les jeux dans la table formats : la rotation passe de 28 à 32 jeux
-- (le jeu du jour de chaque groupe change donc une fois, à l'application de cette migration).
-- Les pas de rotation des groupes sont tous impairs, donc premiers avec 32 : un jeu ne revient pas avant 32 jours.
-- À appliquer AVANT de publier le code v26 (ou immédiatement avant : l'ancien code, qui connaît 28 jeux, afficherait
-- « Le jour a changé » au lancement d'un essai tant que la page n'est pas rechargée).
-- =====================================================================================
insert into public.formats (position, key, max_points) values
  (28, 'expressions', 300),
  (29, 'inventions', 300),
  (30, 'monuments', 300),
  (31, 'corps', 300)
on conflict (position) do update set key = excluded.key, max_points = excluded.max_points;

-- ######## 20261121000000_boost_sunday.sql ########
-- =====================================================================================
-- v27 : Boost (une fois par saison et par joueur), Méga-quiz du dimanche (jeu spécial, 1 seul essai, boussoles ×2),
--       3 jeux de plus dans la rotation (Pop culture, Chanson, Mythes et littérature → 35 jeux).
--   - formats.special : un jeu spécial ne fait pas partie de la rotation ; le dimanche, TOUS les groupes jouent « megaquiz ».
--   - boosts : un joueur peut, une fois par saison, faire compter son score ×1,5 sur UN jeu (ses 2 essais, dans le
--     classement du jour). Il faut l'activer AVANT le premier essai du jour dans ce groupe.
--   - le dimanche, les boussoles gagnées sont doublées (avant le bonus de saison).
-- À appliquer après 20261120000000_more_formats.sql, AVANT de publier le code v27.
-- =====================================================================================

alter table public.formats add column if not exists special boolean not null default false;
insert into public.formats (position, key, max_points, special) values
  (32, 'popculture', 300, false),
  (33, 'chanson', 300, false),
  (34, 'mythes', 300, false),
  (100, 'megaquiz', 400, true)
on conflict (position) do update set key = excluded.key, max_points = excluded.max_points, special = excluded.special;

-- jeu du jour : le dimanche = méga-quiz pour tout le monde, sinon la rotation (sur les jeux non spéciaux)
create or replace function public.format_of(p_day date) returns text
language sql stable set search_path = public as $$
  select case when extract(dow from p_day) = 0 then 'megaquiz' else (
    select f.key from formats f, app_config c, (select count(*)::int as n from formats where not special) t
    where c.id = 1 and not f.special and f.position = (((p_day - c.format_anchor) % t.n) + t.n) % t.n
  ) end
$$;

create or replace function public.format_of(p_day date, p_group uuid) returns text
language sql stable set search_path = public as $$
  select case when extract(dow from p_day) = 0 then 'megaquiz' else (
    select f.key
    from formats f, app_config c, (select count(*)::int as n from formats where not special) t
    left join groups g on g.id = p_group
    where c.id = 1 and not f.special
      and f.position = (((coalesce(g.fmt_offset, 0)::bigint + coalesce(g.fmt_stride, 1)::bigint * (p_day - c.format_anchor)) % t.n) + t.n) % t.n
  ) end
$$;

-- ---------- boosts ----------
create table if not exists public.boosts (
  user_id      uuid not null references public.profiles (id) on delete cascade,
  group_id     uuid not null references public.groups (id) on delete cascade,
  day          date not null,
  season_start date not null,
  created_at   timestamptz not null default now(),
  primary key (user_id, season_start)           -- un seul boost par saison et par joueur
);
alter table public.boosts enable row level security;
drop policy if exists boosts_read_own on public.boosts;
create policy boosts_read_own on public.boosts for select to authenticated using (user_id = auth.uid());
revoke all on public.boosts from anon;
revoke insert, update, delete, truncate on public.boosts from authenticated;

create or replace function public.my_boost(p_group uuid default null) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  uid uuid := auth.uid(); gid uuid := public._pick_group(p_group); d date := game_day(); c record; s0 date; b record; started boolean;
begin
  if uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  select season_anchor, season_days into c from app_config where id = 1;
  s0 := c.season_anchor + (((d - c.season_anchor) / c.season_days) * c.season_days);
  select * into b from boosts where user_id = uid and season_start = s0;
  select exists (select 1 from attempts a where a.user_id = uid and a.group_id is not distinct from gid and a.day = d) into started;
  return jsonb_build_object('season_start', s0, 'season_end', s0 + c.season_days - 1,
    'used', b.user_id is not null, 'used_day', b.day, 'used_group', b.group_id,
    'active_today', b.user_id is not null and b.day = d and b.group_id is not distinct from gid,
    'can_use', gid is not null and b.user_id is null and not started);
end $$;

create or replace function public.use_boost(p_group uuid default null) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid(); gid uuid := public._pick_group(p_group); d date := game_day(); c record; s0 date;
begin
  if uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  if gid is null then return jsonb_build_object('ok', false, 'error', 'not_in_group'); end if;
  perform pg_advisory_xact_lock(hashtext('boost:' || uid::text));
  select season_anchor, season_days into c from app_config where id = 1;
  s0 := c.season_anchor + (((d - c.season_anchor) / c.season_days) * c.season_days);
  if exists (select 1 from boosts where user_id = uid and season_start = s0) then return jsonb_build_object('ok', false, 'error', 'boost_already_used'); end if;
  if exists (select 1 from attempts a where a.user_id = uid and a.group_id = gid and a.day = d) then return jsonb_build_object('ok', false, 'error', 'already_started'); end if;
  insert into boosts (user_id, group_id, day, season_start) values (uid, gid, d, s0);
  return jsonb_build_object('ok', true, 'day', d, 'group_id', gid);
end $$;

-- ---------- start_try : un jeu spécial n'a qu'un essai ----------
drop function if exists public.start_try(uuid, date);
create function public.start_try(p_group uuid default null, p_day date default null) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  d date := game_day(); f text; n int; maxtries int; a attempts; gid uuid; late boolean := false; sp boolean;
begin
  if uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  if not exists (select 1 from profiles where profiles.id = uid) then return jsonb_build_object('ok', false, 'error', 'no_profile'); end if;
  gid := public._pick_group(p_group);
  if p_group is not null and gid is null then return jsonb_build_object('ok', false, 'error', 'not_in_group'); end if;
  perform pg_advisory_xact_lock(hashtext('try:' || uid::text));
  select tries_per_day into maxtries from app_config where id = 1;
  if p_day is not null and p_day <> d then
    if gid is null or not exists (select 1 from public._catchup_days(uid, gid) x where x.day = p_day) then
      return jsonb_build_object('ok', false, 'error', 'catchup_unavailable');
    end if;
    d := p_day; maxtries := 1; late := true;
  end if;
  f := format_of(d, gid);
  select special into sp from formats where key = f;
  if sp then maxtries := 1; end if;
  select count(*) into n from attempts where user_id = uid and day = d and group_id is not distinct from gid;
  if n >= maxtries then return jsonb_build_object('ok', false, 'error', 'no_tries_left', 'day', d); end if;
  insert into attempts (user_id, group_id, day, try_idx, fmt, catchup) values (uid, gid, d, n, f, late) returning * into a;
  return jsonb_build_object('ok', true, 'attempt_id', a.id, 'day', d, 'fmt', f, 'try_idx', n, 'started_at', a.started_at, 'group_id', gid, 'catchup', late);
end $$;

-- ---------- classement : boost ×1,5 sur le score, dimanche ×2 sur les boussoles ----------
drop function if exists public._group_scores(uuid, date, date);
create function public._group_scores(gid uuid, d1 date, d2 date)
returns table (play_day date, user_id uuid, best int, tries int, slow boolean, at timestamptz, pos int, n int, gems int,
               base int, bonus int, pct int, beaten int, fmt text, try_scores int[], mult int, boost boolean)
language sql stable security definer set search_path = public as $$
  with cfg as (select gems_per_rank, season_anchor, season_days from app_config where id = 1),
  played as (
    select a.day as play_day, a.user_id,
           max(round(a.score * case when bo.user_id is not null then 1.5 else 1 end)::int) as best,
           count(*)::int as tries, bool_or(a.slow > 1) as slow, max(a.submitted_at) as at, bool_or(a.catchup) as late,
           array_agg(round(a.score * case when bo.user_id is not null then 1.5 else 1 end)::int order by a.try_idx) as try_scores,
           bool_or(bo.user_id is not null) as boost
    from attempts a
    join group_members gm on gm.user_id = a.user_id and gm.group_id = gid
    left join boosts bo on bo.user_id = a.user_id and bo.group_id = a.group_id and bo.day = a.day
    where a.group_id = gid and a.submitted_at is not null and a.day between d1 and d2
    group by a.day, a.user_id
  ),
  reg as (
    select p.*, rank() over (partition by p.play_day order by p.best desc)::int as pos,
           count(*) over (partition by p.play_day)::int as n,
           count(*) over (partition by p.play_day order by p.best desc)::int as at_least
    from played p where not p.late
  ),
  lat as (
    select p.*,
           (select count(*) from reg r where r.play_day = p.play_day and r.best > p.best)::int + 1 as pos,
           (select count(*) from reg r where r.play_day = p.play_day)::int + 1 as n,
           (select count(*) from reg r where r.play_day = p.play_day and r.best >= p.best)::int + 1 as at_least
    from played p where p.late
  ),
  ranked as (select * from reg union all select * from lat),
  calc as (
    select r.*, case when r.n >= 2 then cfg.gems_per_rank * (r.n - r.at_least + 1) else 0 end as base,
           case when extract(dow from r.play_day) = 0 then 2 else 1 end as mult,
           (5 * (((r.play_day - cfg.season_anchor) % cfg.season_days + cfg.season_days) % cfg.season_days))::int as pct
    from ranked r, cfg
  )
  select c.play_day, c.user_id, c.best, c.tries, c.slow, c.at, c.pos, c.n,
         c.base * c.mult + round(c.base * c.mult * c.pct / 100.0)::int, c.base, round(c.base * c.mult * c.pct / 100.0)::int, c.pct,
         c.n - c.at_least, public.format_of(c.play_day, gid), c.try_scores, c.mult, c.boost
  from calc c
$$;

drop function if exists public.season_overview(date, uuid);
create function public.season_overview(p_day date default null, p_group uuid default null)
returns table (play_day date, player_id uuid, pseudo text, best int, tries int, pos int, n int, gems int, slow boolean, at timestamptz,
               score_key uuid, base int, bonus int, pct int, beaten int, fmt text, try_scores int[], mult int, boost boolean)
language sql stable security definer set search_path = public as $$
  with gx as (select public._pick_group(p_group) as gid),
  cfg as (select season_anchor, season_days from app_config where id = 1),
  s as (
    select c.season_anchor + (((coalesce(p_day, public.game_day()) - c.season_anchor) / c.season_days) * c.season_days) as d1, c.season_days
    from cfg c
  )
  select g.play_day, g.user_id, pr.pseudo, g.best, g.tries, g.pos, g.n, g.gems, g.slow, g.at,
         md5(g.play_day::text || g.user_id::text || gx.gid::text)::uuid,
         g.base, g.bonus, g.pct, g.beaten, g.fmt, g.try_scores, g.mult, g.boost
  from gx, s
  cross join lateral public._group_scores(gx.gid, s.d1, s.d1 + s.season_days - 1) g
  join profiles pr on pr.id = g.user_id
  where gx.gid is not null
  order by g.play_day, g.pos, pr.pseudo
$$;

-- droits
revoke execute on function public._group_scores(uuid, date, date) from public, anon, authenticated;
revoke execute on function public.my_boost(uuid), public.use_boost(uuid), public.start_try(uuid, date), public.season_overview(date, uuid) from public, anon;
grant execute on function public.my_boost(uuid), public.use_boost(uuid), public.start_try(uuid, date), public.season_overview(date, uuid) to authenticated;

-- ######## 20261122000000_groups_overview.sql ########
-- =====================================================================================
-- Écran d'accueil « Mes groupes » (comme Playus) : une seule requête rend, pour chacun de mes groupes,
-- le nombre de membres, mon rang et mon total de boussoles dans la saison, et si j'ai déjà joué aujourd'hui.
-- Lecture seule (aucune règle changée). À appliquer après 20261121000000_boost_sunday.sql, AVANT de publier le code.
-- =====================================================================================
create or replace function public.my_groups_overview()
returns table (group_id uuid, name text, code text, members int, my_rank int, my_total int, played_today boolean, best_today int)
language sql stable security definer set search_path = public as $$
  with cfg as (select season_anchor, season_days from app_config where id = 1),
  s as (
    select c.season_anchor + (((public.game_day() - c.season_anchor) / c.season_days) * c.season_days) as d1, c.season_days from cfg c
  ),
  mine as (select gm.group_id as gid from group_members gm where gm.user_id = auth.uid()),
  tot as (
    select m.gid, sc.user_id, coalesce(sum(sc.gems), 0)::int as total
    from mine m cross join s
    cross join lateral public._group_scores(m.gid, s.d1, s.d1 + s.season_days - 1) sc
    group by m.gid, sc.user_id
  ),
  everyone as (
    select gm.group_id as gid, gm.user_id, coalesce(t.total, 0) as total
    from group_members gm join mine m on m.gid = gm.group_id
    left join tot t on t.gid = gm.group_id and t.user_id = gm.user_id
  ),
  ranked as (select e.*, rank() over (partition by e.gid order by e.total desc)::int as rk from everyone e),
  today as (
    select m.gid, sc.best from mine m
    cross join lateral public._group_scores(m.gid, public.game_day(), public.game_day()) sc
    where sc.user_id = auth.uid()
  )
  select g.id, g.name, g.code, (select count(*)::int from group_members x where x.group_id = g.id),
         r.rk, r.total, t.best is not null, t.best
  from groups g
  join mine m on m.gid = g.id
  left join ranked r on r.gid = g.id and r.user_id = auth.uid()
  left join today t on t.gid = g.id
  order by g.created_at
$$;
revoke execute on function public.my_groups_overview() from public, anon;
grant execute on function public.my_groups_overview() to authenticated;

-- ######## 20261123000000_day_start.sql ########
-- =====================================================================================
-- Le jeu du jour change chaque jour à 14 h 30, heure de Barcelone (Europe/Madrid, UTC+1 l'hiver, UTC+2 l'été).
-- Un « jour de jeu » D commence le jour D à 14 h 30 et se termine le jour D+1 à 14 h 30. Tout ce qui dépend du jour
-- (jeu, essais, classement, boussoles, série, boost, rattrapage, Méga-quiz du dimanche) suit game_day().
--   - app_config.day_start_min : heure de début du jour de jeu, en minutes (870 = 14 h 30) ; timezone passe à Europe/Madrid.
--   - day_end(jour) : instant où le jour de jeu se termine ; le règlement des boussoles a lieu 1 h après.
-- À APPLIQUER APRÈS 14 h 30 (heure de Barcelone) : le jour de jeu en cours ne change alors pas (il se prolonge jusqu'au
-- lendemain 14 h 30). Appliquée avant 14 h 30, la migration ferait revenir l'application au jour précédent.
-- À appliquer après 20261122000000_groups_overview.sql ; publier le code v30 tout de suite après.
-- =====================================================================================

alter table public.app_config add column if not exists day_start_min int not null default 870 check (day_start_min between 0 and 1439);
update public.app_config set timezone = 'Europe/Madrid', day_start_min = 870 where id = 1;

create or replace function public.game_day() returns date
language sql stable set search_path = public as $$
  select ((now() at time zone c.timezone) - make_interval(mins => c.day_start_min))::date from app_config c where c.id = 1
$$;

-- instant de fin d'un jour de jeu (= début du suivant)
create or replace function public.day_end(p_day date) returns timestamptz
language sql stable set search_path = public as $$
  select (((p_day + 1)::timestamp + make_interval(mins => c.day_start_min)) at time zone c.timezone) from app_config c where c.id = 1
$$;

-- résultats du jour : le jour est « final » 1 h après sa fin
drop function if exists public.day_results(date, uuid);
create function public.day_results(p_day date default null, p_group uuid default null)
returns table (player_id uuid, pseudo text, best int, tries int, pos int, gems int, slow boolean, is_final boolean)
language sql stable security definer set search_path = public as $$
  with gx as (select public._pick_group(p_group) as gid),
  dd as (select coalesce(p_day, game_day()) as day)
  select g.user_id, pr.pseudo, g.best, g.tries, g.pos, g.gems, g.slow, (public.day_end(dd.day) + interval '1 hour' < now())
  from gx, dd
  cross join lateral public._group_scores(gx.gid, dd.day, dd.day) g
  join profiles pr on pr.id = g.user_id
  where gx.gid is not null
  order by g.pos, pr.pseudo
$$;

-- règlement des boussoles des jours clos (1 h après la fin du jour de jeu)
create or replace function public.settle_closed_days() returns int
language plpgsql security definer set search_path = public as $$
declare d date; g uuid; done int := 0;
begin
  for d in
    select distinct a.day from attempts a
    where a.submitted_at is not null
      and public.day_end(a.day) + interval '1 hour' < now()
      and not exists (select 1 from settled_days s where s.day = a.day)
    order by a.day
  loop
    for g in select distinct a.group_id from attempts a where a.day = d and a.submitted_at is not null and a.group_id is not null loop
      insert into gem_ledger (user_id, day, group_id, amount)
      select s.user_id, d, g, s.gems from public._group_scores(g, d, d) s
      on conflict (user_id, day, (coalesce(group_id, '00000000-0000-0000-0000-000000000000'::uuid))) do nothing;
    end loop;
    insert into settled_days (day) values (d) on conflict do nothing;
    done := done + 1;
  end loop;
  return done;
end $$;

-- jours rattrapables : même logique, avec les jours de jeu (14 h 30) pour la création du groupe et l'arrivée du joueur
create or replace function public._catchup_days(p_user uuid, p_group uuid)
returns table (day date)
language sql stable security definer set search_path = public as $$
  with c as (select season_anchor, season_days, timezone, day_start_min from app_config where id = 1),
  t as (select public.game_day() as today, c.* from c),
  b as (
    select greatest(
             t.season_anchor + (((t.today - t.season_anchor) / t.season_days) * t.season_days),
             (select ((g.created_at at time zone t.timezone) - make_interval(mins => t.day_start_min))::date from groups g where g.id = p_group)
           ) as first_day,
           least(t.today - 1,
                 (select ((gm.joined_at at time zone t.timezone) - make_interval(mins => t.day_start_min))::date
                  from group_members gm where gm.group_id = p_group and gm.user_id = p_user) - 1) as last_day
    from t
  )
  select d::date
  from b, generate_series(b.first_day::timestamp, b.last_day::timestamp, interval '1 day') d
  where not exists (select 1 from attempts a where a.user_id = p_user and a.group_id = p_group and a.day = d::date)
$$;

revoke execute on function public.day_end(date), public._catchup_days(uuid, uuid), public.settle_closed_days() from public, anon, authenticated;
grant execute on function public.day_end(date) to authenticated;
revoke execute on function public.day_results(date, uuid) from public, anon;
grant execute on function public.day_results(date, uuid) to authenticated;

-- ######## 20261124000000_season_end.sql ########
-- Fin de saison (v31) : cérémonie, récompenses, palmarès.
-- À appliquer APRÈS 20261123000000_day_start.sql (utilise day_end()).
--   season_awards            : récompenses de fin de saison (boussoles), inscrites une seule fois par groupe et par saison
--   _season_totals(gid)      : total, jours joués et rang de chaque joueur pour chaque saison terminée du groupe
--   _settle_group_season     : distribue les récompenses (podium 150 / 100 / 60, assiduité +20 à partir de 14 jours joués)
--   settle_seasons()         : tâche planifiée (toutes les heures) ; season_recap la déclenche aussi à la demande
--   season_recap(groupe, n)  : tout ce qu'il faut pour la cérémonie d'une saison terminée (joueurs, scores jour par jour)
--   season_hall(groupe)      : palmarès du groupe (podium de chaque saison terminée)
--   my_trophies()            : mes places sur le podium, tous groupes confondus
--   my_wallet()              : inclut désormais les récompenses de saison

create table if not exists public.season_awards (
  group_id  uuid not null references public.groups (id) on delete cascade,
  season    int  not null,
  user_id   uuid not null references public.profiles (id) on delete cascade,
  rk        int  not null,
  gems      int  not null check (gems >= 0),
  primary key (group_id, season, user_id)
);
alter table public.season_awards enable row level security;
-- aucune politique : seules les fonctions ci-dessous (security definer) lisent et écrivent cette table

create or replace function public._season_totals(gid uuid)
returns table (season int, user_id uuid, total int, days int, rk int)
language sql stable security definer set search_path = public as $$
  with c as (select season_anchor as a, season_days as n from app_config where id = 1),
  d as (select c.a, c.n, greatest(0, (public.game_day() - c.a) / c.n) as done from c),
  e as (
    select a, n, case when done > 0 and public.day_end(a + done * n - 1) + interval '1 hour' > now() then done - 1 else done end as done
    from d
  )
  select (((g.play_day - e.a) / e.n) + 1)::int, g.user_id, sum(g.gems)::int, count(*)::int,
         (rank() over (partition by ((g.play_day - e.a) / e.n) order by sum(g.gems) desc))::int
  from e
  cross join lateral public._group_scores(gid, e.a, e.a + e.done * e.n - 1) g
  group by ((g.play_day - e.a) / e.n), g.user_id
$$;

create or replace function public._settle_group_season(gid uuid, s int) returns int
language plpgsql security definer set search_path = public as $$
declare c int := 0;
begin
  if exists (select 1 from season_awards a where a.group_id = gid and a.season = s) then return 0; end if;
  if (select count(*) from public._season_totals(gid) t where t.season = s and t.total > 0) < 2 then return 0; end if;
  insert into season_awards (group_id, season, user_id, rk, gems)
  select gid, s, t.user_id, t.rk,
         (case t.rk when 1 then 150 when 2 then 100 when 3 then 60 else 0 end) + (case when t.days >= 14 then 20 else 0 end)
  from public._season_totals(gid) t
  where t.season = s and t.total > 0 and (t.rk <= 3 or t.days >= 14)
  on conflict do nothing;
  get diagnostics c = row_count;
  return c;
end $$;

create or replace function public.settle_seasons() returns int
language plpgsql security definer set search_path = public as $$
declare r record; n int := 0;
begin
  for r in select g.id as gid, t.season from public.groups g
           cross join lateral (select distinct x.season from public._season_totals(g.id) x) t
  loop
    n := n + public._settle_group_season(r.gid, r.season);
  end loop;
  return n;
end $$;

-- portefeuille : boussoles du registre + récompenses de saison - dépenses
create or replace function public.my_wallet() returns int
language sql stable security definer set search_path = public as $$
  select (coalesce((select sum(amount) from gem_ledger where user_id = auth.uid()), 0)
        + coalesce((select sum(gems) from season_awards where user_id = auth.uid()), 0)
        - coalesce((select sum(amount) from gem_spend where user_id = auth.uid()), 0))::int
$$;

-- cérémonie : une saison terminée (par défaut la dernière)
create or replace function public.season_recap(p_group uuid default null, p_season int default null) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  gid uuid; cfg app_config; cur int; s int; d1 date; d2 date; pl jsonb; rw jsonb; gname text;
begin
  if auth.uid() is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  gid := public._pick_group(p_group);
  if gid is null then return jsonb_build_object('ok', false, 'error', 'no_group'); end if;
  select * into cfg from app_config where id = 1;
  cur := ((public.game_day() - cfg.season_anchor) / cfg.season_days) + 1;
  s := coalesce(p_season, cur - 1);
  if s < 1 or s >= cur then return jsonb_build_object('ok', false, 'error', 'no_season'); end if;
  d1 := cfg.season_anchor + (s - 1) * cfg.season_days; d2 := d1 + cfg.season_days - 1;
  if public.day_end(d2) + interval '1 hour' > now() then return jsonb_build_object('ok', false, 'error', 'not_final'); end if;
  perform public._settle_group_season(gid, s);
  select name into gname from groups where id = gid;

  with sc as (select * from public._group_scores(gid, d1, d2)),
  tm as (
    select a.user_id, avg(extract(epoch from a.submitted_at - a.started_at)) as secs
    from attempts a
    where a.group_id = gid and a.day between d1 and d2 and a.submitted_at is not null and not a.catchup
    group by a.user_id
  ),
  ag as (
    select user_id, count(*)::int as days, (count(*) filter (where pos = 1 and n >= 2))::int as wins,
           round(avg(best))::int as avg, max(best) as top, coalesce(sum(beaten), 0)::int as beaten,
           avg((pos - 1)::numeric / greatest(n - 1, 1)) filter (where play_day < d1 + 10) as early,
           avg((pos - 1)::numeric / greatest(n - 1, 1)) filter (where play_day >= d1 + 11) as late
    from sc group by user_id
  )
  select jsonb_agg(jsonb_build_object(
           'id', pr.id, 'name', pr.pseudo, 'pet', pr.pet, 'total', t.total, 'rank', t.rk, 'days', ag.days, 'wins', ag.wins,
           'avg', ag.avg, 'top', ag.top, 'beaten', ag.beaten, 'early', round(ag.early, 3), 'late', round(ag.late, 3),
           'secs', round(tm.secs), 'award', coalesce(aw.gems, 0)) order by t.rk, pr.pseudo)
  into pl
  from public._season_totals(gid) t
  join ag on ag.user_id = t.user_id
  join profiles pr on pr.id = t.user_id
  left join tm on tm.user_id = t.user_id
  left join season_awards aw on aw.group_id = gid and aw.season = s and aw.user_id = t.user_id
  where t.season = s;

  select jsonb_agg(jsonb_build_object('u', x.user_id, 'd', x.play_day, 'b', x.best, 'p', x.pos, 'n', x.n, 'g', x.gems, 'f', x.fmt) order by x.play_day, x.pos)
  into rw from public._group_scores(gid, d1, d2) x;

  return jsonb_build_object('ok', true, 'group_id', gid, 'group', gname, 'season', s, 'd1', d1, 'd2', d2,
                            'players', coalesce(pl, '[]'::jsonb), 'rows', coalesce(rw, '[]'::jsonb));
end $$;

-- palmarès du groupe : podium de chaque saison terminée
create or replace function public.season_hall(p_group uuid default null) returns jsonb
language sql stable security definer set search_path = public as $$
  with gx as (select public._pick_group(p_group) as gid),
  t as (
    select x.season, jsonb_agg(jsonb_build_object('id', pr.id, 'name', pr.pseudo, 'pet', pr.pet, 'total', x.total, 'rank', x.rk) order by x.rk, pr.pseudo) as top
    from gx, lateral public._season_totals(gx.gid) x
    join profiles pr on pr.id = x.user_id
    where gx.gid is not null and x.rk <= 3 and x.total > 0
    group by x.season
  )
  select coalesce(jsonb_agg(jsonb_build_object('season', t.season, 'top', t.top) order by t.season desc), '[]'::jsonb) from t
$$;

-- mes places sur le podium, tous groupes confondus
create or replace function public.my_trophies() returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object('group_id', gm.group_id, 'group', g.name, 'season', t.season, 'rank', t.rk, 'total', t.total) order by t.season desc, g.name), '[]'::jsonb)
  from group_members gm
  join groups g on g.id = gm.group_id
  cross join lateral public._season_totals(gm.group_id) t
  where gm.user_id = auth.uid() and t.user_id = auth.uid() and t.rk <= 3 and t.total > 0
$$;

revoke execute on function public._season_totals(uuid), public._settle_group_season(uuid, int), public.settle_seasons() from public, anon, authenticated;
revoke execute on function public.season_recap(uuid, int), public.season_hall(uuid), public.my_trophies() from public, anon;
grant execute on function public.season_recap(uuid, int), public.season_hall(uuid), public.my_trophies() to authenticated;

do $$ begin
  perform cron.schedule('meridien-settle-seasons', '17 * * * *', 'select public.settle_seasons()');
exception when others then
  raise notice 'pg_cron indisponible (%). Planifier select public.settle_seasons() chaque heure (facultatif : season_recap le fait aussi à la demande).', sqlerrm;
end $$;

select public.settle_seasons();

-- ######## 20261125000000_catchup_window.sql ########
-- Rattrapage limité aux 3 jeux qui précèdent l'arrivée (v34).
-- Un joueur qui arrive le jour D peut jouer UN SEUL essai de chacun des jeux D-1, D-2 et D-3 (jamais avant le début de la saison
-- ni avant la création du groupe). La fenêtre se compte depuis le jour d'arrivée : elle reste ouverte les jours suivants,
-- jusqu'à la fin de la saison. Réglable : update app_config set catchup_days = N where id = 1;

alter table public.app_config add column if not exists catchup_days int not null default 3 check (catchup_days between 0 and 30);

create or replace function public._catchup_days(p_user uuid, p_group uuid)
returns table (day date)
language sql stable security definer set search_path = public as $$
  with c as (select season_anchor, season_days, timezone, day_start_min, catchup_days from app_config where id = 1),
  t as (select public.game_day() as today, c.* from c),
  j as (
    select t.*,
           (select ((gm.joined_at at time zone t.timezone) - make_interval(mins => t.day_start_min))::date
              from group_members gm where gm.group_id = p_group and gm.user_id = p_user) as join_day,
           (select ((g.created_at at time zone t.timezone) - make_interval(mins => t.day_start_min))::date from groups g where g.id = p_group) as created_day
    from t
  ),
  b as (
    select greatest(j.season_anchor + (((j.today - j.season_anchor) / j.season_days) * j.season_days), j.created_day, j.join_day - j.catchup_days) as first_day,
           least(j.today - 1, j.join_day - 1) as last_day
    from j
    where j.join_day is not null
  )
  select d::date
  from b, generate_series(b.first_day::timestamp, b.last_day::timestamp, interval '1 day') d
  where not exists (select 1 from attempts a where a.user_id = p_user and a.group_id = p_group and a.day = d::date)
$$;

revoke execute on function public._catchup_days(uuid, uuid) from public, anon, authenticated;

-- ######## 20261126000000_push.sql ########
-- Notifications push (v36) : nouveau jeu à 14 h 30 (heure de Barcelone) et messages du groupe.
-- Fonctionnement : le téléphone s'abonne (save_push_sub) ; la base appelle la fonction Edge « push » (extension pg_net) :
--   - à chaque nouveau message (déclencheur) ;
--   - chaque jour à 14 h 30 (deux tâches pg_cron, l'heure d'hiver et l'heure d'été ; la fonction ne s'exécute qu'une fois par jour).
-- La fonction « push » (supabase/functions/push/index.ts) crée elle-même les clés VAPID au premier appel et les range dans
-- push_keys : aucune clé secrète à copier, ni dans le dépôt ni dans une conversation.
-- À appliquer APRÈS les migrations précédentes ; puis créer la fonction Edge « push » (voir CLAUDE.md).

create extension if not exists pg_net;

alter table public.app_config add column if not exists push_url text;
update public.app_config set push_url = 'https://objfbehephvvaogmblhj.supabase.co/functions/v1/dynamic-handler' where id = 1 and push_url is null;

-- clés VAPID (une seule ligne, écrite par la fonction Edge avec la clé de service ; aucun droit pour l'application)
create table if not exists public.push_keys (
  id           int primary key check (id = 1),
  public_key   text not null,
  private_key  text not null
);
alter table public.push_keys enable row level security;

-- abonnements : un par téléphone (adresse d'envoi du navigateur)
create table if not exists public.push_subs (
  endpoint    text primary key check (char_length(endpoint) between 20 and 800),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  p256dh      text not null,
  auth        text not null,
  msgs        boolean not null default true,
  daily       boolean not null default true,
  created_at  timestamptz not null default now()
);
create index if not exists push_subs_user on public.push_subs (user_id);
alter table public.push_subs enable row level security;

-- journal : un envoi « quotidien » par jour, un envoi par message (évite tout doublon)
create table if not exists public.push_log (
  kind     text not null,
  day      date not null,
  sent_at  timestamptz not null default now(),
  primary key (kind, day)
);
alter table public.push_log enable row level security;

-- ---------- fonctions pour l'application ----------
create or replace function public.push_public_key() returns text
language sql stable security definer set search_path = public as $$
  select public_key from push_keys where id = 1
$$;

create or replace function public.save_push_sub(p_endpoint text, p_p256dh text, p_auth text, p_msgs boolean default true, p_daily boolean default true) returns jsonb
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  if p_endpoint !~ '^https://' or char_length(p_endpoint) > 800 or coalesce(p_p256dh, '') = '' or coalesce(p_auth, '') = '' then
    return jsonb_build_object('ok', false, 'error', 'bad_subscription');
  end if;
  if not exists (select 1 from profiles where id = uid) then return jsonb_build_object('ok', false, 'error', 'no_profile'); end if;
  insert into push_subs (endpoint, user_id, p256dh, auth, msgs, daily) values (p_endpoint, uid, p_p256dh, p_auth, coalesce(p_msgs, true), coalesce(p_daily, true))
  on conflict (endpoint) do update set user_id = uid, p256dh = excluded.p256dh, auth = excluded.auth, msgs = excluded.msgs, daily = excluded.daily;
  -- un même téléphone ne garde pas d'anciens comptes : au plus 5 abonnements par joueur
  delete from push_subs where user_id = uid and endpoint not in (select endpoint from push_subs where user_id = uid order by created_at desc limit 5);
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.drop_push_sub(p_endpoint text) returns jsonb
language sql security definer set search_path = public as $$
  with d as (delete from push_subs where endpoint = p_endpoint and user_id = auth.uid() returning 1) select jsonb_build_object('ok', true, 'removed', (select count(*) from d))
$$;

create or replace function public.my_push_sub(p_endpoint text) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object('msgs', msgs, 'daily', daily) from push_subs where endpoint = p_endpoint and user_id = auth.uid()
$$;

-- ---------- appels de la fonction Edge (jamais bloquants : une erreur ne doit pas empêcher d'envoyer un message) ----------
create or replace function public._push_call(p_body jsonb) returns void
language plpgsql security definer set search_path = public as $$
declare u text;
begin
  select push_url into u from app_config where id = 1;
  if u is null then return; end if;
  perform net.http_post(url := u, body := p_body, headers := jsonb_build_object('Content-Type', 'application/json'));
exception when others then
  null;
end $$;

create or replace function public.messages_push() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  perform public._push_call(jsonb_build_object('type', 'message', 'id', new.id));
  return new;
exception when others then
  return new;
end $$;
drop trigger if exists messages_push on public.messages;
create trigger messages_push after insert on public.messages for each row execute function public.messages_push();

revoke execute on function public._push_call(jsonb), public.messages_push() from public, anon, authenticated;
revoke execute on function public.push_public_key(), public.save_push_sub(text, text, text, boolean, boolean), public.drop_push_sub(text), public.my_push_sub(text) from public, anon;
grant execute on function public.push_public_key(), public.save_push_sub(text, text, text, boolean, boolean), public.drop_push_sub(text), public.my_push_sub(text) to authenticated;

-- ---------- tâches planifiées : 14 h 30 à Barcelone = 13 h 30 UTC l'hiver, 12 h 30 UTC l'été ----------
do $$ begin
  perform cron.schedule('meridien-push-daily-winter', '30 13 * * *', $c$select public._push_call('{"type":"daily"}'::jsonb)$c$);
  perform cron.schedule('meridien-push-daily-summer', '30 12 * * *', $c$select public._push_call('{"type":"daily"}'::jsonb)$c$);
exception when others then
  raise notice 'pg_cron indisponible (%). Planifier select public._push_call(''{"type":"daily"}'') à 13:30 et 12:30 UTC.', sqlerrm;
end $$;

-- ######## 20261127000000_games41_yesterday.sql ########
-- v39 : six jeux de plus (la rotation passe de 35 à 41 jeux) et rattrapage du jeu de la veille.
--
-- 1. Nouveaux jeux : Histoire de France, Histoire du monde, Sports, Gastronomie, Sciences et nature, Langues du monde.
--    41 est un nombre premier : tous les pas de rotation des groupes conviennent (avec 35, les pas 5, 15 et 25 faisaient revenir
--    les mêmes 7 jeux en boucle). La bascule se fait à partir du jour de jeu app_config.rot_from
--    (20 novembre 2026) : les jours avant gardent la rotation à 35 jeux, donc la journée en cours n'est pas touchée et la migration
--    peut s'appliquer à toute heure.
-- 2. format_of(jour, groupe) rend d'abord le jeu réellement joué ce jour-là dans le groupe (table attempts) : ajouter des jeux ne
--    change plus l'historique ni le jeu d'une journée déjà entamée. Sans partie ce jour-là, la rotation s'applique comme avant.
-- 3. Jeu de la veille : un membre qui n'a pas joué le jeu d'hier (jour de jeu précédent, dans la saison en cours, depuis son arrivée)
--    peut en jouer UN essai, comme un rattrapage (classé sans bousculer les autres, boussoles de ce jour, la série l'ignore).
--
-- À appliquer AVANT de publier le code v39, à n'importe quelle heure (la journée en cours ne change pas).

-- ---------- 1. les six jeux ----------
insert into public.formats (position, key, max_points, special) values
  (35, 'histoirefr', 300, false),
  (36, 'histoiremonde', 300, false),
  (37, 'sports', 300, false),
  (38, 'gastronomie', 300, false),
  (39, 'nature', 300, false),
  (40, 'langues', 300, false)
on conflict (position) do update set key = excluded.key, max_points = excluded.max_points, special = excluded.special;

-- bascule : 35 jeux avant rot_from, tous les jeux ensuite
alter table public.app_config add column if not exists rot_old_n int not null default 35;
alter table public.app_config add column if not exists rot_from date not null default date '2026-11-20';

-- ---------- 2. le jeu déjà joué prime sur la rotation ----------
create or replace function public.format_of(p_day date, p_group uuid) returns text
language sql stable security definer set search_path = public as $$
  select coalesce(
    (select a.fmt from attempts a where a.group_id = p_group and a.day = p_day and a.fmt is not null order by a.started_at limit 1),
    case when extract(dow from p_day) = 0 then 'megaquiz' else (
      select f.key
      from app_config c
      cross join lateral (select case when p_day < c.rot_from then least(c.rot_old_n, x.n) else x.n end as n
                          from (select count(*)::int as n from formats where not special) x) t
      left join groups g on g.id = p_group
      join formats f on not f.special
        and f.position = (((coalesce(g.fmt_offset, 0)::bigint + coalesce(g.fmt_stride, 1)::bigint * (p_day - c.format_anchor)) % t.n) + t.n) % t.n
      where c.id = 1
    ) end
  )
$$;

-- ---------- 3. rattrapage : les jours avant l'arrivée (3 au plus) + le jeu de la veille manqué ----------
create or replace function public._catchup_days(p_user uuid, p_group uuid)
returns table (day date)
language sql stable security definer set search_path = public as $$
  with c as (select season_anchor, season_days, timezone, day_start_min, catchup_days from app_config where id = 1),
  t as (select public.game_day() as today, c.* from c),
  j as (
    select t.*,
           (select ((gm.joined_at at time zone t.timezone) - make_interval(mins => t.day_start_min))::date
              from group_members gm where gm.group_id = p_group and gm.user_id = p_user) as join_day,
           (select ((g.created_at at time zone t.timezone) - make_interval(mins => t.day_start_min))::date from groups g where g.id = p_group) as created_day
    from t
  ),
  b as (
    select j.*,
           j.season_anchor + (((j.today - j.season_anchor) / j.season_days) * j.season_days) as season_start,
           greatest(j.season_anchor + (((j.today - j.season_anchor) / j.season_days) * j.season_days), j.created_day, j.join_day - j.catchup_days) as first_day,
           least(j.today - 1, j.join_day - 1) as last_day
    from j
    where j.join_day is not null
  ),
  cand as (
    select d::date as day from b, generate_series(b.first_day::timestamp, b.last_day::timestamp, interval '1 day') d
    union
    select b.today - 1 from b
    where b.today - 1 >= b.season_start and b.today - 1 >= b.created_day and b.today - 1 >= b.join_day
  )
  select cand.day from cand
  where not exists (select 1 from attempts a where a.user_id = p_user and a.group_id = p_group and a.day = cand.day)
$$;

revoke execute on function public._catchup_days(uuid, uuid) from public, anon, authenticated;

-- ######## 20261128000000_push_plays.sql ########
-- Notifications : essais des amis, records et dépassements (v56).
-- À appliquer AVANT de publier le code qui les réglera (les anciens clients continuent de fonctionner : tout est par défaut « oui »).
-- Puis redéployer la fonction Edge « push » (supabase/functions/push/index.ts).

alter table public.push_subs add column if not exists plays  boolean not null default true;   -- « un ami a fait un essai »
alter table public.push_subs add column if not exists rivals boolean not null default true;   -- « nouveau record » et « un ami t'a dépassé »

-- une seule version de la fonction (les anciens appels sans les nouveaux paramètres restent valides grâce aux valeurs par défaut)
drop function if exists public.save_push_sub(text, text, text, boolean, boolean);
create or replace function public.save_push_sub(p_endpoint text, p_p256dh text, p_auth text, p_msgs boolean default true, p_daily boolean default true, p_plays boolean default true, p_rivals boolean default true) returns jsonb
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  if p_endpoint !~ '^https://' or char_length(p_endpoint) > 800 or coalesce(p_p256dh, '') = '' or coalesce(p_auth, '') = '' then
    return jsonb_build_object('ok', false, 'error', 'bad_subscription');
  end if;
  if not exists (select 1 from profiles where id = uid) then return jsonb_build_object('ok', false, 'error', 'no_profile'); end if;
  insert into push_subs (endpoint, user_id, p256dh, auth, msgs, daily, plays, rivals)
  values (p_endpoint, uid, p_p256dh, p_auth, coalesce(p_msgs, true), coalesce(p_daily, true), coalesce(p_plays, true), coalesce(p_rivals, true))
  on conflict (endpoint) do update set user_id = uid, p256dh = excluded.p256dh, auth = excluded.auth, msgs = excluded.msgs, daily = excluded.daily, plays = excluded.plays, rivals = excluded.rivals;
  delete from push_subs where user_id = uid and endpoint not in (select endpoint from push_subs where user_id = uid order by created_at desc limit 5);
  return jsonb_build_object('ok', true);
end $$;
revoke execute on function public.save_push_sub(text, text, text, boolean, boolean, boolean, boolean) from public, anon;
grant execute on function public.save_push_sub(text, text, text, boolean, boolean, boolean, boolean) to authenticated;

create or replace function public.my_push_sub(p_endpoint text) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object('msgs', msgs, 'daily', daily, 'plays', plays, 'rivals', rivals) from push_subs where endpoint = p_endpoint and user_id = auth.uid()
$$;

-- à chaque essai terminé, la base prévient la fonction Edge (jamais bloquant : une erreur ne doit pas empêcher d'enregistrer le score)
create or replace function public.attempts_push() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if old.submitted_at is null and new.submitted_at is not null and new.group_id is not null then
    perform public._push_call(jsonb_build_object('type', 'attempt', 'id', new.id));
  end if;
  return new;
exception when others then
  return new;
end $$;
drop trigger if exists attempts_push on public.attempts;
create trigger attempts_push after update of submitted_at on public.attempts for each row execute function public.attempts_push();
revoke execute on function public.attempts_push() from public, anon, authenticated;

-- ######## 20261129000000_catchup_ranking.sql ########
-- Rattrapages : les joueurs qui rattrapent un jeu sont classés AUSSI entre eux (v60).
-- Avant : chaque rattrapage était comparé aux seuls joueurs « du jour », jamais aux autres rattrapages. Deux rattrapages de 545 et 528 points
-- battaient donc le même nombre de joueurs : même place, mêmes boussoles. Maintenant leur place et leurs boussoles dépendent aussi des autres
-- rattrapages. Les joueurs « du jour » ne bougent pas (ni place ni boussoles) : « ton score est classé sans changer la place des autres ».
-- Les boussoles des rattrapages sont réécrites dans le registre à chaque nouveau rattrapage du même jour (elles peuvent varier tant que d'autres rattrapent).

drop function if exists public._group_scores(uuid, date, date);
create function public._group_scores(gid uuid, d1 date, d2 date)
returns table (play_day date, user_id uuid, best int, tries int, slow boolean, at timestamptz, pos int, n int, gems int,
               base int, bonus int, pct int, beaten int, fmt text, try_scores int[], mult int, boost boolean)
language sql stable security definer set search_path = public as $$
  with cfg as (select gems_per_rank, season_anchor, season_days from app_config where id = 1),
  played as (
    select a.day as play_day, a.user_id,
           max(round(a.score * case when bo.user_id is not null then 1.5 else 1 end)::int) as best,
           count(*)::int as tries, bool_or(a.slow > 1) as slow, max(a.submitted_at) as at, bool_or(a.catchup) as late,
           array_agg(round(a.score * case when bo.user_id is not null then 1.5 else 1 end)::int order by a.try_idx) as try_scores,
           bool_or(bo.user_id is not null) as boost
    from attempts a
    join group_members gm on gm.user_id = a.user_id and gm.group_id = gid
    left join boosts bo on bo.user_id = a.user_id and bo.group_id = a.group_id and bo.day = a.day
    where a.group_id = gid and a.submitted_at is not null and a.day between d1 and d2
    group by a.day, a.user_id
  ),
  reg as (
    select p.*, rank() over (partition by p.play_day order by p.best desc)::int as pos,
           count(*) over (partition by p.play_day)::int as n,
           count(*) over (partition by p.play_day order by p.best desc)::int as at_least
    from played p where not p.late
  ),
  lat as (
    select p.*,
           ((select count(*) from reg r where r.play_day = p.play_day and r.best > p.best)
            + (select count(*) from played l where l.play_day = p.play_day and l.late and l.best > p.best))::int + 1 as pos,
           ((select count(*) from reg r where r.play_day = p.play_day)
            + (select count(*) from played l where l.play_day = p.play_day and l.late))::int as n,
           ((select count(*) from reg r where r.play_day = p.play_day and r.best >= p.best)
            + (select count(*) from played l where l.play_day = p.play_day and l.late and l.best >= p.best))::int as at_least
    from played p where p.late
  ),
  ranked as (select * from reg union all select * from lat),
  calc as (
    select r.*, case when r.n >= 2 then cfg.gems_per_rank * (r.n - r.at_least + 1) else 0 end as base,
           case when extract(dow from r.play_day) = 0 then 2 else 1 end as mult,
           (5 * (((r.play_day - cfg.season_anchor) % cfg.season_days + cfg.season_days) % cfg.season_days))::int as pct
    from ranked r, cfg
  )
  select c.play_day, c.user_id, c.best, c.tries, c.slow, c.at, c.pos, c.n,
         c.base * c.mult + round(c.base * c.mult * c.pct / 100.0)::int, c.base, round(c.base * c.mult * c.pct / 100.0)::int, c.pct,
         c.n - c.at_least, public.format_of(c.play_day, gid), c.try_scores, c.mult, c.boost
  from calc c
$$;
revoke execute on function public._group_scores(uuid, date, date) from public, anon, authenticated;

-- à chaque rattrapage, on réécrit les boussoles de tous les rattrapages de ce jour (leur rang dépend maintenant les uns des autres)
create or replace function public.submit_score(p_attempt uuid, p_rounds jsonb, p_slow numeric default 1) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  a attempts; mx int; mults numeric[]; r jsonb; d int; p int; total int := 0; elapsed interval; fl text[] := '{}';
begin
  if uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  select * into a from attempts where id = p_attempt and user_id = uid for update;
  if not found then return jsonb_build_object('ok', false, 'error', 'unknown_attempt'); end if;
  if a.submitted_at is not null then return jsonb_build_object('ok', false, 'error', 'already_submitted'); end if;
  if p_slow not in (1, 1.5, 2) then return jsonb_build_object('ok', false, 'error', 'bad_slow'); end if;
  elapsed := now() - a.started_at;
  if elapsed > interval '60 minutes' then return jsonb_build_object('ok', false, 'error', 'expired'); end if;
  if elapsed < interval '20 seconds' then return jsonb_build_object('ok', false, 'error', 'too_fast'); end if;
  if jsonb_typeof(p_rounds) <> 'array' or jsonb_array_length(p_rounds) <> 3 then return jsonb_build_object('ok', false, 'error', 'bad_rounds'); end if;
  select max_points into mx from formats where key = a.fmt;
  select mult into mults from app_config where id = 1;
  begin
    for r in select * from jsonb_array_elements(p_rounds) loop
      d := (r ->> 'diff')::int; p := (r ->> 'pts')::int;
      if d is null or d not between 0 and 2 or p is null or p < 0 or p > ceil(mx * mults[d + 1]) then
        return jsonb_build_object('ok', false, 'error', 'bad_rounds');
      end if;
      total := total + p;
    end loop;
  exception when invalid_text_representation or numeric_value_out_of_range then
    return jsonb_build_object('ok', false, 'error', 'bad_rounds');
  end;
  if elapsed < interval '45 seconds' then fl := array_append(fl, 'fast'); end if;
  update attempts set submitted_at = now(), score = total, rounds = p_rounds, slow = p_slow, flags = fl where id = a.id;
  if a.catchup and a.group_id is not null then
    insert into gem_ledger (user_id, day, group_id, amount)
    select s.user_id, a.day, a.group_id, s.gems from public._group_scores(a.group_id, a.day, a.day) s
    where s.user_id in (select t.user_id from attempts t where t.group_id = a.group_id and t.day = a.day and t.catchup and t.submitted_at is not null)
    on conflict (user_id, day, (coalesce(group_id, '00000000-0000-0000-0000-000000000000'::uuid))) do update set amount = excluded.amount;
  end if;
  return jsonb_build_object('ok', true, 'score', total);
end $$;

-- une fois : recalcul des boussoles des rattrapages déjà joués
insert into gem_ledger (user_id, day, group_id, amount)
select s.user_id, x.day, x.group_id, s.gems
from (select distinct day, group_id from attempts where catchup and submitted_at is not null and group_id is not null) x
cross join lateral public._group_scores(x.group_id, x.day, x.day) s
where s.user_id in (select t.user_id from attempts t where t.group_id = x.group_id and t.day = x.day and t.catchup and t.submitted_at is not null)
on conflict (user_id, day, (coalesce(group_id, '00000000-0000-0000-0000-000000000000'::uuid))) do update set amount = excluded.amount;

-- ######## 20261130000000_pet_book.sql ########
-- =====================================================================================
-- Familiers synchronisés entre appareils (v78).
-- profiles.pet (déjà présent) reçoit désormais le familier équipé à chaque changement ; pet_book garde l'expérience de
-- chaque familier ({ espèce: { games, days, stage, shiny, bg } }). Lecture : soi-même (le client ne le demande que pour
-- son propre profil) ; écriture : le joueur sur son propre profil (règle profiles_update existante).
-- À appliquer AVANT de publier le code v78 ; sans effet sur les données existantes.
-- =====================================================================================
alter table public.profiles
  add column if not exists pet_book jsonb check (pet_book is null or pg_column_size(pet_book) < 20000);

-- ######## 20261202000000_gems_merit.sql ########
-- Boussoles plus méritocratiques (v82).
-- Avant : base = 16 × (nombre de joueurs battus + 1) : le gain dépendait de la taille du groupe (1er d'un jeu à 5 = 80, 5e d'un jeu à 10 = 96).
-- Maintenant : base = gems_max × ( moitié selon la PLACE en pourcentage + moitié selon le SCORE sur le maximum possible ) :
--     place   = (N − place) / (N − 1)            1er = 1, dernier = 0, ex æquo = même place, quelle que soit la taille du groupe ;
--     score   = meilleur score / (3 manches × points max × ×1,5), plafonné à 1 ;
--   le bonus de saison (+5 % par jour) et le ×2 du dimanche s'appliquent ensuite comme avant. Toujours rien s'il y a moins de 2 joueurs.
-- Le serveur reste seul juge : tout passe par _group_scores. Les jours déjà réglés de la SAISON EN COURS sont recalculés pour que les totaux
-- et les jours affichés restent cohérents (les saisons terminées ne bougent pas).
-- À appliquer AVANT de publier le code v82.
alter table public.app_config add column if not exists gems_max int not null default 200 check (gems_max between 20 and 2000);

drop function if exists public._group_scores(uuid, date, date);
create function public._group_scores(gid uuid, d1 date, d2 date)
returns table (play_day date, user_id uuid, best int, tries int, slow boolean, at timestamptz, pos int, n int, gems int,
               base int, bonus int, pct int, beaten int, fmt text, try_scores int[], mult int, boost boolean)
language sql stable security definer set search_path = public as $$
  with cfg as (select app_config.gems_max, app_config.mult[3] as m3, app_config.season_anchor, app_config.season_days from app_config where id = 1),
  played as (
    select a.day as play_day, a.user_id,
           max(round(a.score * case when bo.user_id is not null then 1.5 else 1 end)::int) as best,
           count(*)::int as tries, bool_or(a.slow > 1) as slow, max(a.submitted_at) as at, bool_or(a.catchup) as late,
           array_agg(round(a.score * case when bo.user_id is not null then 1.5 else 1 end)::int order by a.try_idx) as try_scores,
           bool_or(bo.user_id is not null) as boost
    from attempts a
    join group_members gm on gm.user_id = a.user_id and gm.group_id = gid
    left join boosts bo on bo.user_id = a.user_id and bo.group_id = a.group_id and bo.day = a.day
    where a.group_id = gid and a.submitted_at is not null and a.day between d1 and d2
    group by a.day, a.user_id
  ),
  reg as (
    select p.*, rank() over (partition by p.play_day order by p.best desc)::int as pos,
           count(*) over (partition by p.play_day)::int as n,
           count(*) over (partition by p.play_day order by p.best desc)::int as at_least
    from played p where not p.late
  ),
  lat as (
    select p.*,
           ((select count(*) from reg r where r.play_day = p.play_day and r.best > p.best)
            + (select count(*) from played l where l.play_day = p.play_day and l.late and l.best > p.best))::int + 1 as pos,
           ((select count(*) from reg r where r.play_day = p.play_day)
            + (select count(*) from played l where l.play_day = p.play_day and l.late))::int as n,
           ((select count(*) from reg r where r.play_day = p.play_day and r.best >= p.best)
            + (select count(*) from played l where l.play_day = p.play_day and l.late and l.best >= p.best))::int as at_least
    from played p where p.late
  ),
  ranked as (select * from reg union all select * from lat),
  calc as (
    select r.*,
           case when r.n >= 2 then
             round(cfg.gems_max * (
               0.5 * (r.n - r.pos)::numeric / (r.n - 1)
               + 0.5 * least(1::numeric, r.best::numeric / greatest(1::numeric,
                   3 * coalesce((select f.max_points from formats f where f.key = public.format_of(r.play_day, gid)), 100) * cfg.m3))
             ))::int
           else 0 end as base,
           case when extract(dow from r.play_day) = 0 then 2 else 1 end as mult,
           (5 * (((r.play_day - cfg.season_anchor) % cfg.season_days + cfg.season_days) % cfg.season_days))::int as pct
    from ranked r, cfg
  )
  select c.play_day, c.user_id, c.best, c.tries, c.slow, c.at, c.pos, c.n,
         c.base * c.mult + round(c.base * c.mult * c.pct / 100.0)::int, c.base, round(c.base * c.mult * c.pct / 100.0)::int, c.pct,
         c.n - c.at_least, public.format_of(c.play_day, gid), c.try_scores, c.mult, c.boost
  from calc c
$$;
revoke execute on function public._group_scores(uuid, date, date) from public, anon, authenticated;

-- une fois : recalcul des jours déjà réglés de la saison en cours (même formule partout)
insert into gem_ledger (user_id, day, group_id, amount)
select s.user_id, x.day, x.group_id, s.gems
from (
  select distinct a.day, a.group_id
  from attempts a, app_config c
  where a.submitted_at is not null and a.group_id is not null
    and a.day >= c.season_anchor + (((public.game_day() - c.season_anchor) / c.season_days) * c.season_days)
    and exists (select 1 from settled_days sd where sd.day = a.day)
) x
cross join lateral public._group_scores(x.group_id, x.day, x.day) s
on conflict (user_id, day, (coalesce(group_id, '00000000-0000-0000-0000-000000000000'::uuid))) do update set amount = excluded.amount;

-- ######## 20261203000000_mult_by_day.sql ########
-- Multiplicateurs de difficulté par jour de jeu (v84) : ×1 / ×1,5 / ×2 à partir du 30 novembre 2026 (début de la saison 3), ×1 / ×1,25 / ×1,5 avant.
-- « Gros risque, grosse récompense » : le moyen passe de ×1,25 à ×1,5 et le difficile de ×1,5 à ×2.
-- Chaque jour de jeu est évalué avec les coefficients de SON jour (_mult_at) : un rattrapage d'un jour ancien garde les anciens coefficients,
-- et le téléphone et le serveur bascule le même jour (14 h 30). Pour changer la date ou les coefficients :
--   update app_config set mult_from = date 'AAAA-MM-JJ', mult_new = '{1,1.5,2}' where id = 1;
-- (sur une base vide, rejouer cette ligne après le seed.) À appliquer AVANT le 30 novembre ; sans danger avant : rien ne change jusque-là.
alter table public.app_config add column if not exists mult_from date, add column if not exists mult_new numeric[];
update public.app_config set mult_new = '{1,1.5,2}', mult_from = date '2026-11-30' where id = 1;

create or replace function public._mult_at(p_day date) returns numeric[]
language sql stable security definer set search_path = public as $$
  select case when c.mult_from is not null and c.mult_new is not null and p_day >= c.mult_from then c.mult_new else c.mult end
  from app_config c where c.id = 1
$$;
revoke execute on function public._mult_at(date) from public, anon, authenticated;

-- le score est validé avec les coefficients du jour de l'essai
create or replace function public.submit_score(p_attempt uuid, p_rounds jsonb, p_slow numeric default 1) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  a attempts; mx int; mults numeric[]; r jsonb; d int; p int; total int := 0; elapsed interval; fl text[] := '{}';
begin
  if uid is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  select * into a from attempts where id = p_attempt and user_id = uid for update;
  if not found then return jsonb_build_object('ok', false, 'error', 'unknown_attempt'); end if;
  if a.submitted_at is not null then return jsonb_build_object('ok', false, 'error', 'already_submitted'); end if;
  if p_slow not in (1, 1.5, 2) then return jsonb_build_object('ok', false, 'error', 'bad_slow'); end if;
  elapsed := now() - a.started_at;
  if elapsed > interval '60 minutes' then return jsonb_build_object('ok', false, 'error', 'expired'); end if;
  if elapsed < interval '20 seconds' then return jsonb_build_object('ok', false, 'error', 'too_fast'); end if;
  if jsonb_typeof(p_rounds) <> 'array' or jsonb_array_length(p_rounds) <> 3 then return jsonb_build_object('ok', false, 'error', 'bad_rounds'); end if;
  select max_points into mx from formats where key = a.fmt;
  mults := public._mult_at(a.day); -- coefficients du jour de jeu (v84)
  begin
    for r in select * from jsonb_array_elements(p_rounds) loop
      d := (r ->> 'diff')::int; p := (r ->> 'pts')::int;
      if d is null or d not between 0 and 2 or p is null or p < 0 or p > ceil(mx * mults[d + 1]) then
        return jsonb_build_object('ok', false, 'error', 'bad_rounds');
      end if;
      total := total + p;
    end loop;
  exception when invalid_text_representation or numeric_value_out_of_range then
    return jsonb_build_object('ok', false, 'error', 'bad_rounds');
  end;
  if elapsed < interval '45 seconds' then fl := array_append(fl, 'fast'); end if;
  update attempts set submitted_at = now(), score = total, rounds = p_rounds, slow = p_slow, flags = fl where id = a.id;
  if a.catchup and a.group_id is not null then
    insert into gem_ledger (user_id, day, group_id, amount)
    select s.user_id, a.day, a.group_id, s.gems from public._group_scores(a.group_id, a.day, a.day) s
    where s.user_id in (select t.user_id from attempts t where t.group_id = a.group_id and t.day = a.day and t.catchup and t.submitted_at is not null)
    on conflict (user_id, day, (coalesce(group_id, '00000000-0000-0000-0000-000000000000'::uuid))) do update set amount = excluded.amount;
  end if;
  return jsonb_build_object('ok', true, 'score', total);
end $$;


-- la part « score » des boussoles se mesure au maximum possible du jour
drop function if exists public._group_scores(uuid, date, date);
create function public._group_scores(gid uuid, d1 date, d2 date)
returns table (play_day date, user_id uuid, best int, tries int, slow boolean, at timestamptz, pos int, n int, gems int,
               base int, bonus int, pct int, beaten int, fmt text, try_scores int[], mult int, boost boolean)
language sql stable security definer set search_path = public as $$
  with cfg as (select app_config.gems_max, app_config.season_anchor, app_config.season_days from app_config where id = 1),
  played as (
    select a.day as play_day, a.user_id,
           max(round(a.score * case when bo.user_id is not null then 1.5 else 1 end)::int) as best,
           count(*)::int as tries, bool_or(a.slow > 1) as slow, max(a.submitted_at) as at, bool_or(a.catchup) as late,
           array_agg(round(a.score * case when bo.user_id is not null then 1.5 else 1 end)::int order by a.try_idx) as try_scores,
           bool_or(bo.user_id is not null) as boost
    from attempts a
    join group_members gm on gm.user_id = a.user_id and gm.group_id = gid
    left join boosts bo on bo.user_id = a.user_id and bo.group_id = a.group_id and bo.day = a.day
    where a.group_id = gid and a.submitted_at is not null and a.day between d1 and d2
    group by a.day, a.user_id
  ),
  reg as (
    select p.*, rank() over (partition by p.play_day order by p.best desc)::int as pos,
           count(*) over (partition by p.play_day)::int as n,
           count(*) over (partition by p.play_day order by p.best desc)::int as at_least
    from played p where not p.late
  ),
  lat as (
    select p.*,
           ((select count(*) from reg r where r.play_day = p.play_day and r.best > p.best)
            + (select count(*) from played l where l.play_day = p.play_day and l.late and l.best > p.best))::int + 1 as pos,
           ((select count(*) from reg r where r.play_day = p.play_day)
            + (select count(*) from played l where l.play_day = p.play_day and l.late))::int as n,
           ((select count(*) from reg r where r.play_day = p.play_day and r.best >= p.best)
            + (select count(*) from played l where l.play_day = p.play_day and l.late and l.best >= p.best))::int as at_least
    from played p where p.late
  ),
  ranked as (select * from reg union all select * from lat),
  calc as (
    select r.*,
           case when r.n >= 2 then
             round(cfg.gems_max * (
               0.5 * (r.n - r.pos)::numeric / (r.n - 1)
               + 0.5 * least(1::numeric, r.best::numeric / greatest(1::numeric,
                   3 * coalesce((select f.max_points from formats f where f.key = public.format_of(r.play_day, gid)), 100) * (public._mult_at(r.play_day))[3]))
             ))::int
           else 0 end as base,
           case when extract(dow from r.play_day) = 0 then 2 else 1 end as mult,
           (5 * (((r.play_day - cfg.season_anchor) % cfg.season_days + cfg.season_days) % cfg.season_days))::int as pct
    from ranked r, cfg
  )
  select c.play_day, c.user_id, c.best, c.tries, c.slow, c.at, c.pos, c.n,
         c.base * c.mult + round(c.base * c.mult * c.pct / 100.0)::int, c.base, round(c.base * c.mult * c.pct / 100.0)::int, c.pct,
         c.n - c.at_least, public.format_of(c.play_day, gid), c.try_scores, c.mult, c.boost
  from calc c
$$;
revoke execute on function public._group_scores(uuid, date, date) from public, anon, authenticated;

