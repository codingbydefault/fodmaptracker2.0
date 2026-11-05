import type { Metadata } from "next";
import Link from "next/link";
import { Brand } from "@/components/Brand";
import { PRIVACY_CONTACT_EMAIL, PRIVACY_NOTICE_VERSION, privacyController, privacyNotice } from "@/lib/privacy";

const notice = privacyNotice("nl");

export const metadata: Metadata = {
  title: notice.title,
  description: notice.description,
};

export default function PrivacyPage() {
  return (
    <main className="app-shell privacy-page" style={{ maxWidth: 760 }}>
      <Brand />
      <p className="notice" style={{ marginTop: 28 }}>{notice.draft}</p>
      <header style={{ margin: "18px 0 22px" }}>
        <div className="eyebrow">Versie {PRIVACY_NOTICE_VERSION}</div>
        <h1 className="page-title">{notice.title}</h1>
        <p className="subtle">{notice.intro}</p>
      </header>
      {notice.sections.map(section => (
        <section className="card" key={section.id} style={{ marginBottom: 14 }} id={section.id}>
          <h2 className="section-title">{section.heading}</h2>
          {section.paragraphs.map(paragraph => <p key={paragraph} style={{ margin: "10px 0 0" }}>{paragraph}</p>)}
          {section.id === "opslag" && <p className="notice" style={{ marginTop: 14 }}>{notice.regionTodo}</p>}
        </section>
      ))}
      <section className="card" id="contact">
        <h2 className="section-title">Contact</h2>
        <p style={{ marginBottom: 8 }}>{privacyController.legalName}, handelend onder de naam {privacyController.tradeName}</p>
        <p style={{ margin: 0 }}>{privacyController.place}</p>
        <p style={{ margin: 0 }}>KvK {privacyController.kvk}</p>
        <p style={{ marginTop: 0 }}>btw {privacyController.btw}</p>
        <p style={{ marginBottom: 0 }}>{notice.emailLabel}: <a href={`mailto:${PRIVACY_CONTACT_EMAIL}`}>{PRIVACY_CONTACT_EMAIL}</a></p>
        <p className="footer-note">Ingelogd verwijder je het account zelf via Profiel. Zonder account gebruik je de pagina <Link href="/account-verwijderen" style={{ color: "var(--green)", fontWeight: 700 }}>Account verwijderen</Link>.</p>
      </section>
      <p className="footer-note"><Link href="/">Terug naar de startpagina</Link></p>
    </main>
  );
}
