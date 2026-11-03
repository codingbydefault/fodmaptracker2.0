import { SubmitButton } from "@/components/SubmitButton";
import { addSymptomEntry, deleteSymptomEntry } from "@/lib/actions";
import { requireUser, getFoodEntries, getSymptomEntries } from "@/lib/data";
import { AppShell } from "@/components/AppShell";
import { SeveritySlider } from "@/components/SeveritySlider";
import { getRequestLanguage } from "@/lib/request-language";
import { localizedSymptomNames } from "@/lib/i18n";
import Link from "next/link";
export const metadata = { title: "Symptoomdagboek" };
export default async function SymptomPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const [{ user }, entries, foods, params,language] = await Promise.all([
    requireUser(),
    getSymptomEntries(100),
    getFoodEntries(30),
    searchParams,
    getRequestLanguage(),
  ]);
  const symptomNames=localizedSymptomNames[language];
  return (
    <AppShell active="klachten" email={user.email ?? "Account"}>
      <header style={{ marginBottom: 20 }}>
        <div className="eyebrow">Dagboek</div>
        <h1 className="page-title">Hoe voel je je?</h1>
        <p className="subtle">
          Leg je ervaring vast. Er is geen goed of fout antwoord.
        </p>
      </header>
      {params.error && (
        <div className="notice notice-error">
          {params.error === "invoer"
            ? "Controleer de velden en probeer opnieuw."
            : params.error === "opslaan"
              ? "Opslaan is niet gelukt. Probeer opnieuw."
              : "De actie is niet gelukt."}
        </div>
      )}
      {params.message && (
        <div className="notice">
          {params.message === "toegevoegd"
            ? "Klacht toegevoegd aan je dagboek."
            : params.message === "bijgewerkt"
              ? "Klacht bijgewerkt."
              : "Registratie verwijderd."}
        </div>
      )}
      <div className="grid-main">
        <section className="card">
          <h2 className="section-title">Klacht registreren</h2>
          <p
            className="subtle"
            style={{ fontSize: 13, marginTop: 4, marginBottom: 18 }}
          >
            Kies een vorm of beschrijf zelf wat je voelt.
          </p>
          <form action={addSymptomEntry}>
            <div className="form-grid">
              <div className="field span-2">
                <label htmlFor="food_entry_id">
                  Na welke maaltijd? (optioneel)
                </label>
                <select id="food_entry_id" name="food_entry_id" defaultValue="">
                  <option value="">Niet aan een maaltijd koppelen</option>
                  {foods.map((food) => (
                    <option key={food.id} value={food.id}>
                      {food.food_name} ·{" "}
                      {new Intl.DateTimeFormat(language, {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZone: "Europe/Amsterdam",
                      }).format(new Date(food.eaten_at))}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="symptom_type">Vorm van de klacht *</label>
                <select
                  id="symptom_type"
                  name="symptom_type"
                  defaultValue="opgeblazen"
                >
                  {Object.entries(symptomNames).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="custom_symptom">
                  Eigen omschrijving bij ‘Anders’
                </label>
                <input
                  id="custom_symptom"
                  name="custom_symptom"
                  maxLength={80}
                  placeholder="Bijv. branderig gevoel"
                />
              </div>
              <div className="field span-2">
                <label htmlFor="experienced_at">Datum en tijd</label>
                <input
                  id="experienced_at"
                  name="experienced_at"
                  type="datetime-local"
                />
              </div>
              <div className="field span-2">
                <label htmlFor="severity">
                  Ernst: 0 (geen) tot 10 (zeer ernstig) *
                </label>
                <SeveritySlider />
                <div className="subtle" style={{ fontSize: 12 }}>
                  0 = geen klachten · 10 = zeer ernstig.
                </div>
              </div>
              <div className="field span-2">
                <label htmlFor="notes">Notities (optioneel)</label>
                <textarea
                  id="notes"
                  name="notes"
                  maxLength={500}
                  placeholder="Wanneer begon het, hoe voelde het en wat viel verder op?"
                />
              </div>
            </div>
            <div className="form-actions">
              <SubmitButton className="btn">
                Klacht opslaan <span aria-hidden="true">→</span>
              </SubmitButton>
            </div>
          </form>
        </section>
        <section className="card">
          <h2 className="section-title">Recente registraties</h2>
          {entries.length === 0 ? (
            <div className="empty">Je registraties verschijnen hier.</div>
          ) : (
            entries.map((x) => {
              const label =
                x.symptom_type === "anders" && x.custom_symptom
                  ? x.custom_symptom
                  : symptomNames[x.symptom_type];
              return (
                <div className="entry" key={x.id}>
                  <div style={{ minWidth: 0 }}>
                    <div className="entry-title">{label}</div>
                    <div
                      className="subtle"
                      style={{ fontSize: 12, marginTop: 3 }}
                    >
                      {new Intl.DateTimeFormat(language, {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZone: "Europe/Amsterdam",
                      }).format(new Date(x.experienced_at))}
                    </div>
                    {x.food_entry && (
                      <div className="subtle" style={{ fontSize: 12 }}>
                        Na: {x.food_entry.food_name}
                      </div>
                    )}
                    {x.notes && (
                      <div
                        className="subtle"
                        style={{
                          fontSize: 12,
                          marginTop: 4,
                          overflowWrap: "anywhere",
                        }}
                      >
                        {x.notes}
                      </div>
                    )}
                    <Link
                      href={`/klachten/${x.id}/bewerken`}
                      style={{
                        display: "inline-block",
                        fontSize: 12,
                        color: "var(--green)",
                        fontWeight: 700,
                        marginTop: 8,
                      }}
                    >
                      Bewerken
                    </Link>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "end",
                      gap: 8,
                    }}
                  >
                    <span className="pill">{x.severity}/10</span>
                    <form action={deleteSymptomEntry}>
                      <input type="hidden" name="id" value={x.id} />
                      <SubmitButton
                        className="btn btn-secondary"
                        style={{
                          minHeight: 32,
                          padding: "5px 8px",
                          fontSize: 11,
                        }}
                        ariaLabel={`Verwijder ${label}`}
                        confirmMessage="Deze klacht verwijderen? Dit kan niet ongedaan worden."
                      >
                        Verwijder
                      </SubmitButton>
                    </form>
                  </div>
                </div>
              );
            })
          )}
        </section>
      </div>
      <p className="footer-note">
        Symptoomregistraties zijn subjectieve ervaringen en stellen geen
        diagnose.
      </p>
    </AppShell>
  );
}
