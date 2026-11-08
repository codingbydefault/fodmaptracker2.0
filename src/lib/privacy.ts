import type { AppLanguage } from "@/lib/i18n";

export const PRIVACY_NOTICE_VERSION = "2026-11-05.2";

export const PRIVACY_CONTACT_EMAIL = "codedbydefault@gmail.com";

export const privacyController = {
  legalName: "De Bumperbank",
  tradeName: "CodedByDefault",
  kvk: "42171617",
  btw: "NL005557496B77",
  place: "Hulst, Zeeland (Nederland)",
} as const;

export type PrivacySection = {
  id: string;
  heading: string;
  paragraphs: string[];
};

export type PrivacyNotice = {
  title: string;
  description: string;
  draft: string;
  intro: string;
  sections: PrivacySection[];
  emailLabel: string;
  regionTodo: string;
};

// Dutch is the only published text. Add fr, de and en by filling this record;
// privacyNotice() falls back to Dutch until those translations exist.
export const privacyNotices: Partial<Record<AppLanguage, PrivacyNotice>> = {
  nl: {
    title: "Privacyverklaring",
    description: "Concept-privacyverklaring van Fodmap-Tracker: welke gegevens we verwerken, waarom, en welke rechten je hebt.",
    draft: "Concept voor juridische controle. Dit is nog geen definitieve privacyverklaring. Laat deze tekst controleren voordat de app openbaar wordt aangeboden.",
    intro: "Fodmap-Tracker is een hulpmiddel om maaltijden en klachten bij te houden. De app stelt geen diagnose en geeft geen dieetbehandeling. Deze verklaring beschrijft wat we van je bewaren.",
    emailLabel: "E-mail",
    regionTodo: "TODO: vul de hostingregio in nadat die in het Supabase-project en het Vercel-project is bevestigd. De regio staat niet in deze repository en is daarom hier niet ingevuld.",
    sections: [
      {
        id: "verantwoordelijke",
        heading: "Wie is verantwoordelijk?",
        paragraphs: [
          "De verwerkingsverantwoordelijke is De Bumperbank, handelend onder de naam CodedByDefault, gevestigd in Hulst, Zeeland (Nederland), KvK 42171617, btw-nummer NL005557496B77.",
          "Voor privacyvragen, inzage, een export, correctie of een verwijderverzoek gebruik je het contactadres onderaan deze pagina, of de knoppen in je profiel als je bent ingelogd.",
        ],
      },
      {
        id: "gegevens",
        heading: "Welke gegevens we verwerken",
        paragraphs: [
          "Account: e-mailadres en een wachtwoord. Het wachtwoord wordt door Supabase Auth opgeslagen als een hash. Wij kunnen het wachtwoord niet teruglezen.",
          "Profiel: naam, gebruikersnaam, profielfoto, voorkeurstaal, tijdzone, het tijdstip van je toestemming voor gezondheidsgegevens en de versie van deze verklaring die je hebt aanvaard.",
          "Gezondheidsgegevens: maaltijden (naam, eetmoment, hoeveelheid, notities, tijdstip en een optionele foto), klachten (soort, eigen omschrijving, ernst van 0 tot 10, notities, tijdstip en een optionele koppeling aan een maaltijd), de dieetfase die je zelf start, herintroductietesten en je persoonlijke tolerantie-uitkomsten.",
          "Recepten en weekmenu: recepten die je zelf invoert, of je ze privé houdt of deelt met andere ingelogde gebruikers, favorieten, en de planning per dag en eetmoment.",
          "Etiketcontrole: als je uitdrukkelijk kiest voor ‘Product in de app bewaren’, delen we de barcode, het land van aankoop en de intern herkende ingrediënten in de productencatalogus zodat andere gebruikers het product niet opnieuw hoeven te fotograferen. De etiketfoto zelf blijft privé bij jouw account.",
          "Technische gegevens: sessiecookies die nodig zijn om je ingelogd te houden. Alleen na afzonderlijke toestemming op de publieke startpagina gebruikt onze bezoekersteller een willekeurige, pseudonieme browsercode en per browsersessie een tijdelijke code. De database bewaart daarvan onomkeerbare hashes, eerste en laatste bezoek en sessieaantallen; geen dagboekinhoud. Na dezelfde toestemming kunnen Vercel Analytics, Speed Insights en Google Tag Manager statistieken over die startpagina ontvangen. Deze marketingtools worden niet geladen in de ingelogde patiëntomgeving.",
          "Concept voor Gomez — cookieloze paginatelling: alleen in de productieomgeving (niet lokaal en niet op een Vercel-preview) melden we elke paginaweergave één keer aan het bezoekersdashboard van CodedByDefault op www.codedbydefault.com. Mee gaat de sitenaam fodmap, het pad zonder zoekparameters en zonder identificerende of gezondheidsgerelateerde onderdelen (die vervangen we door een placeholder), en als de browser die meestuurt de verwijzende site, eveneens zonder zoekparameters of identificerende padonderdelen. We plaatsen daarbij geen cookie, bewaren geen browsercode en sturen geen e-mailadres, account of dagboekinhoud mee. Staat Do Not Track of Global Privacy Control aan, dan sturen we niets. Deze alinea is een concept en moet nog juridisch worden gecontroleerd.",
          "Vertaling: wanneer je Engels, Frans of Duits kiest, kunnen uitsluitend teksten van Fodmap-Tracker-recepten naar de vertaaldienst MyMemory worden gestuurd. Persoonlijke dagboekgegevens en recepten van gebruikers worden niet voor automatische vertaling verzonden. Vertalingen worden in je browser opgeslagen om herhaalde aanvragen te beperken.",
          "Professionele begeleiding: een diëtistprofiel bevat de professionele naam, een optioneel registratie- of kwaliteitsnummer en de verificatiestatus. Als patiënt kun je via een uitnodiging uitdrukkelijk toestemming geven om geselecteerde dagboek-, fase- en productgegevens met een geverifieerde diëtist te delen. De diëtist kan binnen die koppeling begeleidingsplannen en gedeelde notities toevoegen.",
        ],
      },
      {
        id: "grondslag",
        heading: "Waarom en op welke grondslag",
        paragraphs: [
          "We verwerken je account, profiel, recepten en weekmenu om de app te leveren die je aanvraagt. De grondslag daarvoor is de overeenkomst (artikel 6 lid 1 onder b AVG).",
          "Maaltijden, klachten, maaltijdfoto’s en de dieetfase kunnen gegevens over je gezondheid zijn. Die verwerken we alleen met je uitdrukkelijke toestemming (artikel 9 lid 2 onder a AVG). Het keuzevak bij het aanmaken van een account staat standaard uit. Zonder dat vak maken we geen account aan.",
          "We gebruiken deze gegevens niet om reclameprofielen te maken en we verkopen ze niet. De app bevat in deze versie geen advertenties.",
          "Je kunt de toestemming intrekken door je account te verwijderen. Daarmee wissen we de gezondheidsgegevens die aan dat account hangen. Je kunt ook een verzoek sturen naar het contactadres.",
          "Een koppeling met een diëtist is vrijwillig en staat los van je algemene toestemming voor gezondheidsgegevens. Je kunt de koppeling op ieder moment intrekken via Begeleiding. Vanaf dat moment kan de diëtist je dossier niet meer openen. De diëtist kan je oorspronkelijke dagboekregistraties niet wijzigen.",
        ],
      },
      {
        id: "analytics",
        heading: "Analyticscookies en toestemming",
        paragraphs: [
          "We activeren de bezoekersteller met browsercode, Vercel Analytics, Speed Insights en marketinganalytics op de publieke startpagina uitsluitend als je op ‘Analytics toestaan’ klikt. We vragen deze toestemming apart van je toestemming voor gezondheidsgegevens. We delen geen e-mailadressen, medische registraties of patiëntdossiers met Google Analytics of andere marketingtools.",
          "Je kunt ook ‘Alleen noodzakelijk’ kiezen. Je keuze wordt lokaal op je apparaat onthouden. Via ‘Cookievoorkeuren’ op de startpagina kun je je keuze later veranderen. Een gewijzigde keuze geldt voor de volgende trackingactiviteit; reeds rechtmatig verzamelde gegevens worden daarmee niet automatisch gewist.",
          "Bij toestemming kan Google Tag Manager een Google Analytics-tag op de startpagina laden, zodra die is geconfigureerd. Vercel Analytics en Speed Insights meten uitsluitend die startpagina. We beperken verzonden URL's tot het publieke pad, zonder zoekparameters. We gebruiken deze informatie niet voor individuele gezondheidsprofielen of gepersonaliseerde gezondheidsadvertenties.",
          "Concept voor Gomez: de cookieloze paginatelling staat los van deze cookiekeuze. De tekst daarover is nog een concept.",
        ],
      },
      {
        id: "opslag",
        heading: "Waar de gegevens staan",
        paragraphs: [
          "De database, de accounts en de privéfoto’s staan bij Supabase. De website wordt gehost bij Vercel. Dat zijn verwerkers. Er hoort een verwerkersovereenkomst met hen te zijn voordat de app openbaar wordt aangeboden.",
          "Foto’s staan in privé-opslag (buckets meal-photos, profile-photos en label-photos) en zijn niet openbaar. De app toont ze alleen waar nodig via een tijdelijke link.",
        ],
      },
      {
        id: "bewaartermijn",
        heading: "Hoe lang we gegevens bewaren",
        paragraphs: [
          "We bewaren je gegevens zolang je account bestaat. Er is geen automatische verwijdering na een vaste termijn.",
          "Als je het account verwijdert, verwijderen we je databasegegevens en je foto’s, en daarna het account zelf. Back-ups van de leverancier kunnen een kopie nog een beperkte tijd bewaren.",
          "TODO: vul de concrete back-uptermijn in nadat die in het Supabase-project is vastgesteld. Die termijn staat niet in deze repository.",
        ],
      },
      {
        id: "rechten",
        heading: "Jouw rechten",
        paragraphs: [
          "Je kunt je gegevens inzien en downloaden via Profiel: een JSON-bestand met je accountgegevens, en CSV-bestanden voor maaltijden en klachten.",
          "Je kunt maaltijden, klachten, recepten, het weekmenu en je profiel in de app zelf corrigeren of wissen. Herintroductietesten kun je stoppen; de testgeschiedenis en tolerantie-uitkomsten staan ook in je volledige JSON-export.",
          "Je kunt het hele account in de app verwijderen (Profiel, typ VERWIJDER). Zonder in te loggen kun je een verwijderverzoek doen via de pagina Account verwijderen.",
          "Je kunt een klacht indienen bij de Autoriteit Persoonsgegevens.",
          "Bij professionele begeleiding kun je zien met welke diëtist je bent gekoppeld, welke adviezen met je zijn gedeeld en de toegang zelf beëindigen. Dossiertoegang door de diëtist wordt gelogd.",
        ],
      },
    ],
  },
};

export function privacyNotice(language: AppLanguage = "nl"): PrivacyNotice {
  return privacyNotices[language] ?? privacyNotices.nl!;
}
