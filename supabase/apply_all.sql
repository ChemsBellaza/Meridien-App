-- Méridien lot 3 : tout en un (migrations dans l'ordre + seed). Pour un projet VIERGE uniquement.
-- Pour un projet déjà en place, n'appliquer que les migrations récentes (voir docs/LOT3-MAQUETTE.md).

-- ===== 20261112000000_lot3_init.sql =====
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


-- ===== 20261113000000_season_overview.sql =====
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


-- ===== seed.sql =====
-- GÉNÉRÉ par scripts/gen-supabase-seed.py à partir de src/p1_config.js : ne pas modifier à la main.

insert into public.app_config (id, tries_per_day, gems_per_rank, joker_cost, mult, format_anchor, season_anchor, season_days, timezone)
values (1, 2, 16, 25, '{1,1.25,1.5}', date '2026-10-25', date '2026-10-19', 28, 'Europe/Paris')
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
  (27, 'blocs', 300)
on conflict (position) do update set key = excluded.key, max_points = excluded.max_points;
