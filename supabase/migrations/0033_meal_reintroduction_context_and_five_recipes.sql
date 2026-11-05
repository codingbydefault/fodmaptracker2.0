-- Keep recipes independent from a user's challenge and store reintroduction context on meals.
begin;

alter table public.food_entries
  add column if not exists reintroduction_challenge_id uuid references public.reintroduction_challenges(id) on delete set null,
  add column if not exists reintroduction_group text
    check (reintroduction_group is null or reintroduction_group in ('fructans','gos','lactose','fructose','sorbitol','mannitol')),
  add column if not exists reintroduction_test_food text
    check (reintroduction_test_food is null or char_length(reintroduction_test_food) <= 120);

create index if not exists food_entries_reintroduction_challenge_idx
  on public.food_entries(user_id,reintroduction_challenge_id)
  where reintroduction_challenge_id is not null;

-- Migration 0031 repeated five neutral templates for every group. Preserve history but unpublish them.
update public.curated_recipes set published=false where recipe_role='reintroduction';

insert into public.curated_recipes
  (title,summary,category,source_name,source_url,suitable_for_elimination,servings,preparation_minutes,ingredients,instructions,attribution_note,phase_note,published,recipe_role,reintroduction_group)
values
  (
    'Citroen-kruidenkip met romige polenta en spinazie',
    'Zachte polenta met naturel kip, citroen, spinazie en verse kruiden; zonder ui of knoflookstukjes.',
    'avondeten','Fodmap-Tracker','https://www.monashfodmap.com/about-fodmap-and-ibs/frequently-asked-questions/',true,2,30,
    E'300 g kipfilet\n120 g fijne polenta\n500 ml water\n100 ml lactosevrije melk\n120 g babyspinazie\n1 el knoflook-geïnfuseerde olie zonder stukjes\n1 citroen\n2 el bieslook en peterselie, fijngehakt\nPeper en zout',
    E'1. Breng water en lactosevrije melk aan de kook en gaar de polenta volgens de verpakking.\n2. Bak de kip in de geïnfuseerde olie volledig gaar.\n3. Laat de spinazie kort slinken en roer citroenrasp en kruiden door de polenta.\n4. Serveer met citroensap, peper en zout.',
    'Origineel recept van Fodmap-Tracker. De samenstelling gebruikt algemene low-FODMAP-kookprincipes; dit recept is niet door Monash gecertificeerd.',
    'Controleer actuele product- en portie-informatie in een gezaghebbende FODMAP-bron. Tijdens herintroductie koppelt de app je actieve test automatisch aan de maaltijd.',
    true,'general',null
  ),
  (
    'Krokante aardappel-tonijnbowl met boontjes en dille',
    'Een lauwwarme bowl met geroosterde aardappel, naturel tonijn, sperziebonen, komkommer en citroendille.',
    'lunch','Fodmap-Tracker','https://www.monashfodmap.com/about-fodmap-and-ibs/frequently-asked-questions/',true,2,35,
    E'500 g aardappelen, in partjes\n200 g sperziebonen\n160 g tonijn op water, uitgelekt\n120 g komkommer\n2 el olijfolie\n1 citroen\n2 el verse dille en bieslook\nPeper en zout',
    E'1. Rooster de aardappelpartjes met de helft van de olie op 200 °C in 25 minuten goudbruin.\n2. Kook de sperziebonen gaar en snijd de komkommer.\n3. Meng citroensap, resterende olie, dille en bieslook tot een dressing.\n4. Verdeel alles over twee kommen en voeg de uitgelekte tonijn toe.',
    'Origineel recept van Fodmap-Tracker, niet overgenomen van een extern recept en niet Monash-gecertificeerd.',
    'Kies naturel tonijn zonder ui, knoflook of marinade en controleer porties en productetiketten.',
    true,'general',null
  ),
  (
    'Gember-sesamrijstnoedels met omelet en paksoi',
    'Snelle rijstnoedels met dunne omeletreepjes, wortel, paksoi, gember en een eenvoudige sesamdressing.',
    'avondeten','Fodmap-Tracker','https://www.monashfodmap.com/blog/adding-flavour-without-adding-symptoms/',true,2,25,
    E'160 g rijstnoedels\n4 eieren\n160 g paksoi\n120 g wortel, in linten\n15 g verse gember, geraspt\n2 el knoflook-geïnfuseerde olie zonder stukjes\n1 el sesamolie\n2 el sojasaus zonder ui of knoflook\n1 limoen\n1 el sesamzaad',
    E'1. Bereid de rijstnoedels volgens de verpakking en spoel kort af.\n2. Bak van de losgeklopte eieren een dunne omelet en snijd die in repen.\n3. Roerbak paksoi, wortel en gember in de geïnfuseerde olie.\n4. Schep noedels, sesamolie en gecontroleerde sojasaus erdoor.\n5. Serveer met omelet, limoen en sesamzaad.',
    'Origineel Fodmap-Tracker-recept, geïnformeerd door algemene Monash-tips voor smaakmakers; geen adaptatie en geen certificering.',
    'Sojasaus en samengestelde smaakmakers zijn productafhankelijk. Controleer het etiket en je passende portie.',
    true,'general',null
  ),
  (
    'Ovenfrittata met aardappel, tomaat en feta',
    'Een luchtige frittata met voorgekookte aardappel, tomaat, spinazie, bieslook en feta.',
    'lunch','Fodmap-Tracker','https://www.monashfodmap.com/about-fodmap-and-ibs/frequently-asked-questions/',true,4,40,
    E'8 eieren\n400 g aardappelen, voorgekookt en in blokjes\n200 g tomaten\n100 g babyspinazie\n80 g feta\n2 el bieslook\n1 el olijfolie\nPeper en zout',
    E'1. Verwarm de oven voor op 190 °C en vet een ovenschaal in.\n2. Verdeel aardappel, tomaat en spinazie over de schaal.\n3. Klop de eieren met bieslook, peper en zout en schenk over de groenten.\n4. Verkruimel de feta erover en bak 25 minuten tot het midden gestold is.',
    'Origineel recept van Fodmap-Tracker. Niet extern overgenomen en niet formeel low-FODMAP-gecertificeerd.',
    'Zuivel en porties blijven persoonlijk en productafhankelijk; kies lactosevrij waar dat voor jou nodig is.',
    true,'general',null
  ),
  (
    'Gebakken havervierkantjes met kiwi en kaneel',
    'Zachte ontbijtvierkantjes van haver, lactosevrije melk, ei, kiwi en kaneel, handig om vooraf te maken.',
    'ontbijt','Fodmap-Tracker','https://www.monashfodmap.com/about-fodmap-and-ibs/frequently-asked-questions/',true,4,35,
    E'200 g havermout\n300 ml lactosevrije melk\n2 eieren\n2 kiwi’s, in kleine blokjes\n30 g walnoten, grof gehakt\n2 el ahornsiroop\n1 tl kaneel\n1 tl bakpoeder\nSnuf zout',
    E'1. Verwarm de oven voor op 180 °C en bekleed een kleine bakvorm.\n2. Meng havermout, kaneel, bakpoeder en zout.\n3. Klop melk, eieren en ahornsiroop en roer door de droge ingrediënten.\n4. Schep kiwi en walnoot erdoor en bak 25 minuten.\n5. Laat afkoelen en snijd in vier porties.',
    'Origineel recept van Fodmap-Tracker. De ingrediënten zijn zelf samengesteld en de bereidingswijze is eigen tekst.',
    'Haver, fruit en noten kunnen bij grotere gecombineerde porties stapelen. Controleer actuele portie-informatie en je eigen tolerantie.',
    true,'general',null
  )
on conflict (title) do update set
  summary=excluded.summary,category=excluded.category,source_name=excluded.source_name,source_url=excluded.source_url,
  suitable_for_elimination=excluded.suitable_for_elimination,servings=excluded.servings,
  preparation_minutes=excluded.preparation_minutes,ingredients=excluded.ingredients,instructions=excluded.instructions,
  attribution_note=excluded.attribution_note,phase_note=excluded.phase_note,published=true,recipe_role='general',reintroduction_group=null;

commit;
