import Link from "next/link";
import { Brand } from "@/components/Brand";
import { PublicFooter } from "@/components/PublicFooter";
import { TERMS_VERSION, termsController, termsSections } from "@/lib/terms";

export const metadata = { title: "Algemene voorwaarden (concept)", description: "Concept algemene voorwaarden voor Fodmap-Tracker." };

export default function TermsPage() {
  return <main className="app-shell privacy-page" style={{maxWidth:760}}>
    <Brand/>
    <header style={{marginTop:32}}><div className="eyebrow">Juridische informatie</div><h1 className="page-title">Algemene voorwaarden</h1><p className="subtle">Versie {TERMS_VERSION}</p></header>
    <div className="notice" style={{marginTop:18}}><strong>Concept – nog te beoordelen door een jurist.</strong> Deze tekst is beschikbaar voor transparantie tijdens de testfase en kan vóór de officiële lancering nog wijzigen.</div>
    <section className="card" style={{marginTop:18}}><h2 className="section-title">Aanbieder en beheerder</h2><p><strong>Fodmap-Tracker is gemaakt en wordt beheerd door {termsController.tradeName}.</strong></p><p>{termsController.legalName}, handelend onder de naam {termsController.tradeName}<br/>{termsController.place}<br/>KvK {termsController.kvk} · btw {termsController.btw}</p><p><a href={`mailto:${termsController.email}`}>{termsController.email}</a></p></section>
    {termsSections.map(([heading,paragraphs])=><section className="card" style={{marginTop:18}} key={heading}><h2 className="section-title">{heading}</h2>{paragraphs.map(paragraph=><p key={paragraph}>{paragraph}</p>)}</section>)}
    <section className="card" style={{marginTop:18}}><h2 className="section-title">Contact en privacy</h2><p>Vragen of klachten kun je sturen naar <a href={`mailto:${termsController.email}`}>{termsController.email}</a>. We streven ernaar binnen 14 dagen te reageren.</p><p>Lees ook de <Link href="/privacy">privacyverklaring</Link> en de pagina over <Link href="/account-verwijderen">accountverwijdering</Link>.</p></section>
    <PublicFooter/>
  </main>;
}
