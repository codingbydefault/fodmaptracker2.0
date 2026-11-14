# Apple Health (HealthKit) — concept, stap A

Status: **concept**. De featurevlag staat uit. Er wordt geen gezondheidsgegeven verwerkt, gekopieerd of naar Apple Health geschreven. Niets in dit document is een besluit om live te gaan.

Gecontroleerd op 14 november 2026 tegen de publieke pagina's die hieronder staan. Prijzen en richtlijnen kunnen wijzigen; voor een latere stap opnieuw op de bron kijken.

## 1. Gekozen architectuur

Fodmap-Tracker is een Next.js-webapp (App Router) op Vercel, met servercomponents, server actions, de auth-callback op `/auth/callback` en Supabase-sessies in cookies via `@supabase/ssr`. Die cookies worden per request ververst in `src/proxy.ts`. HealthKit bestaat alleen in een native iOS-app. Safari, een PWA en deze website kunnen het niet aanroepen.

De gekozen route is een **Capacitor-iOS-schil** die later de bestaande site in een WKWebView laadt en via een native plugin naar HealthKit schrijft. De website blijft de plek waar het dagboek leeft. De schil komt erbij; ze vervangt de Vercel-deploy niet.

Dat is passender dan de alternatieven:

- Een **PWA** valt af. Er is geen web-API voor HealthKit.
- Een **React Native- of Expo-herschrijving** zou het dagboek, de server actions en de diëtistenkant een tweede keer bouwen. Dat is een ander product.
- Een **statische export** van deze Next.js-app valt af. Zie hieronder.
- Een losse Swift-app die alleen synchroniseert, blijft de terugval als App Review een webschil afwijst. Dezelfde TypeScript-interface kan dan door een Swift-bridge worden ingevuld. Die app bouwen we nu niet.

In deze stap staat er geen Capacitor-pakket in `package.json`, geen iOS-project en geen plugin. `ios-shell/capacitor.config.json` is een ongebruikte schets. De Capacitor CLI leest dat bestand niet, tenzij iemand uitdrukkelijk `--config ios-shell/capacitor.config.json` meegeeft. Geen npm-script doet dat. De schets zet bewust geen `server.url`.

## 2. Remote URL, statische export, SSR en Supabase

Twee manieren om een webapp in Capacitor te laden, en geen van beide zetten we nu aan.

**Statische export** (`output: 'export'`) levert een map met HTML en JavaScript, zonder Node-server. Daarmee vallen de server actions, de auth-callback en de cookie-refresh in de proxy weg. De sessie van deze app is een cookie die de Next.js-server zet op het domein van de site. Een gebundelde schil draait op een ander origin (`capacitor://localhost`). Die cookies komen daar niet mee. Een export zou een tweede inlogflow nodig hebben (Supabase in de browser, PKCE, JWT in de webview) en de validatie die nu in server actions zit opnieuw moeten borgen. RLS blijft dan de databasegrens, maar het is een ander auth-model. Deze stap wijzigt `next.config.ts` niet.

**Remote URL** (`server.url` in de Capacitor-config) laat de webview de uitgerolde site laden. Het document-origin is dan het productiedomein. Servercomponents, server actions en de cookies van `@supabase/ssr` blijven werken, omdat de browser van de webview dezelfde site ziet als Safari. `X-Frame-Options: DENY` en `frame-ancestors 'none'` blokkeren iframes, niet een webview die de pagina als hoofddocument laadt. Links in e-mail die in Safari opengaan in plaats van in de app, kunnen de sessie later wel splitsen. Dat hoort bij een eventuele associated-domain-configuratie, niet bij deze stap.

Capacitor documenteert `server.url` als live-reload en schrijft: niet bedoeld voor productie ([Capacitor Configuration](https://capacitorjs.com/docs/config)). Apple kan een app die vooral een bestaande website toont afwijzen onder richtlijn 4.2. Remote URL is technisch wel de enige van de twee opties die de huidige SSR- en cookie-auth in stand houdt.

Daarom is de aanbeveling voor een latere native build: de webview laadt het productiedomein, en HealthKit is de native functie die de app meer maakt dan een bladwijzer. Die combinatie blijft een reviewrisico. Als App Review de schil afwijst, is de terugval een kleine gebundelde sync-client met een eigen Supabase-sessie, niet een statische export van het hele dagboek. Die terugval leest gezondheidsgegevens op het apparaat en mag pas bestaan nadat de DPIA dat toestaat.

De schets in `ios-shell/` laat `server.url` weg, zodat niemand per ongeluk een remote site in een binary laadt.

## 3. Wat deze stap in code doet

`NEXT_PUBLIC_FEATURE_APPLE_HEALTH` staat standaard uit. Alleen de letterlijke waarde `true` zet de shell aan. Leeg, `false`, `1` en `TRUE` blijven uit. De variabele staat niet in een deployment. In `.env.example` staat ze leeg.

`src/lib/apple-health/` bevat:

- een getypeerde `HealthSyncClient` (toestemming vragen, toestemming intrekken, symptomen schrijven);
- een webimplementatie die geen I/O doet en altijd `wrote: 0` teruggeeft;
- `iosHealthKitBridge`, die `null` is. Dat is het plug-inpunt. Er wordt geen Capacitor-pakket en geen HealthKit-API geïmporteerd.

Zonder vlag wordt een bridge niet aangeroepen, ook niet als een test er een meegeeft. Met de vlag aan en zonder bridge is het resultaat `unavailable`, nog steeds zonder schrijfactie. Geen pagina importeert de module. Het dagboek, de profielpagina en de Vercel-deploy gedragen zich zoals daarvoor.

De vlag is een `NEXT_PUBLIC_`-variabele. Next.js bakt zo'n waarde in de clientbundle op het moment van bouwen, zodra een clientcomponent haar importeert. Zolang Vercel haar niet zet, blijft een latere bundle uit. Deze pull request zet geen omgevingsvariabele op Vercel.

## 4. Mapping van symptomen

De app kent zes symptoomtypen (`SymptomType` in `src/lib/types.ts`): buikpijn, opgeblazen, winderigheid, stoelgang, misselijkheid en anders. Ernst is een geheel getal van 0 tot 10. "Anders" heeft een vrije omschrijving.

HealthKit heeft geen FODMAP-type en geen algemeen type "veranderde stoelgang" of "winderigheid". De maag-darmgroep van de symptoomcategorieën is, volgens [Symptom Type Identifiers](https://developer.apple.com/documentation/healthkit/symptom-type-identifiers) (opgehaald 14 november 2026):

| HealthKit-categorie | Betekenis in Apple's documentatie |
| --- | --- |
| `abdominalCramps` | buikkramp |
| `bloating` | opgeblazen gevoel |
| `constipation` | verstopping |
| `diarrhea` | diarree |
| `heartburn` | brandend maagzuur |
| `nausea` | misselijkheid |
| `vomiting` | braken |

`bloating` gebruikt waarden uit [HKCategoryValueSeverity](https://developer.apple.com/documentation/healthkit/hkcategoryvalueseverity): `notPresent`, `mild`, `moderate`, `severe`, `unspecified`. De andere categorieën in deze groep zijn hetzelfde soort category type. Er is geen winderigheid, geen Bristol-schaal en geen vrije tekst.

Voedingskwantiteiten staan apart onder [HKQuantityTypeIdentifier](https://developer.apple.com/documentation/healthkit/hkquantitytypeidentifier), groep Nutrition: 39 typen (`dietaryEnergyConsumed`, `dietaryCarbohydrates`, vitaminen, en zo door). **Geen enkel type heet FODMAP.** Maaltijden, porties, FODMAP-groepen en herintroductie vallen buiten de eerste scope. Een klacht blijft in het dagboek koppelbaar aan een maaltijd; die koppeling gaat niet mee naar Health.

Richtlijn 5.1.3 (ii) verbiedt onjuiste gegevens in HealthKit. Daarom is een naammatch nog geen toestemming om te schrijven. De code zet `automaticWrite` overal op `false`.

| App | HealthKit | Status in deze stap |
| --- | --- | --- |
| opgeblazen | `bloating` | Directe match. Nog niet schrijven. |
| misselijkheid | `nausea` | Directe match. Nog niet schrijven. Braken (`vomiting`) wordt daar niet uit afgeleid. |
| buikpijn | hoogstens `abdominalCramps` | Geen automatische match. Apple beschrijft dit type als buikkramp, en buikpijn in de app is breder. Alleen als de gebruiker later uitdrukkelijk kramp kiest. |
| stoelgang | `constipation` of `diarrhea` | Geen automatische match. Het veld is "veranderde stoelgang" en maakt geen onderscheid. Een van beide schrijven zou het andere kunnen verzinnen. |
| anders | geen | Vrije tekst wordt niet geïnterpreteerd. `heartburn` bestaat, maar "branderig" in het vrije veld wordt niet omgezet. Een later expliciet type zou dat apart moeten vastleggen. |
| winderigheid | geen | Geen HealthKit-categorie. Niet afbeelden op `bloating`. |

## 5. Ernst

HealthKit kent voor deze categorieën vijf labels, geen schaal van 0 tot 10. Een later voorstel, alleen als functie die niets wegschrijft:

| Ernst in de app | Voorstel voor HealthKit |
| --- | --- |
| 0 | `notPresent` |
| 1–3 | `mild` |
| 4–6 | `moderate` |
| 7–10 | `severe` |

Geen geheel getal in dat bereik geeft `null`, niet `unspecified`. `unspecified` is zelf een waarde die je zou kunnen schrijven, en dat doen we niet. De banden zijn een voorstel, geen gevalideerde klinische schaal. De numerieke ruwe waarden van de enum staan niet in de opgehaalde symboolpagina en worden hier daarom niet vastgelegd. Die horen pas bij een echte bridge, uit de SDK van dat moment.

Notities en de vrije omschrijving bij "anders" gaan niet mee. HealthKit is niet de plek voor het dagboekverslag.

## 6. Toestemming

De toestemming bij het aanmaken van een account (`health_data_consent_at`) dekt het bewaren van het dagboek in deze app. Ze dekt niet het kopiëren naar Apple Health. Dat is een nieuw doel.

De latere flow, nog niet gebouwd:

- per HealthKit-categorie een eigen, uitdrukkelijke keuze, standaard uit;
- de systeemdialoog van HealthKit komt pas ná die keuze, en vraagt alleen schrijfrechten voor de gekozen categorieën;
- intrekken kan per categorie. Vanaf dat moment stopt schrijven. Het dagboek in Supabase blijft bestaan;
- intrekken wist niet vanzelf samples die de app eerder in Health heeft gezet. Wissen van eigen samples is een aparte, nog niet gebouwde actie en verwijdert geen gegevens van andere apps;
- geen leesrecht op Health. De eerste scope is alleen schrijven. Geen Clinical Health Records, geen achtergrondlevering, geen lezen om het dagboek te vullen;
- de bridge schrijft pas als de vlag aan staat, de categorie is toegestaan, de mapping niet `unsupported` is, en de gebruiker die categorie heeft bevestigd.

De webclient in deze stap slaat geen toestemming op. `requestConsent` en `revokeConsent` geven alleen een status terug.

## 7. App Store

Bronnen, 14 november 2026: [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/) en de HealthKit-documentatie.

- **Entitlement.** `com.apple.developer.healthkit` op het App ID. De entitlement voor klinische dossiers niet aanzetten.
- **Usage description.** Voor alleen schrijven hoort `NSHealthUpdateUsageDescription` in het Info.plist, met een zin die zegt dat de gebruiker gekozen klachten in Gezondheid kan bewaren. `NSHealthShareUsageDescription` pas toevoegen als er een goedgekeurde leesscope is. Een ontbrekende sleutel laat HealthKit falen; een extra leessleutel wekt een doel dat we niet hebben. Dit bij de bouw tegen de dan geldende SDK controleren.
- **Richtlijn 2.5.1.** HealthKit alleen voor gezondheid, en gekoppeld aan de Gezondheid-app. Schrijven van door de gebruiker gekozen klachten past daarbij. De app mag het framework niet alleen als versiering vermelden.
- **Richtlijn 5.1.2 (vi) en 5.1.3 (i).** Gegevens uit HealthKit, en gezondheidsgegevens in het algemeen, niet gebruiken voor reclame, marketing of datamining. De app heeft in de huidige privacytekst geen advertenties. De native schil krijgt geen advertentie-SDK. Klachten, ernst en dagboektekst gaan niet naar Google Tag Manager, Vercel Analytics of een andere meetdienst. Marketingtags horen buiten de ingelogde omgeving te blijven, zoals nu.
- **Richtlijn 5.1.3 (ii).** Geen onjuiste samples schrijven. Geen persoonlijke gezondheidsinformatie in iCloud bewaren. De schil mag concept-klachten niet in een iCloud-container cachen. Of een webview-cookiestore in een iCloud-back-up terechtkomt, is een open technisch punt voor de native build.
- **Privacyverklaring.** App Store Connect vraagt een publieke privacy-URL. `/privacy` bestaat en is in de app zelf gemarkeerd als concept voor juridische controle. Die tekst noemt Apple Health nog niet. Ze moet worden bijgewerkt en goedgekeurd vóór een binary, samen met het privacy-etiket in App Store Connect (gezondheid en fitness, niet gekoppeld aan tracking, niet voor advertenties).
- **Richtlijn 4.2.** De app moet meer zijn dan een verpakte website. Een webview om het dagboek plus een echte HealthKit-schrijffunctie is het argument, geen garantie. 4.2.3 vraagt dat de app op zichzelf werkt. Een schil die zonder netwerk een lege site toont, is een reviewrisico. Dit blokkeert indienen, niet het uitschrijven van het concept.
- **Account verwijderen.** Apple vraagt een manier om een account te verwijderen als de app een account aanmaakt. Die flow bestaat al op `/account-verwijderen`. Ze wist het Apple Health-archief niet; dat blijft een aparte vraag voor de DPIA.

## 8. Bouwen zonder eigen Mac

Er is geen Mac nodig om deze website te blijven deployen. Een iOS-binary heeft wel een Mac-omgeving nodig op het moment van compileren. Drie actuele routes, gecontroleerd op 14 november 2026:

**Xcode Cloud** ([aan de slag](https://developer.apple.com/xcode-cloud/get-started/)). Zit bij het Apple Developer Program: 25 compute-uren per maand. Het eerste extra plan op die pagina is 100 compute-uren voor US$ 49,99 per maand. Dezelfde pagina noemt ook US$ 99,99, US$ 399,99 en US$ 3.999,99 per maand voor grotere bundels. De uurgrenzen van de middelste bundels kwamen in de opgehaalde tekst niet als aparte koppen mee; bevestig die grenzen in de Apple Developer-app voor je een bundel koopt. Ongebruikte uren schuiven niet door. Apple schrijft dat je de eerste workflow in Xcode 15 of nieuwer configureert. Xcode Cloud is dus geen start zonder ooit een Mac te raken, tenzij je die ene configuratie op een geleende of gehuurde Mac doet. Daarna zijn builds vanuit App Store Connect te volgen. Xcode Cloud bouwt alleen Apple-platformen.

**Codemagic** ([prijzen](https://codemagic.io/pricing/), [Capacitor-workflow](https://docs.codemagic.io/yaml-quick-start/building-an-ionic-app/)). Gehoste Macs, zonder eigen Mac. Het individuele plan geeft 500 gratis macOS-M2-minuten per maand, één build tegelijk, daarna US$ 0,095 per minuut op een Mac mini M2 en US$ 0,114 op een Mac mini M4. Publiceren naar App Store Connect gaat met een API-sleutel. Die sleutel hoort niet in deze repository.

**GitHub-hosted macOS-runners** ([Actions runner pricing](https://docs.github.com/en/billing/reference/actions-runner-pricing)). US$ 0,062 per minuut voor een macOS-runner met 3 of 4 cores. Grotere runners (onder meer macOS 5-core M2 Pro, US$ 0,102 per minuut) zijn er voor Team- en Enterprise-organisaties. Signing blijft in geheimen van de CI, niet in git. Dit is de derde werkbare route en de meest voor de hand liggende als de code toch al op GitHub staat.

Een eerste `ios/`-project kan op zo'n gehoste Mac worden gegenereerd. Die map committen we in deze stap niet.

## 9. Apple Developer Program

Het **Apple Developer Program kost 99 USD per lidmaatschapsjaar**.

Bronnen, 14 november 2026:

- [Apple Developer Program](https://developer.apple.com/programs/): "\$99 annual membership".
- [Become a member](https://developer.apple.com/programs/enroll/): "The Apple Developer Program is 99 USD per membership year. Prices may vary by region and are listed in local currency during the enrollment process."
- [Program enrollment](https://developer.apple.com/help/account/membership/program-enrollment/): het jaarbedrag is 99 USD, in lokale valuta waar dat beschikbaar is.

Er staat op die pagina's geen vast bedrag in euro. Het bedrag in euro verschijnt pas tijdens het afrekenen. Een gratis Apple Account is niet hetzelfde als dit lidmaatschap. Distribueren via de App Store hoort bij het betaalde programma. Een fee waiver geldt volgens [Apple's fee-waiverpagina](https://developer.apple.com/help/account/membership/fee-waivers/) voor bepaalde non-profits, onderwijs en overheid, en uitdrukkelijk niet voor een individu, eenmanszaak of eenmansbedrijf.

**Individu of organisatie.** Deze notitie kiest niet.

Apple beschrijft het onderscheid zo ([enrollment](https://developer.apple.com/programs/enroll/), [D-U-N-S](https://developer.apple.com/help/account/membership/D-U-N-S/), [program enrollment](https://developer.apple.com/help/account/membership/program-enrollment/)):

- **Individu**, inclusief sole proprietor / single person business. Geen D-U-N-S. De wettelijke persoonsnaam van de Account Holder wordt de verkopersnaam op de App Store. Een alias, bijnaam of bedrijfsnaam als voor- of achternaam vertraagt de aanmelding. Apple zegt dat een eenmanszaak als individu moet inschrijven als de rechtsvorm een sole proprietorship is.
- **Organisatie.** De organisatie moet een rechtspersoon zijn die contracten kan sluiten. Een D-U-N-S-nummer is verplicht (behalve voor overheden) en moet op die rechtspersoon staan. DBA's, fictieve namen, handelsnamen en filialen worden niet geaccepteerd. De wettelijke entiteitsnaam wordt de verkopersnaam. Daarnaast vraagt Apple een werkmail op het domein van de organisatie, een publieke site op dat domein, en iemand die de organisatie juridisch mag binden.

De onderneming in de privacytekst is de Nederlandse eenmanszaak **De Bumperbank**, handelsnaam **CodedByDefault** (KvK 42171617). Een eenmanszaak heeft in het Nederlandse recht geen eigen rechtspersoonlijkheid; de eigenaar is de ondernemer. Dat raakt Apple's eis dat een organisatie een legal entity is.

Gevolgen, zonder keuze:

- Schrijft de eenmanszaak zich in als **individu**, dan toont de App Store de wettelijke naam van de persoon, niet de handelsnaam CodedByDefault en niet vanzelf de naam De Bumperbank. Het contract staat op die persoon.
- Een poging als **organisatie** heeft een D-U-N-S nodig op een naam die Apple als rechtspersoon accepteert. Staat Dun & Bradstreet de zaak als sole proprietorship, dan is Apple's eigen antwoord om als individu in te schrijven ("Your organization is not listed as a legal entity"). De verkopersnaam van een organisatie zou de naam op dat D-U-N-S-record zijn, niet de handelsnaam. Het contactadres in de privacytekst is een Gmail-adres; een organisatielidmaatschap vraagt een werkmail op het organisatiedomein.
- Een D-U-N-S aanvragen maakt van een handelsnaam nog geen rechtspersoon. Apple waarschuwt daar zelf voor.

Welke inschrijving past, is een beslissing van de eigenaar samen met wie de inschrijving doet. Dit concept legt haar niet vast.

## 10. Android Health Connect, later

Health Connect is de Android-tegenhanger, niet een kopie van HealthKit. De [lijst met datatypen](https://developer.android.com/health-and-fitness/health-connect/data-types) (14 november 2026) bevat vitale functies, activiteit, lichaamssamenstelling, cyclus en voeding. Er staat geen symptoomtype `bloating`, `nausea` of een algemene klacht tussen. Voeding bestaat wel, FODMAP niet. Dezelfde mapping kan dus niet worden hergebruikt tot Google een passend type toevoegt, of tot een aparte scope wordt gekozen. De interface `HealthSyncClient` laat een tweede platform later toe. Deze stap levert geen Android-project.

## 11. Open punten die stap B en C blokkeren

Stap B is een native build met een echte bridge. Stap C is sync die aan staat en gegevens schrijft. Beide blijven dicht tot de punten hieronder zijn opgelost. Deze pull request voert ze niet uit.

1. **DPIA (AVG, bijzondere persoonsgegevens).** Klachten en ernst zijn gezondheidsgegevens in de zin van artikel 9 AVG. Kopiëren naar Apple Health is een nieuwe verwerking, met een ander doel dan het dagboek in Supabase bewaren. Het bestaande werkdocument `docs/dpia-template.md` dekt die stroom niet: ontvanger op het apparaat, bewaarplaats in Gezondheid, intrekking, wissen van eigen samples, back-ups en iCloud, en het verschil met de accounttoestemming. De DPIA moet zijn bijgewerkt en beoordeeld voor er één sample wordt geschreven. Er is nog geen verwerkersrol voor Apple vastgesteld; gegevens die alleen op het apparaat in Gezondheid staan, zijn niet automatisch "geen verwerking".
2. **MDR-check.** De app zegt nu dat ze geen diagnose stelt en geen dieetbehandeling voorschrijft. Of een klachtendagboek dat naar Apple Health schrijft een medisch hulpmiddel is, of een wellness-app blijft, moet iemand met die bevoegdheid toetsen. Dit document doet die toets niet.
3. **Goedkeuring van Gomez.** Stap B en C wachten op die goedkeuring. Ze staat niet in deze repository en wordt hier niet ingevuld of aangenomen.

Daarnaast, voordat een binary de review in gaat: privacytekst en App Store-etiket bijwerken, de bundle-id en de inschrijvingsvorm kiezen, de 4.2-strategie vastleggen, en bevestigen dat de schil geen gezondheidsgegevens in logs of analytics schrijft.

## 12. Buiten scope van deze pull request

Geen HealthKit-aanroep die draait, geen schrijven naar Gezondheid, geen database-migratie, geen wijziging aan productiegegevens, omgevingsvariabelen of Supabase, geen nieuwe toestemmings-UI, en geen merge.
