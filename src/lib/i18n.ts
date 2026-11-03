import type { MealType, MenuMealType, SymptomType } from "@/lib/types";
export const languages = ["en", "nl", "fr", "de"] as const;
export type AppLanguage = (typeof languages)[number];

export const languageInfo: Record<
  AppLanguage,
  { flag: string; label: string; locale: string }
> = {
  nl: { flag: "🇳🇱", label: "Nederlands", locale: "nl-NL" },
  fr: { flag: "🇫🇷", label: "Français", locale: "fr-BE" },
  de: { flag: "🇩🇪", label: "Deutsch", locale: "de-DE" },
  en: { flag: "🇬🇧", label: "English", locale: "en-GB" },
};

export function appLanguage(value: unknown): AppLanguage {
  return languages.includes(value as AppLanguage)
    ? (value as AppLanguage)
    : "en";
}

export const shellText = {
  nl: {
    overview: "Overzicht",
    recipes: "Recepten",
    week: "Weekmenu",
    profile: "Profiel",
    meal: "Maaltijd",
    symptom: "Klacht",
    admin: "Beheerder",
    logout: "Uitloggen",
    nav: "Hoofdnavigatie",
    language: "Taal wijzigen",
    privacy: "Privacyverklaring",
    deleteAccount: "Account verwijderen",
    footer:
      "Fodmap-Tracker helpt je gegevens bij te houden en stelt geen diagnose. Bespreek voedingskeuzes met een gekwalificeerde diëtist.",
  },
  fr: {
    overview: "Aperçu",
    recipes: "Recettes",
    week: "Menu semaine",
    profile: "Profil",
    meal: "Repas",
    symptom: "Symptôme",
    admin: "Admin",
    logout: "Déconnexion",
    nav: "Navigation principale",
    language: "Changer de langue",
    privacy: "Confidentialité",
    deleteAccount: "Supprimer le compte",
    footer:
      "Fodmap-Tracker vous aide à enregistrer vos données et ne pose aucun diagnostic. Discutez de vos choix alimentaires avec un diététicien qualifié.",
  },
  de: {
    overview: "Übersicht",
    recipes: "Rezepte",
    week: "Wochenplan",
    profile: "Profil",
    meal: "Mahlzeit",
    symptom: "Beschwerde",
    admin: "Verwaltung",
    logout: "Abmelden",
    nav: "Hauptnavigation",
    language: "Sprache ändern",
    privacy: "Datenschutz",
    deleteAccount: "Konto löschen",
    footer:
      "Fodmap-Tracker hilft dir, deine Daten zu erfassen, und stellt keine Diagnose. Besprich Ernährungsentscheidungen mit einer qualifizierten Ernährungsfachkraft.",
  },
  en: {
    overview: "Overview",
    recipes: "Recipes",
    week: "Weekly menu",
    profile: "Profile",
    meal: "Meal",
    symptom: "Symptom",
    admin: "Admin",
    logout: "Log out",
    nav: "Main navigation",
    language: "Change language",
    privacy: "Privacy notice",
    deleteAccount: "Delete account",
    footer:
      "Fodmap-Tracker helps you keep track of your information and does not provide a diagnosis. Discuss dietary choices with a qualified dietitian.",
  },
} satisfies Record<AppLanguage, Record<string, string>>;

export const localizedMealNames: Record<
  AppLanguage,
  Record<MealType, string>
> = {
  nl: {
    ontbijt: "Ontbijt",
    lunch: "Lunch",
    avondeten: "Avondeten",
    tussendoor: "Tussendoor",
  },
  en: {
    ontbijt: "Breakfast",
    lunch: "Lunch",
    avondeten: "Dinner",
    tussendoor: "Snack",
  },
  fr: {
    ontbijt: "Petit-déjeuner",
    lunch: "Déjeuner",
    avondeten: "Dîner",
    tussendoor: "Collation",
  },
  de: {
    ontbijt: "Frühstück",
    lunch: "Mittagessen",
    avondeten: "Abendessen",
    tussendoor: "Zwischenmahlzeit",
  },
};
export const localizedMenuMealNames = localizedMealNames as Record<
  AppLanguage,
  Record<MenuMealType, string>
>;
export const localizedSymptomNames: Record<
  AppLanguage,
  Record<SymptomType, string>
> = {
  nl: {
    buikpijn: "Buikpijn",
    opgeblazen: "Opgeblazen gevoel",
    winderigheid: "Winderigheid",
    stoelgang: "Veranderde stoelgang",
    misselijkheid: "Misselijkheid",
    anders: "Anders",
  },
  en: {
    buikpijn: "Abdominal pain",
    opgeblazen: "Bloating",
    winderigheid: "Gas",
    stoelgang: "Changed bowel movements",
    misselijkheid: "Nausea",
    anders: "Other",
  },
  fr: {
    buikpijn: "Douleur abdominale",
    opgeblazen: "Ballonnements",
    winderigheid: "Flatulences",
    stoelgang: "Transit modifié",
    misselijkheid: "Nausées",
    anders: "Autre",
  },
  de: {
    buikpijn: "Bauchschmerzen",
    opgeblazen: "Blähgefühl",
    winderigheid: "Blähungen",
    stoelgang: "Veränderter Stuhlgang",
    misselijkheid: "Übelkeit",
    anders: "Andere",
  },
};
