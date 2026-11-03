import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { SubmitButton } from "@/components/SubmitButton";
import { addWeeklyMenuEntry, deleteWeeklyMenuEntry } from "@/lib/actions";
import {
  addCalendarDays,
  formatCalendarDate,
  mondayOfWeek,
  safeTimeZone,
  weekDates,
  zonedCalendarDate,
} from "@/lib/dates";
import {
  getCuratedRecipes,
  getPublicRecipes,
  getRecipes,
  getWeeklyMenu,
  requireUser,
} from "@/lib/data";
import { menuMealNames } from "@/lib/types";
import { getRequestLanguage } from "@/lib/request-language";
import { appCopy } from "@/lib/app-copy";

export const metadata = { title: "Weekmenu" };

export default async function WeekMenuPage({
  searchParams,
}: {
  searchParams: Promise<{
    week?: string;
    day?: string;
    message?: string;
    error?: string;
  }>;
}) {
  const [{ user, supabase }, params, language] = await Promise.all([
    requireUser(),
    searchParams,
    getRequestLanguage(),
  ]);
  const pageText=appCopy[language].pages;
  const { data: profile } = await supabase
    .from("profiles")
    .select("timezone")
    .eq("id", user.id)
    .maybeSingle();
  const timeZone = safeTimeZone(profile?.timezone);
  const today = zonedCalendarDate(timeZone);
  const anchor =
    params.week && /^\d{4}-\d{2}-\d{2}$/.test(params.week)
      ? params.week
      : today;
  const monday = mondayOfWeek(anchor);
  const days = weekDates(monday);
  const sunday = days[6];
  const selectedDay =
    params.day && days.includes(params.day) ? params.day : null;
  const [entries, ownRecipes, communityRecipes, curatedRecipes] =
    await Promise.all([
      getWeeklyMenu(monday, sunday),
      getRecipes(),
      getPublicRecipes(),
      getCuratedRecipes(),
    ]);
  const previous = addCalendarDays(monday, -7);
  const next = addCalendarDays(monday, 7);
  const dayLabel = (iso: string, options: Intl.DateTimeFormatOptions) =>
    formatCalendarDate(iso, timeZone, options);
  return (
    <AppShell active="weekmenu" email={user.email ?? "Account"}>
      <header style={{ marginBottom: 20 }}>
        <div className="eyebrow">{pageText.weekEyebrow}</div>
        <h1 className="page-title">{pageText.weekTitle}</h1>
        <p className="subtle">{pageText.weekIntro}</p>
      </header>
      {params.message && (
        <div className="notice">
          {params.message === "gepland"
            ? "Recept toegevoegd aan het weekmenu."
            : "Gerecht uit het weekmenu verwijderd."}
        </div>
      )}
      {params.error && (
        <div className="notice notice-error">
          De wijziging kon niet worden opgeslagen.
        </div>
      )}
      <div className="week-navigation">
        <Link className="btn btn-secondary" href={`/weekmenu?week=${previous}`}>
          ← Vorige
        </Link>
        <strong>
          {dayLabel(monday, { day: "numeric", month: "short" })} –{" "}
          {dayLabel(sunday, {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </strong>
        <Link className="btn btn-secondary" href={`/weekmenu?week=${next}`}>
          Volgende →
        </Link>
      </div>
      {selectedDay && (
        <section className="card week-planner">
          <div className="eyebrow">Recept inplannen</div>
          <h2 className="section-title">
            {dayLabel(selectedDay, {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </h2>
          <form action={addWeeklyMenuEntry}>
            <input type="hidden" name="planned_for" value={selectedDay} />
            <div className="week-planner-fields">
              <div className="field">
                <label htmlFor="recipe_selection">Recept</label>
                <select
                  id="recipe_selection"
                  name="recipe_selection"
                  required
                  defaultValue=""
                >
                  <option value="" disabled>
                    Kies een recept…
                  </option>
                  {ownRecipes.length > 0 && (
                    <optgroup label="Mijn recepten">
                      {ownRecipes.map((recipe) => (
                        <option key={recipe.id} value={`user:${recipe.id}`}>
                          {recipe.title}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {communityRecipes.length > 0 && (
                    <optgroup label="Community">
                      {communityRecipes.map((recipe) => (
                        <option key={recipe.id} value={`user:${recipe.id}`}>
                          {recipe.title}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  <optgroup label="Fodmap-Tracker recepten">
                    {curatedRecipes.map((recipe) => (
                      <option key={recipe.id} value={`curated:${recipe.id}`}>
                        {recipe.title}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
              <div className="field">
                <label htmlFor="meal_type">Eetmoment</label>
                <select
                  id="meal_type"
                  name="meal_type"
                  defaultValue="avondeten"
                >
                  {Object.entries(menuMealNames).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="planned_servings">Personen</label>
                <input id="planned_servings" name="planned_servings" type="number" min={1} max={24} placeholder="Receptstandaard" />
              </div>
              <SubmitButton className="btn">Toevoegen →</SubmitButton>
              <Link
                className="btn btn-secondary"
                href={`/weekmenu?week=${monday}`}
              >
                Annuleren
              </Link>
            </div>
          </form>
        </section>
      )}
      <section className="week-grid">
        {days.map((date) => {
          const planned = entries.filter((entry) => entry.planned_for === date);
          return (
            <article
              className={`card week-day${date === today ? " today" : ""}${date === selectedDay ? " selected" : ""}`}
              key={date}
            >
              <div className="eyebrow">
                {dayLabel(date, { weekday: "short" })}
              </div>
              <h2 className="section-title" style={{ margin: "5px 0 12px" }}>
                {dayLabel(date, { day: "numeric", month: "short" })}
              </h2>
              <Link
                className="week-add-button"
                href={`/weekmenu?week=${monday}&day=${date}`}
              >
                + Recept plannen
              </Link>
              {planned.length === 0 ? (
                <p className="subtle" style={{ fontSize: 12 }}>
                  Nog niets gepland.
                </p>
              ) : (
                planned.map((entry) => {
                  const recipe = entry.recipe ?? entry.curated_recipe;
                  const href = entry.recipe_id
                    ? `/recepten/${entry.recipe_id}`
                    : `/recepten/uitgelicht/${entry.curated_recipe_id}`;
                  return (
                    <div className="week-entry" key={entry.id}>
                      <div className="eyebrow" style={{ fontSize: 9 }}>
                        {menuMealNames[entry.meal_type]}
                      </div>
                      <Link
                        href={href}
                        style={{
                          fontWeight: 700,
                          fontSize: 13,
                          display: "block",
                          marginTop: 4,
                        }}
                      >
                        {recipe?.title ?? "Recept"}
                      </Link>
                      <small className="subtle">{entry.planned_servings ?? recipe?.servings ?? 1} personen</small>
                      <form
                        action={deleteWeeklyMenuEntry}
                        style={{ marginTop: 7 }}
                      >
                        <input type="hidden" name="id" value={entry.id} />
                        <SubmitButton
                          className="week-delete-button"
                          confirmMessage="Dit gerecht uit het weekmenu verwijderen?"
                        >
                          Verwijder
                        </SubmitButton>
                      </form>
                    </div>
                  );
                })
              )}
            </article>
          );
        })}
      </section>
      <div className="quick-links">
        <Link href={`/boodschappen?week=${monday}`}>
          Boodschappenlijst maken →
        </Link>
        <Link href="/recepten">Alle recepten bekijken →</Link>
        <Link href="/voedingswijzer">Voedingswijzer →</Link>
      </div>
    </AppShell>
  );
}
