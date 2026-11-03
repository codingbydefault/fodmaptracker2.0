import type { AppLanguage } from "@/lib/i18n";

export const PRIVACY_NOTICE_VERSION = "2026-11-03.1";

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
          "Technische gegevens: sessiecookies die nodig zijn om je ingelogd te houden. Voor onze eigen bezoekersteller bewaren we in je browser een willekeurige anonieme code en per browsersessie een tijdelijke code. In de database staan daarvan alleen onomkeerbare hashes, eerste en laatste bezoek en het aantal sessies; geen IP-adres, browserkenmerken, e-mailadres of dagboekinhoud. Vercel Analytics en Speed Insights kunnen daarnaast anonieme gebruiks- en prestatiemetingen van pagina’s ontvangen.",
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
        ],
      },
    ],
  },
};

export function privacyNotice(language: AppLanguage = "nl"): PrivacyNotice {
  return privacyNotices[language] ?? privacyNotices.nl!;
}
