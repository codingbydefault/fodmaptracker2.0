"use client";

import { ErrorReporter } from "@/components/ErrorReporter";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="app-shell">
      <ErrorReporter error={error} eventType="route_error" />
      <section className="card" style={{ maxWidth: 680, margin: "48px auto" }}>
        <div className="eyebrow">Technisch probleem</div>
        <h1 className="page-title">Deze pagina kon niet worden geladen</h1>
        <p className="subtle">De technische fout is veilig gemeld. Probeer de pagina opnieuw te laden.</p>
        <button className="btn" type="button" onClick={reset}>Opnieuw proberen</button>
      </section>
    </main>
  );
}
