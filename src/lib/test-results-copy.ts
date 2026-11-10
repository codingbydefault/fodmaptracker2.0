import type { AppLanguage } from "@/lib/i18n";

export const testResultKeys = ["tolerated", "portion_sensitive", "possible_trigger", "inconclusive"] as const;
export type TestResultKey = (typeof testResultKeys)[number];

type TestResultsCopy = {
  pageTitle: string;
  title: string;
  fileName: string;
  empty: string;
  saved: string;
  note: string;
  print: string;
  choose: string;
  yourNote: string;
  severity: string;
  results: Record<TestResultKey, string>;
};

export const testResultsCopy: Record<AppLanguage, TestResultsCopy> = {
  nl: {
    pageTitle: "Herintroductie",
    title: "Mijn testresultaten",
    fileName: "Mijn testresultaten",
    empty: "Nog geen afgeronde tests. Hier verschijnt alleen wat je zelf hebt ingevoerd.",
    saved: "Je notitie staat in Mijn testresultaten.",
    note: "Dit overzicht toont alleen wat je zelf hebt ingevoerd. Je diëtist trekt de conclusie.",
    print: "Afdrukken of opslaan als PDF",
    choose: "Kies wat je zelf wilt vastleggen…",
    yourNote: "Wat wil je zelf vastleggen na drie dagen?",
    severity: "Hoogste ernst: {severity}/10 · getest {date}",
    results: {
      tolerated: "Goed verdragen",
      portion_sensitive: "Portiegevoelig",
      possible_trigger: "Mogelijk gevoelig",
      inconclusive: "Onvoldoende duidelijk",
    },
  },
  en: {
    pageTitle: "Reintroduction",
    title: "My test results",
    fileName: "My test results",
    empty: "No finished tests yet. Only what you enter yourself appears here.",
    saved: "Your note is in My test results.",
    note: "This overview only shows what you entered yourself. Your dietitian draws the conclusion.",
    print: "Print or save as PDF",
    choose: "Choose what you want to record yourself…",
    yourNote: "What do you want to record yourself after three days?",
    severity: "Highest severity: {severity}/10 · tested {date}",
    results: {
      tolerated: "Seemed fine",
      portion_sensitive: "Depends on the portion",
      possible_trigger: "Seemed sensitive",
      inconclusive: "Not clear yet",
    },
  },
  de: {
    pageTitle: "Wiedereinführung",
    title: "Meine Testergebnisse",
    fileName: "Meine Testergebnisse",
    empty: "Noch keine abgeschlossenen Tests. Hier erscheint nur, was du selbst eingetragen hast.",
    saved: "Deine Notiz steht in Meine Testergebnisse.",
    note: "Diese Übersicht zeigt nur, was du selbst eingetragen hast. Die Ernährungsfachkraft zieht die Schlussfolgerung.",
    print: "Drucken oder als PDF speichern",
    choose: "Wähle, was du selbst festhalten möchtest…",
    yourNote: "Was möchtest du nach drei Tagen selbst festhalten?",
    severity: "Höchster Schweregrad: {severity}/10 · getestet {date}",
    results: {
      tolerated: "Schien gut zu gehen",
      portion_sensitive: "Hängt von der Portion ab",
      possible_trigger: "Schien empfindlich",
      inconclusive: "Noch unklar",
    },
  },
  fr: {
    pageTitle: "Réintroduction",
    title: "Mes résultats de test",
    fileName: "Mes résultats de test",
    empty: "Aucun test terminé pour l’instant. Seules vos propres saisies apparaissent ici.",
    saved: "Votre note se trouve dans Mes résultats de test.",
    note: "Cet aperçu montre seulement ce que vous avez saisi vous-même. C’est votre diététicien·ne qui en tire la conclusion.",
    print: "Imprimer ou enregistrer en PDF",
    choose: "Choisissez ce que vous voulez noter vous-même…",
    yourNote: "Que voulez-vous noter vous-même après trois jours ?",
    severity: "Sévérité la plus haute : {severity}/10 · testé le {date}",
    results: {
      tolerated: "Semblait bien passé",
      portion_sensitive: "Dépend de la portion",
      possible_trigger: "Semblait sensible",
      inconclusive: "Pas encore clair",
    },
  },
};

export function testResultLine(template: string, severity: number, date: string) {
  return template.replace("{severity}", String(severity)).replace("{date}", date);
}
