import { SubmitButton } from "@/components/SubmitButton";
import { addFoodEntry, deleteFoodEntry } from "@/lib/actions";
import { requireUser, getFoodEntries } from "@/lib/data";
import { AppShell } from "@/components/AppShell";
import { mealNames } from "@/lib/types";
import Link from "next/link";
export const metadata = { title: "Voedingsdagboek" };
export default async function FoodPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const [{ user }, entries, params] = await Promise.all([
    requireUser(),
    getFoodEntries(100),
    searchParams,
  ]);
  return (
    <AppShell active="voeding" email={user.email ?? "Account"}>
      <header style={{ marginBottom: 20 }}>
        <div className="eyebrow">Dagboek</div>
        <h1 className="page-title">Voeding</h1>
        <p className="subtle">
          Leg vast wat je hebt gegeten, zonder oordeel of aannames.
        </p>
      </header>
      {params.error && (
        <div className="notice notice-error">
          {params.error === "invoer"
            ? "Controleer de velden en probeer opnieuw."
            : params.error === "foto"
              ? "Gebruik een JPG-, PNG- of WebP-foto van maximaal 5 MB."
              : params.error === "opslaan"
                ? "Opslaan is niet gelukt. Probeer opnieuw."
                : "De actie is niet gelukt."}
        </div>
      )}
      {params.message && (
        <div className="notice">
          {params.message === "toegevoegd"
            ? "Maaltijd toegevoegd aan je dagboek."
            : params.message === "bijgewerkt"
              ? "Maaltijd bijgewerkt."
              : "Maaltijd verwijderd."}
        </div>
      )}
      <div className="grid-main">
        <section className="card">
          <h2 className="section-title">Maaltijd toevoegen</h2>
          <p
            className="subtle"
            style={{ fontSize: 13, marginTop: 4, marginBottom: 18 }}
          >
            Vul de gegevens zo goed mogelijk in. Je kunt alles later aanpassen.
          </p>
          <form action={addFoodEntry}>
            <div className="form-grid">
              <div className="field span-2">
                <label htmlFor="food_name">Wat heb je gegeten? *</label>
                <input
                  id="food_name"
                  name="food_name"
                  required
                  minLength={2}
                  maxLength={140}
                  placeholder="Bijv. havermout met banaan"
                />
              </div>
              <div className="field">
                <label htmlFor="meal_type">Maaltijd *</label>
                <select id="meal_type" name="meal_type" defaultValue="ontbijt">
                  {Object.entries(mealNames).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="portion_description">Hoeveelheid</label>
                <input
                  id="portion_description"
                  name="portion_description"
                  maxLength={100}
                  placeholder="Bijv. 1 kom, circa 200 g"
                />
              </div>
              <div className="field span-2">
                <label htmlFor="eaten_at">Datum en tijd</label>
                <input id="eaten_at" name="eaten_at" type="datetime-local" />
              </div>
              <div className="field span-2">
                <label htmlFor="photo">Foto (optioneel)</label>
                <input
                  id="photo"
                  name="photo"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                />
                <span className="subtle" style={{ fontSize: 11 }}>
                  JPG, PNG of WebP, maximaal 5 MB. We slaan de foto privé op als
                  WebP van maximaal 800×800.
                </span>
              </div>
              <div className="field span-2">
                <label htmlFor="notes">Notities (optioneel)</label>
                <textarea
                  id="notes"
                  name="notes"
                  maxLength={500}
                  placeholder="Ingrediënten, merk of bereidingswijze…"
                />
              </div>
            </div>
            <div className="form-actions">
              <SubmitButton className="btn">
                Maaltijd opslaan <span aria-hidden="true">→</span>
              </SubmitButton>
            </div>
          </form>
        </section>
        <section className="card">
          <h2 className="section-title">Recente registraties</h2>
          {entries.length === 0 ? (
            <div className="empty">
              Hier verschijnen je maaltijden zodra je ze toevoegt.
            </div>
          ) : (
            entries.map((x) => (
              <div className="entry" key={x.id}>
                {x.photo_url && (
                  <img className="meal-thumb" src={x.photo_url} alt="" />
                )}
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div className="entry-title">{x.food_name}</div>
                  <div
                    className="subtle"
                    style={{ fontSize: 12, marginTop: 3 }}
                  >
                    {mealNames[x.meal_type]} ·{" "}
                    {new Intl.DateTimeFormat("nl-NL", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZone: "Europe/Amsterdam",
                    }).format(new Date(x.eaten_at))}
                  </div>
                  {x.portion_description && (
                    <div className="subtle" style={{ fontSize: 12 }}>
                      Hoeveelheid: {x.portion_description}
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
                  <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                    <Link
                      href={`/voeding/${x.id}/bewerken`}
                      style={{
                        fontSize: 12,
                        color: "var(--green)",
                        fontWeight: 700,
                      }}
                    >
                      Bewerken
                    </Link>
                    <Link
                      href={`/recepten/nieuw?maaltijd=${x.id}`}
                      style={{
                        fontSize: 12,
                        color: "var(--green)",
                        fontWeight: 700,
                      }}
                    >
                      Als recept opslaan
                    </Link>
                  </div>
                </div>
                <form action={deleteFoodEntry}>
                  <input type="hidden" name="id" value={x.id} />
                  <SubmitButton
                    className="btn btn-secondary"
                    style={{ minHeight: 32, padding: "5px 8px", fontSize: 11 }}
                    ariaLabel={`Verwijder ${x.food_name}`}
                    confirmMessage="Deze maaltijd verwijderen? Dit kan niet ongedaan worden."
                  >
                    Verwijder
                  </SubmitButton>
                </form>
              </div>
            ))
          )}
        </section>
      </div>
    </AppShell>
  );
}
