-- RLS policies filter rows; explicit table grants let authenticated requests reach those policies.
grant select, insert, delete on table public.product_catalog to authenticated;
grant select, insert, update, delete on table public.product_scan_evidence to authenticated;
