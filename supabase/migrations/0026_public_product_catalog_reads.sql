-- Product label data is shared; photos and contributor evidence remain private.
grant select on table public.product_catalog to anon;
drop policy if exists "product_catalog_read_anon" on public.product_catalog;
create policy "product_catalog_read_anon" on public.product_catalog for select to anon using (true);
