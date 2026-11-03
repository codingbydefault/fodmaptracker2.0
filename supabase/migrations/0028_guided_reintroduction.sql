-- Guided reintroduction and a personal tolerance passport.
begin;
create table if not exists public.reintroduction_challenges (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 fodmap_group text not null check (fodmap_group in ('fructans','gos','lactose','fructose','sorbitol','mannitol')),
 test_food text not null check (char_length(test_food) between 2 and 120),
 status text not null default 'active' check (status in ('active','completed','cancelled')),
 started_on date not null default current_date, completed_on date,
 result text check (result is null or result in ('tolerated','portion_sensitive','possible_trigger','inconclusive')),
 created_at timestamptz not null default now()
);
create unique index if not exists reintroduction_one_active_per_user_idx on public.reintroduction_challenges(user_id) where status='active';
create index if not exists reintroduction_user_started_idx on public.reintroduction_challenges(user_id,started_on desc);
create table if not exists public.reintroduction_logs (
 id uuid primary key default gen_random_uuid(), challenge_id uuid not null references public.reintroduction_challenges(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade, challenge_day smallint not null check (challenge_day between 1 and 3),
 portion_note text not null check (char_length(portion_note) between 1 and 100), symptom_severity smallint not null check (symptom_severity between 0 and 10),
 symptom_note text check (symptom_note is null or char_length(symptom_note)<=500), tested_at timestamptz not null default now(), created_at timestamptz not null default now(),
 unique(challenge_id,challenge_day)
);
create table if not exists public.fodmap_tolerance_profile (
 user_id uuid not null references auth.users(id) on delete cascade,
 fodmap_group text not null check (fodmap_group in ('fructans','gos','lactose','fructose','sorbitol','mannitol')),
 result text not null check (result in ('tolerated','portion_sensitive','possible_trigger','inconclusive')),
 test_food text not null, max_severity smallint not null check (max_severity between 0 and 10), tested_on date not null,
 updated_at timestamptz not null default now(), primary key(user_id,fodmap_group)
);
alter table public.reintroduction_challenges enable row level security;
alter table public.reintroduction_logs enable row level security;
alter table public.fodmap_tolerance_profile enable row level security;
revoke all on public.reintroduction_challenges,public.reintroduction_logs,public.fodmap_tolerance_profile from public,anon;
grant select,insert,update,delete on public.reintroduction_challenges,public.reintroduction_logs,public.fodmap_tolerance_profile to authenticated;
create policy "challenge_own" on public.reintroduction_challenges for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy "challenge_log_own" on public.reintroduction_logs for all to authenticated
 using ((select auth.uid())=user_id and exists(select 1 from public.reintroduction_challenges c where c.id=challenge_id and c.user_id=(select auth.uid())))
 with check ((select auth.uid())=user_id and exists(select 1 from public.reintroduction_challenges c where c.id=challenge_id and c.user_id=(select auth.uid())));
create policy "tolerance_profile_own" on public.fodmap_tolerance_profile for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
commit;
