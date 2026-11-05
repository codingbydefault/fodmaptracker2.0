import Link from "next/link";
import { Brand } from "@/components/Brand";
import { SubmitButton } from "@/components/SubmitButton";
import { PublicFooter } from "@/components/PublicFooter";
import { signUp } from "@/lib/actions";

export const metadata = { title: "Account maken" };
const errors: Record<string, string> = {
  invoer: "Controleer het accounttype, e-mailadres en wachtwoord van minimaal 10 tekens.",
  bestaat: "Dit e-mailadres is al geregistreerd. Probeer in te loggen.",
  wachtwoord: "Kies een langer of sterker wachtwoord.", limiet: "Te veel pogingen. Wacht enkele minuten.",
  vol: "De testfase heeft het maximum van 100 accounts bereikt.", database: "Het profiel kon niet worden aangemaakt.",
  toestemming: "Lees de privacyverklaring en bevestig de verwerking.", voorwaarden: "Lees en accepteer de conceptvoorwaarden om een testaccount aan te maken.", auth: "Registreren is niet gelukt.",
};

export default async function Register({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  return <main className="auth-wrap"><Brand/><section className="auth-card" style={{marginTop:24}}>
    <div className="eyebrow">Begin met registreren</div><h1>Maak je account aan</h1>
    <p className="subtle" style={{fontSize:13}}>Kies eerst hoe je Fodmap-Tracker gaat gebruiken.</p>
    {params.error&&<div className="notice notice-error">{errors[params.error]??errors.auth}</div>}
    <form action={signUp} style={{display:"grid",gap:14,marginTop:22}}>
      <fieldset className="account-type-picker"><legend>Type profiel</legend>
        <label><input type="radio" name="account_type" value="patient" defaultChecked required/><span><strong>Persoonlijk profiel</strong><small>Houd maaltijden, klachten en fases bij en deel alleen als jij dat wilt.</small></span></label>
        <label><input type="radio" name="account_type" value="dietitian" required/><span><strong>Diëtistenprofiel</strong><small>Nodig cliënten uit en bekijk gedeelde dossiers na verificatie door de beheerder.</small></span></label>
      </fieldset>
      <div className="field"><label htmlFor="email">E-mailadres</label><input id="email" name="email" type="email" autoComplete="email" required maxLength={254}/></div>
      <div className="field"><label htmlFor="password">Wachtwoord (minimaal 10 tekens)</label><input id="password" name="password" type="password" autoComplete="new-password" required minLength={10} maxLength={128}/></div>
      <div className="field"><label htmlFor="preferred_language">Language · Taal · Langue · Sprache</label><select id="preferred_language" name="preferred_language" defaultValue="en"><option value="en">🇬🇧 English</option><option value="nl">🇳🇱 Nederlands</option><option value="fr">🇫🇷 Français</option><option value="de">🇩🇪 Deutsch</option></select></div>
      <label className="filter-check" htmlFor="health_consent" style={{whiteSpace:"normal",alignItems:"flex-start"}}><input id="health_consent" name="health_consent" type="checkbox" value="yes" required style={{marginTop:4}}/><span>Ik heb de <Link href="/privacy">privacyverklaring</Link> gelezen en stem in met de verwerking die bij het gekozen profiel hoort.</span></label>
      <label className="filter-check" htmlFor="terms_consent" style={{whiteSpace:"normal",alignItems:"flex-start"}}><input id="terms_consent" name="terms_consent" type="checkbox" value="yes" required style={{marginTop:4}}/><span>Ik heb de <Link href="/voorwaarden">conceptvoorwaarden</Link> gelezen en accepteer deze voor deelname aan de testfase.</span></label>
      <SubmitButton className="btn">Account aanmaken →</SubmitButton>
    </form>
    <p className="footer-note">Een diëtistenaccount krijgt pas toegang tot gedeelde cliëntgegevens na verificatie én expliciete toestemming van de cliënt.</p>
    <p className="subtle" style={{fontSize:13}}>Al een account? <Link href="/login" style={{color:"var(--green)",fontWeight:700}}>Log in</Link></p>
  </section><PublicFooter/></main>;
}
