import { NextResponse, type NextRequest } from "next/server";
import { safeNextPath } from "@/lib/redirect-path";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const requested = searchParams.get("next");
      if (!requested) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase.from("profiles").select("account_type").eq("id", user.id).maybeSingle();
          return NextResponse.redirect(new URL(profile?.account_type === "dietitian" ? "/professional" : "/dashboard", origin));
        }
      }
      return NextResponse.redirect(new URL(safeNextPath(requested), origin));
    }
  }
  return NextResponse.redirect(new URL("/login?error=auth", origin));
}
