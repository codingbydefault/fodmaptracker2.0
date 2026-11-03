import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { HalloweenSpotlight } from "@/components/HalloweenSpotlight";
import { LatestArticles } from "@/components/LatestArticles";
import { SeverityStatCard } from "@/components/SeverityStatCard";
import {
  getActiveDietPhase,
  getCuratedRecipes,
  getDietJourneySummary,
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
import { dietJourneyStage, eliminationSchedule } from "@/lib/diet-phase";
import { dailyPhaseTip } from "@/lib/phase-daily-tips";
export const metadata = { title: "Overzicht" };
export default async function Dashboard() {
  const [{ user }, language] = await Promise.all([
    requireUser(),
    getRequestLanguage(),
  ]);
  const text = appCopy[language].dashboard;
  const phaseText = workflowCopy[language].phase;
  const mealLabels = localizedMealNames[language];
  const symptomLabels = localizedSymptomNames[language];
  const halloween = isHalloweenToday();
  const [foods, symptoms, phase, profile, curatedRecipes, journey] = await Promise.all([
    getFoodEntries(100),
    getSymptomEntries(1000),
    getActiveDietPhase(),
    getProfile(),
    halloween ? getCuratedRecipes() : Promise.resolve([]),
    getDietJourneySummary(),
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
  const elimination = phase?.phase_type === "elimination"
    ? eliminationSchedule(phase, today)
    : null;
  const eliminationDay = elimination?.currentDay ?? null;
  const phasePlanComplete = elimination?.complete ?? false;
  const journeyStage = dietJourneyStage(
    phase?.phase_type ?? null,
    {
      hasEliminationHistory: journey.hasEliminationHistory,
      hasActiveChallenge: Boolean(journey.activeChallenge),
      toleranceCount: journey.toleranceCount,
    },
    phasePlanComplete,
  );
  const dailyTip = dailyPhaseTip(language, journeyStage, user.id, today);
  const phaseGuide = (() => {
    if (elimination && !phasePlanComplete) {
      return {
        title: phaseText.eliminationTitle,
        body: `${phaseText.day} ${eliminationDay} ${phaseText.of} ${elimination.plannedDays}`,
        tip: dailyTip,
        href: "/fases",
        action: phaseText.view,
        progress: eliminationDay ? (eliminationDay / elimination.plannedDays) * 100 : 0,
      };
    }
    if (journey.activeChallenge || phase?.phase_type === "reintroduction") {
      return {
        title: phaseText.reintroActiveTitle,
        body: journey.activeChallenge
          ? `${journey.activeChallenge.test_food} · ${journey.activeChallengeDays}/3 ${phaseText.reintroActiveProgress}. ${phaseText.reintroActiveBody}`
          : phaseText.reintroActiveBody,
        tip: dailyTip,
        href: "/herintroductie",
        action: phaseText.reintroActiveAction,
        progress: (journey.activeChallengeDays / 3) * 100,
      };
    }
    if (journey.toleranceCount > 0) {
      return {
        title: phaseText.maintenanceTitle,
        body: `${journey.toleranceCount}/6 ${phaseText.maintenanceProgress}. ${phaseText.maintenanceBody}`,
        tip: dailyTip,
        href: "/herintroductie",
        action: phaseText.maintenanceAction,
        progress: (journey.toleranceCount / 6) * 100,
      };
    }
    if (phasePlanComplete || journey.hasEliminationHistory) {
      return {
        title: phaseText.reintroReadyTitle,
        body: phaseText.reintroReadyBody,
        tip: dailyTip,
        href: "/herintroductie",
        action: phaseText.reintroReadyAction,
        progress: 100,
      };
    }
    return {
      title: phaseText.startTitle,
      body: phaseText.startBody,
      tip: dailyTip,
      href: "/fases",
      action: phaseText.startAction,
      progress: 0,
    };
  })();
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
      </section>
      <section className="phase-guide-card" aria-labelledby="phase-guide-title">
        <div className="phase-guide-copy">
          <div className="eyebrow">{phaseText.guidance}</div>
          <h2 id="phase-guide-title">{phaseGuide.title}</h2>
          <p>{phaseGuide.body}</p>
          <div className="phase-guide-tip">
            <span aria-hidden="true">🌿</span>
            <span><strong>{phaseText.todayTip}</strong>{phaseGuide.tip}</span>
          </div>
        </div>
        <div className="phase-guide-action">
          <div className="phase-progress" aria-hidden="true">
            <span style={{ width: `${Math.min(100, phaseGuide.progress)}%` }} />
          </div>
          <Link className="btn" href={phaseGuide.href}>{phaseGuide.action} →</Link>
        </div>
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
        {language === "en"
          ? "Entries reflect personal experiences and do not prove that a meal caused a symptom."
          : language === "fr"
            ? "Les entrées reflètent des expériences personnelles et ne prouvent pas qu’un repas a causé un symptôme."
            : language === "de"
              ? "Einträge zeigen persönliche Erfahrungen und beweisen keinen ursächlichen Zusammenhang zwischen Mahlzeit und Beschwerden."
              : "Registraties tonen persoonlijke ervaringen en bewijzen geen oorzaak-gevolgrelatie tussen een maaltijd en een klacht."}
      </p>
    </AppShell>
  );
}
