import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { SubmitButton } from "@/components/SubmitButton";
import { LabelChecker } from "@/components/LabelChecker";
import { getFoodGuide, getProfile, requireUser } from "@/lib/data";
import {
  fodmapGroupNames,
  fodmapGroups,
} from "@/lib/fodmap-guide";
import { updateFodmapPreferences } from "@/lib/profile-actions";
import type { FoodGuideStatus } from "@/lib/types";
export const metadata = { title: "Voedingswijzer" };
const statusNames: Record<FoodGuideStatus, string> = {
  low: "Algemeen low-FODMAP",
  portion: "Portie telt",
  avoid: "Tijdelijk vervangen",
  unknown: "Onzeker",
};
export default async function GuidePage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    group?: string;
    status?: string;
    message?: string;
  }>;
}) {
  const [{ user }, params, profile] = await Promise.all([
    requireUser(),
    searchParams,
    getProfile(),
  ]);
  const items = await getFoodGuide(params.q, params.group, params.status);
  return (
    <AppShell
      active="profiel"
      email={
        profile.username ? `@${profile.username}` : (user.email ?? "Account")
      }
    >
      <header>
        <div className="eyebrow">Naslag en controle</div>
        <h1 className="page-title">Voedingswijzer</h1>
        <p className="subtle">
          Een kleine eigen, bronvermelde startset. Geen product wordt
          automatisch veilig verklaard.
        </p>
      </header>
      {params.message && (
        <div className="notice">
          Je persoonlijke groepsfilters zijn opgeslagen.
        </div>
      )}
      <section className="card guide-filters">
        <form className="recipe-filter-grid">
          <div className="field recipe-search-field">
            <label htmlFor="q">Zoeken</label>
            <input
              id="q"
              name="q"
              defaultValue={params.q}
              placeholder="Bijv. havermout of ui"
            />
          </div>
          <div className="field">
            <label htmlFor="group">FODMAP-groep</label>
            <select id="group" name="group" defaultValue={params.group ?? ""}>
              <option value="">Alle groepen</option>
              {fodmapGroups.map((group) => (
                <option key={group} value={group}>
                  {fodmapGroupNames[group]}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              defaultValue={params.status ?? ""}
            >
              <option value="">Alle statussen</option>
              {Object.entries(statusNames).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="recipe-filter-actions">
            <button className="btn" type="submit">
              Filteren
            </button>
            <Link className="btn btn-secondary" href="/voedingswijzer">
              Wissen
            </Link>
          </div>
        </form>
      </section>
      <div className="grid-main">
        <LabelChecker />
        <section className="card">
          <h2 className="section-title">Mijn aandachtspunten</h2>
          <p className="subtle">
            Gebruik dit pas na persoonlijke herintroductie; het is geen
            diagnose.
          </p>
          <form action={updateFodmapPreferences}>
            {fodmapGroups.map((group) => (
              <label className="filter-check preference-check" key={group}>
                <input
                  type="checkbox"
                  name="fodmap_group"
                  value={group}
                  defaultChecked={profile.avoided_fodmap_groups.includes(group)}
                />
                {fodmapGroupNames[group]}
              </label>
            ))}
            <SubmitButton
              className="btn btn-secondary"
              style={{ marginTop: 14 }}
            >
              Filters opslaan
            </SubmitButton>
          </form>
        </section>
      </div>
      <section className="guide-grid">
        {items.map((item) => (
          <article className="card guide-card" key={item.id}>
            <div className="guide-card-heading">
              <h2 className="section-title">{item.name}</h2>
              <span className={`pill guide-${item.guidance_status}`}>
                {statusNames[item.guidance_status ?? "unknown"]}
              </span>
            </div>
            {item.fodmap_groups.length > 0 && (
              <p className="subtle guide-groups">
                {item.fodmap_groups
                  .map((group) => fodmapGroupNames[group])
                  .join(" · ")}
              </p>
            )}
            <p>{item.portion_guidance}</p>
            <p className="subtle">{item.product_note}</p>
            <div className="guide-actions">
              <Link className="btn btn-secondary" href="/voeding">
                Maaltijd registreren
              </Link>
              {item.source_url && (
                <a href={item.source_url} target="_blank" rel="noreferrer">
                  Bron ↗
                </a>
              )}
            </div>
            <small className="subtle">
              Gecontroleerd {item.reviewed_on ?? "onbekend"} ·{" "}
              {item.source_name}
            </small>
          </article>
        ))}
      </section>
    </AppShell>
  );
}
