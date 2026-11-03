import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { HalloweenSpotlight } from "@/components/HalloweenSpotlight";
import { LatestArticles } from "@/components/LatestArticles";
import { SeverityStatCard } from "@/components/SeverityStatCard";
import {
  getActiveDietPhase,
  getCuratedRecipes,
  getFoodEntries,
  getProfile,
  getSymptomEntries,
  requireUser,
} from "@/lib/data";
import { isHalloweenToday } from "@/lib/seasonal";
import { localizedMealNames, localizedSymptomNames } from "@/lib/i18n";
import { getRequestLanguage } from "@/lib/request-language";
import { appCopy } from "@/lib/app-copy";
import { workflowCopy } from "@/lib/workflow-copy";
export const metadata = { title: "Overzicht" };
export default async function Dashboard() {
  const [{ user }, language] = await Promise.all([
    requireUser(),
    getRequestLanguage(),
  ]);
  const text = appCopy[language].dashboard;
  const phaseText=workflowCopy[language].phase;
  const mealLabels = localizedMealNames[language];
  const symptomLabels = localizedSymptomNames[language];
  const halloween = isHalloweenToday();
  const [foods, symptoms, phase, profile, curatedRecipes] = await Promise.all([
    getFoodEntries(100),
    getSymptomEntries(1000),
    getActiveDietPhase(),
    getProfile(),
    halloween ? getCuratedRecipes() : Promise.resolve([]),
  ]);
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Europe/Amsterdam",
  });
  const isToday = (v: string) =>
    new Date(v).toLocaleDateString("en-CA", {
      timeZone: "Europe/Amsterdam",
    }) === today;
  const todaysFoods = foods.filter((x) => isToday(x.eaten_at));
  const todaysSymptoms = symptoms.filter((x) => isToday(x.experienced_at));
  const startDate = (days: number) => {
    const date = new Date(`${today}T12:00:00Z`);
    date.setUTCDate(date.getUTCDate() - (days - 1));
    return date.toISOString().slice(0, 10);
  };
  const symptomsInLastDays = (days: number) =>
    symptoms.filter(
      (x) =>
        new Date(x.experienced_at).toLocaleDateString("en-CA", {
          timeZone: "Europe/Amsterdam",
        }) >= startDate(days),
    );
  const severityStat = (entries: typeof symptoms) => ({
    average: entries.length
      ? Math.round(
          (entries.reduce((n, x) => n + x.severity, 0) / entries.length) * 10,
        ) / 10
      : null,
    count: entries.length,
  });
  const severityStats = {
    today: severityStat(todaysSymptoms),
    "7d": severityStat(symptomsInLastDays(7)),
    "30d": severityStat(symptomsInLastDays(30)),
  };
  const rawEliminationDay =
    phase?.phase_type === "elimination"
      ? Math.max(
          1,
          Math.floor(
            (new Date(today).getTime() - new Date(phase.started_at).getTime()) /
              86400000,
          ) + 1,
        )
      : null;
  const eliminationDay = rawEliminationDay
    ? Math.min(rawEliminationDay, 28)
    : null;
  const phasePlanComplete = Boolean(
    rawEliminationDay && rawEliminationDay > 28,
  );
  const tip = eliminationDay
    ? [
        "Plan vandaag één eenvoudige maaltijd vooruit.",
        "Controleer porties; ook low-FODMAP ingrediënten kunnen stapelen.",
        "Noteer klachten zo snel mogelijk na de maaltijd.",
        "Kies voor variatie binnen wat je goed verdraagt.",
      ][eliminationDay % 4]
    : null;
  const nextActions = [
    todaysFoods.length === 0
      ? {
          href: "/voeding",
          label: text.firstMeal,
          detail: text.firstMealDetail,
          icon: "🍽",
        }
      : null,
    todaysFoods.length > 0 && todaysSymptoms.length === 0
      ? {
          href: "/klachten",
          label: text.feeling,
          detail: text.feelingDetail,
          icon: "♡",
        }
      : null,
    { href: "/weekmenu", label: text.menu, detail: text.menuDetail, icon: "▦" },
  ].filter(Boolean) as {
    href: string;
    label: string;
    detail: string;
    icon: string;
  }[];
  return (
    <AppShell active="dashboard" email={user.email ?? "Account"}>
      <section className="welcome">
        <div className="eyebrow">{text.eyebrow}</div>
        <h1 className="page-title" style={{ marginTop: 10 }}>
          {text.title}
        </h1>
        <p className="subtle" style={{ maxWidth: 570 }}>
          {text.intro}
        </p>
        <div className="dashboard-quick-actions">
          <Link className="btn" href="/voedingswijzer#etiketcontrole">
            🏷️ {text.scan}
          </Link>
          <Link className="btn btn-secondary" href="/boodschappen">
            {text.shopping}
          </Link>
        </div>
        {eliminationDay && (
          <div className="phase-banner">
            <strong>
              {phasePlanComplete
                ? phaseText.complete
                : `${phaseText.day} ${eliminationDay} ${phaseText.of} 28`}
            </strong>
            <span>
              {phasePlanComplete
                ? phaseText.completeBody
                : tip}
            </span>
            <Link href="/profiel">{phaseText.view} →</Link>
          </div>
        )}
      </section>
      <section className="today-card" aria-labelledby="today-title">
        <div className="today-intro">
          <div className="eyebrow">{text.today}</div>
          <h2 id="today-title">{text.moment}</h2>
          <p>{text.momentDetail}</p>
        </div>
        <div className="today-actions">
          {nextActions.slice(0, 2).map((action) => (
            <Link href={action.href} key={action.href}>
              <span aria-hidden="true">{action.icon}</span>
              <span>
                <strong>{action.label}</strong>
                <small>{action.detail}</small>
              </span>
              <b aria-hidden="true">→</b>
            </Link>
          ))}
        </div>
      </section>
      {!eliminationDay && (
        <div className="phase-banner">
          <strong>{phaseText.discover}</strong>
          <span>{phaseText.discoverBody}</span>
          <Link href="/herintroductie">{phaseText.open} →</Link>
        </div>
      )}
      {halloween && <HalloweenSpotlight recipes={curatedRecipes} />}
      <section className="stat-grid" style={{ marginTop: 17 }}>
        <div className="card stat">
          <div className="subtle" style={{ fontSize: 12 }}>
            {text.recentMeals}
          </div>
          <div className="stat-number">{todaysFoods.length}</div>
          <div className="subtle" style={{ fontSize: 12 }}>
            {text.registered}
          </div>
        </div>
        <div className="card stat">
          <div className="subtle" style={{ fontSize: 12 }}>
            {text.recentSymptoms}
          </div>
          <div className="stat-number">{todaysSymptoms.length}</div>
          <div className="subtle" style={{ fontSize: 12 }}>
            {text.registrations}
          </div>
        </div>
        <SeverityStatCard stats={severityStats} language={language} />
      </section>
      <section className="grid-main" style={{ marginTop: 18 }}>
        <div className="card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
            }}
          >
            <h2 className="section-title">{text.recentMeals}</h2>
            <Link className="subtle" style={{ fontSize: 12 }} href="/voeding">
              {text.all} →
            </Link>
          </div>
          {foods.length === 0 ? (
            <div className="empty">
              {text.noMeals}
              <br />
              <Link
                href="/voeding"
                style={{ color: "var(--green)", fontWeight: 700 }}
              >
                {text.addMeal}
              </Link>
            </div>
          ) : (
            foods.slice(0, 4).map((x) => (
              <Link
                className="entry entry-link"
                href={`/voeding/${x.id}/bewerken`}
                aria-label={x.food_name}
                key={x.id}
              >
                <div>
                  <div className="entry-title">{x.food_name}</div>
                  <div
                    className="subtle"
                    style={{ fontSize: 12, marginTop: 3 }}
                  >
                    {mealLabels[x.meal_type]} ·{" "}
                    {new Intl.DateTimeFormat(
                      language === "nl" ? "nl-NL" : language,
                      {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZone: "Europe/Amsterdam",
                      },
                    ).format(new Date(x.eaten_at))}
                  </div>
                </div>
                {x.portion_description ? (
                  <span className="pill">{x.portion_description}</span>
                ) : (
                  <span className="entry-arrow" aria-hidden="true">
                    →
                  </span>
                )}
              </Link>
            ))
          )}
        </div>
        <div className="dashboard-side">
          <div className="card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
              }}
            >
              <h2 className="section-title">{text.recentSymptoms}</h2>
              <Link
                className="subtle"
                style={{ fontSize: 12 }}
                href="/klachten"
              >
                {text.all} →
              </Link>
            </div>
            {symptoms.length === 0 ? (
              <div className="empty">
                {text.noSymptoms}
                <br />
                <Link
                  href="/klachten"
                  style={{ color: "var(--green)", fontWeight: 700 }}
                >
                  {text.addSymptom}
                </Link>
              </div>
            ) : (
              symptoms.slice(0, 4).map((x) => (
                <Link
                  className="entry entry-link"
                  href={`/klachten/${x.id}/bewerken`}
                  aria-label={symptomLabels[x.symptom_type]}
                  key={x.id}
                >
                  <div>
                    <div className="entry-title">
                      {symptomLabels[x.symptom_type]}
                    </div>
                    <div
                      className="subtle"
                      style={{ fontSize: 12, marginTop: 3 }}
                    >
                      {new Intl.DateTimeFormat(
                        language === "nl" ? "nl-NL" : language,
                        {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                          timeZone: "Europe/Amsterdam",
                        },
                      ).format(new Date(x.experienced_at))}
                    </div>
                  </div>
                  <span className="pill">{x.severity}/10</span>
                </Link>
              ))
            )}
          </div>
          <LatestArticles lang={profile.preferred_language} carousel />
        </div>
      </section>
      <p className="footer-note">
        Registraties tonen persoonlijke ervaringen en bewijzen geen
        oorzaak-gevolgrelatie tussen een maaltijd en een klacht.
      </p>
    </AppShell>
  );
}
