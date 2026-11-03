import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/data";
import { AppShell } from "@/components/AppShell";
import { SubmitButton } from "@/components/SubmitButton";
import { resetVisitorStats } from "@/lib/admin-actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Beheer en stabiliteit" };

type RecentSignup = { created_at: string };
type AdminStats = {
  generated_at: string;
  database_status: string;
  total_auth_users: number;
  total_profiles: number;
  profiles_last_24h: number;
  profiles_last_7d: number;
  auth_users_without_profile: number;
  total_food_entries: number;
  food_entries_last_7d: number;
  total_symptom_entries: number;
  symptom_entries_last_7d: number;
  latest_profile_created_at: string | null;
  recent_signups: RecentSignup[];
};

type MonitoringEvent = {
  event_type: "client_error" | "route_error";
  path: string;
  error_code: string | null;
  created_at: string;
};

type MonitoringStats = {
  generated_at: string;
  errors_last_24h: number;
  errors_last_7d: number;
  last_error_at: string | null;
  recent_events: MonitoringEvent[];
  unique_visitors: number;
  total_visit_sessions: number;
  visits_today: number;
  visitor_tracking_started_at: string | null;
};

const number = (value: number) => value.toLocaleString("nl-NL");
const dateTime = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("nl-NL", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Europe/Amsterdam",
      }).format(new Date(value))
    : "Nog geen registraties";

function Metric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="card stat">
      <div className="subtle" style={{ fontSize: 12 }}>{label}</div>
      <div className="stat-number">{value}</div>
      <div className="subtle" style={{ fontSize: 12 }}>{detail}</div>
    </div>
  );
}

export default async function AdminPage({ searchParams }: { searchParams: Promise<{message?:string;error?:string}> }) {
  const query = await searchParams;
  const { supabase, user } = await requireUser();

  const { data: isAdmin, error: adminCheckError } = await supabase.rpc("is_app_admin");
  if (adminCheckError || isAdmin !== true) redirect("/dashboard");

  const monitoringStartedAt = performance.now();
  const [{ data, error }, { data: monitoringData, error: monitoringError }] = await Promise.all([
    supabase.rpc("get_admin_dashboard_stats"),
    supabase.rpc("get_admin_monitoring_stats"),
  ]);
  const databaseResponseMs = Math.max(1, Math.round(performance.now() - monitoringStartedAt));
  if (error || !data) {
    return (
      <AppShell active="admin" email={user.email ?? "Beheerder"}>
        <section className="card">
          <div className="eyebrow">Beheer</div>
          <h1 className="page-title">Stabiliteitsdashboard</h1>
          <div className="notice notice-error">
            De statistieken konden niet worden geladen. Controleer de Supabase-migratie en de databaseverbinding.
          </div>
          <p className="subtle">Er zijn geen beheerstatistieken getoond.</p>
          <Link className="btn btn-secondary" href="/dashboard">Terug naar overzicht</Link>
        </section>
      </AppShell>
    );
  }

  const stats = data as AdminStats;
  const monitoring = monitoringData as MonitoringStats | null;
  const profileMismatch = stats.auth_users_without_profile > 0;

  return (
    <AppShell active="admin" email={user.email ?? "Beheerder"}>
      <section className="welcome">
        <div className="eyebrow">Alleen voor beheer</div>
        <h1 className="page-title" style={{ marginTop: 10 }}>Stabiliteitsdashboard</h1>
        <p className="subtle" style={{ maxWidth: 680 }}>
          Een compact overzicht van accountgroei, opgeslagen registraties en de bereikbaarheid van de database.
          Alleen accounts die als beheerder zijn ingesteld, kunnen deze statistieken opvragen.
        </p>
        <p className="subtle" style={{ fontSize: 12, marginBottom: 0 }}>
          Laatst bijgewerkt: {dateTime(stats.generated_at)}
        </p>
      </section>

      <section style={{ marginTop: 18 }}>
        <h2 className="section-title" style={{ marginBottom: 10 }}>Accounts</h2>
        <div className="stat-grid">
          <Metric label="Geregistreerde accounts" value={number(stats.total_auth_users)} detail="Totaal in Supabase Auth" />
          <Metric label="Aangemaakte profielen" value={number(stats.total_profiles)} detail="De profielenteller" />
          <Metric label="Nieuwe accounts · 24 uur" value={number(stats.profiles_last_24h)} detail="Op basis van profieldatum" />
        </div>
        <div className="stat-grid" style={{ marginTop: 12 }}>
          <Metric label="Nieuwe profielen · 7 dagen" value={number(stats.profiles_last_7d)} detail="Recente groei" />
          <Metric label="Maaltijdregistraties" value={number(stats.total_food_entries)} detail={number(stats.food_entries_last_7d) + " in de afgelopen 7 dagen"} />
          <Metric label="Klachtenregistraties" value={number(stats.total_symptom_entries)} detail={number(stats.symptom_entries_last_7d) + " in de afgelopen 7 dagen"} />
        </div>
      </section>

      <section className="grid-main" style={{ marginTop: 18 }}>
        <div className="card">
          <h2 className="section-title">Systeemcontroles</h2>
          <div className="entry">
            <div>
              <div className="entry-title">Supabase-database</div>
              <div className="subtle" style={{ fontSize: 12 }}>Statistieken konden via de database worden opgehaald</div>
            </div>
            <span className="pill">Verbonden</span>
          </div>
          <div className="entry">
            <div>
              <div className="entry-title">Account- en profielcontrole</div>
              <div className="subtle" style={{ fontSize: 12 }}>
                {profileMismatch
                  ? number(stats.auth_users_without_profile) + " account(s) zonder profiel"
                  : "Alle geregistreerde accounts hebben een profiel"}
              </div>
            </div>
            <span className="pill" style={profileMismatch ? { background: "#fff0ed", color: "#9a3b31" } : undefined}>
              {profileMismatch ? "Controleren" : "OK"}
            </span>
          </div>
          <div className="entry">
            <div>
              <div className="entry-title">Laatste profielregistratie</div>
              <div className="subtle" style={{ fontSize: 12 }}>Meest recente profiel in de database</div>
            </div>
            <span style={{ fontSize: 12, textAlign: "right" }}>{dateTime(stats.latest_profile_created_at)}</span>
          </div>
        </div>

        <div className="card">
          <h2 className="section-title">Recente aanmeldingen</h2>
          {stats.recent_signups.length === 0 ? (
            <div className="empty">Er zijn nog geen profielen geregistreerd.</div>
          ) : (
            stats.recent_signups.map((signup, index) => (
              <div className="entry" key={signup.created_at + index}>
                <div>
                  <div className="entry-title">Account aangemaakt</div>
                  <div className="subtle" style={{ fontSize: 12 }}>Registratie {index + 1} in de recente lijst</div>
                </div>
                <span style={{ fontSize: 12, textAlign: "right" }}>{dateTime(signup.created_at)}</span>
              </div>
            ))
          )}
        </div>
      </section>

      <section style={{ marginTop: 18 }}>
        <h2 className="section-title" style={{ marginBottom: 10 }}>Bezoekers sinds de teststart</h2>
        {query.message === "reset" && <div className="notice">De bezoekerstelling is opnieuw gestart.</div>}
        {query.error === "reset" && <div className="notice notice-error">De bezoekerstelling kon niet worden gereset. Typ RESET exact en probeer opnieuw.</div>}
        {monitoringError || !monitoring ? <div className="notice notice-error">De bezoekerstelling wordt actief na Supabase-migratie 0030.</div> : <>
          <div className="stat-grid">
            <Metric label="Unieke bezoekers" value={number(monitoring.unique_visitors)} detail="Anonieme browsers sinds de start" />
            <Metric label="Bezoeken" value={number(monitoring.total_visit_sessions)} detail="Nieuwe browsersessies" />
            <Metric label="Bezoeken vandaag" value={number(monitoring.visits_today)} detail="Tijdzone Europa/Amsterdam" />
          </div>
          <div className="card" style={{marginTop:12}}>
            <div className="entry"><div><div className="entry-title">Privacyvriendelijke telling</div><div className="subtle" style={{fontSize:12}}>Actief sinds {dateTime(monitoring.visitor_tracking_started_at)} · geen IP-adressen, e-mailadressen of gezondheidsgegevens.</div></div><span className="pill">Actief</span></div>
            <details style={{marginTop:14}}><summary style={{cursor:"pointer",fontWeight:700}}>Teller resetten bij officiële lancering</summary><form action={resetVisitorStats} style={{marginTop:14}}><p className="subtle">Dit wist uitsluitend de anonieme bezoeker- en sessietellingen. Accounts en appgegevens blijven behouden.</p><div className="field" style={{maxWidth:320}}><label htmlFor="reset_confirmation">Typ RESET</label><input id="reset_confirmation" name="reset_confirmation" autoComplete="off" required pattern="RESET"/></div><div className="form-actions"><SubmitButton className="btn btn-danger" confirmMessage="Alle anonieme bezoekerstatistieken op nul zetten? Accounts en appgegevens blijven behouden.">Bezoekerstelling resetten</SubmitButton></div></form></details>
          </div>
        </>}
      </section>

      <section style={{ marginTop: 18 }}>
        <h2 className="section-title" style={{ marginBottom: 10 }}>Monitoring</h2>
        {monitoringError || !monitoring ? (
          <div className="notice notice-error">
            Monitoring is nog niet verbonden. Voer Supabase-migratie 0027 uit om foutregistratie te activeren.
          </div>
        ) : (
          <>
            <div className="stat-grid">
              <Metric label="Technische fouten · 24 uur" value={number(monitoring.errors_last_24h)} detail="Alleen technische metadata" />
              <Metric label="Technische fouten · 7 dagen" value={number(monitoring.errors_last_7d)} detail="Frontend- en routefouten" />
              <Metric label="Database-responstijd" value={`${databaseResponseMs} ms`} detail="Gemeten bij het openen van dit dashboard" />
            </div>
            <div className="card" style={{ marginTop: 12 }}>
              <div className="entry">
                <div>
                  <div className="entry-title">Foutregistratie</div>
                  <div className="subtle" style={{ fontSize: 12 }}>Laatste fout: {dateTime(monitoring.last_error_at)}</div>
                </div>
                <span className="pill">Actief</span>
              </div>
              {monitoring.recent_events.length === 0 ? (
                <div className="empty">Er zijn nog geen technische fouten geregistreerd.</div>
              ) : monitoring.recent_events.map((event, index) => (
                <div className="entry" key={`${event.created_at}-${index}`}>
                  <div>
                    <div className="entry-title">{event.event_type === "route_error" ? "Paginafout" : "Appfout"} · {event.path}</div>
                    <div className="subtle" style={{ fontSize: 12 }}>Code: {event.error_code || "onbekend"}</div>
                  </div>
                  <span style={{ fontSize: 12, textAlign: "right" }}>{dateTime(event.created_at)}</span>
                </div>
              ))}
            </div>
          </>
        )}
        <p className="subtle" style={{ fontSize: 12, marginTop: 10, marginBottom: 0 }}>
          Monitoring bewaart geen klachten, maaltijden, e-mailadressen of volledige foutteksten.
        </p>
      </section>
    </AppShell>
  );
}
