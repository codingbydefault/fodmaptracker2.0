import type { AppLanguage } from "@/lib/i18n";
import type { DietJourneyStage } from "@/lib/diet-phase";

const nl = {
  eyebrow: "Jouw persoonlijke route",
  title: "De fases van het FODMAP-traject",
  intro: "Bekijk waar je nu staat, wat de volgende stap betekent en welke keuzes je per fase hebt. De app ondersteunt je planning en registraties, maar stelt geen diagnose.",
  current: "Je huidige fase",
  stages: {
    not_started: "Nog niet gestart",
    elimination: "Eliminatiefase",
    reintroduction_ready: "Klaar voor herintroductie",
    reintroduction: "Herintroductiefase",
    maintenance: "Persoonlijke onderhoudsfase",
  } satisfies Record<DietJourneyStage, string>,
  step: "Stap",
  active: "Nu actief",
  completed: "Doorlopen",
  upcoming: "Volgende stap",
  elimination: {
    title: "Eliminatiefase",
    body: "Tijdelijk vereenvoudig je de voeding om een rustige uitgangssituatie te creëren. Je kiest zelf een planning van 14 tot 42 dagen.",
    tips: ["Plan eenvoudige, gevarieerde maaltijden.", "Registreer klachten én dagen zonder klachten.", "Blijf niet langer beperken dan nodig."],
    duration: "Aantal dagen",
    help: "Kies 14 tot 42 dagen (2–6 weken).",
    safety: "Ik heb de veiligheidsinformatie gelezen en begrijp dat deze teller geen persoonlijk dieetadvies geeft.",
    start: "Eliminatiefase starten",
    restart: "Nieuwe eliminatiefase starten",
    restartConfirm: "De huidige fase afsluiten en een nieuwe eliminatiefase starten?",
  },
  reintro: {
    title: "Herintroductiefase",
    body: "Je test één FODMAP-groep tegelijk en registreert drie testdagen. Wat je invoert, verschijnt in Mijn testresultaten.",
    tips: ["Kies één duidelijk testvoedingsmiddel.", "Houd de rest van je voeding zo stabiel mogelijk.", "Noteer portie, timing en klachten nauwkeurig."],
    action: "Herintroductie openen",
  },
  maintenance: {
    title: "Persoonlijke onderhoudsfase",
    body: "Je gebruikt wat je zelf hebt ingevoerd om zo gevarieerd mogelijk te eten. Je kunt later opnieuw testen wanneer een notitie onduidelijk is of van de portie afhangt.",
    tips: ["Blijf goed verdragen voedingsmiddelen eten.", "Houd rekening met persoonlijke portiegrenzen.", "Werk Mijn testresultaten bij met wat je zelf hebt genoteerd."],
    action: "Mijn testresultaten",
    progress: "FODMAP-groepen onderzocht",
  },
  started: "Je eliminatiefase is gestart met de gekozen duur.",
  durationError: "Kies een duur tussen 14 en 42 dagen.",
  saveError: "De fase kon niet worden opgeslagen. Probeer opnieuw.",
};

const en: typeof nl = {
  eyebrow: "Your personal route", title: "The phases of the FODMAP journey", intro: "See where you are now, what the next step means and which options you have in each phase. The app supports planning and tracking but does not diagnose.", current: "Your current phase",
  stages: { not_started: "Not started", elimination: "Elimination phase", reintroduction_ready: "Ready for reintroduction", reintroduction: "Reintroduction phase", maintenance: "Personal maintenance phase" },
  step: "Step", active: "Active now", completed: "Completed", upcoming: "Next step",
  elimination: { title: "Elimination phase", body: "Temporarily simplify your diet to create a calm baseline. You choose a plan of 14 to 42 days.", tips: ["Plan simple, varied meals.", "Record symptoms and symptom-free days.", "Do not restrict for longer than necessary."], duration: "Number of days", help: "Choose 14 to 42 days (2–6 weeks).", safety: "I have read the safety information and understand that this counter is not personalised dietary advice.", start: "Start elimination phase", restart: "Start a new elimination phase", restartConfirm: "End the current phase and start a new elimination phase?" },
  reintro: { title: "Reintroduction phase", body: "Test one FODMAP group at a time and record three test days. What you enter appears in My test results.", tips: ["Choose one clear test food.", "Keep the rest of your diet as stable as possible.", "Record portion, timing and symptoms carefully."], action: "Open reintroduction" },
  maintenance: { title: "Personal maintenance phase", body: "Use what you entered yourself to eat as varied a diet as possible. You can test again later when a note is unclear or depends on the portion.", tips: ["Keep eating foods you tolerate well.", "Respect your personal portion limits.", "Update My test results with what you noted yourself."], action: "My test results", progress: "FODMAP groups investigated" },
  started: "Your elimination phase has started with the selected duration.", durationError: "Choose a duration between 14 and 42 days.", saveError: "The phase could not be saved. Please try again.",
};

const fr: typeof nl = {
  eyebrow: "Votre parcours personnel", title: "Les phases du parcours FODMAP", intro: "Voyez où vous en êtes, ce que signifie l’étape suivante et les choix disponibles à chaque phase. L’application aide à planifier et noter, mais ne pose pas de diagnostic.", current: "Votre phase actuelle",
  stages: { not_started: "Pas encore commencé", elimination: "Phase d’élimination", reintroduction_ready: "Prêt·e pour la réintroduction", reintroduction: "Phase de réintroduction", maintenance: "Phase d’entretien personnelle" },
  step: "Étape", active: "Active maintenant", completed: "Terminée", upcoming: "Étape suivante",
  elimination: { title: "Phase d’élimination", body: "Simplifiez temporairement l’alimentation pour créer une base stable. Vous choisissez un programme de 14 à 42 jours.", tips: ["Planifiez des repas simples et variés.", "Notez les symptômes et les jours sans symptômes.", "Ne vous limitez pas plus longtemps que nécessaire."], duration: "Nombre de jours", help: "Choisissez de 14 à 42 jours (2–6 semaines).", safety: "J’ai lu les informations de sécurité et je comprends que ce compteur n’est pas un conseil alimentaire personnalisé.", start: "Commencer l’élimination", restart: "Commencer une nouvelle élimination", restartConfirm: "Clôturer la phase actuelle et commencer une nouvelle élimination ?" },
  reintro: { title: "Phase de réintroduction", body: "Testez un groupe FODMAP à la fois et notez trois jours de test. Ce que vous saisissez apparaît dans Mes résultats de test.", tips: ["Choisissez un aliment test clair.", "Gardez le reste de l’alimentation aussi stable que possible.", "Notez précisément la portion, le moment et les symptômes."], action: "Ouvrir la réintroduction" },
  maintenance: { title: "Phase d’entretien personnelle", body: "Utilisez ce que vous avez saisi vous-même pour manger aussi varié que possible. Vous pourrez retester plus tard une note incertaine ou liée à la portion.", tips: ["Continuez les aliments bien tolérés.", "Respectez vos limites personnelles de portion.", "Mettez à jour Mes résultats de test avec ce que vous avez noté vous-même."], action: "Mes résultats de test", progress: "groupes FODMAP étudiés" },
  started: "Votre phase d’élimination a commencé avec la durée choisie.", durationError: "Choisissez une durée comprise entre 14 et 42 jours.", saveError: "La phase n’a pas pu être enregistrée. Réessayez.",
};

const de: typeof nl = {
  eyebrow: "Dein persönlicher Weg", title: "Die Phasen des FODMAP-Wegs", intro: "Sieh, wo du gerade stehst, was der nächste Schritt bedeutet und welche Möglichkeiten jede Phase bietet. Die App unterstützt Planung und Dokumentation, stellt aber keine Diagnose.", current: "Deine aktuelle Phase",
  stages: { not_started: "Noch nicht begonnen", elimination: "Eliminationsphase", reintroduction_ready: "Bereit zur Wiedereinführung", reintroduction: "Wiedereinführungsphase", maintenance: "Persönliche Erhaltungsphase" },
  step: "Schritt", active: "Jetzt aktiv", completed: "Durchlaufen", upcoming: "Nächster Schritt",
  elimination: { title: "Eliminationsphase", body: "Vereinfache deine Ernährung vorübergehend, um eine ruhige Ausgangslage zu schaffen. Du wählst 14 bis 42 Tage.", tips: ["Plane einfache, abwechslungsreiche Mahlzeiten.", "Dokumentiere Beschwerden und beschwerdefreie Tage.", "Schränke dich nicht länger als nötig ein."], duration: "Anzahl der Tage", help: "Wähle 14 bis 42 Tage (2–6 Wochen).", safety: "Ich habe die Sicherheitsinformationen gelesen und verstehe, dass dieser Zähler keine persönliche Ernährungsberatung darstellt.", start: "Eliminationsphase starten", restart: "Neue Eliminationsphase starten", restartConfirm: "Die aktuelle Phase beenden und eine neue Eliminationsphase starten?" },
  reintro: { title: "Wiedereinführungsphase", body: "Teste jeweils eine FODMAP-Gruppe und dokumentiere drei Testtage. Was du einträgst, erscheint in Meine Testergebnisse.", tips: ["Wähle ein eindeutiges Testlebensmittel.", "Halte die übrige Ernährung möglichst stabil.", "Notiere Portion, Zeitpunkt und Beschwerden genau."], action: "Wiedereinführung öffnen" },
  maintenance: { title: "Persönliche Erhaltungsphase", body: "Nutze, was du selbst eingetragen hast, für möglichst viel Vielfalt. Unklare oder portionsabhängige Notizen kannst du später erneut testen.", tips: ["Iss gut verträgliche Lebensmittel weiter.", "Beachte deine persönlichen Portionsgrenzen.", "Aktualisiere Meine Testergebnisse mit dem, was du selbst notiert hast."], action: "Meine Testergebnisse", progress: "FODMAP-Gruppen untersucht" },
  started: "Deine Eliminationsphase wurde mit der gewählten Dauer gestartet.", durationError: "Wähle eine Dauer zwischen 14 und 42 Tagen.", saveError: "Die Phase konnte nicht gespeichert werden. Versuche es erneut.",
};

export const phasePageCopy: Record<AppLanguage, typeof nl> = { nl, en, fr, de };
