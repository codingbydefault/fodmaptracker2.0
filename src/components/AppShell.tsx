import Link from "next/link";
import { Brand } from "@/components/Brand";
import { SubmitButton } from "@/components/SubmitButton";
import { signOut } from "@/lib/actions";
import { requireUser } from "@/lib/data";
import { appLanguage, languageInfo, languages, shellText } from "@/lib/i18n";
import { updateLanguage } from "@/lib/profile-actions";
import { QuickAddMenu } from "@/components/QuickAddMenu";
export async function AppShell({ children, active, email }: {children: React.ReactNode;active:string;email:string}) {
 const {supabase}=await requireUser();const [{data:adminCheck},{data:profile}]=await Promise.all([supabase.rpc("is_app_admin"),supabase.from("profiles").select("preferred_language").single()]);const isAdmin=adminCheck===true;
 const language=appLanguage(profile?.preferred_language);const text=shellText[language];
 const links=[{href:"/dashboard",label:text.overview,key:"dashboard",icon:"◫"},{href:"/recepten",label:text.recipes,key:"recepten",icon:"◇"},{href:"/weekmenu",label:text.week,key:"weekmenu",icon:"▦"},{href:"/profiel",label:text.profile,key:"profiel",icon:"○"}];
 return <><div className="app-shell"><header className="topbar"><Brand/><div className="top-actions"><Link className="btn" href="/voeding">+ {text.meal}</Link><Link className="btn btn-secondary" href="/klachten">+ {text.symptom}</Link></div><div className="account-actions">{isAdmin&&<Link className={`btn admin-dashboard-button${active==="admin"?" active":""}`} href="/admin" aria-current={active==="admin"?"page":undefined}><span aria-hidden="true">▥</span> Dashboard</Link>}<details className="language-menu"><summary className="btn btn-secondary compact-btn" aria-label={text.language}>{languageInfo[language].flag}</summary><div className="language-options">{languages.map(code=><form action={updateLanguage} key={code}><input type="hidden" name="preferred_language" value={code}/><SubmitButton className={code===language?"active":""}>{languageInfo[code].flag} {languageInfo[code].label}</SubmitButton></form>)}</div></details><span className="subtle account-email">{email}</span><form action={signOut}><SubmitButton className="btn btn-secondary compact-btn">{text.logout}</SubmitButton></form></div></header>{children}<p className="footer-note">{text.footer} <Link href="/privacy">{text.privacy}</Link> · <Link href="/account-verwijderen">{text.deleteAccount}</Link></p></div><QuickAddMenu mealLabel={text.meal} symptomLabel={text.symptom}/><nav className="mobile-nav" aria-label={text.nav}>{links.map(x=><Link key={x.key} className={active===x.key?"active":""} href={x.href}><span className="nav-icon">{x.icon}</span>{x.label}</Link>)}</nav></>;
}
