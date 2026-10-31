# Architectuur

## Request flow

Browser → Next.js App Router → server actions / server components → Supabase Auth + Postgres. Supabase RLS is de databasegrens voor data-isolatie; checks in de server actions zijn aanvullend, niet de enige beveiligingslaag.

## Data model

- `profiles`: één profiel per `auth.users` record.
- `food_entries`: vrije voedingsnotities, type maaltijd, hoeveelheid, notities en timestamp.
- `symptom_entries`: symptoomtype, subjectieve ernst (0–10), notities en timestamp.
- `food_catalog`: voedingsmiddelen met herkomst en reviewstatus.
- `food_fodmap_assessments`: beoordeling per FODMAP-groep en portie met bron, reviewer en verificatiedatum.
- `recipes`: persoonlijke recepten met ingrediënten, bereidingswijze, porties en bereidingstijd.
- `weekly_menu_entries`: een recept per gebruiker, datum en eetmoment; gekoppeld aan `recipes` of `curated_recipes`, met een optioneel aantal personen voor het schalen van de boodschappenlijst.
- `meal-photos`: privé Storage-bucket; objectpaden beginnen met het gebruikers-id en worden via tijdelijke links getoond.

## Veiligheidsprincipes

- Gezondheidsnotities zijn standaard privé.
- RLS policy koppelt iedere persoonlijke rij aan `auth.uid()`.
- Geen service-role key in de webapp.
- Catalogusclassificaties zijn niet beschikbaar totdat ze gecontroleerd zijn.
- AI-functionaliteit wordt pas toegevoegd na expliciete beoordeling van privacy, prompts, bronkwaliteit en foutafhandeling.
