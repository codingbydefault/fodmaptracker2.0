# DPIA — werkdocument Fodmap-Tracker

Status: **concept, juridisch te beoordelen**
Versie: 0.1 — 5 november 2026

Dit werkdocument is geen juridische goedkeuring. Vanwege de verwerking van gezondheidsgegevens moet vóór gebruik met echte patiënten worden vastgesteld of de DPIA volledig is en of restrisico's aanvaardbaar zijn.

## 1. Verwerking

Fodmap-Tracker ondersteunt patiënten bij het registreren van voeding, symptomen, dieetfasen, recepten, productscans en persoonlijke toleranties. Een patiënt kan afzonderlijk toestemming geven om geselecteerde gegevens met een geverifieerde diëtist te delen.

Verwerkingsverantwoordelijke: CodedByDefault. De definitieve juridische entiteit, contactgegevens en eventuele FG moeten aansluiten op de gepubliceerde privacyverklaring.

## 2. Categorieën gegevens

- account- en profielgegevens;
- gezondheids- en symptoomgegevens;
- voedingsregistraties en dieetfasegegevens;
- foto's van maaltijden, profiel of productetiketten;
- patiënt-diëtistkoppelingen, plannen en notities;
- beveiligings-, audit- en foutgegevens;
- consentstatus en versie van de privacyinformatie.

## 3. Betrokkenen en doeleinden

Betrokkenen: testgebruikers, patiënten, diëtisten en beheerders.
Doeleinden: zelfregistratie, begeleiding, persoonlijk inzicht, beveiliging, ondersteuning en productverbetering. Gegevens mogen niet stilzwijgend worden hergebruikt voor advertenties, profilering of modeltraining.

## 4. Rechtsgrond en noodzakelijkheid

Per verwerking vaststellen:

| Verwerking | Voorgestelde grondslag | Nog te bevestigen |
|---|---|---|
| Accountbeheer | uitvoering overeenkomst | definitieve voorwaarden |
| Gezondheidsregistratie | uitdrukkelijke toestemming | intrekkings- en verwijdergevolgen |
| Delen met diëtist | uitdrukkelijke, specifieke toestemming | beroepscontext en behandelovereenkomst |
| Beveiligingslogging | gerechtvaardigd belang/wettelijke beveiligingsplicht | afweging en bewaartermijn |
| Privacyvriendelijke analytics | toestemming waar vereist | definitieve configuratie en termijn |

Documenteer waarom ieder veld noodzakelijk is. Verwijder velden zonder aantoonbaar doel.

## 5. Gegevensstromen en ontvangers

Documenteer per omgeving de regio, doorgiften en subverwerkers. Minimaal beoordelen:

- Supabase: database, authenticatie, storage, back-ups en support;
- Vercel: hosting, logs, analytics en deployment;
- Google Tag Manager/Analytics: uitsluitend na toestemming;
- e-mailprovider en eventuele externe product-/vertaaldiensten.

Leg DPA's, SCC's, regio's, bewaartermijnen en subverwerkers vast. Neem geen aanname over locatie of retentie op zonder dashboard- of contractbewijs.

## 6. Risicoanalyse

| Risico | Impact | Maatregelen | Restrisico/eigenaar |
|---|---|---|---|
| patiënt leest gegevens van andere patiënt | zeer hoog | RLS, ownership checks, deny-tests | nog te testen |
| onbevoegde diëtist krijgt toegang | zeer hoog | verificatie, expliciete koppeling, intrekking, auditlog | nog te testen |
| accountovername | zeer hoog | sterke authconfiguratie, sessiebeheer, rate limits, herstelproces | nog vast te leggen |
| lek via databasefunctie | zeer hoog | minimale EXECUTE-grants, lege search_path, body checks | advisorcontrole nodig |
| verlies of beschadiging | hoog | automatische back-up, restore-test | restorebewijs ontbreekt |
| ongewenste internationale doorgifte | hoog | regio- en DPA-controle | juridisch te beoordelen |
| te lange bewaring | hoog | bewaarschema en automatische verwijdering | nog vast te stellen |
| gevoelige info in logs/analytics | hoog | dataminimalisatie, consent, redactie | configuratiecontrole nodig |

## 7. Rechten van betrokkenen

Aanwezig: inzage in de app, correctie, JSON/CSV-export en accountverwijdering. Nog te documenteren: identiteitstoets bij handmatige verzoeken, beantwoordingstermijnen, uitzonderingen, back-upverwijdering en bewijsregistratie.

## 8. Besluit

- Beoordelaar/privacyjurist: …
- Technisch verantwoordelijke: …
- Openstaande hoge risico's: …
- Consultatie AP nodig: ja/nee + motivering
- Go/no-go en datum: …
- Herbeoordelingsdatum: …
