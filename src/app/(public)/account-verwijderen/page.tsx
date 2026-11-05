import type { Metadata } from "next";
import Link from "next/link";
import { Brand } from "@/components/Brand";
import { PRIVACY_CONTACT_EMAIL } from "@/lib/privacy";

export const metadata: Metadata = {
  title: "Account verwijderen",
  description: "Zo verwijder je je Fodmap-Tracker-account en de bijbehorende gegevens, ook zonder dat je bent ingelogd.",
};

export default async function AccountDeletionPage({ searchParams }: { searchParams: Promise<{ message?: string }> }) {
  const params = await searchParams;
  return (
    <main className="app-shell" style={{ maxWidth: 760 }}>
      <Brand />
      <header style={{ margin: "28px 0 22px" }}>
        <div className="eyebrow">Je gegevens</div>
        <h1 className="page-title">Account verwijderen</h1>
        <p className="subtle">Deze pagina is openbaar. Je hoeft niet ingelogd te zijn om te lezen hoe je een account laat verwijderen.</p>
      </header>
      {params.message === "verwijderd" && <div className="notice">Je account en de bijbehorende gegevens zijn verwijderd.</div>}
      <section className="card" style={{ marginBottom: 14 }}>
        <h2 className="section-title">Als je nog kunt inloggen</h2>
        <p>Open Profiel en gebruik ‘Account verwijderen’. Typ VERWIJDER en bevestig. Daarmee wissen we je dagboek, foto’s, recepten, weekmenu, profiel en het account zelf.</p>
        <p className="footer-note" style={{ marginTop: 0 }}><Link href="/login" style={{ color: "var(--green)", fontWeight: 700 }}>Inloggen</Link> en daarna naar Profiel gaan.</p>
      </section>
      <section className="card">
        <h2 className="section-title">Als je niet kunt inloggen</h2>
        <p>Stuur een e-mail naar <a href={`mailto:${PRIVACY_CONTACT_EMAIL}`}>{PRIVACY_CONTACT_EMAIL}</a> vanaf het adres van je account. Zet in het onderwerp ‘Verwijder mijn Fodmap-Tracker-account’ en vermeld het e-mailadres van het account.</p>
        <p>We verwijderen dan het account en de gegevens die eraan hangen: maaltijden, klachten, foto’s, recepten, weekmenu en profiel. We bevestigen per e-mail wanneer dat is gebeurd.</p>
        <p className="footer-note" style={{ marginTop: 0 }}>Meer over de verwerking staat in de <Link href="/privacy" style={{ color: "var(--green)", fontWeight: 700 }}>privacyverklaring</Link>.</p>
      </section>
    </main>
  );
}
