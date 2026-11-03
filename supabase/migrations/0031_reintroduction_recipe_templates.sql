-- Original Fodmap-Tracker meal templates for a single-group reintroduction challenge.
begin;

alter table public.curated_recipes
  add column if not exists recipe_role text not null default 'general'
    check (recipe_role in ('general','reintroduction')),
  add column if not exists reintroduction_group text
    check (reintroduction_group is null or reintroduction_group in ('fructans','gos','lactose','fructose','sorbitol','mannitol'));

create index if not exists curated_recipes_reintroduction_idx
  on public.curated_recipes(recipe_role,reintroduction_group) where published=true;

with groups(group_key,group_label) as (values
  ('fructans','Fructanen'),('gos','GOS'),('lactose','Lactose'),
  ('fructose','Overtollige fructose'),('sorbitol','Sorbitol'),('mannitol','Mannitol')
), templates(template_key,title,category,minutes,ingredients,instructions) as (values
  ('rijstkom','Rustige rijstkom','avondeten',25,E'150 g gekookte witte rijst\n100 g wortel, in linten\n80 g komkommer\n1 ei of 100 g naturel kip\n1 tl knoflook-geïnfuseerde olie zonder stukjes\nCitroensap, peper en zout\nJouw gekozen testvoedingsmiddel in de vooraf bepaalde testportie',E'1. Bereid rijst en ei of kip zonder ui, knoflook of marinade.\n2. Verdeel rijst, wortel en komkommer over een kom.\n3. Voeg olie, citroen en het ei of de kip toe.\n4. Bereid uitsluitend het gekozen testvoedingsmiddel apart en voeg precies de vooraf bepaalde testportie toe.\n5. Verander tijdens de test geen andere ingrediënten.'),
  ('aardappelbord','Eenvoudig aardappelbord','avondeten',35,E'300 g aardappelen\n100 g wortel\n100 g sperziebonen\n120 g naturel vis of stevige tofu\n1 el olijfolie\nPeterselie, peper en zout\nJouw gekozen testvoedingsmiddel in de vooraf bepaalde testportie',E'1. Kook of rooster de aardappelen met olie, peper en zout.\n2. Kook wortel en sperziebonen en bereid vis of tofu naturel.\n3. Leg de rustige basis op een bord.\n4. Bereid het gekozen testvoedingsmiddel apart en voeg alleen de vooraf bepaalde testportie toe.\n5. Noteer na het eten portie, tijdstip en klachten.'),
  ('quinoasalade','Heldere quinoasalade','lunch',25,E'120 g gekookte quinoa\n80 g komkommer\n70 g wortel\n50 g babyspinazie\n1 gekookt ei\n1 el olijfolie\nCitroensap, peper en zout\nJouw gekozen testvoedingsmiddel in de vooraf bepaalde testportie',E'1. Laat de gekookte quinoa afkoelen.\n2. Meng quinoa met komkommer, wortel, spinazie en ei.\n3. Breng op smaak met olie, citroen, peper en zout.\n4. Voeg uitsluitend het gekozen testvoedingsmiddel in de vooraf bepaalde testportie toe.\n5. Houd de overige samenstelling op alle testdagen gelijk.'),
  ('omelet','Neutrale testomelet','lunch',15,E'2 eieren\n40 ml lactosevrije melk\n50 g babyspinazie\n150 g gekookte aardappel\n1 tl olijfolie\nBieslook, peper en zout\nJouw gekozen testvoedingsmiddel in de vooraf bepaalde testportie',E'1. Klop eieren met lactosevrije melk, peper en zout.\n2. Bak de aardappel kort in olie en laat de spinazie slinken.\n3. Voeg het ei toe en gaar de omelet rustig.\n4. Bereid het gekozen testvoedingsmiddel apart en serveer alleen de vooraf bepaalde testportie erbij.\n5. Gebruik geen extra saus, kruidenmix of nieuw product tijdens de test.'),
  ('polentakom','Zachte polentakom','avondeten',25,E'70 g fijne polenta\n250 ml water\n100 ml lactosevrije melk\n80 g babyspinazie\n100 g naturel kip of stevige tofu\n1 tl knoflook-geïnfuseerde olie zonder stukjes\nPeper en zout\nJouw gekozen testvoedingsmiddel in de vooraf bepaalde testportie',E'1. Kook de polenta met water en lactosevrije melk volgens de verpakking.\n2. Bereid kip of tofu naturel en laat de spinazie slinken in de olie.\n3. Verdeel de rustige basis over een kom.\n4. Voeg alleen het gekozen testvoedingsmiddel in de vooraf bepaalde testportie toe.\n5. Registreer dezelfde dag de gebruikte portie en eventuele reactie.')
)
insert into public.curated_recipes
  (title,summary,category,source_name,source_url,suitable_for_elimination,servings,preparation_minutes,ingredients,instructions,attribution_note,phase_note,published,recipe_role,reintroduction_group)
select
  t.title||' voor '||g.group_label,
  'Rustige low-FODMAP-achtergrond met ruimte voor één gekozen testvoedingsmiddel uit de groep '||g.group_label||'.',
  t.category,'Fodmap-Tracker','https://fodmaptracker20.vercel.app/fases',false,1,t.minutes,t.ingredients,t.instructions,
  'Origineel receptsjabloon, ontwikkeld en geschreven door Fodmap-Tracker op basis van algemene herintroductieprincipes.',
  'Alleen bedoeld tijdens een geplande '||g.group_label||'-herintroductie. Kies testvoedingsmiddel en testportie met een actuele gezaghebbende bron of FODMAP-diëtist; het recept schrijft geen testportie voor.',
  true,'reintroduction',g.group_key
from groups g cross join templates t
on conflict (title) do update set summary=excluded.summary,category=excluded.category,source_name=excluded.source_name,
 source_url=excluded.source_url,suitable_for_elimination=false,servings=excluded.servings,preparation_minutes=excluded.preparation_minutes,
 ingredients=excluded.ingredients,instructions=excluded.instructions,attribution_note=excluded.attribution_note,
 phase_note=excluded.phase_note,published=true,recipe_role='reintroduction',reintroduction_group=excluded.reintroduction_group;

commit;
