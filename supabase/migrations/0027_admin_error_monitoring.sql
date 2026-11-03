-- Privacy-conscious application error monitoring for administrators.
-- Stores only technical metadata; never health entries, email addresses or raw stack traces.

create table if not exists public.app_monitoring_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null check (event_type in ('client_error', 'route_error')),
  path text not null check (char_length(path) between 1 and 240),
  error_code text check (error_code is null or char_length(error_code) <= 120),
  created_at timestamptz not null default now()
);

create index if not exists app_monitoring_events_created_at_idx
  on public.app_monitoring_events (created_at desc);

alter table public.app_monitoring_events enable row level security;
revoke all on table public.app_monitoring_events from public, anon, authenticated;
grant insert on table public.app_monitoring_events to authenticated;
grant usage, select on sequence public.app_monitoring_events_id_seq to authenticated;

drop policy if exists "monitoring_insert_own" on public.app_monitoring_events;
create policy "monitoring_insert_own"
  on public.app_monitoring_events
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create or replace function public.get_admin_monitoring_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  result jsonb;
begin
  if (select auth.uid()) is null or not exists (
    select 1 from public.app_admins a
    where a.user_id = (select auth.uid())
  ) then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'generated_at', now(),
    'errors_last_24h', count(*) filter (where created_at >= now() - interval '24 hours'),
    'errors_last_7d', count(*) filter (where created_at >= now() - interval '7 days'),
    'last_error_at', max(created_at),
    'recent_events', coalesce((
      select jsonb_agg(jsonb_build_object(
        'event_type', recent.event_type,
        'path', recent.path,
        'error_code', recent.error_code,
        'created_at', recent.created_at
      ) order by recent.created_at desc)
      from (
        select event_type, path, error_code, created_at
        from public.app_monitoring_events
        order by created_at desc
        limit 8
      ) recent
    ), '[]'::jsonb)
  ) into result
  from public.app_monitoring_events;

  return result;
end;
$$;

revoke all on function public.get_admin_monitoring_stats() from public, anon;
grant execute on function public.get_admin_monitoring_stats() to authenticated;
