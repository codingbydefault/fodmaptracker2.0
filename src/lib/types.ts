export type MealType = "ontbijt" | "lunch" | "avondeten" | "tussendoor";
export type SymptomType =
  | "buikpijn"
  | "opgeblazen"
  | "winderigheid"
  | "stoelgang"
  | "misselijkheid"
  | "anders";
export type MenuMealType = "ontbijt" | "lunch" | "avondeten" | "tussendoor";
export interface FoodEntry {
  id: string;
  user_id: string;
  food_name: string;
  meal_type: MealType;
  portion_description: string | null;
  notes: string | null;
  photo_path: string | null;
  photo_url?: string | null;
  eaten_at: string;
  created_at: string;
}
export interface SymptomEntry {
  id: string;
  user_id: string;
  food_entry_id: string | null;
  symptom_type: SymptomType;
  custom_symptom: string | null;
  severity: number;
  notes: string | null;
  experienced_at: string;
  created_at: string;
  food_entry?: Pick<FoodEntry, "id" | "food_name"> | null;
}
export interface Recipe {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  servings: number;
  preparation_minutes: number | null;
  ingredients: string;
  instructions: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  author_username?: string | null;
}
export interface WeeklyMenuEntry {
  id: string;
  user_id: string;
  recipe_id: string | null;
  curated_recipe_id: string | null;
  planned_for: string;
  meal_type: MenuMealType;
  planned_servings: number | null;
  created_at: string;
  recipe: Pick<
    Recipe,
    "id" | "title" | "servings" | "preparation_minutes" | "ingredients"
  > | null;
  curated_recipe: Pick<
    CuratedRecipe,
    "id" | "title" | "servings" | "preparation_minutes" | "ingredients"
  > | null;
}
export interface Profile {
  id: string;
  display_name: string | null;
  username: string | null;
  avatar_path: string | null;
  avatar_url?: string | null;
  preferred_language: "nl" | "fr" | "de" | "en";
  timezone: string;
  avoided_fodmap_groups: FodmapGroup[];
  health_data_consent_at: string | null;
  privacy_notice_version: string | null;
  created_at: string;
  updated_at: string;
}
export interface DietPhase {
  id: string;
  user_id: string;
  phase_type: "elimination" | "reintroduction" | "maintenance";
  status: "active" | "completed" | "cancelled";
  started_at: string;
  planned_end_at: string | null;
  ended_at: string | null;
  created_at: string;
}
export interface CuratedRecipe {
  id: string;
  title: string;
  summary: string;
  category: MenuMealType;
  source_name: string;
  source_url: string;
  suitable_for_elimination: boolean;
  servings: number;
  preparation_minutes: number | null;
  ingredients: string;
  instructions: string;
  attribution_note: string;
  phase_note: string;
  liked: boolean;
}
export type FodmapGroup =
  "fructans" | "gos" | "lactose" | "fructose" | "sorbitol" | "mannitol";
export type FoodGuideStatus = "low" | "portion" | "avoid" | "unknown";
export interface FoodGuideItem {
  id: string;
  name: string;
  name_normalized: string;
  category: string | null;
  source_name: string;
  source_reference: string | null;
  source_url: string | null;
  verification_status: "reviewed" | "verified";
  guidance_status: FoodGuideStatus | null;
  fodmap_groups: FodmapGroup[];
  portion_guidance: string | null;
  product_note: string | null;
  reviewed_on: string | null;
}
export const mealNames: Record<MealType, string> = {
  ontbijt: "Ontbijt",
  lunch: "Lunch",
  avondeten: "Avondeten",
  tussendoor: "Tussendoor",
};
export const symptomNames: Record<SymptomType, string> = {
  buikpijn: "Buikpijn",
  opgeblazen: "Opgeblazen gevoel",
  winderigheid: "Winderigheid",
  stoelgang: "Veranderde stoelgang",
  misselijkheid: "Misselijkheid",
  anders: "Anders",
};
export const menuMealNames: Record<MenuMealType, string> = {
  ontbijt: "Ontbijt",
  lunch: "Lunch",
  avondeten: "Avondeten",
  tussendoor: "Tussendoor",
};
