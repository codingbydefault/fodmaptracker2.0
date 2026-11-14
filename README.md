# Fodmap-Tracker 2.0 — MVP

Mobile-first Nederlandse webapp voor het registreren van voeding en symptomen. De app bevat accounts, een persoonlijk dashboard, voedings- en symptoomregistraties, persoonlijke recepten en een weekmenu. Het Supabase-schema gebruikt Row Level Security (RLS).

## Wat zit erin?

- Next.js App Router + TypeScript
- Supabase Auth via `@supabase/ssr`
- Server actions met Zod-validatie
- PostgreSQL-tabellen voor profielen, voedingsregistraties, symptoomregistraties en toekomstige gecontroleerde voedingsdata
- RLS: gebruikers kunnen uitsluitend hun eigen registraties lezen en wijzigen
- Responsive UI voor mobiel en desktop
- Persoonlijke recepten zoeken, bekijken, aanmaken en verwijderen
- Recepten per dag en eetmoment in een weekmenu plannen
- Maaltijden en klachten bewerken, aan elkaar koppelen en van vrije notities voorzien
- Privéfoto's bij maaltijden en bewaarde etiketscans via afgeschermde Supabase Storage-buckets
- Profiel met unieke gebruikersnaam en privéprofielfoto
- Herstartbare eliminatiefase van 28 dagen met dagteller en dagelijkse tips
- Bronvermelde low-FODMAP-receptsuggesties en persoonlijke favorieten
- Geen demo-gezondheidsdata en geen automatisch verzonnen FODMAP-classificaties

## Vereisten

- Node.js 20.9 of nieuwer (gebruik bij voorkeur een actuele LTS-versie die door de gekozen Next.js-versie wordt ondersteund)
- Een Supabase-project

## Lokaal starten

1. Pak het project uit.
2. Maak een Supabase-project aan.
3. Open **SQL Editor** in Supabase en voer de migraties in `supabase/migrations` op volgorde uit (`0001` t/m `0016`). Migratie `0016` moet als database-eigenaar draaien, omdat `delete_own_account()` het auth-account en privéfoto’s van de ingelogde gebruiker verwijdert.
4. Kopieer `.env.example` naar `.env.local`.
5. Vul `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` en `SITE_URL=http://localhost:3000` in vanuit je Supabase-project.
6. Voeg in Supabase Auth → URL Configuration deze redirect URLs toe:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/auth/callback?next=/wachtwoord-opnieuw` (wachtwoordherstel)
7. Voer uit:

```bash
npm install
npm run dev
```

8. Open `http://localhost:3000`, maak een account aan en bevestig je e-mailadres als e-mailbevestiging in Supabase aanstaat.

## Productie

- Zet de app op Vercel of een vergelijkbaar platform.
- Stel dezelfde environment variables in met de productie-URL.
- Voeg de productie callback URL toe aan Supabase Auth, inclusief `https://JOUW-DOMEIN/auth/callback?next=/wachtwoord-opnieuw` voor wachtwoordherstel.
- Voer `npm test`, `npm run typecheck` en `npm run build` uit in CI voordat je deployt.
- Analytics gebruikt standaard productiecontainer `GTM-T8378T3L`. `NEXT_PUBLIC_GTM_ID` kan deze openbare container-ID per deployment overschrijven en accepteert alleen het formaat `GTM-...`.
- Controleer vóór inschakeling van GTM dat de container alleen een goedgekeurde Google-tag voor de publieke startpagina bevat, dat automatische paginaweergaven en enhanced measurement geen privé-URL's kunnen verzamelen, en dat de analytics-toestemming werkt.
- Configureer Supabase-back-ups, e-mailbevestiging, rate limiting en monitoring.
- Zet nooit een Supabase `service_role`/secret key in `NEXT_PUBLIC_*` of clientcode.
- Accountverwijdering gebruikt de databasefunctie `delete_own_account()` en heeft geen extra environment variable. Voeg geen service-role key toe voor deze functie.

## Privacy (concept)

De pagina’s `/privacy` en `/account-verwijderen` zijn een concept voor juridische controle, nog geen definitieve privacyverklaring.

### Marketinganalytics met expliciete toestemming

- De publieke startpagina (`/`) gebruikt een aparte Next.js root layout. De inlog-, registratie-, informatie- en patiëntpagina's gebruiken andere root layouts. Navigatie tussen die layouts geeft een volledige paginalaadbeurt, waardoor marketingtags niet actief blijven in de patiëntomgeving.
- Bij het eerste bezoek staat analytics standaard **uit**. De bezoeker kiest tussen ‘Alleen noodzakelijk’ en ‘Analytics toestaan’. De keuze wordt lokaal bewaard en kan op de startpagina via ‘Cookievoorkeuren’ worden aangepast.
- `VisitorTracker`, Vercel Analytics, Speed Insights en (indien ingesteld) GTM worden alleen op de startpagina geladen na toestemming. Geen extra GTM-`noscript`-iframe: dat zou de toestemmingscontrole kunnen omzeilen.
- De URL wordt vóór het activeren van tracking ontdaan van zoekparameters en fragmenten; Vercel-events krijgen alleen het publieke pad `/` door.
- Configureer binnen GTM de **Google-tag** met de juiste GA4-meet-ID (`G-...`) en alleen een trigger voor een toegestane marketingpagina. Schakel automatische geschiedenis-/SPA-paginaweergaven en andere enhanced-measurementgebeurtenissen uit waar die privé-URL's kunnen bereiken. Publiceer de GTM-container pas na review.
- Test in een Vercel-preview met Tag Assistant en de browsernetwerktab: bij weigering **geen** requests naar Google Tag Manager/Analytics of Vercel Analytics; na toestemming uitsluitend een geschoonde bezoekmeting op `/`; op `/login`, `/registreren`, `/dashboard`, `/klachten`, `/voeding` en andere patiëntpaden **geen** marketingtags.
- De privacytekst blijft een concept dat vóór productie juridisch en technisch moet worden gecontroleerd, met aandacht voor bewaartermijnen, verwerkers en de AVG.

- Contactadres: codedbydefault@gmail.com. De verwerkingsverantwoordelijke is gevestigd in Hulst, Zeeland (Nederland).
- Vul de hostingregio van Supabase en Vercel in de privacyverklaring in. Die regio staat niet in deze repository.
- Publieke URL’s voor de App Store en Play Console: `/privacy` en `/account-verwijderen` (de verwijderpagina is zonder login te lezen).
- Bij registratie is een uitgevinkt keuzevak voor gezondheidsgegevens verplicht. Het tijdstip en de versie (`2026-10-30`) worden op het profiel gezet door migratie `0016`.

## Scope en bewuste beperkingen

Dit is een MVP-startpunt, geen medisch gevalideerd product of volledig afgeronde productieapp. Voedingsregistraties en symptoomregistraties kunnen achteraf worden bewerkt en aan elkaar gekoppeld. Betalingen en AI zijn nog niet geïmplementeerd. Recepten zijn persoonlijke invoer en krijgen geen automatische FODMAP-classificatie. De ernstschuif legt de gekozen waarde op in het formulier en toont de huidige waarde.

De tabellen `food_catalog` en `food_fodmap_assessments` zijn alleen een datamodel voor latere gecontroleerde gegevens. Er zijn bewust geen FODMAP-scores ingevuld. Gebruik voor FODMAP-beoordelingen alleen rechtmatig verkregen, betrouwbare gegevens en laat de inhoud deskundig controleren. De app mag geen diagnose stellen of dieetbehandeling voorschrijven.

Omdat symptomen gezondheidsgegevens kunnen zijn, voer vóór een openbare lancering een AVG/privacybeoordeling uit: rechtsgrond, transparantie, bewaartermijnen, dataminimalisatie, rechten van betrokkenen, verwerkersovereenkomsten en beoordelen of een DPIA nodig is.

Apple Health (HealthKit) is een uitgeschakeld concept. `NEXT_PUBLIC_FEATURE_APPLE_HEALTH` blijft leeg; alleen de letterlijke waarde `true` zet de shell aan, en ook dan schrijft de app niets naar Gezondheid. Zie `docs/apple-health-plan.md`.
