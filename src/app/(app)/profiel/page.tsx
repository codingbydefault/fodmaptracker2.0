import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { DietSafetyNotice } from "@/components/DietSafetyNotice";
import { SubmitButton } from "@/components/SubmitButton";
import { RecipeCarousel } from "@/components/RecipeCarousel";
import {
  getActiveDietPhase,
  getCuratedRecipes,
  getProfile,
  getRecipes,
  requireUser,
} from "@/lib/data";
import { deleteOwnAccount, recordHealthConsent } from "@/lib/account-actions";
import { PRIVACY_NOTICE_VERSION } from "@/lib/privacy";
import { startEliminationPhase, updateProfile } from "@/lib/profile-actions";
import { appCopy } from "@/lib/app-copy";
import { appLanguage } from "@/lib/i18n";
import { workflowCopy } from "@/lib/workflow-copy";

export const metadata = { title: "Profiel" };

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const [{ user, supabase }, profile, phase, ownRecipes, suggestions, params] =
    await Promise.all([
      requireUser(),
      getProfile(),
      getActiveDietPhase(),
      getRecipes(),
      getCuratedRecipes(),
      searchParams,
    ]);
  const { data: adminCheck } = await supabase.rpc("is_app_admin");
  const isAdmin = adminCheck === true;
  const language = appLanguage(profile.preferred_language);
  const pageText = appCopy[language].pages;
  const text = workflowCopy[language].profile;
  const extra=language==="en"?{ownRecipe:"Own recipe",favourites:"Favourites",suggested:"Suggested for you",privacy:"Privacy and your data",edit:"Edit details",language:"Preferred language",save:"Save changes"}:language==="fr"?{ownRecipe:"Recette personnelle",favourites:"Favoris",suggested:"Suggestions pour vous",privacy:"Confidentialité et vos données",edit:"Modifier les données",language:"Langue préférée",save:"Enregistrer"}:language==="de"?{ownRecipe:"Eigenes Rezept",favourites:"Favoriten",suggested:"Für dich vorgeschlagen",privacy:"Datenschutz und deine Daten",edit:"Daten bearbeiten",language:"Bevorzugte Sprache",save:"Änderungen speichern"}:{ownRecipe:"Eigen recept",favourites:"Favorieten",suggested:"Voorgesteld voor jou",privacy:"Privacy en je gegevens",edit:"Gegevens aanpassen",language:"Gewenste taal",save:"Wijzigingen opslaan"};
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Europe/Amsterdam",
  });
  const rawPhaseDay =
    phase?.phase_type === "elimination"
      ? Math.max(
          1,
          Math.floor(
            (new Date(today).getTime() - new Date(phase.started_at).getTime()) /
              86400000,
          ) + 1,
        )
      : null;
  const phaseDay = rawPhaseDay ? Math.min(rawPhaseDay, 28) : null;
  const phasePlanComplete = Boolean(rawPhaseDay && rawPhaseDay > 28);
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
          {params.message === "eliminatie-gestart"
            ? "Je nieuwe eliminatiefase van 28 dagen is gestart."
            : params.message === "toestemming"
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
                    : params.error === "fase-veiligheid"
                      ? "Lees de veiligheidsinformatie en bevestig deze voordat je de teller start."
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
                {profile.username
                  ? `@${profile.username}`
                  : text.missing}
              </dd>
            </div>
            <div>
              <dt>{text.photo}</dt>
              <dd>
                {profile.avatar_path ? text.set : text.missing}
              </dd>
            </div>
          </dl>
          <p className="footer-note">
            {text.hint}
          </p>
        </section>
        <section className="card">
          <div className="eyebrow">{text.guidance}</div>
          <h2 className="section-title">{text.elimination}</h2>
          {phaseDay ? (
            <>
              <div className="stat-number">
                {phasePlanComplete ? (
                  text.daysComplete
                ) : (
                  <>
                    {text.day} {phaseDay}
                    <span style={{ fontSize: 13, color: "var(--muted)" }}>
                      {" "}
                      / 28
                    </span>
                  </>
                )}
              </div>
              <p className="subtle">
                {text.started}{" "}
                {new Intl.DateTimeFormat(language, {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  timeZone: "Europe/Amsterdam",
                }).format(new Date(phase!.started_at))}
                .
              </p>
              {phasePlanComplete && (
                <p>
                  {workflowCopy[language].phase.completeBody}
                </p>
              )}
            </>
          ) : (
            <p className="subtle">
              {text.none}
            </p>
          )}
          <form action={startEliminationPhase}>
            <label
              className="filter-check"
              htmlFor="safety_acknowledgement"
              style={{
                whiteSpace: "normal",
                alignItems: "flex-start",
                marginBottom: 12,
              }}
            >
              <input
                id="safety_acknowledgement"
                name="safety_acknowledgement"
                type="checkbox"
                value="yes"
                required
                style={{ marginTop: 4 }}
              />
              <span>{text.safety}</span>
            </label>
            <SubmitButton className="btn btn-secondary">
              {phaseDay
                ? text.restart
                : text.start}
            </SubmitButton>
          </form>
          <p className="footer-note">
            {text.restartNote}
          </p>
        </section>
      </div>
      <DietSafetyNotice language={language} />
      <section className="card" style={{ marginTop: 18 }}>
        <div className="eyebrow">{text.steps}</div>
        <h2 className="section-title">{text.reintro}</h2>
        <p className="subtle">{text.reintroBody}</p>
        <Link className="btn" href="/herintroductie">
          {text.openReintro} →
        </Link>
      </section>
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
            label="Mijn drie nieuwste recepten"
            language={language}
          />
        )}
        <h3 className="section-title" style={{ marginTop: 24 }}>
          {extra.favourites}
        </h3>
        {liked.length === 0 ? (
          <div className="card empty">
            Tik bij een voorstel op ‘Bewaren’ om het hier terug te vinden.
          </div>
        ) : (
          <RecipeCarousel
            kind="curated"
            recipes={liked.slice(0, 3)}
            label="Mijn drie favoriete recepten"
            showLikeActions
            language={language}
          />
        )}
        <h3 className="section-title" style={{ marginTop: 24 }}>
          {extra.suggested}
        </h3>
        <p className="subtle">
          Bronvermelde inspiratie uit meerdere low-FODMAP-bronnen. Controleer de
          actuele porties bij de oorspronkelijke bron.
        </p>
        <RecipeCarousel
          kind="curated"
          recipes={suggestions.slice(0, 3)}
          label="Drie recepten voorgesteld voor jou"
          showLikeActions
          language={language}
        />
      </section>
      <section className="card" style={{ marginTop: 22 }}>
        <h2 className="section-title">{extra.privacy}</h2>
        <p className="subtle">
          Versie van de verklaring: {PRIVACY_NOTICE_VERSION}.{" "}
          <Link
            href="/privacy"
            style={{ color: "var(--green)", fontWeight: 700 }}
          >
            Privacyverklaring
          </Link>
        </p>
        {profile.health_data_consent_at ? (
          <p>
            Toestemming voor gezondheidsgegevens vastgelegd op{" "}
            {new Intl.DateTimeFormat("nl-NL", {
              dateStyle: "long",
              timeStyle: "short",
              timeZone: "Europe/Amsterdam",
            }).format(new Date(profile.health_data_consent_at))}
            {profile.privacy_notice_version
              ? ` (versie ${profile.privacy_notice_version})`
              : ""}
            .
          </p>
        ) : (
          <form action={recordHealthConsent}>
            <p className="subtle">
              Voor dit account is nog geen toestemming voor gezondheidsgegevens
              vastgelegd.
            </p>
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
              <span>
                Ik geef uitdrukkelijk toestemming zoals beschreven in de
                privacyverklaring.
              </span>
            </label>
            <div className="form-actions">
              <SubmitButton className="btn">
                Toestemming vastleggen
              </SubmitButton>
            </div>
          </form>
        )}
        <div className="quick-links">
          <a className="btn btn-secondary" href="/account/export">
            Download JSON
          </a>
          <a className="btn btn-secondary" href="/account/export?format=meals">
            CSV maaltijden
          </a>
          <a
            className="btn btn-secondary"
            href="/account/export?format=symptoms"
          >
            CSV klachten
          </a>
        </div>
        <form action={deleteOwnAccount} style={{ marginTop: 18 }}>
          <h3 className="section-title">Account verwijderen</h3>
          <p className="subtle">
            Dit wist je dagboek, foto’s, recepten, weekmenu, profiel en het
            account. Dit kan niet ongedaan worden.
          </p>
          <div className="field">
            <label htmlFor="confirm_delete">
              Typ VERWIJDER om te bevestigen
            </label>
            <input
              id="confirm_delete"
              name="confirm_delete"
              autoComplete="off"
              required
              pattern="VERWIJDER"
            />
          </div>
          <SubmitButton
            className="btn btn-danger"
            confirmMessage="Je account en alle gegevens worden definitief verwijderd. Doorgaan?"
          >
            Account verwijderen
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
                    3–30 tekens: letters, cijfers en underscore.
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
                  <label htmlFor="avatar">Nieuwe profielfoto</label>
                  <input
                    id="avatar"
                    name="avatar"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                  />
                  <span className="subtle" style={{ fontSize: 11 }}>
                    Laat leeg om je huidige foto te behouden. Maximaal 3 MB;
                    opslag als WebP van maximaal 800×800.
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
