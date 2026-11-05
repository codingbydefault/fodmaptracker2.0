import { PRIVACY_NOTICE_VERSION } from "@/lib/privacy";

export type AccountRow = Record<string, unknown>;

export type AccountExport = {
  exported_at: string;
  privacy_notice_version: string;
  account: { id: string; email: string | null };
  profile: AccountRow | null;
  food_entries: AccountRow[];
  symptom_entries: AccountRow[];
  recipes: AccountRow[];
  weekly_menu_entries: AccountRow[];
  diet_phases: AccountRow[];
  reintroduction_challenges: AccountRow[];
  reintroduction_logs: AccountRow[];
  fodmap_tolerance_profile: AccountRow[];
  recipe_likes: AccountRow[];
  product_catalog_contributions: AccountRow[];
  product_scan_evidence: AccountRow[];
  dietitian_profile: AccountRow | null;
  care_links: AccountRow[];
  care_plans: AccountRow[];
  care_notes: AccountRow[];
  photos: { bucket: string; path: string }[];
};

type QueryResult = { data: AccountRow[] | AccountRow | null; error: { message: string } | null };
type ListResult = { data: { name: string }[] | null; error: { message: string } | null };

export type AccountDataClient = {
  from: (table: string) => {
    select: (columns: string) => {
      eq: (column: string, value: string) => Promise<QueryResult>;
    };
  };
  storage: {
    from: (bucket: string) => {
      list: (folder: string) => Promise<ListResult>;
      remove?: (paths: string[]) => Promise<{ error: { message: string } | null }>;
    };
  };
};

const photoBuckets = ["meal-photos", "profile-photos", "label-photos"] as const;

const selects = {
  profiles: "id,display_name,username,avatar_path,preferred_language,account_type,timezone,health_data_consent_at,privacy_notice_version,created_at,updated_at",
  food_entries: "id,user_id,food_name,meal_type,portion_description,notes,photo_path,eaten_at,created_at",
  symptom_entries: "id,user_id,food_entry_id,symptom_type,custom_symptom,severity,notes,experienced_at,created_at",
  recipes: "id,user_id,title,description,servings,preparation_minutes,ingredients,instructions,is_public,created_at,updated_at",
  weekly_menu_entries: "id,user_id,recipe_id,curated_recipe_id,planned_for,meal_type,planned_servings,created_at",
  diet_phases: "id,user_id,phase_type,status,started_at,planned_end_at,ended_at,created_at",
  reintroduction_challenges: "id,user_id,fodmap_group,test_food,status,started_on,completed_on,result,created_at",
  reintroduction_logs: "id,challenge_id,user_id,challenge_day,portion_note,symptom_severity,symptom_note,tested_at,created_at",
  fodmap_tolerance_profile: "user_id,fodmap_group,result,test_food,max_severity,tested_on,updated_at",
  recipe_likes: "user_id,curated_recipe_id,created_at",
  product_catalog: "id,barcode,country_code,ingredients_text,source,created_by,created_at,updated_at",
  product_scan_evidence: "id,product_id,user_id,photo_path,created_at",
  dietitian_profiles: "user_id,professional_name,registration_number,verification_status,verified_at,created_at,updated_at",
  patient_dietitian_links: "id,dietitian_id,patient_id,status,share_food,share_symptoms,share_phases,share_products,invited_at,accepted_at,revoked_at",
  care_plans: "id,link_id,dietitian_id,patient_id,title,goals,status,created_at,updated_at",
  care_notes: "id,link_id,dietitian_id,patient_id,note,shared_with_patient,created_at",
} as const;

type OwnershipField = "user_id" | "id" | "created_by" | "patient_id" | "dietitian_id";

export function onlyOwnedRows(rows: AccountRow[] | null | undefined, userId: string, field: OwnershipField): AccountRow[] {
  return (rows ?? []).filter(row => row[field] === userId);
}

function asRows(data: QueryResult["data"]): AccountRow[] {
  if (!data) return [];
  return Array.isArray(data) ? data : [data];
}

async function ownedTable(supabase: AccountDataClient, table: keyof typeof selects, userId: string, field: OwnershipField): Promise<AccountRow[]> {
  const { data, error } = await supabase.from(table).select(selects[table]).eq(field, userId);
  if (error) throw new Error(error.message);
  return onlyOwnedRows(asRows(data), userId, field);
}

export function safeStorageName(name: string): boolean {
  return name.length > 0 && !name.includes("/") && !name.includes("\\") && !name.includes("..") && name !== ".emptyFolderPlaceholder";
}

export async function listOwnPhotoPaths(supabase: AccountDataClient, userId: string): Promise<{ bucket: string; path: string }[]> {
  const photos: { bucket: string; path: string }[] = [];
  for (const bucket of photoBuckets) {
    const { data, error } = await supabase.storage.from(bucket).list(userId);
    if (error) throw new Error(error.message);
    for (const file of data ?? []) {
      if (!safeStorageName(file.name)) continue;
      photos.push({ bucket, path: `${userId}/${file.name}` });
    }
  }
  return photos;
}

export async function removeOwnStorage(supabase: AccountDataClient, userId: string) {
  const photos = await listOwnPhotoPaths(supabase, userId);
  for (const bucket of photoBuckets) {
    const paths = photos.filter(photo => photo.bucket === bucket).map(photo => photo.path);
    if (paths.length === 0) continue;
    const storage = supabase.storage.from(bucket);
    if (!storage.remove) throw new Error("storage-remove-missing");
    const { error } = await storage.remove(paths);
    if (error) throw new Error(error.message);
  }
}

export async function loadOwnAccountData(supabase: AccountDataClient, user: { id: string; email?: string | null }, exportedAt = new Date().toISOString()): Promise<AccountExport> {
  const [profileRows, foodEntries, symptomEntries, recipes, weeklyMenu, dietPhases, challenges, challengeLogs, toleranceProfile, likes, catalogContributions, scanEvidence, dietitianProfile, patientLinks, dietitianLinks, patientPlans, dietitianPlans, patientNotes, dietitianNotes, photos] = await Promise.all([
    ownedTable(supabase, "profiles", user.id, "id"),
    ownedTable(supabase, "food_entries", user.id, "user_id"),
    ownedTable(supabase, "symptom_entries", user.id, "user_id"),
    ownedTable(supabase, "recipes", user.id, "user_id"),
    ownedTable(supabase, "weekly_menu_entries", user.id, "user_id"),
    ownedTable(supabase, "diet_phases", user.id, "user_id"),
    ownedTable(supabase, "reintroduction_challenges", user.id, "user_id"),
    ownedTable(supabase, "reintroduction_logs", user.id, "user_id"),
    ownedTable(supabase, "fodmap_tolerance_profile", user.id, "user_id"),
    ownedTable(supabase, "recipe_likes", user.id, "user_id"),
    ownedTable(supabase, "product_catalog", user.id, "created_by"),
    ownedTable(supabase, "product_scan_evidence", user.id, "user_id"),
    ownedTable(supabase, "dietitian_profiles", user.id, "user_id"),
    ownedTable(supabase, "patient_dietitian_links", user.id, "patient_id"),
    ownedTable(supabase, "patient_dietitian_links", user.id, "dietitian_id"),
    ownedTable(supabase, "care_plans", user.id, "patient_id"),
    ownedTable(supabase, "care_plans", user.id, "dietitian_id"),
    ownedTable(supabase, "care_notes", user.id, "patient_id"),
    ownedTable(supabase, "care_notes", user.id, "dietitian_id"),
    listOwnPhotoPaths(supabase, user.id),
  ]);

  const uniqueRows = (rows: AccountRow[]) => [...new Map(rows.map(row => [String(row.id), row])).values()];

  return {
    exported_at: exportedAt,
    privacy_notice_version: PRIVACY_NOTICE_VERSION,
    account: { id: user.id, email: user.email ?? null },
    profile: profileRows[0] ?? null,
    food_entries: foodEntries,
    symptom_entries: symptomEntries,
    recipes,
    weekly_menu_entries: weeklyMenu,
    diet_phases: dietPhases,
    reintroduction_challenges: challenges,
    reintroduction_logs: challengeLogs,
    fodmap_tolerance_profile: toleranceProfile,
    recipe_likes: likes,
    product_catalog_contributions: catalogContributions,
    product_scan_evidence: scanEvidence,
    dietitian_profile: dietitianProfile[0] ?? null,
    care_links: uniqueRows([...patientLinks, ...dietitianLinks]),
    care_plans: uniqueRows([...patientPlans, ...dietitianPlans]),
    care_notes: uniqueRows([...patientNotes, ...dietitianNotes]),
    photos,
  };
}

function csvCell(value: unknown): string {
  if (value == null) return "";
  const text = String(value);
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

export function toCsv(rows: AccountRow[], columns: string[]): string {
  const lines = [columns.join(",")];
  for (const row of rows) lines.push(columns.map(column => csvCell(row[column])).join(","));
  return `${lines.join("\r\n")}\r\n`;
}

export const mealCsvColumns = ["id", "eaten_at", "meal_type", "food_name", "portion_description", "notes", "photo_path", "created_at"];
export const symptomCsvColumns = ["id", "experienced_at", "symptom_type", "custom_symptom", "severity", "notes", "food_entry_id", "created_at"];

export function mealsToCsv(rows: AccountRow[]) {
  return toCsv(rows, mealCsvColumns);
}

export function symptomsToCsv(rows: AccountRow[]) {
  return toCsv(rows, symptomCsvColumns);
}
