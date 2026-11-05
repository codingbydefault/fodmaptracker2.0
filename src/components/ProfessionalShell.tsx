import Link from "next/link";
import { Brand } from "@/components/Brand";
import { SubmitButton } from "@/components/SubmitButton";
import { signOut } from "@/lib/actions";

export function ProfessionalShell({children,email}:{children:React.ReactNode;email:string}){
 return <><div className="app-shell"><header className="topbar"><Brand/><nav className="professional-nav"><Link href="/professional">Cliënten en profiel</Link></nav><div className="account-actions"><span className="subtle account-email">{email}</span><form action={signOut}><SubmitButton className="btn btn-secondary compact-btn">Uitloggen</SubmitButton></form></div></header>{children}<p className="footer-note">Fodmap-Tracker Professional ondersteunt begeleiding en stelt geen diagnose. Toegang wordt gelogd en is afhankelijk van toestemming.</p></div></>;
}
