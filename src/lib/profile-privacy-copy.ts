import type { AppLanguage } from "@/lib/i18n";
const nl = {
  version: "Versie van de verklaring",
  notice: "Privacyverklaring",
  consent: "Toestemming voor gezondheidsgegevens vastgelegd op",
  versionWord: "versie",
  missing:
    "Voor dit account is nog geen toestemming voor gezondheidsgegevens vastgelegd.",
  agree:
    "Ik geef uitdrukkelijk toestemming zoals beschreven in de privacyverklaring.",
  record: "Toestemming vastleggen",
  meals: "CSV maaltijden",
  symptoms: "CSV klachten",
  delete: "Account verwijderen",
  deleteBody:
    "Dit wist je dagboek, foto’s, recepten, weekmenu, profiel en het account. Dit kan niet ongedaan worden.",
  type: "Typ VERWIJDER om te bevestigen",
  pattern: "VERWIJDER",
  confirm:
    "Je account en alle gegevens worden definitief verwijderd. Doorgaan?",
  photo: "Nieuwe profielfoto",
  photoHelp:
    "Laat leeg om je huidige foto te behouden. Maximaal 3 MB; opslag als WebP van maximaal 800×800.",
  usernameHelp: "3–30 tekens: letters, cijfers en underscore.",
};
const en = {
  version: "Privacy notice version",
  notice: "Privacy notice",
  consent: "Health-data consent recorded on",
  versionWord: "version",
  missing: "No health-data consent has been recorded for this account.",
  agree: "I explicitly consent as described in the privacy notice.",
  record: "Record consent",
  meals: "CSV meals",
  symptoms: "CSV symptoms",
  delete: "Delete account",
  deleteBody:
    "This deletes your diary, photos, recipes, weekly menu, profile and account. This cannot be undone.",
  type: "Type DELETE to confirm",
  pattern: "DELETE",
  confirm: "Your account and all data will be permanently deleted. Continue?",
  photo: "New profile photo",
  photoHelp:
    "Leave empty to keep your current photo. Maximum 3 MB; stored as WebP up to 800×800.",
  usernameHelp: "3–30 characters: letters, numbers and underscore.",
};
const fr = {
  version: "Version de la déclaration",
  notice: "Déclaration de confidentialité",
  consent: "Consentement aux données de santé enregistré le",
  versionWord: "version",
  missing:
    "Aucun consentement aux données de santé n’est enregistré pour ce compte.",
  agree:
    "Je donne mon consentement explicite comme décrit dans la déclaration.",
  record: "Enregistrer le consentement",
  meals: "CSV repas",
  symptoms: "CSV symptômes",
  delete: "Supprimer le compte",
  deleteBody:
    "Cela supprime votre journal, photos, recettes, menu, profil et compte. Cette action est irréversible.",
  type: "Tapez SUPPRIMER pour confirmer",
  pattern: "SUPPRIMER",
  confirm:
    "Votre compte et toutes vos données seront définitivement supprimés. Continuer ?",
  photo: "Nouvelle photo de profil",
  photoHelp:
    "Laissez vide pour conserver la photo actuelle. Maximum 3 Mo ; stockage WebP jusqu’à 800×800.",
  usernameHelp: "3–30 caractères : lettres, chiffres et underscore.",
};
const de = {
  version: "Version der Datenschutzerklärung",
  notice: "Datenschutzerklärung",
  consent: "Einwilligung zu Gesundheitsdaten erfasst am",
  versionWord: "Version",
  missing:
    "Für dieses Konto wurde noch keine Einwilligung zu Gesundheitsdaten erfasst.",
  agree:
    "Ich willige ausdrücklich wie in der Datenschutzerklärung beschrieben ein.",
  record: "Einwilligung speichern",
  meals: "CSV Mahlzeiten",
  symptoms: "CSV Beschwerden",
  delete: "Konto löschen",
  deleteBody:
    "Dadurch werden Tagebuch, Fotos, Rezepte, Wochenplan, Profil und Konto gelöscht. Dies kann nicht rückgängig gemacht werden.",
  type: "Zum Bestätigen LÖSCHEN eingeben",
  pattern: "LÖSCHEN",
  confirm: "Dein Konto und alle Daten werden dauerhaft gelöscht. Fortfahren?",
  photo: "Neues Profilbild",
  photoHelp:
    "Leer lassen, um das aktuelle Bild zu behalten. Maximal 3 MB; Speicherung als WebP bis 800×800.",
  usernameHelp: "3–30 Zeichen: Buchstaben, Zahlen und Unterstrich.",
};
export const profilePrivacyCopy: Record<AppLanguage, typeof nl> = {
  nl,
  en,
  fr,
  de,
};
