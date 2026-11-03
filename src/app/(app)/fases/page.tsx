import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { DietSafetyNotice } from "@/components/DietSafetyNotice";
import { SubmitButton } from "@/components/SubmitButton";
import { getActiveDietPhase, getDietJourneySummary, getProfile, requireUser } from "@/lib/data";
import { dietJourneyStage, eliminationSchedule } from "@/lib/diet-phase";
import { phasePageCopy } from "@/lib/phase-page-copy";
import { dailyPhaseTip } from "@/lib/phase-daily-tips";
import { startEliminationPhase } from "@/lib/profile-actions";

export const metadata = { title: "Mijn fases" };

export default async function PhasesPage({ searchParams }: { searchParams: Promise<{ message?: string; error?: string }> }) {
  const [{ user }, profile, phase, journey, params] = await Promise.all([
    requireUser(), getProfile(), getActiveDietPhase(), getDietJourneySummary(), searchParams,
  ]);
  const language = profile.preferred_language;
  const text = phasePageCopy[language];
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Amsterdam" });
  const elimination = phase?.phase_type === "elimination" ? eliminationSchedule(phase, today) : null;
  const stage = dietJourneyStage(
    phase?.phase_type ?? null,
    {
      hasEliminationHistory: journey.hasEliminationHistory,
      hasActiveChallenge: Boolean(journey.activeChallenge),
      toleranceCount: journey.toleranceCount,
    },
    elimination?.complete ?? false,
  );
  const stageIndex = stage === "maintenance" ? 2 : stage === "reintroduction" || stage === "reintroduction_ready" ? 1 : 0;
  const cardState = (index: number) => stage === "not_started" ? text.upcoming : index < stageIndex ? text.completed : index === stageIndex ? text.active : text.upcoming;
  const dailyTip = dailyPhaseTip(language, stage, user.id, today);

  return (
    <AppShell active="profiel" email={user.email ?? "Account"}>
      <header>
        <div className="eyebrow">{text.eyebrow}</div>
        <h1 className="page-title">{text.title}</h1>
        <p className="subtle" style={{ maxWidth: 760 }}>{text.intro}</p>
      </header>
      {params.message === "eliminatie-gestart" && <div className="notice">{text.started}</div>}
      {params.error && <div className="notice notice-error">{params.error === "fase-duur" ? text.durationError : text.saveError}</div>}

      <section className="phase-current-card">
        <div>
          <div className="eyebrow">{text.current}</div>
          <h2>{text.stages[stage]}</h2>
          {elimination && stage === "elimination" && (
            <p>{elimination.currentDay} / {elimination.plannedDays}</p>
          )}
          {journey.activeChallenge && stage === "reintroduction" && (
            <p>{journey.activeChallenge.test_food} · {journey.activeChallengeDays}/3</p>
          )}
          {stage === "maintenance" && <p>{journey.toleranceCount}/6 {text.maintenance.progress}</p>}
          <div className="phase-current-tip"><span aria-hidden="true">🌿</span><span>{dailyTip}</span></div>
        </div>
        <div className="phase-route" aria-hidden="true">
          {[0, 1, 2].map((index) => <span className={stage !== "not_started" && index <= stageIndex ? "done" : ""} key={index}>{index + 1}</span>)}
        </div>
      </section>

      <div className="phase-journey-grid">
        <article className={`phase-step-card ${stage !== "not_started" && stageIndex === 0 ? "active" : ""}`}>
          <div className="phase-step-head"><span>{text.step} 1</span><span className="pill">{cardState(0)}</span></div>
          <h2>{text.elimination.title}</h2>
          <p>{text.elimination.body}</p>
          <ul>{text.elimination.tips.map((tip) => <li key={tip}>{tip}</li>)}</ul>
          <form action={startEliminationPhase} className="phase-start-form">
            <div className="field">
              <label htmlFor="duration_days">{text.elimination.duration}</label>
              <input id="duration_days" name="duration_days" type="number" min={14} max={42} step={1} defaultValue={elimination?.plannedDays ?? 28} inputMode="numeric" required />
              <small>{text.elimination.help}</small>
            </div>
            <label className="filter-check" htmlFor="safety_acknowledgement" style={{ whiteSpace: "normal", alignItems: "flex-start" }}>
              <input id="safety_acknowledgement" name="safety_acknowledgement" type="checkbox" value="yes" required style={{ marginTop: 4 }} />
              <span>{text.elimination.safety}</span>
            </label>
            <SubmitButton className="btn btn-secondary" confirmMessage={elimination ? text.elimination.restartConfirm : undefined}>
              {elimination ? text.elimination.restart : text.elimination.start}
            </SubmitButton>
          </form>
        </article>

        <article className={`phase-step-card ${stageIndex === 1 ? "active" : ""}`}>
          <div className="phase-step-head"><span>{text.step} 2</span><span className="pill">{cardState(1)}</span></div>
          <h2>{text.reintro.title}</h2>
          <p>{text.reintro.body}</p>
          <ul>{text.reintro.tips.map((tip) => <li key={tip}>{tip}</li>)}</ul>
          <Link className="btn btn-secondary" href="/herintroductie">{text.reintro.action} →</Link>
        </article>

        <article className={`phase-step-card ${stageIndex === 2 ? "active" : ""}`}>
          <div className="phase-step-head"><span>{text.step} 3</span><span className="pill">{cardState(2)}</span></div>
          <h2>{text.maintenance.title}</h2>
          <p>{text.maintenance.body}</p>
          <ul>{text.maintenance.tips.map((tip) => <li key={tip}>{tip}</li>)}</ul>
          <p className="subtle">{journey.toleranceCount}/6 {text.maintenance.progress}</p>
          <Link className="btn btn-secondary" href="/herintroductie">{text.maintenance.action} →</Link>
        </article>
      </div>
      <DietSafetyNotice language={language} />
    </AppShell>
  );
}
