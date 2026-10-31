"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/data";
import { optimizeUploadedImage } from "@/lib/image-processing";
import { appLanguage } from "@/lib/i18n";
import { idSchema, profileSchema } from "@/lib/validation";
import { fodmapGroups } from "@/lib/fodmap-guide";

const field = (form: FormData, name: string) => String(form.get(name) ?? "");

async function uploadAvatar(
  form: FormData,
  userId: string,
  supabase: Awaited<ReturnType<typeof requireUser>>["supabase"],
) {
  const photo = form.get("avatar");
  if (!(photo instanceof File) || photo.size === 0) return null;
  const optimized = await optimizeUploadedImage(photo, 3 * 1024 * 1024);
  const path = `${userId}/${crypto.randomUUID()}.webp`;
  const { error } = await supabase.storage
    .from("profile-photos")
    .upload(path, optimized, { contentType: "image/webp", upsert: false });
  if (error) throw new Error("avatar-upload");
  return path;
}

export async function updateProfile(form: FormData) {
  const parsed = profileSchema.safeParse({
    display_name: field(form, "display_name"),
    username: field(form, "username"),
  });
  if (!parsed.success) redirect("/profiel?error=invoer");
  const { supabase, user } = await requireUser();
  const { data: current } = await supabase
    .from("profiles")
    .select("avatar_path")
    .eq("id", user.id)
    .single();
  let avatarPath = (current?.avatar_path as string | null) ?? null;
  let uploaded: string | null = null;
  try {
    uploaded = await uploadAvatar(form, user.id, supabase);
    if (uploaded) avatarPath = uploaded;
  } catch {
    redirect("/profiel?error=foto");
  }
  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: parsed.data.display_name || null,
      username: parsed.data.username,
      avatar_path: avatarPath,
      preferred_language: appLanguage(field(form, "preferred_language")),
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);
  if (error) {
    if (uploaded)
      await supabase.storage.from("profile-photos").remove([uploaded]);
    redirect(
      error.code === "23505"
        ? "/profiel?error=gebruikersnaam"
        : "/profiel?error=opslaan",
    );
  }
  if (uploaded && current?.avatar_path)
    await supabase.storage.from("profile-photos").remove([current.avatar_path]);
  revalidatePath("/profiel");
  redirect("/profiel?message=bijgewerkt");
}

export async function updateLanguage(form: FormData) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("profiles")
    .update({
      preferred_language: appLanguage(field(form, "preferred_language")),
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);
  if (error) redirect("/profiel?error=taal");
  revalidatePath("/", "layout");
}

export async function updateFodmapPreferences(form: FormData) {
  const selected = form
    .getAll("fodmap_group")
    .map(String)
    .filter((value) =>
      fodmapGroups.includes(value as (typeof fodmapGroups)[number]),
    );
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("profiles")
    .update({
      avoided_fodmap_groups: selected,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);
  if (error) redirect("/voedingswijzer?error=profiel");
  revalidatePath("/voedingswijzer");
  redirect("/voedingswijzer?message=voorkeuren");
}

export async function startEliminationPhase(form: FormData) {
  if (field(form, "safety_acknowledgement") !== "yes")
    redirect("/profiel?error=fase-veiligheid");
  const { supabase, user } = await requireUser();
  const today = new Date();
  const plannedEnd = new Date(today);
  plannedEnd.setDate(plannedEnd.getDate() + 27);
  const iso = (date: Date) =>
    date.toLocaleDateString("en-CA", { timeZone: "Europe/Amsterdam" });
  const { error: endError } = await supabase
    .from("diet_phases")
    .update({ status: "cancelled", ended_at: iso(today) })
    .eq("user_id", user.id)
    .eq("status", "active");
  if (endError) redirect("/profiel?error=fase");
  const { error } = await supabase
    .from("diet_phases")
    .insert({
      user_id: user.id,
      phase_type: "elimination",
      status: "active",
      started_at: iso(today),
      planned_end_at: iso(plannedEnd),
    });
  if (error) redirect("/profiel?error=fase");
  revalidatePath("/dashboard");
  revalidatePath("/profiel");
  redirect("/profiel?message=eliminatie-gestart");
}

export async function toggleRecipeLike(form: FormData) {
  const recipeId = idSchema.safeParse(field(form, "recipe_id"));
  const liked = field(form, "liked") === "true";
  if (!recipeId.success) redirect("/profiel?error=recept");
  const { supabase, user } = await requireUser();
  const query = supabase.from("recipe_likes");
  const { error } = liked
    ? await query
        .delete()
        .eq("user_id", user.id)
        .eq("curated_recipe_id", recipeId.data)
    : await query.insert({
        user_id: user.id,
        curated_recipe_id: recipeId.data,
      });
  if (error) redirect("/profiel?error=recept");
  revalidatePath("/profiel");
  redirect("/profiel#recepten");
}
