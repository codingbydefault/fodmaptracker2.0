import Link from "next/link";
import { Brand } from "@/components/Brand";
import { SubmitButton } from "@/components/SubmitButton";
import { PublicFooter } from "@/components/PublicFooter";
import { SkipLink } from "@/components/SkipLink";
import { signIn } from "@/lib/actions";

export const metadata = { title: "Inloggen" };

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string; message?: string }> }) {
  const params = await searchParams;
  const invalid = Boolean(params.error);
  const errorText = params.error === "invoer"
    ? "Vul een geldig e-mailadres en wachtwoord in (minimaal 10 tekens)."
    : "Inloggen is niet gelukt. Controleer je gegevens en probeer opnieuw.";
  return (
    <>
      <SkipLink />
      <main className="auth-wrap" id="inhoud">
        <Brand />
        <section className="auth-card" style={{ marginTop: 24 }}>
          <div className="eyebrow">Welkom terug</div>
          <h1>Log in op je account</h1>
          <p className="subtle" style={{ fontSize: 13 }}>Ga verder met je persoonlijke dagboek.</p>
          {params.error && <div id="form-error" className="notice notice-error" role="alert">{errorText}</div>}
          {params.message && <div className="notice" role="status">{params.message === "controleer-email" ? "Controleer je e-mail om je account te bevestigen." : "Je bent uitgelogd."}</div>}
          <form action={signIn} style={{ display: "grid", gap: 14, marginTop: 22 }} aria-describedby={invalid ? "form-error" : undefined}>
            <div className="field">
              <label htmlFor="email">E-mailadres</label>
              <input id="email" name="email" type="email" autoComplete="email" required maxLength={254} aria-invalid={invalid || undefined} aria-describedby={invalid ? "form-error" : undefined} />
            </div>
            <div className="field">
              <label htmlFor="password">Wachtwoord</label>
              <input id="password" name="password" type="password" autoComplete="current-password" required minLength={10} maxLength={128} aria-invalid={invalid || undefined} aria-describedby={invalid ? "form-error" : undefined} />
            </div>
            <SubmitButton className="btn" style={{ marginTop: 5 }}>Inloggen →</SubmitButton>
          </form>
          <p className="subtle" style={{ fontSize: 13, marginTop: 14 }}><Link href="/wachtwoord-vergeten" style={{ color: "var(--green)", fontWeight: 700 }}>Wachtwoord vergeten?</Link></p>
          <p className="subtle" style={{ fontSize: 13, marginTop: 8 }}>Nog geen account? <Link href="/registreren" style={{ color: "var(--green)", fontWeight: 700 }}>Registreer hier</Link></p>
        </section>
        <p className="footer-note">Gebruik een uniek wachtwoord. Deel je account niet met anderen.</p>
        <PublicFooter />
      </main>
    </>
  );
}
