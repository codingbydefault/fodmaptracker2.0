import type { DietJourneyStage } from "@/lib/diet-phase";
import type { AppLanguage } from "@/lib/i18n";

type TipPhase = "elimination" | "reintroduction" | "maintenance";
type TipParts = { focus: string[]; action: string[] };

const nl: Record<TipPhase, TipParts> = {
  elimination: {
    focus: [
      "Houd je maaltijd vandaag eenvoudig en herkenbaar.",
      "Variatie blijft belangrijk, ook binnen een tijdelijke eliminatiefase.",
      "Een rustige eetdag geeft vaak duidelijkere registraties.",
      "Portiegrootte en combinaties kunnen allebei verschil maken.",
      "Ook een dag zonder klachten is waardevolle informatie.",
    ],
    action: [
      "Plan alvast één maaltijd voor morgen.",
      "Controleer één etiket op ui, knoflook, inuline of polyolen.",
      "Noteer kort wat je at, hoeveel en hoe je je voelde.",
      "Kies vandaag verschillende toegestane kleuren groente of fruit.",
      "Neem je tijd om rustig te eten en je registratie af te ronden.",
    ],
  },
  reintroduction: {
    focus: [
      "Test één FODMAP-groep tegelijk voor een duidelijker resultaat.",
      "Een stabiele achtergrondvoeding maakt vergelijken makkelijker.",
      "Een reactie kan afhangen van de portie en niet alleen van het ingrediënt.",
      "Herintroductie draait om leren wat wél mogelijk is.",
      "Een onduidelijke test is geen mislukking en kan later opnieuw.",
    ],
    action: [
      "Leg vandaag portie, tijdstip en eventuele klachten vast.",
      "Vermijd meerdere nieuwe testproducten op dezelfde dag.",
      "Wacht met testen wanneer je ziek bent of al duidelijke klachten hebt.",
      "Controleer of je testvoedingsmiddel echt één hoofdgroep onderzoekt.",
      "Bespreek sterke of onverwachte reacties met een geschikte professional.",
    ],
  },
  maintenance: {
    focus: [
      "Je persoonlijke tolerantie is belangrijker dan een algemene verbodslijst.",
      "Blijf voldoende variëren met wat je goed verdraagt.",
      "Tolerantie kan veranderen en mag later opnieuw worden bekeken.",
      "Een notitie over de portie biedt vaak meer ruimte dan volledig vermijden.",
      "Mijn testresultaten tonen wat je zelf hebt ingevoerd. Je diëtist trekt de conclusie.",
    ],
    action: [
      "Voeg deze week één goed verdragen favoriet toe aan je weekmenu.",
      "Bekijk of een eerder onduidelijk resultaat opnieuw getest moet worden.",
      "Bewaar een praktisch alternatief voor drukke of onverwachte dagen.",
      "Gebruik je resultaten om je boodschappenlijst gevarieerd te houden.",
      "Noteer nieuwe patronen zonder op één losse ervaring te besluiten.",
    ],
  },
};

const en: Record<TipPhase, TipParts> = {
  elimination: { focus: ["Keep today's meal simple and recognisable.", "Variety remains important during a temporary elimination phase.", "A calm food day often produces clearer records.", "Portion size and combinations can both make a difference.", "A symptom-free day is valuable information too."], action: ["Plan one meal for tomorrow.", "Check one label for onion, garlic, inulin or polyols.", "Briefly record what you ate, how much and how you felt.", "Choose different permitted colours of vegetables or fruit today.", "Take time to eat calmly and complete your entry."] },
  reintroduction: { focus: ["Test one FODMAP group at a time for a clearer result.", "A stable background diet makes comparison easier.", "A response may depend on the portion, not only the ingredient.", "Reintroduction is about learning what is possible.", "An unclear test is not a failure and can be repeated later."], action: ["Record the portion, time and any symptoms today.", "Avoid several new test products on the same day.", "Delay testing when you are ill or already have clear symptoms.", "Check that your test food investigates one main group.", "Discuss strong or unexpected responses with a suitable professional."] },
  maintenance: { focus: ["Your personal tolerance matters more than a general banned-food list.", "Keep enough variety among foods you tolerate well.", "Tolerance can change and may be reviewed later.", "A note about the portion often leaves more room than avoiding a food completely.", "My test results show what you entered yourself. Your dietitian draws the conclusion."], action: ["Add one well-tolerated favourite to this week's menu.", "Review whether an earlier unclear note should be tested again.", "Keep a practical alternative for busy or unexpected days.", "Use your notes to keep the shopping list varied.", "Record new patterns and let your dietitian interpret a single experience."] },
};

const fr: Record<TipPhase, TipParts> = {
  elimination: { focus: ["Gardez le repas d’aujourd’hui simple et identifiable.", "La variété reste importante pendant une élimination temporaire.", "Une journée alimentaire stable donne souvent des notes plus claires.", "La portion et les combinaisons peuvent toutes deux compter.", "Une journée sans symptômes est aussi une information utile."], action: ["Planifiez déjà un repas pour demain.", "Vérifiez une étiquette pour l’oignon, l’ail, l’inuline ou les polyols.", "Notez brièvement ce que vous avez mangé, la quantité et votre ressenti.", "Choisissez aujourd’hui plusieurs couleurs permises de légumes ou fruits.", "Prenez le temps de manger calmement et de terminer votre note."] },
  reintroduction: { focus: ["Testez un groupe FODMAP à la fois pour un résultat plus clair.", "Une alimentation de fond stable facilite la comparaison.", "Une réaction peut dépendre de la portion, pas seulement de l’ingrédient.", "La réintroduction sert à découvrir ce qui est possible.", "Un test incertain n’est pas un échec et peut être répété."], action: ["Notez aujourd’hui la portion, l’heure et les éventuels symptômes.", "Évitez plusieurs nouveaux produits tests le même jour.", "Reportez le test si vous êtes malade ou avez déjà des symptômes nets.", "Vérifiez que l’aliment test étudie bien un groupe principal.", "Discutez d’une réaction forte ou inattendue avec un professionnel adapté."] },
  maintenance: { focus: ["Votre tolérance personnelle compte plus qu’une liste générale d’interdits.", "Conservez assez de variété parmi les aliments bien tolérés.", "La tolérance peut évoluer et être réévaluée plus tard.", "Une note sur la portion laisse souvent plus de liberté qu’un évitement total.", "Mes résultats de test montrent ce que vous avez saisi vous-même. C’est votre diététicien·ne qui en tire la conclusion."], action: ["Ajoutez un favori bien toléré au menu de cette semaine.", "Voyez si une ancienne note incertaine mérite un nouveau test.", "Gardez une alternative pratique pour les journées chargées ou imprévues.", "Utilisez vos notes pour varier la liste de courses.", "Notez les nouveaux schémas et laissez votre diététicien·ne interpréter une expérience isolée."] },
};

const de: Record<TipPhase, TipParts> = {
  elimination: { focus: ["Halte die heutige Mahlzeit einfach und gut erkennbar.", "Abwechslung bleibt auch während einer vorübergehenden Elimination wichtig.", "Ein ruhiger Ernährungstag ergibt oft klarere Einträge.", "Portionsgröße und Kombinationen können beide einen Unterschied machen.", "Auch ein beschwerdefreier Tag ist eine wertvolle Information."], action: ["Plane schon eine Mahlzeit für morgen.", "Prüfe ein Etikett auf Zwiebel, Knoblauch, Inulin oder Polyole.", "Notiere kurz, was und wie viel du gegessen hast und wie es dir ging.", "Wähle heute verschiedene erlaubte Farben bei Gemüse oder Obst.", "Nimm dir Zeit, ruhig zu essen und deinen Eintrag abzuschließen."] },
  reintroduction: { focus: ["Teste jeweils eine FODMAP-Gruppe für ein klareres Ergebnis.", "Eine stabile Hintergrundernährung erleichtert den Vergleich.", "Eine Reaktion kann von der Portion und nicht nur von der Zutat abhängen.", "Bei der Wiedereinführung lernst du, was möglich ist.", "Ein unklares Ergebnis ist kein Misserfolg und kann wiederholt werden."], action: ["Notiere heute Portion, Zeitpunkt und mögliche Beschwerden.", "Vermeide mehrere neue Testprodukte am selben Tag.", "Verschiebe den Test, wenn du krank bist oder bereits deutliche Beschwerden hast.", "Prüfe, ob dein Testlebensmittel wirklich eine Hauptgruppe untersucht.", "Besprich starke oder unerwartete Reaktionen mit einer geeigneten Fachkraft."] },
  maintenance: { focus: ["Deine persönliche Verträglichkeit zählt mehr als eine allgemeine Verbotsliste.", "Sorge bei gut verträglichen Lebensmitteln weiter für Abwechslung.", "Verträglichkeit kann sich ändern und später neu betrachtet werden.", "Eine Notiz zur Portion lässt oft mehr Spielraum als vollständiger Verzicht.", "Meine Testergebnisse zeigen, was du selbst eingetragen hast. Die Ernährungsfachkraft zieht die Schlussfolgerung."], action: ["Füge dem Wochenplan einen gut verträglichen Favoriten hinzu.", "Prüfe, ob eine frühere unklare Notiz erneut getestet werden sollte.", "Halte eine praktische Alternative für hektische oder unerwartete Tage bereit.", "Nutze deine Notizen für eine abwechslungsreiche Einkaufsliste.", "Notiere neue Muster und lass eine einzelne Erfahrung von der Ernährungsfachkraft einordnen."] },
};

const tips: Record<AppLanguage, Record<TipPhase, TipParts>> = { nl, en, fr, de };

export function phaseTipCategory(stage: DietJourneyStage): TipPhase {
  if (stage === "maintenance") return "maintenance";
  if (stage === "reintroduction" || stage === "reintroduction_ready") return "reintroduction";
  return "elimination";
}

export function dailyPhaseTip(language: AppLanguage, stage: DietJourneyStage, userId: string, date: string) {
  const parts = tips[language][phaseTipCategory(stage)];
  const day = Math.floor(new Date(`${date}T12:00:00Z`).getTime() / 86_400_000);
  const offset = [...userId].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 25;
  const index = (day + offset) % 25;
  return `${parts.focus[index % 5]} ${parts.action[Math.floor(index / 5)]}`;
}
