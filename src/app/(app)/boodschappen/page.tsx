import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { ShoppingList } from "@/components/ShoppingList";
import {
  addCalendarDays,
  mondayOfWeek,
  weekDates,
  zonedCalendarDate,
} from "@/lib/dates";
import { getWeeklyMenu, requireUser } from "@/lib/data";
import {
  consolidatedIngredientLines,
  stackingSignals,
} from "@/lib/fodmap-guide";
export const metadata = { title: "Boodschappenlijst" };
export default async function ShoppingPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const [{ user }, params] = await Promise.all([requireUser(), searchParams]);
  const today = zonedCalendarDate("Europe/Amsterdam");
  const monday = mondayOfWeek(
    params.week && /^\d{4}-\d{2}-\d{2}$/.test(params.week)
      ? params.week
      : today,
  );
  const sunday = weekDates(monday)[6];
  const entries = await getWeeklyMenu(monday, sunday);
  const items = consolidatedIngredientLines(entries);
  const combined = entries
    .map((x) => (x.recipe ?? x.curated_recipe)?.ingredients ?? "")
    .join("\n");
  const stacking = stackingSignals(combined);
  return (
    <AppShell active="weekmenu" email={user.email ?? "Account"}>
      <header>
        <div className="eyebrow">Weekmenu</div>
        <h1 className="page-title">Boodschappenlijst</h1>
        <p className="subtle">
          Gelijke ingrediënten worden automatisch samengevoegd en opgeteld.
          Vinkjes blijven op dit apparaat bewaard.
        </p>
      </header>
      <div className="week-navigation">
        <Link
          className="btn btn-secondary"
          href={`/boodschappen?week=${addCalendarDays(monday, -7)}`}
        >
          ← Vorige
        </Link>
        <strong>Week van {monday}</strong>
        <Link
          className="btn btn-secondary"
          href={`/boodschappen?week=${addCalendarDays(monday, 7)}`}
        >
          Volgende →
        </Link>
      </div>
      {stacking.showWarning && (
        <div className="notice notice-warning">
          <strong>Controlepunt voor stapeling:</strong> in dit weekmenu zijn
          meerdere portiegevoelige aandachtspunten gevonden. Dit is geen
          persoonlijke voorspelling; controleer porties per maaltijd.
        </div>
      )}
      {items.length ? (
        <ShoppingList week={monday} items={items} />
      ) : (
        <div className="card empty">
          Plan eerst recepten in je weekmenu om een lijst te maken.
        </div>
      )}
      <div className="quick-links">
        <Link href={`/weekmenu?week=${monday}`}>Terug naar weekmenu →</Link>
        <Link href="/voedingswijzer">Ingrediënten controleren →</Link>
      </div>
    </AppShell>
  );
}
