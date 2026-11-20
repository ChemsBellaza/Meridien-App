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
