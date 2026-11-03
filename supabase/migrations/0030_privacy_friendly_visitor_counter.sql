-- Privacy-friendly visitor counts. No IP address, user agent, email or health data is stored.
create extension if not exists pgcrypto with schema extensions;

create table if not exists public.app_visitors (
  visitor_hash text primary key check (char_length(visitor_hash) = 64),
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  session_count bigint not null default 1 check (session_count > 0)
);

create table if not exists public.app_visit_sessions (
  session_hash text primary key check (char_length(session_hash) = 64),
  visitor_hash text not null references public.app_visitors(visitor_hash) on delete cascade,
  visited_at timestamptz not null default now()
);

create index if not exists app_visit_sessions_visited_at_idx on public.app_visit_sessions (visited_at desc);
alter table public.app_visitors enable row level security;
alter table public.app_visit_sessions enable row level security;
revoke all on public.app_visitors, public.app_visit_sessions from public, anon, authenticated;

create or replace function public.record_app_visit(visitor_id uuid, session_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  visitor_key text := encode(extensions.digest(visitor_id::text, 'sha256'), 'hex');
  session_key text := encode(extensions.digest(session_id::text, 'sha256'), 'hex');
  inserted_session text;
begin
  insert into public.app_visitors (visitor_hash)
  values (visitor_key)
  on conflict (visitor_hash) do update set last_seen_at = now();

  insert into public.app_visit_sessions (session_hash, visitor_hash)
  values (session_key, visitor_key)
  on conflict (session_hash) do nothing
  returning session_hash into inserted_session;

  if inserted_session is not null then
    update public.app_visitors
      set session_count = (select count(*) from public.app_visit_sessions s where s.visitor_hash = visitor_key),
          last_seen_at = now()
      where visitor_hash = visitor_key;
  end if;
end;
$$;

revoke all on function public.record_app_visit(uuid, uuid) from public;
grant execute on function public.record_app_visit(uuid, uuid) to anon, authenticated;

create or replace function public.reset_app_visitor_stats()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null or not exists (
    select 1 from public.app_admins a where a.user_id = (select auth.uid())
  ) then raise exception 'not authorized' using errcode = '42501'; end if;
  truncate table public.app_visit_sessions, public.app_visitors;
end;
$$;

revoke all on function public.reset_app_visitor_stats() from public, anon;
grant execute on function public.reset_app_visitor_stats() to authenticated;

create or replace function public.get_admin_monitoring_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare result jsonb;
begin
  if (select auth.uid()) is null or not exists (
    select 1 from public.app_admins a where a.user_id = (select auth.uid())
  ) then raise exception 'not authorized' using errcode = '42501'; end if;

  select jsonb_build_object(
    'generated_at', now(),
    'errors_last_24h', count(*) filter (where created_at >= now() - interval '24 hours'),
    'errors_last_7d', count(*) filter (where created_at >= now() - interval '7 days'),
    'last_error_at', max(created_at),
    'unique_visitors', (select count(*) from public.app_visitors),
    'total_visit_sessions', (select count(*) from public.app_visit_sessions),
    'visits_today', (select count(*) from public.app_visit_sessions where visited_at >= date_trunc('day', now() at time zone 'Europe/Amsterdam') at time zone 'Europe/Amsterdam'),
    'visitor_tracking_started_at', (select min(first_seen_at) from public.app_visitors),
    'recent_events', coalesce((select jsonb_agg(jsonb_build_object('event_type', recent.event_type,'path', recent.path,'error_code', recent.error_code,'created_at', recent.created_at) order by recent.created_at desc) from (select event_type,path,error_code,created_at from public.app_monitoring_events order by created_at desc limit 8) recent), '[]'::jsonb)
  ) into result from public.app_monitoring_events;
  return result;
end;
$$;

revoke all on function public.get_admin_monitoring_stats() from public, anon;
grant execute on function public.get_admin_monitoring_stats() to authenticated;
