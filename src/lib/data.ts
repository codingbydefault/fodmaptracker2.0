import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type {
  CuratedRecipe,
  DietPhase,
  FoodEntry,
  FoodGuideItem,
  FodmapGroup,
  FoodGuideStatus,
  Profile,
  Recipe,
  SymptomEntry,
  WeeklyMenuEntry,
} from "@/lib/types";
export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) redirect("/login");
  return { supabase, user };
}
async function withSignedPhotos(
  supabase: Awaited<ReturnType<typeof createClient>>,
  entries: FoodEntry[],
) {
  return Promise.all(
    entries.map(async (entry) => {
      if (!entry.photo_path) return entry;
      const { data } = await supabase.storage
        .from("meal-photos")
        .createSignedUrl(entry.photo_path, 3600);
      return { ...entry, photo_url: data?.signedUrl ?? null };
    }),
  );
}
export async function getFoodEntries(limit = 50): Promise<FoodEntry[]> {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("food_entries")
    .select(
      "id,user_id,food_name,meal_type,portion_description,notes,photo_path,reintroduction_challenge_id,reintroduction_group,reintroduction_test_food,eaten_at,created_at",
    )
    .eq("user_id", user.id)
    .order("eaten_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error("Het voedingsdagboek kon niet worden geladen.");
  return withSignedPhotos(supabase, (data ?? []) as FoodEntry[]);
}
export async function getFoodEntry(id: string): Promise<FoodEntry | null> {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("food_entries")
    .select(
      "id,user_id,food_name,meal_type,portion_description,notes,photo_path,reintroduction_challenge_id,reintroduction_group,reintroduction_test_food,eaten_at,created_at",
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) throw new Error("De maaltijd kon niet worden geladen.");
  return data
    ? (await withSignedPhotos(supabase, [data as FoodEntry]))[0]
    : null;
}
export async function getSymptomEntries(limit = 50): Promise<SymptomEntry[]> {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("symptom_entries")
    .select(
      "id,user_id,food_entry_id,symptom_type,custom_symptom,severity,notes,experienced_at,created_at,food_entry:food_entries(id,food_name)",
    )
    .eq("user_id", user.id)
    .order("experienced_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error("Het symptoomdagboek kon niet worden geladen.");
  return (data ?? []) as unknown as SymptomEntry[];
}
export async function getSymptomEntry(
  id: string,
): Promise<SymptomEntry | null> {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("symptom_entries")
    .select(
      "id,user_id,food_entry_id,symptom_type,custom_symptom,severity,notes,experienced_at,created_at,food_entry:food_entries(id,food_name)",
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) throw new Error("De klacht kon niet worden geladen.");
  return data as unknown as SymptomEntry | null;
}
export async function getRecipes(search = ""): Promise<Recipe[]> {
  const { supabase, user } = await requireUser();
  let query = supabase
    .from("recipes")
    .select(
      "id,user_id,title,description,servings,preparation_minutes,ingredients,instructions,is_public,created_at,updated_at",
    )
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });
  if (search.trim()) query = query.ilike("title", `%${search.trim()}%`);
  const { data, error } = await query.limit(100);
  if (error) throw new Error("De recepten konden niet worden geladen.");
  return (data ?? []) as Recipe[];
}
export async function getPublicRecipes(search = ""): Promise<Recipe[]> {
  const { supabase, user } = await requireUser();
  let query = supabase
    .from("recipes")
    .select(
      "id,user_id,title,description,servings,preparation_minutes,ingredients,instructions,is_public,created_at,updated_at,profiles!recipes_profile_fk(username)",
    )
    .eq("is_public", true)
    .neq("user_id", user.id)
    .order("updated_at", { ascending: false });
  if (search.trim()) query = query.ilike("title", `%${search.trim()}%`);
  const { data, error } = await query.limit(100);
  if (error)
    throw new Error("De gedeelde recepten konden niet worden geladen.");
  return (data ?? []).map((row) => {
    const profile = Array.isArray(row.profiles)
      ? row.profiles[0]
      : row.profiles;
    return {
      ...row,
      author_username:
        (profile as { username?: string | null } | null)?.username ?? null,
      profiles: undefined,
    };
  }) as Recipe[];
}
export async function getRecipe(id: string): Promise<Recipe | null> {
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("recipes")
    .select(
      "id,user_id,title,description,servings,preparation_minutes,ingredients,instructions,is_public,created_at,updated_at",
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error("Het recept kon niet worden geladen.");
  return data as Recipe | null;
}
export async function getWeeklyMenu(
  start: string,
  end: string,
): Promise<WeeklyMenuEntry[]> {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("weekly_menu_entries")
    .select(
      "id,user_id,recipe_id,curated_recipe_id,planned_for,meal_type,planned_servings,created_at,recipe:recipes(id,title,servings,preparation_minutes,ingredients),curated_recipe:curated_recipes(id,title,servings,preparation_minutes,ingredients)",
    )
    .eq("user_id", user.id)
    .gte("planned_for", start)
    .lte("planned_for", end)
    .order("planned_for")
    .order("meal_type");
  if (error) throw new Error("Het weekmenu kon niet worden geladen.");
  return (data ?? []) as unknown as WeeklyMenuEntry[];
}

export async function getProfile(): Promise<Profile> {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id,display_name,username,avatar_path,preferred_language,account_type,timezone,avoided_fodmap_groups,health_data_consent_at,privacy_notice_version,created_at,updated_at",
    )
    .eq("id", user.id)
    .single();
  if (error) throw new Error("Het profiel kon niet worden geladen.");
  const profile = data as Profile;
  if (!profile.avatar_path) return profile;
  const { data: signed } = await supabase.storage
    .from("profile-photos")
    .createSignedUrl(profile.avatar_path, 3600);
  return { ...profile, avatar_url: signed?.signedUrl ?? null };
}

export async function getFoodGuide(
  search = "",
  group = "",
  status = "",
): Promise<FoodGuideItem[]> {
  const { supabase } = await requireUser();
  let query = supabase
    .from("food_catalog")
    .select(
      "id,name,name_normalized,category,source_name,source_reference,source_url,verification_status,guidance_status,fodmap_groups,portion_guidance,product_note,reviewed_on",
    )
    .in("verification_status", ["reviewed", "verified"])
    .order("name");
  if (search.trim())
    query = query.ilike("name", `%${search.trim().slice(0, 80)}%`);
  if (group) query = query.contains("fodmap_groups", [group as FodmapGroup]);
  if (status) query = query.eq("guidance_status", status as FoodGuideStatus);
  const { data, error } = await query.limit(100);
  if (error) throw new Error("De voedingswijzer kon niet worden geladen.");
  return (data ?? []) as FoodGuideItem[];
}

export async function getActiveDietPhase(): Promise<DietPhase | null> {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("diet_phases")
    .select(
      "id,user_id,phase_type,status,started_at,planned_end_at,ended_at,created_at",
    )
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();
  if (error) throw new Error("De dieetfase kon niet worden geladen.");
  return data as DietPhase | null;
}

export interface DietJourneySummary {
  hasEliminationHistory: boolean;
  activeChallenge: { id: string; test_food: string } | null;
  activeChallengeDays: number;
  toleranceCount: number;
}

export async function getDietJourneySummary(): Promise<DietJourneySummary> {
  const { supabase, user } = await requireUser();
  const [elimination, challenge, tolerance] = await Promise.all([
    supabase
      .from("diet_phases")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("phase_type", "elimination"),
    supabase
      .from("reintroduction_challenges")
      .select("id,test_food")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle(),
    supabase
      .from("fodmap_tolerance_profile")
      .select("fodmap_group", { count: "exact", head: true })
      .eq("user_id", user.id),
  ]);
  if (elimination.error || challenge.error || tolerance.error)
    throw new Error("De fasebegeleiding kon niet worden geladen.");
  let activeChallengeDays = 0;
  if (challenge.data) {
    const { count, error } = await supabase
      .from("reintroduction_logs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("challenge_id", challenge.data.id);
    if (error) throw new Error("De fasebegeleiding kon niet worden geladen.");
    activeChallengeDays = count ?? 0;
  }
  return {
    hasEliminationHistory: (elimination.count ?? 0) > 0,
    activeChallenge: challenge.data,
    activeChallengeDays,
    toleranceCount: tolerance.count ?? 0,
  };
}

export async function getCuratedRecipes(): Promise<CuratedRecipe[]> {
  const { supabase, user } = await requireUser();
  const [{ data: recipes, error }, { data: likes }] = await Promise.all([
    supabase
      .from("curated_recipes")
      .select(
        "id,title,summary,category,source_name,source_url,suitable_for_elimination,servings,preparation_minutes,ingredients,instructions,attribution_note,phase_note,recipe_role,reintroduction_group",
      )
      .eq("published", true)
      .order("title"),
    supabase
      .from("recipe_likes")
      .select("curated_recipe_id")
      .eq("user_id", user.id),
  ]);
  if (error)
    throw new Error("De voorgestelde recepten konden niet worden geladen.");
  const liked = new Set(
    (likes ?? []).map((x) => x.curated_recipe_id as string),
  );
  return (recipes ?? []).map((recipe) => ({
    ...recipe,
    liked: liked.has(recipe.id),
  })) as CuratedRecipe[];
}

export async function getCuratedRecipe(
  id: string,
): Promise<CuratedRecipe | null> {
  const recipes = await getCuratedRecipes();
  return recipes.find((recipe) => recipe.id === id) ?? null;
}
