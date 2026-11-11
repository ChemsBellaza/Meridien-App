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
