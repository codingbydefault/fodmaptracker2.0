"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/data";

export async function resetVisitorStats(form: FormData) {
  if (String(form.get("reset_confirmation") ?? "") !== "RESET") redirect("/admin?error=reset");
  const { supabase } = await requireUser();
  const { data: isAdmin } = await supabase.rpc("is_app_admin");
  if (isAdmin !== true) redirect("/dashboard");
  const { error } = await supabase.rpc("reset_app_visitor_stats");
  if (error) redirect("/admin?error=reset");
  revalidatePath("/admin");
  redirect("/admin?message=reset");
}
