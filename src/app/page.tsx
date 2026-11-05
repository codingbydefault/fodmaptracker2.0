import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Brand } from "@/components/Brand";
import { LatestArticles } from "@/components/LatestArticles";
import { PublicFooter } from "@/components/PublicFooter";
export default async function Home(){
 const configured=!!(process.env.SUPABASE_URL&&process.env.SUPABASE_PUBLISHABLE_KEY);
 if(configured){const supabase=await createClient();const {data}=await supabase.auth.getUser();if(data.user){const {data:profile}=await supabase.from("profiles").select("account_type").eq("id",data.user.id).maybeSingle();redirect(profile?.account_type==="dietitian"?"/professional":"/dashboard");}}
 return <main className="app-shell" style={{maxWidth:850,paddingTop:"9vh"}}><Brand/><section className="welcome" style={{marginTop:45,padding:"clamp(25px,6vw,55px)"}}><div className="eyebrow">Meer inzicht, stap voor stap</div><h1 className="page-title" style={{fontSize:"clamp(36px,7vw,58px)",maxWidth:620,marginTop:16}}>Leer je eigen voedingspatroon beter begrijpen.</h1><p className="subtle" style={{fontSize:17,maxWidth:560,marginTop:14}}>Een rustige plek om maaltijden en symptomen bij te houden. Zie je eigen gegevens overzichtelijk terug en bespreek ze waar nodig met je diëtist.</p><div className="quick-links"><Link href="/registreren">Maak een account aan →</Link><Link href="/login">Ik heb al een account</Link></div></section><div className="stat-grid" style={{marginTop:16}}>{[{n:"01",t:"Registreer",d:"Leg maaltijden vast."},{n:"02",t:"Observeer",d:"Houd klachten bij."},{n:"03",t:"Bespreek",d:"Neem je overzicht mee."}].map(x=><div key={x.n} className="card stat"><span className="eyebrow">{x.n}</span><div className="section-title" style={{marginTop:8}}>{x.t}</div><p className="subtle" style={{fontSize:13,margin:"4px 0 0"}}>{x.d}</p></div>)}</div><LatestArticles/><p className="footer-note">Fodmap-Tracker is een hulpmiddel voor registratie en vervangt geen medisch advies. De eerste versie bevat nog geen gevalideerde FODMAP-classificaties.</p><PublicFooter/></main>
}
