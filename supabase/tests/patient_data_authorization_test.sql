begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, auth, extensions;

select plan(26);

-- Fixed, non-production identities. The entire test is rolled back.
insert into auth.users (id, email, raw_user_meta_data)
values
  ('10000000-0000-0000-0000-000000000001', 'rls-patient-a@test.invalid', '{"account_type":"patient"}'::jsonb),
  ('10000000-0000-0000-0000-000000000002', 'rls-patient-b@test.invalid', '{"account_type":"patient"}'::jsonb),
  ('20000000-0000-0000-0000-000000000001', 'rls-dietitian-verified@test.invalid', '{"account_type":"dietitian"}'::jsonb),
  ('20000000-0000-0000-0000-000000000002', 'rls-dietitian-pending@test.invalid', '{"account_type":"dietitian"}'::jsonb),
  ('30000000-0000-0000-0000-000000000001', 'rls-regular-user@test.invalid', '{"account_type":"patient"}'::jsonb);

update public.dietitian_profiles
set verification_status = 'verified', verified_at = now()
where user_id = '20000000-0000-0000-0000-000000000001';

insert into public.food_entries (id, user_id, food_name, meal_type)
values
  ('40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Patient A meal', 'lunch'),
  ('40000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'Patient B meal', 'lunch');

insert into public.symptom_entries (id, user_id, symptom_type, severity)
values
  ('50000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'buikpijn', 4),
  ('50000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'misselijkheid', 2);

insert into public.patient_dietitian_links (
  id, dietitian_id, patient_id, invite_code, status,
  share_food, share_symptoms, share_phases, share_products, accepted_at
)
values (
  '60000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  'RLS-TEST-LINK', 'active', true, false, false, false, now()
);

-- Patient A can read only their own journal.
set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);

select results_eq(
  $$ select food_name from public.food_entries order by food_name $$,
  array['Patient A meal']::text[],
  'patient A sees only their own food entry'
);
select results_eq(
  $$ select symptom_type from public.symptom_entries order by symptom_type $$,
  array['buikpijn']::text[],
  'patient A sees only their own symptom entry'
);
select throws_ok(
  $$ insert into public.food_entries (user_id, food_name, meal_type)
     values ('10000000-0000-0000-0000-000000000002', 'Forbidden entry', 'lunch') $$,
  '42501',
  'new row violates row-level security policy for table "food_entries"',
  'patient A cannot create an entry for patient B'
);
select is(
  (select count(*)::bigint from public.patient_dietitian_links),
  1::bigint,
  'patient A can see their own active care link'
);

-- Patient B remains isolated from patient A and their care link.
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000002', true);
select results_eq(
  $$ select food_name from public.food_entries order by food_name $$,
  array['Patient B meal']::text[],
  'patient B sees only their own food entry'
);
select is(
  (select count(*)::bigint from public.patient_dietitian_links),
  0::bigint,
  'unrelated patient cannot see another patient care link'
);
select is(public.has_patient_access('10000000-0000-0000-0000-000000000001', 'food'), false, 'patient B is not treated as a dietitian');

-- A pending dietitian never receives patient access.
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '20000000-0000-0000-0000-000000000002', true);
select is(public.is_verified_dietitian(), false, 'pending dietitian is not verified');
select is(public.has_patient_access('10000000-0000-0000-0000-000000000001', 'food'), false, 'pending dietitian has no patient access');
select is((select count(*)::bigint from public.food_entries), 0::bigint, 'pending dietitian sees no patient food');
select is((select count(*)::bigint from public.symptom_entries), 0::bigint, 'pending dietitian sees no patient symptoms');

-- Verified, linked dietitian receives only the explicitly shared scope.
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '20000000-0000-0000-0000-000000000001', true);
select is(public.is_verified_dietitian(), true, 'verified dietitian is recognized');
select is(public.has_patient_access('10000000-0000-0000-0000-000000000001', 'food'), true, 'linked dietitian receives food scope');
select is(public.has_patient_access('10000000-0000-0000-0000-000000000001', 'symptoms'), false, 'unshared symptom scope is denied');
select results_eq(
  $$ select food_name from public.food_entries order by food_name $$,
  array['Patient A meal']::text[],
  'linked dietitian sees shared patient A food only'
);
select is((select count(*)::bigint from public.symptom_entries), 0::bigint, 'linked dietitian sees no unshared symptoms');

-- Expanding consent exposes only the newly shared scope.
reset role;
update public.patient_dietitian_links
set share_symptoms = true
where id = '60000000-0000-0000-0000-000000000001';
set local role authenticated;
select set_config('request.jwt.claim.sub', '20000000-0000-0000-0000-000000000001', true);
select is(public.has_patient_access('10000000-0000-0000-0000-000000000001', 'symptoms'), true, 'explicitly shared symptom scope is granted');
select results_eq(
  $$ select symptom_type from public.symptom_entries order by symptom_type $$,
  array['buikpijn']::text[],
  'linked dietitian sees shared patient A symptoms only'
);

-- Revocation must terminate every scope immediately.
reset role;
update public.patient_dietitian_links
set status = 'revoked', revoked_at = now()
where id = '60000000-0000-0000-0000-000000000001';
set local role authenticated;
select set_config('request.jwt.claim.sub', '20000000-0000-0000-0000-000000000001', true);
select is(public.has_patient_access('10000000-0000-0000-0000-000000000001', 'food'), false, 'revocation removes food scope immediately');
select is(public.has_patient_access('10000000-0000-0000-0000-000000000001', 'symptoms'), false, 'revocation removes symptom scope immediately');
select is((select count(*)::bigint from public.food_entries), 0::bigint, 'revoked dietitian sees no patient food');
select is((select count(*)::bigint from public.symptom_entries), 0::bigint, 'revoked dietitian sees no patient symptoms');

-- A regular signed-in user cannot call admin functionality.
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '30000000-0000-0000-0000-000000000001', true);
select is(public.is_app_admin(), false, 'regular user is not an administrator');
select throws_ok(
  $$ select public.get_admin_dashboard_stats() $$,
  '42501',
  'not authorized',
  'regular user cannot retrieve admin statistics'
);

-- Anonymous role has no direct journal or privileged-function access.
reset role;
set local role anon;
select throws_ok(
  $$ select * from public.food_entries $$,
  '42501',
  'permission denied for table food_entries',
  'anonymous visitor cannot read food entries'
);
select is(
  has_function_privilege('anon', 'public.get_admin_dashboard_stats()', 'execute'),
  false,
  'anonymous role cannot execute admin statistics RPC'
);

select * from finish();
rollback;
