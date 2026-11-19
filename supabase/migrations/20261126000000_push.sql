-- Notifications push (v36) : nouveau jeu à 14 h 30 (heure de Barcelone) et messages du groupe.
-- Fonctionnement : le téléphone s'abonne (save_push_sub) ; la base appelle la fonction Edge « push » (extension pg_net) :
--   - à chaque nouveau message (déclencheur) ;
--   - chaque jour à 14 h 30 (deux tâches pg_cron, l'heure d'hiver et l'heure d'été ; la fonction ne s'exécute qu'une fois par jour).
-- La fonction « push » (supabase/functions/push/index.ts) crée elle-même les clés VAPID au premier appel et les range dans
-- push_keys : aucune clé secrète à copier, ni dans le dépôt ni dans une conversation.
-- À appliquer APRÈS les migrations précédentes ; puis créer la fonction Edge « push » (voir CLAUDE.md).

create extension if not exists pg_net;

alter table public.app_config add column if not exists push_url text;
update public.app_config set push_url = 'https://objfbehephvvaogmblhj.supabase.co/functions/v1/push' where id = 1 and push_url is null;

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
