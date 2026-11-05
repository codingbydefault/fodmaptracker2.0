import Link from "next/link";
import { Brand } from "@/components/Brand";
import { SubmitButton } from "@/components/SubmitButton";
import { requestPasswordReset } from "@/lib/actions";

export const metadata = { title: "Wachtwoord vergeten" };

const errors: Record<string, string> = {
  invoer: "Vul een geldig e-mailadres in.",
  limiet: "Er zijn te veel e-mails verstuurd. Wacht enkele minuten en probeer opnieuw.",
  auth: "De e-mail kon niet worden verstuurd. Probeer het later opnieuw.",
  sessie: "De herstellink is ongeldig of verlopen. Vraag een nieuwe e-mail aan.",
};

export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ error?: string; message?: string }> }) {
  const params = await searchParams;
  return (
    <main className="auth-wrap">
      <Brand />
      <section className="auth-card" style={{ marginTop: 24 }}>
        <div className="eyebrow">Account</div>
        <h1>Wachtwoord vergeten</h1>
        <p className="subtle" style={{ fontSize: 13 }}>We sturen een link om een nieuw wachtwoord te kiezen. De link opent deze site.</p>
        {params.error && <div className="notice notice-error">{errors[params.error] ?? errors.auth}</div>}
        {params.message === "verzonden" && <div className="notice">Als dit adres bij ons bekend is, ontvang je een e-mail om je wachtwoord opnieuw in te stellen.</div>}
        <form action={requestPasswordReset} style={{ display: "grid", gap: 14, marginTop: 22 }}>
          <div className="field">
            <label htmlFor="email">E-mailadres</label>
            <input id="email" name="email" type="email" autoComplete="email" required maxLength={254} />
          </div>
          <SubmitButton className="btn" style={{ marginTop: 5 }}>Verstuur herstellink →</SubmitButton>
        </form>
        <p className="subtle" style={{ fontSize: 13, marginTop: 20 }}>
          <Link href="/login" style={{ color: "var(--green)", fontWeight: 700 }}>Terug naar inloggen</Link>
        </p>
      </section>
    </main>
  );
}
