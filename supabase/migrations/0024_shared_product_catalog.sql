-- Shared barcode catalogue by purchase country, with private scan evidence.
begin;
create table if not exists public.product_catalog (
  id uuid primary key default gen_random_uuid(), barcode text not null check (barcode ~ '^[0-9]{8,14}$'),
  country_code text not null check (country_code ~ '^[A-Z]{2}$'), ingredients_text text not null check (char_length(ingredients_text) between 3 and 4000),
  source text not null default 'user_scan' check (source in ('user_scan','open_food_facts','admin')),
  created_by uuid references auth.users(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (barcode, country_code)
);
create table if not exists public.product_scan_evidence (
  id uuid primary key default gen_random_uuid(), product_id uuid not null references public.product_catalog(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade, photo_path text not null check (char_length(photo_path) <= 500),
  created_at timestamptz not null default now(), unique (product_id, user_id)
);
alter table public.product_catalog enable row level security;
alter table public.product_scan_evidence enable row level security;
grant select, insert, delete on table public.product_catalog to authenticated;
grant select on table public.product_catalog to anon;
grant select, insert, update, delete on table public.product_scan_evidence to authenticated;
create policy "product_catalog_read_authenticated" on public.product_catalog for select to authenticated using (true);
create policy "product_catalog_read_anon" on public.product_catalog for select to anon using (true);
create policy "product_catalog_insert_authenticated" on public.product_catalog for insert to authenticated with check ((select auth.uid()) = created_by);
create policy "product_catalog_delete_creator" on public.product_catalog for delete to authenticated using ((select auth.uid()) = created_by);
create policy "product_evidence_select_own" on public.product_scan_evidence for select to authenticated using ((select auth.uid()) = user_id);
create policy "product_evidence_insert_own" on public.product_scan_evidence for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "product_evidence_update_own" on public.product_scan_evidence for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "product_evidence_delete_own" on public.product_scan_evidence for delete to authenticated using ((select auth.uid()) = user_id);
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types) values ('label-photos','label-photos',false,1048576,array['image/webp'])
on conflict (id) do update set public=false,file_size_limit=1048576,allowed_mime_types=array['image/webp'];
create policy "label_photos_select_own" on storage.objects for select to authenticated using (bucket_id='label-photos' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy "label_photos_insert_own" on storage.objects for insert to authenticated with check (bucket_id='label-photos' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy "label_photos_update_own" on storage.objects for update to authenticated using (bucket_id='label-photos' and (storage.foldername(name))[1]=(select auth.uid())::text) with check (bucket_id='label-photos' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy "label_photos_delete_own" on storage.objects for delete to authenticated using (bucket_id='label-photos' and (storage.foldername(name))[1]=(select auth.uid())::text);
create or replace function public.delete_own_account() returns void language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); begin
  if uid is null then raise exception 'not authenticated' using errcode = '42501'; end if;
  delete from storage.objects where bucket_id in ('meal-photos','profile-photos','label-photos') and name like uid::text || '/%';
  delete from auth.users where id = uid;
end; $$;
revoke all on function public.delete_own_account() from public, anon;
grant execute on function public.delete_own_account() to authenticated;
commit;
