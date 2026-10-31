begin;

alter table public.weekly_menu_entries
  add column if not exists planned_servings smallint
  check (planned_servings is null or planned_servings between 1 and 24);

comment on column public.weekly_menu_entries.planned_servings is
  'Optional number of people used to scale recipe quantities in the shopping list.';

commit;
