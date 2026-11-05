import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { SubmitButton } from "@/components/SubmitButton";
import { RecipeCarousel } from "@/components/RecipeCarousel";
import {
  getActiveDietPhase,
  getCuratedRecipes,
  getDietJourneySummary,
  getProfile,
  getRecipes,
  requireUser,
} from "@/lib/data";
import { deleteOwnAccount, recordHealthConsent } from "@/lib/account-actions";
import { PRIVACY_NOTICE_VERSION } from "@/lib/privacy";
import { updateProfile } from "@/lib/profile-actions";
import { appCopy } from "@/lib/app-copy";
import { appLanguage } from "@/lib/i18n";
import { workflowCopy } from "@/lib/workflow-copy";
import { profilePrivacyCopy } from "@/lib/profile-privacy-copy";
import { dietJourneyStage, eliminationSchedule } from "@/lib/diet-phase";
import { phasePageCopy } from "@/lib/phase-page-copy";

export const metadata = { title: "Profiel" };

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const [{ user, supabase }, profile, phase, journey, ownRecipes, suggestions, params] =
    await Promise.all([
      requireUser(),
      getProfile(),
      getActiveDietPhase(),
      getDietJourneySummary(),
      getRecipes(),
      getCuratedRecipes(),
      searchParams,
    ]);
  const { data: adminCheck } = await supabase.rpc("is_app_admin");
  const isAdmin = adminCheck === true;
  const language = appLanguage(profile.preferred_language);
  const pageText = appCopy[language].pages;
  const text = workflowCopy[language].profile;
  const privacyUi = profilePrivacyCopy[language];
  const phaseUi = phasePageCopy[language];
  const extra =
    language === "en"
      ? {
          ownRecipe: "Own recipe",
          favourites: "Favourites",
          suggested: "Suggested for you",
          privacy: "Privacy and your data",
          edit: "Edit details",
          language: "Preferred language",
          save: "Save changes",
          emptyFavourites: "Tap ‘Save’ on a suggested recipe to find it here.",
          favouritesLabel: "My three favourite recipes",
          ownLabel: "My three newest recipes",
          suggestedBody:
            "Ideas with credited sources from several low-FODMAP resources. Check current portions with the original source.",
          suggestedLabel: "Three recipes suggested for you",
        }
      : language === "fr"
        ? {
            ownRecipe: "Recette personnelle",
            favourites: "Favoris",
            suggested: "Suggestions pour vous",
            privacy: "Confidentialité et vos données",
            edit: "Modifier les données",
            language: "Langue préférée",
            save: "Enregistrer",
            emptyFavourites:
              "Touchez « Enregistrer » sur une suggestion pour la retrouver ici.",
            favouritesLabel: "Mes trois recettes favorites",
            ownLabel: "Mes trois recettes les plus récentes",
            suggestedBody:
              "Des idées issues de plusieurs sources pauvres en FODMAP. Vérifiez les portions actuelles auprès de la source originale.",
            suggestedLabel: "Trois recettes suggérées pour vous",
          }
        : language === "de"
          ? {
              ownRecipe: "Eigenes Rezept",
              favourites: "Favoriten",
              suggested: "Für dich vorgeschlagen",
              privacy: "Datenschutz und deine Daten",
              edit: "Daten bearbeiten",
              language: "Bevorzugte Sprache",
              save: "Änderungen speichern",
              emptyFavourites:
                "Tippe bei einem Vorschlag auf „Speichern“, um ihn hier wiederzufinden.",
              favouritesLabel: "Meine drei Lieblingsrezepte",
              ownLabel: "Meine drei neuesten Rezepte",
              suggestedBody:
                "Ideen aus mehreren Low-FODMAP-Quellen mit Quellenangabe. Prüfe aktuelle Portionen bei der Originalquelle.",
              suggestedLabel: "Drei für dich vorgeschlagene Rezepte",
            }
          : {
              ownRecipe: "Eigen recept",
              favourites: "Favorieten",
              suggested: "Voorgesteld voor jou",
              privacy: "Privacy en je gegevens",
              edit: "Gegevens aanpassen",
              language: "Gewenste taal",
              save: "Wijzigingen opslaan",
              emptyFavourites:
                "Tik bij een voorstel op ‘Bewaren’ om het hier terug te vinden.",
              favouritesLabel: "Mijn drie favoriete recepten",
              ownLabel: "Mijn drie nieuwste recepten",
              suggestedBody:
                "Bronvermelde inspiratie uit meerdere low-FODMAP-bronnen. Controleer de actuele porties bij de oorspronkelijke bron.",
              suggestedLabel: "Drie recepten voorgesteld voor jou",
            };
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Europe/Amsterdam",
  });
  const elimination = phase?.phase_type === "elimination"
    ? eliminationSchedule(phase, today)
    : null;
  const journeyStage = dietJourneyStage(
    phase?.phase_type ?? null,
    {
      hasEliminationHistory: journey.hasEliminationHistory,
      hasActiveChallenge: Boolean(journey.activeChallenge),
      toleranceCount: journey.toleranceCount,
    },
    elimination?.complete ?? false,
  );
  const liked = suggestions.filter((recipe) => recipe.liked);
  return (
    <AppShell
      active="profiel"
      email={
        profile.username ? `@${profile.username}` : (user.email ?? "Account")
      }
    >
      <header className="profile-header">
        <div className="profile-avatar">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="Profielfoto" />
          ) : (
            <span>
              {(profile.username ?? profile.display_name ?? user.email ?? "P")
                .slice(0, 1)
                .toUpperCase()}
            </span>
          )}
        </div>
        <div>
          <div className="eyebrow">{pageText.profileEyebrow}</div>
          <h1 className="page-title">
            {profile.display_name || profile.username || "Vul je profiel aan"}
          </h1>
          {profile.username && (
            <p className="subtle" style={{ margin: 0 }}>
              @{profile.username}
            </p>
          )}
        </div>
      </header>
      {params.message && (
        <div className="notice">
          {params.message === "toestemming"
              ? "Je toestemming voor gezondheidsgegevens is vastgelegd."
              : "Je profiel is bijgewerkt."}
        </div>
      )}
      {params.error && (
        <div className="notice notice-error">
          {params.error === "gebruikersnaam"
            ? "Deze gebruikersnaam is al in gebruik."
            : params.error === "foto"
              ? "Gebruik een JPG-, PNG- of WebP-foto van maximaal 3 MB."
              : params.error === "verwijderen-bevestiging"
                ? "Typ VERWIJDER om het account te verwijderen."
                : params.error === "verwijderen"
                  ? "Het account kon niet worden verwijderd. Probeer opnieuw of gebruik de pagina Account verwijderen."
                  : params.error === "toestemming"
                    ? "De toestemming kon niet worden vastgelegd. Vink het vak aan en probeer opnieuw."
                    : "Opslaan is niet gelukt. Probeer opnieuw."}
        </div>
      )}
      <div className="grid-main">
        <section className="card">
          <h2 className="section-title">{text.details}</h2>
          <dl className="profile-summary">
            <div>
              <dt>{text.name}</dt>
              <dd>{profile.display_name || text.missing}</dd>
            </div>
            <div>
              <dt>{text.username}</dt>
              <dd>
                {profile.username ? `@${profile.username}` : text.missing}
              </dd>
            </div>
            <div>
              <dt>{text.photo}</dt>
              <dd>{profile.avatar_path ? text.set : text.missing}</dd>
            </div>
          </dl>
          <p className="footer-note">{text.hint}</p>
        </section>
        <section className="card">
          <div className="eyebrow">{text.guidance}</div>
          <h2 className="section-title">{phaseUi.stages[journeyStage]}</h2>
          {journeyStage === "elimination" && elimination && (
            <p className="subtle">{text.day} {elimination.currentDay} / {elimination.plannedDays}</p>
          )}
          {journeyStage === "reintroduction" && journey.activeChallenge && (
            <p className="subtle">{journey.activeChallenge.test_food} · {journey.activeChallengeDays}/3</p>
          )}
          {journeyStage === "maintenance" && (
            <p className="subtle">{journey.toleranceCount}/6 {phaseUi.maintenance.progress}</p>
          )}
          <Link className="btn btn-secondary" href="/fases">{workflowCopy[language].phase.view} →</Link>
        </section>
      </div>
      {profile.account_type === "patient" && (
        <section className="card" style={{ marginTop: 18 }}>
          <div className="eyebrow">Privacy en begeleiding</div>
          <h2 className="section-title">Mijn gekoppelde diëtist</h2>
          <p className="subtle">Bekijk gedeelde plannen en bepaal zelf welke diëtist toegang heeft tot je dossier.</p>
          <Link className="btn btn-secondary" href="/begeleiding">Begeleiding en toegang beheren →</Link>
        </section>
      )}
      <section id="recepten" style={{ marginTop: 22 }}>
        <div className="section-heading">
          <div>
            <div className="eyebrow">{text.kitchen}</div>
            <h2 className="page-title" style={{ fontSize: 27 }}>
              {pageText.recipesTitle}
            </h2>
          </div>
          <Link className="btn" href="/recepten/nieuw">
            + {extra.ownRecipe}
          </Link>
        </div>
        <h3 className="section-title">{text.myRecipes}</h3>
        {ownRecipes.length === 0 ? (
          <div className="card empty">{text.noRecipes}</div>
        ) : (
          <RecipeCarousel
            kind="own"
            recipes={ownRecipes.slice(0, 3)}
            label={extra.ownLabel}
            language={language}
          />
        )}
        <h3 className="section-title" style={{ marginTop: 24 }}>
          {extra.favourites}
        </h3>
        {liked.length === 0 ? (
          <div className="card empty">{extra.emptyFavourites}</div>
        ) : (
          <RecipeCarousel
            kind="curated"
            recipes={liked.slice(0, 3)}
            label={extra.favouritesLabel}
            showLikeActions
            language={language}
          />
        )}
        <h3 className="section-title" style={{ marginTop: 24 }}>
          {extra.suggested}
        </h3>
        <p className="subtle">{extra.suggestedBody}</p>
        <RecipeCarousel
          kind="curated"
          recipes={suggestions.slice(0, 3)}
          label={extra.suggestedLabel}
          showLikeActions
          language={language}
        />
      </section>
      <section className="card" style={{ marginTop: 22 }}>
        <h2 className="section-title">{extra.privacy}</h2>
        <p className="subtle">
          {privacyUi.version}: {PRIVACY_NOTICE_VERSION}.{" "}
          <Link
            href="/privacy"
            style={{ color: "var(--green)", fontWeight: 700 }}
          >
            {privacyUi.notice}
          </Link>
        </p>
        {profile.health_data_consent_at ? (
          <p>
            {privacyUi.consent}{" "}
            {new Intl.DateTimeFormat(language, {
              dateStyle: "long",
              timeStyle: "short",
              timeZone: "Europe/Amsterdam",
            }).format(new Date(profile.health_data_consent_at))}
            {profile.privacy_notice_version
              ? ` (${privacyUi.versionWord} ${profile.privacy_notice_version})`
              : ""}
            .
          </p>
        ) : (
          <form action={recordHealthConsent}>
            <p className="subtle">{privacyUi.missing}</p>
            <label
              className="filter-check"
              htmlFor="health_consent"
              style={{ whiteSpace: "normal", alignItems: "flex-start" }}
            >
              <input
                id="health_consent"
                name="health_consent"
                type="checkbox"
                value="yes"
                required
                style={{ marginTop: 4 }}
              />
              <span>{privacyUi.agree}</span>
            </label>
            <div className="form-actions">
              <SubmitButton className="btn">{privacyUi.record}</SubmitButton>
            </div>
          </form>
        )}
        <div className="quick-links">
          <a className="btn btn-secondary" href="/account/export">
            Download JSON
          </a>
          <a className="btn btn-secondary" href="/account/export?format=meals">
            {privacyUi.meals}
          </a>
          <a
            className="btn btn-secondary"
            href="/account/export?format=symptoms"
          >
            {privacyUi.symptoms}
          </a>
        </div>
        <form action={deleteOwnAccount} style={{ marginTop: 18 }}>
          <h3 className="section-title">{privacyUi.delete}</h3>
          <p className="subtle">{privacyUi.deleteBody}</p>
          <div className="field">
            <label htmlFor="confirm_delete">{privacyUi.type}</label>
            <input
              id="confirm_delete"
              name="confirm_delete"
              autoComplete="off"
              required
              pattern={privacyUi.pattern}
            />
          </div>
          <SubmitButton
            className="btn btn-danger"
            confirmMessage={privacyUi.confirm}
          >
            {privacyUi.delete}
          </SubmitButton>
        </form>
      </section>
      <div className="profile-bottom-actions">
        <details className="card profile-edit" open={Boolean(params.error)}>
          <summary className="btn">{pageText.editProfile}</summary>
          <div className="profile-edit-body">
            <div className="eyebrow">{extra.edit}</div>
            <h2 className="section-title">{pageText.editProfile}</h2>
            <form action={updateProfile} encType="multipart/form-data">
              <div className="form-grid">
                <div className="field">
                  <label htmlFor="display_name">Naam</label>
                  <input
                    id="display_name"
                    name="display_name"
                    defaultValue={profile.display_name ?? ""}
                    maxLength={80}
                  />
                </div>
                <div className="field">
                  <label htmlFor="username">Gebruikersnaam *</label>
                  <input
                    id="username"
                    name="username"
                    defaultValue={profile.username ?? ""}
                    required
                    minLength={3}
                    maxLength={30}
                    pattern="[A-Za-z0-9_]+"
                  />
                  <span className="subtle" style={{ fontSize: 11 }}>
                    {privacyUi.usernameHelp}
                  </span>
                </div>
                <div className="field">
                  <label htmlFor="preferred_language">{extra.language}</label>
                  <select
                    id="preferred_language"
                    name="preferred_language"
                    defaultValue={profile.preferred_language}
                  >
                    <option value="nl">🇳🇱 Nederlands</option>
                    <option value="fr">🇫🇷 Français</option>
                    <option value="de">🇩🇪 Deutsch</option>
                    <option value="en">🇬🇧 English</option>
                  </select>
                </div>
                <div className="field span-2">
                  <label htmlFor="avatar">{privacyUi.photo}</label>
                  <input
                    id="avatar"
                    name="avatar"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                  />
                  <span className="subtle" style={{ fontSize: 11 }}>
                    {privacyUi.photoHelp}
                  </span>
                </div>
              </div>
              <div className="form-actions">
                <SubmitButton className="btn">{extra.save}</SubmitButton>
              </div>
            </form>
          </div>
        </details>
        {isAdmin && (
          <Link className="btn admin-profile-dashboard" href="/admin">
            <span aria-hidden="true">▥</span> {pageText.adminDashboard}
          </Link>
        )}
      </div>
    </AppShell>
  );
}
