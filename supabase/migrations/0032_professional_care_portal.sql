-- Consent-based dietitian portal. Existing patient-owned journals remain the source of truth.
begin;

alter table public.profiles add column if not exists account_type text not null default 'patient'
  check (account_type in ('patient','dietitian'));

create table if not exists public.dietitian_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  professional_name text check (professional_name is null or char_length(professional_name)<=120),
  registration_number text check (registration_number is null or char_length(registration_number)<=80),
  verification_status text not null default 'pending' check (verification_status in ('pending','verified','rejected')),
  verified_at timestamptz, verified_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.patient_dietitian_links (
  id uuid primary key default gen_random_uuid(), dietitian_id uuid not null references auth.users(id) on delete cascade,
  patient_id uuid references auth.users(id) on delete cascade, invite_code text not null unique,
  status text not null default 'pending' check(status in ('pending','active','revoked','expired')),
  share_food boolean not null default true, share_symptoms boolean not null default true,
  share_phases boolean not null default true, share_products boolean not null default true,
  invited_at timestamptz not null default now(), accepted_at timestamptz, revoked_at timestamptz,
  unique(dietitian_id,patient_id)
);
create index if not exists patient_dietitian_patient_idx on public.patient_dietitian_links(patient_id,status);
create index if not exists patient_dietitian_dietitian_idx on public.patient_dietitian_links(dietitian_id,status);

create table if not exists public.care_plans (
 id uuid primary key default gen_random_uuid(), link_id uuid not null references public.patient_dietitian_links(id) on delete cascade,
 dietitian_id uuid not null references auth.users(id) on delete cascade, patient_id uuid not null references auth.users(id) on delete cascade,
 title text not null check(char_length(title) between 2 and 120), goals text not null check(char_length(goals) between 2 and 2000),
 status text not null default 'active' check(status in ('draft','active','completed')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.care_notes (
 id uuid primary key default gen_random_uuid(), link_id uuid not null references public.patient_dietitian_links(id) on delete cascade,
 dietitian_id uuid not null references auth.users(id) on delete cascade, patient_id uuid not null references auth.users(id) on delete cascade,
 note text not null check(char_length(note) between 2 and 2000), shared_with_patient boolean not null default true,
 created_at timestamptz not null default now()
);
create table if not exists public.care_audit_logs (
 id bigint generated always as identity primary key, actor_id uuid not null references auth.users(id) on delete cascade,
 patient_id uuid not null references auth.users(id) on delete cascade, action text not null check(char_length(action)<=80),
 created_at timestamptz not null default now()
);

create or replace function public.is_verified_dietitian(uid uuid default auth.uid()) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.dietitian_profiles d where d.user_id=uid and d.verification_status='verified'); $$;
create or replace function public.has_patient_access(pid uuid, scope text default 'all') returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.patient_dietitian_links l where l.dietitian_id=auth.uid() and l.patient_id=pid and l.status='active'
 and public.is_verified_dietitian(auth.uid()) and case scope when 'food' then l.share_food when 'symptoms' then l.share_symptoms when 'phases' then l.share_phases when 'products' then l.share_products else true end); $$;

create or replace function public.create_patient_invitation() returns text language plpgsql security definer set search_path='' as $$
declare code text:=upper(encode(gen_random_bytes(6),'hex')); begin
 if not public.is_verified_dietitian(auth.uid()) then raise exception 'dietitian_not_verified' using errcode='42501'; end if;
 insert into public.patient_dietitian_links(dietitian_id,invite_code) values(auth.uid(),code); return code; end; $$;
create or replace function public.get_invitation_details(code text) returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('code',l.invite_code,'dietitian_name',coalesce(d.professional_name,p.display_name,'Diëtist'),'status',l.status,
 'share_food',l.share_food,'share_symptoms',l.share_symptoms,'share_phases',l.share_phases,'share_products',l.share_products)
 from public.patient_dietitian_links l join public.dietitian_profiles d on d.user_id=l.dietitian_id join public.profiles p on p.id=l.dietitian_id
 where l.invite_code=upper(code) and l.status='pending' and d.verification_status='verified'; $$;
create or replace function public.accept_patient_invitation(code text) returns void language plpgsql security definer set search_path='' as $$
begin
 if not exists(select 1 from public.profiles p where p.id=auth.uid() and p.account_type='patient') then raise exception 'patient_only' using errcode='42501'; end if;
 update public.patient_dietitian_links set patient_id=auth.uid(),status='active',accepted_at=now()
 where invite_code=upper(code) and status='pending' and exists(select 1 from public.dietitian_profiles d where d.user_id=dietitian_id and d.verification_status='verified');
 if not found then raise exception 'invalid_invitation'; end if; end; $$;
create or replace function public.revoke_patient_access(link uuid) returns void language plpgsql security definer set search_path='' as $$
begin update public.patient_dietitian_links set status='revoked',revoked_at=now() where id=link and patient_id=auth.uid() and status='active'; if not found then raise exception 'not_allowed' using errcode='42501'; end if; end; $$;
create or replace function public.record_patient_access(pid uuid, event text) returns void language plpgsql security definer set search_path='' as $$
begin if not public.has_patient_access(pid,'all') then raise exception 'not_allowed' using errcode='42501'; end if; insert into public.care_audit_logs(actor_id,patient_id,action) values(auth.uid(),pid,left(event,80)); end; $$;
create or replace function public.set_dietitian_verification(target uuid, approved boolean) returns void language plpgsql security definer set search_path='' as $$
begin if not exists(select 1 from public.app_admins a where a.user_id=auth.uid()) then raise exception 'not_allowed' using errcode='42501'; end if;
 update public.dietitian_profiles set verification_status=case when approved then 'verified' else 'rejected' end,verified_at=case when approved then now() else null end,verified_by=auth.uid(),updated_at=now() where user_id=target; end; $$;

alter table public.dietitian_profiles enable row level security; alter table public.patient_dietitian_links enable row level security;
alter table public.care_plans enable row level security; alter table public.care_notes enable row level security; alter table public.care_audit_logs enable row level security;
revoke all on public.dietitian_profiles,public.patient_dietitian_links,public.care_plans,public.care_notes,public.care_audit_logs from public,anon;
grant select on public.dietitian_profiles to authenticated; grant update(professional_name,registration_number,updated_at) on public.dietitian_profiles to authenticated; grant select on public.patient_dietitian_links to authenticated;
grant select,insert,update on public.care_plans,public.care_notes to authenticated;
create policy dietitian_profile_own on public.dietitian_profiles for select to authenticated using(user_id=auth.uid());
create policy dietitian_profile_admin_select on public.dietitian_profiles for select to authenticated using(public.is_app_admin());
create policy dietitian_profile_update_own on public.dietitian_profiles for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy care_links_parties on public.patient_dietitian_links for select to authenticated using(dietitian_id=auth.uid() or patient_id=auth.uid());
create policy care_plans_parties on public.care_plans for select to authenticated using(patient_id=auth.uid() or public.has_patient_access(patient_id,'all'));
create policy care_plans_dietitian_insert on public.care_plans for insert to authenticated with check(dietitian_id=auth.uid() and public.has_patient_access(patient_id,'all'));
create policy care_plans_dietitian_update on public.care_plans for update to authenticated using(dietitian_id=auth.uid() and public.has_patient_access(patient_id,'all')) with check(dietitian_id=auth.uid() and public.has_patient_access(patient_id,'all'));
create policy care_notes_parties on public.care_notes for select to authenticated using((patient_id=auth.uid() and shared_with_patient) or public.has_patient_access(patient_id,'all'));
create policy care_notes_dietitian_insert on public.care_notes for insert to authenticated with check(dietitian_id=auth.uid() and public.has_patient_access(patient_id,'all'));

create policy profiles_dietitian_linked on public.profiles for select to authenticated using(public.has_patient_access(id,'all'));
create policy profiles_linked_dietitian_for_patient on public.profiles for select to authenticated using(exists(select 1 from public.patient_dietitian_links l where l.patient_id=auth.uid() and l.dietitian_id=id and l.status='active'));
create policy food_entries_dietitian_linked on public.food_entries for select to authenticated using(public.has_patient_access(user_id,'food'));
create policy symptom_entries_dietitian_linked on public.symptom_entries for select to authenticated using(public.has_patient_access(user_id,'symptoms'));
create policy diet_phases_dietitian_linked on public.diet_phases for select to authenticated using(public.has_patient_access(user_id,'phases'));
create policy reintro_challenges_dietitian_linked on public.reintroduction_challenges for select to authenticated using(public.has_patient_access(user_id,'phases'));
create policy reintro_logs_dietitian_linked on public.reintroduction_logs for select to authenticated using(public.has_patient_access(user_id,'phases'));
create policy tolerance_dietitian_linked on public.fodmap_tolerance_profile for select to authenticated using(public.has_patient_access(user_id,'phases'));
create policy scan_evidence_dietitian_linked on public.product_scan_evidence for select to authenticated using(public.has_patient_access(user_id,'products'));

revoke all on function public.is_verified_dietitian(uuid),public.has_patient_access(uuid,text),public.create_patient_invitation(),public.get_invitation_details(text),public.accept_patient_invitation(text),public.revoke_patient_access(uuid),public.record_patient_access(uuid,text),public.set_dietitian_verification(uuid,boolean) from public,anon;
grant execute on function public.is_verified_dietitian(uuid),public.has_patient_access(uuid,text),public.create_patient_invitation(),public.get_invitation_details(text),public.accept_patient_invitation(text),public.revoke_patient_access(uuid),public.record_patient_access(uuid,text),public.set_dietitian_verification(uuid,boolean) to authenticated;

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path='' as $$
declare consent_given boolean:=new.raw_user_meta_data->>'health_data_consent'='true'; notice_version text:=nullif(left(coalesce(new.raw_user_meta_data->>'privacy_notice_version',''),40),''); kind text:=case when new.raw_user_meta_data->>'account_type'='dietitian' then 'dietitian' else 'patient' end;
begin perform pg_advisory_xact_lock(637244100); if (select count(*) from auth.users)>100 then raise exception 'test_user_limit_reached' using errcode='P0001'; end if;
 insert into public.profiles(id,preferred_language,health_data_consent_at,privacy_notice_version,account_type) values(new.id,case when new.raw_user_meta_data->>'preferred_language' in ('nl','fr','de','en') then new.raw_user_meta_data->>'preferred_language' else 'en' end,case when consent_given and notice_version is not null then now() else null end,case when consent_given then notice_version else null end,kind) on conflict(id) do nothing;
 if kind='dietitian' then insert into public.dietitian_profiles(user_id) values(new.id) on conflict do nothing; end if; return new; end; $$;
revoke all on function public.handle_new_user() from public,anon,authenticated;
commit;
