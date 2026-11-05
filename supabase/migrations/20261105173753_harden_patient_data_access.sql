-- Security release: enforce the 100-account test limit and explicitly narrow
-- EXECUTE privileges on all privileged public RPCs. This migration assumes
-- migrations 0001 through 0032 have already been applied.
begin;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  consent_given boolean := new.raw_user_meta_data->>'health_data_consent' = 'true';
  notice_version text := nullif(left(coalesce(new.raw_user_meta_data->>'privacy_notice_version', ''), 40), '');
  kind text := case when new.raw_user_meta_data->>'account_type' = 'dietitian' then 'dietitian' else 'patient' end;
begin
  -- Serialize registrations so concurrent requests cannot pass the cap.
  perform pg_advisory_xact_lock(637244100);
  if (select count(*) from auth.users) >= 100 then
    raise exception 'test_user_limit_reached' using errcode = 'P0001';
  end if;

  insert into public.profiles (
    id, preferred_language, health_data_consent_at, privacy_notice_version, account_type
  ) values (
    new.id,
    case
      when new.raw_user_meta_data->>'preferred_language' in ('nl', 'fr', 'de', 'en')
        then new.raw_user_meta_data->>'preferred_language'
      else 'en'
    end,
    case when consent_given and notice_version is not null then now() else null end,
    case when consent_given then notice_version else null end,
    kind
  ) on conflict (id) do nothing;

  if kind = 'dietitian' then
    insert into public.dietitian_profiles (user_id)
    values (new.id)
    on conflict do nothing;
  end if;

  return new;
end;
$$;

-- Future functions should not automatically become callable through PUBLIC.
alter default privileges for role postgres in schema public
  revoke execute on functions from public;

-- Trigger-only function: never callable by API roles.
revoke all on function public.handle_new_user() from public, anon, authenticated;

-- Authenticated RPCs. Their bodies also perform ownership/admin checks.
revoke all on function public.is_app_admin() from public, anon, authenticated;
revoke all on function public.get_admin_dashboard_stats() from public, anon, authenticated;
revoke all on function public.get_admin_monitoring_stats() from public, anon, authenticated;
revoke all on function public.reset_app_visitor_stats() from public, anon, authenticated;
revoke all on function public.delete_own_account() from public, anon, authenticated;
revoke all on function public.is_verified_dietitian(uuid) from public, anon, authenticated;
revoke all on function public.has_patient_access(uuid, text) from public, anon, authenticated;
revoke all on function public.create_patient_invitation() from public, anon, authenticated;
revoke all on function public.get_invitation_details(text) from public, anon, authenticated;
revoke all on function public.accept_patient_invitation(text) from public, anon, authenticated;
revoke all on function public.revoke_patient_access(uuid) from public, anon, authenticated;
revoke all on function public.record_patient_access(uuid, text) from public, anon, authenticated;
revoke all on function public.set_dietitian_verification(uuid, boolean) from public, anon, authenticated;

grant execute on function public.is_app_admin() to authenticated;
grant execute on function public.get_admin_dashboard_stats() to authenticated;
grant execute on function public.get_admin_monitoring_stats() to authenticated;
grant execute on function public.reset_app_visitor_stats() to authenticated;
grant execute on function public.delete_own_account() to authenticated;
grant execute on function public.is_verified_dietitian(uuid) to authenticated;
grant execute on function public.has_patient_access(uuid, text) to authenticated;
grant execute on function public.create_patient_invitation() to authenticated;
grant execute on function public.get_invitation_details(text) to authenticated;
grant execute on function public.accept_patient_invitation(text) to authenticated;
grant execute on function public.revoke_patient_access(uuid) to authenticated;
grant execute on function public.record_patient_access(uuid, text) to authenticated;
grant execute on function public.set_dietitian_verification(uuid, boolean) to authenticated;

-- These two intentionally support signed-out application flows and contain no
-- patient data. Keep their access explicit rather than inherited from PUBLIC.
revoke all on function public.is_test_registration_open() from public, anon, authenticated;
revoke all on function public.record_app_visit(uuid, uuid) from public, anon, authenticated;
grant execute on function public.is_test_registration_open() to anon, authenticated;
grant execute on function public.record_app_visit(uuid, uuid) to anon, authenticated;

commit;
