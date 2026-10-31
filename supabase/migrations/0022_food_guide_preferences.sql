-- Qualitative first release: no proprietary serving thresholds or copied database.
begin;

alter table public.profiles add column if not exists avoided_fodmap_groups text[] not null default '{}';
alter table public.profiles drop constraint if exists profiles_avoided_fodmap_groups_valid;
alter table public.profiles add constraint profiles_avoided_fodmap_groups_valid check (
  avoided_fodmap_groups <@ array['fructans','gos','lactose','fructose','sorbitol','mannitol']::text[]
);

alter table public.food_catalog
  add column if not exists category text,
  add column if not exists guidance_status text,
  add column if not exists fodmap_groups text[] not null default '{}',
  add column if not exists portion_guidance text,
  add column if not exists product_note text,
  add column if not exists reviewed_on date;
alter table public.food_catalog drop constraint if exists food_catalog_guidance_status_valid;
alter table public.food_catalog add constraint food_catalog_guidance_status_valid
  check (guidance_status is null or guidance_status in ('low','portion','avoid','unknown'));

insert into public.food_catalog
  (name,name_normalized,category,source_name,source_reference,source_url,verification_status,guidance_status,fodmap_groups,portion_guidance,product_note,reviewed_by,reviewed_at,reviewed_on)
values
  ('Aardappel','aardappel','groenten','Monash FODMAP','High and low FODMAP foods','https://www.monashfodmap.com/about-fodmap-and-ibs/high-and-low-fodmap-foods/','reviewed','low','{}','Gebruik een normale maaltijdportie en combineer gevarieerd.','Naturel aardappel; controleer kant-en-klare kruiden en sauzen.','Fodmap-Tracker redactie',now(),'2026-10-31'),
  ('Wortel','wortel','groenten','Monash FODMAP','High and low FODMAP foods','https://www.monashfodmap.com/about-fodmap-and-ibs/high-and-low-fodmap-foods/','reviewed','low','{}','Gebruik als onderdeel van een gevarieerde maaltijd.','Naturel of zonder ui- en knoflookhoudende marinade.','Fodmap-Tracker redactie',now(),'2026-10-31'),
  ('Komkommer','komkommer','groenten','Monash FODMAP','High and low FODMAP foods','https://www.monashfodmap.com/about-fodmap-and-ibs/high-and-low-fodmap-foods/','reviewed','low','{}','Gebruik als frisse groente binnen de maaltijd.','Let bij ingelegde varianten op ui, knoflook en zoetstoffen.','Fodmap-Tracker redactie',now(),'2026-10-31'),
  ('Paksoi','paksoi','groenten','Monash FODMAP','High and low FODMAP foods','https://www.monashfodmap.com/about-fodmap-and-ibs/high-and-low-fodmap-foods/','reviewed','low','{}','Gebruik binnen een normale maaltijdportie.','Controleer woksaus en bouillon afzonderlijk.','Fodmap-Tracker redactie',now(),'2026-10-31'),
  ('Groene kiwi','groene-kiwi','fruit','Monash FODMAP','High and low FODMAP foods','https://www.monashfodmap.com/about-fodmap-and-ibs/high-and-low-fodmap-foods/','reviewed','low','{}','Houd fruit verspreid over de dag.','Portie en combinatie met ander fruit blijven persoonlijk relevant.','Fodmap-Tracker redactie',now(),'2026-10-31'),
  ('Sinaasappel','sinaasappel','fruit','Monash FODMAP','High and low FODMAP foods','https://www.monashfodmap.com/about-fodmap-and-ibs/high-and-low-fodmap-foods/','reviewed','low','{}','Kies bij voorkeur heel fruit in plaats van veel sap.','Grote hoeveelheden sap kunnen anders worden verdragen.','Fodmap-Tracker redactie',now(),'2026-10-31'),
  ('Witte rijst','witte-rijst','granen','Monash FODMAP','High and low FODMAP foods','https://www.monashfodmap.com/about-fodmap-and-ibs/high-and-low-fodmap-foods/','reviewed','low','{}','Gebruik als basis met groenten en eiwit.','Let op smaakzakjes, bouillon en kant-en-klare saus.','Fodmap-Tracker redactie',now(),'2026-10-31'),
  ('Havermout','havermout','granen','Monash FODMAP','Serving size and FODMAPs','https://www.monashfodmap.com/blog/serving-size-and-fodmaps-why-it-so-important/','reviewed','portion','{fructans}','Portie telt; controleer de actuele passende hoeveelheid bij een gekwalificeerde bron.','Muesli en instantcups kunnen honing, gedroogd fruit of inuline bevatten.','Fodmap-Tracker redactie',now(),'2026-10-31'),
  ('Lactosevrije melk','lactosevrije-melk','zuivel','Monash FODMAP','High and low FODMAP foods','https://www.monashfodmap.com/about-fodmap-and-ibs/high-and-low-fodmap-foods/','reviewed','low','{}','Gebruik volgens persoonlijke tolerantie.','Controleer gearomatiseerde varianten op inuline, FOS en polyolen.','Fodmap-Tracker redactie',now(),'2026-10-31'),
  ('Stevige tofu','stevige-tofu','eiwitten','Monash FODMAP','Low FODMAP plant-based swaps','https://www.monashfodmap.com/blog/low-fodmap-plant-based-swaps/','reviewed','low','{}','Kies stevige, uitgelekte tofu.','Zijde-tofu heeft een ander profiel; marinades kunnen ui of knoflook bevatten.','Fodmap-Tracker redactie',now(),'2026-10-31'),
  ('Tempeh','tempeh','eiwitten','Monash FODMAP','Low FODMAP plant-based swaps','https://www.monashfodmap.com/blog/low-fodmap-plant-based-swaps/','reviewed','portion','{gos}','Kies naturel tempeh en houd de gebruikte portie bewust.','Voorgekruide tempeh kan ui, knoflook, tarwe of zoetstoffen bevatten.','Fodmap-Tracker redactie',now(),'2026-10-31'),
  ('Kikkererwten uit blik','kikkererwten-uit-blik','peulvruchten','BDA','Therapeutic diets','https://www.bda.uk.com/practice-and-education/resources-for-practice/the-nutrition-and-hydration-digest/menu-coding-therapeutic-diets-and-patient-groups/therapeutic-diets.html','reviewed','portion','{gos}','Alleen een gecontroleerde portie; goed spoelen en persoonlijke tolerantie volgen.','Gedroogd gekookte en ingeblikte kikkererwten zijn niet één-op-één uitwisselbaar.','Fodmap-Tracker redactie',now(),'2026-10-31'),
  ('Avocado','avocado','fruit','Monash FODMAP','Serving size and FODMAPs','https://www.monashfodmap.com/blog/serving-size-and-fodmaps-why-it-so-important/','reviewed','portion','{sorbitol}','Portie telt; combineer niet onbewust met meerdere andere polyolbronnen.','Geen exact grensgetal zonder gelicentieerde dataset.','Fodmap-Tracker redactie',now(),'2026-10-31'),
  ('Zoete aardappel','zoete-aardappel','groenten','Monash FODMAP','Serving size and FODMAPs','https://www.monashfodmap.com/blog/serving-size-and-fodmaps-why-it-so-important/','reviewed','portion','{mannitol}','Portie telt; controleer actuele hoeveelheden bij een gekwalificeerde bron.','Friet of kant-en-klare puree bevat mogelijk extra ingrediënten.','Fodmap-Tracker redactie',now(),'2026-10-31'),
  ('Ui','ui','smaakmakers','Monash FODMAP','FODMAP FAQs','https://www.monashfodmap.com/about-fodmap-and-ibs/frequently-asked-questions/','reviewed','avoid','{fructans}','Tijdens de tijdelijke eerste fase meestal vermijden.','Let ook op uienpoeder, bouillon, kruidenmixen en aroma.','Fodmap-Tracker redactie',now(),'2026-10-31'),
  ('Knoflook','knoflook','smaakmakers','Monash FODMAP','FODMAP FAQs','https://www.monashfodmap.com/about-fodmap-and-ibs/frequently-asked-questions/','reviewed','avoid','{fructans}','Tijdens de tijdelijke eerste fase meestal vermijden.','Knoflook-geïnfuseerde olie zonder stukjes kan als smaakoptie dienen.','Fodmap-Tracker redactie',now(),'2026-10-31'),
  ('Appel','appel','fruit','Monash FODMAP','High and low FODMAP foods','https://www.monashfodmap.com/about-fodmap-and-ibs/high-and-low-fodmap-foods/','reviewed','avoid','{fructose,sorbitol}','Tijdens de tijdelijke eerste fase doorgaans vervangen.','Let ook op appelsap, concentraat, puree en gedroogde appel.','Fodmap-Tracker redactie',now(),'2026-10-31'),
  ('Gewone koemelk','gewone-koemelk','zuivel','Monash FODMAP','High and low FODMAP foods','https://www.monashfodmap.com/about-fodmap-and-ibs/high-and-low-fodmap-foods/','reviewed','avoid','{lactose}','Tijdens de tijdelijke eerste fase vervangen door een passende lactosevrije optie.','Persoonlijke tolerantie en producthoeveelheid blijven bepalend.','Fodmap-Tracker redactie',now(),'2026-10-31')
on conflict (name_normalized) do update set
  category=excluded.category,source_name=excluded.source_name,source_reference=excluded.source_reference,
  source_url=excluded.source_url,verification_status=excluded.verification_status,guidance_status=excluded.guidance_status,
  fodmap_groups=excluded.fodmap_groups,portion_guidance=excluded.portion_guidance,product_note=excluded.product_note,
  reviewed_by=excluded.reviewed_by,reviewed_at=excluded.reviewed_at,reviewed_on=excluded.reviewed_on,updated_at=now();

commit;
