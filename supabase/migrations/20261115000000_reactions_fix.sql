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
