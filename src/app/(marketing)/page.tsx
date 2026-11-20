import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Brand } from "@/components/Brand";
import { LatestArticles } from "@/components/LatestArticles";
import { PublicFooter } from "@/components/PublicFooter";
import { SkipLink } from "@/components/SkipLink";

export default async function Home() {
  const configured = !!(process.env.SUPABASE_URL && process.env.SUPABASE_PUBLISHABLE_KEY);
  if (configured) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      const { data: profile } = await supabase.from("profiles").select("account_type").eq("id", data.user.id).maybeSingle();
      redirect(profile?.account_type === "dietitian" ? "/professional" : "/dashboard");
    }
  }
  const steps = [
    { n: "01", t: "Registreer", d: "Leg maaltijden vast." },
    { n: "02", t: "Observeer", d: "Houd klachten bij." },
    { n: "03", t: "Bespreek", d: "Neem je overzicht mee." },
  ];
  return (
    <>
      <SkipLink />
      <main className="app-shell home-shell" id="inhoud">
        <Brand />
        <section className="welcome home-welcome">
          <div className="eyebrow">Meer inzicht, stap voor stap</div>
          <h1 className="page-title home-title">Leer je eigen voedingspatroon beter begrijpen.</h1>
          <p className="subtle home-lead">Een rustige plek om maaltijden en symptomen bij te houden. Zie je eigen gegevens overzichtelijk terug en bespreek ze waar nodig met je diëtist.</p>
          <div className="home-actions">
            <Link className="btn" href="/registreren">Maak een account aan →</Link>
            <Link className="btn btn-secondary" href="/login">Ik heb al een account</Link>
          </div>
        </section>
        <div className="stat-grid home-steps">
          {steps.map(step => (
            <div key={step.n} className="card stat">
              <span className="eyebrow">{step.n}</span>
              <div className="section-title" style={{ marginTop: 8 }}>{step.t}</div>
              <p className="subtle" style={{ fontSize: 13, margin: "4px 0 0" }}>{step.d}</p>
            </div>
          ))}
        </div>
        <LatestArticles />
        <p className="footer-note">Fodmap-Tracker is een hulpmiddel voor registratie en vervangt geen medisch advies. De eerste versie bevat nog geen gevalideerde FODMAP-classificaties.</p>
        <PublicFooter />
      </main>
    </>
  );
}
