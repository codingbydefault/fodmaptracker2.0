import Link from "next/link";
import { Brand } from "@/components/Brand";
import { SkipLink } from "@/components/SkipLink";

export function NotFoundView() {
  return (
    <>
      <SkipLink />
      <main className="app-shell not-found-shell" id="inhoud">
        <Brand />
        <section className="card not-found-card">
          <div className="eyebrow">Pagina niet gevonden</div>
          <h1 className="page-title">Dit adres hoort niet bij Fodmap-Tracker</h1>
          <p className="subtle">Controleer het adres, of ga terug naar een bestaande pagina.</p>
          <div className="home-actions">
            <Link className="btn" href="/">Naar de startpagina</Link>
            <Link className="btn btn-secondary" href="/login">Inloggen</Link>
          </div>
        </section>
      </main>
    </>
  );
}
