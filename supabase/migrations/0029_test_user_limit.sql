-- Keep the public test phase limited to 100 Supabase Auth users.
-- The trigger is the race-safe enforcement point; the RPC only improves UX.

create or replace function public.is_test_registration_open()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select count(*) from auth.users) < 100;
$$;

revoke all privileges on function public.is_test_registration_open() from public;
grant execute on function public.is_test_registration_open() to anon, authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  consent_given boolean := new.raw_user_meta_data->>'health_data_consent' = 'true';
  notice_version text := nullif(left(coalesce(new.raw_user_meta_data->>'privacy_notice_version', ''), 40), '');
begin
  -- Serialize registrations so simultaneous signups cannot pass the cap together.
  perform pg_advisory_xact_lock(637244100);

  -- This is an AFTER INSERT trigger, so the new auth user is already included.
  if (select count(*) from auth.users) > 100 then
    raise exception 'test_user_limit_reached' using errcode = 'P0001';
  end if;

  insert into public.profiles (id, preferred_language, health_data_consent_at, privacy_notice_version)
  values (
    new.id,
    case when new.raw_user_meta_data->>'preferred_language' in ('nl', 'fr', 'de', 'en')
      then new.raw_user_meta_data->>'preferred_language' else 'en' end,
    case when consent_given and notice_version is not null then now() else null end,
    case when consent_given then notice_version else null end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all privileges on function public.handle_new_user() from public, anon, authenticated;

