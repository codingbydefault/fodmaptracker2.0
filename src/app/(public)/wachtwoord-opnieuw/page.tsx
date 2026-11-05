import Link from "next/link";
import { Brand } from "@/components/Brand";
import { SubmitButton } from "@/components/SubmitButton";
import { updatePassword } from "@/lib/actions";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Nieuw wachtwoord", robots: { index: false, follow: false } };

const errors: Record<string, string> = {
  invoer: "Kies een wachtwoord van minimaal 10 tekens.",
  auth: "Het wachtwoord kon niet worden opgeslagen. Vraag een nieuwe herstellink aan.",
};

export default async function NewPasswordPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  let signedIn = false;
  if (process.env.SUPABASE_URL && process.env.SUPABASE_PUBLISHABLE_KEY) {
    try {
      const supabase = await createClient();
      const { data } = await supabase.auth.getUser();
      signedIn = Boolean(data.user);
    } catch {
      signedIn = false;
    }
  }
  return (
    <main className="auth-wrap">
      <Brand />
      <section className="auth-card" style={{ marginTop: 24 }}>
        <div className="eyebrow">Account</div>
        <h1>Nieuw wachtwoord</h1>
        {params.error && <div className="notice notice-error">{errors[params.error] ?? errors.auth}</div>}
        {signedIn ? (
          <form action={updatePassword} style={{ display: "grid", gap: 14, marginTop: 22 }}>
            <div className="field">
              <label htmlFor="password">Nieuw wachtwoord (minimaal 10 tekens)</label>
              <input id="password" name="password" type="password" autoComplete="new-password" required minLength={10} maxLength={128} />
            </div>
            <SubmitButton className="btn" style={{ marginTop: 5 }}>Wachtwoord opslaan →</SubmitButton>
          </form>
        ) : (
          <div className="notice notice-error">Open de link in de e-mail om een nieuw wachtwoord te kiezen. Vraag een nieuwe link aan als deze verlopen is.</div>
        )}
        <p className="subtle" style={{ fontSize: 13, marginTop: 20 }}>
          <Link href="/wachtwoord-vergeten" style={{ color: "var(--green)", fontWeight: 700 }}>Nieuwe herstellink aanvragen</Link>
        </p>
      </section>
    </main>
  );
}
