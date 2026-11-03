import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT:${url}`);
  },
}));
vi.mock("@/lib/image-processing", () => ({ optimizeUploadedImage: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
vi.mock("@/lib/data", () => ({ requireUser: vi.fn() }));

import { requireUser } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { addFoodEntry, addSymptomEntry, addWeeklyMenuEntry, deleteFoodEntry, deleteRecipe, deleteWeeklyMenuEntry, updateFoodEntry, updatePassword, updateRecipe, updateSymptomEntry } from "@/lib/actions";
import { recordReintroductionDay } from "@/lib/reintroduction-actions";

const userId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const otherUserId = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const rowId = "11111111-1111-4111-8111-111111111111";

type Op = { method: string; args: unknown[] };
type Result = { data: unknown; error: { message: string } | null };

function createSupabase(resolveFor: (table: string, ops: Op[]) => Result) {
  const log: Array<Op & { table: string }> = [];
  function from(table: string) {
    const ops: Op[] = [];
    const chain: Record<string, unknown> = {};
    const record = (method: string) => (...args: unknown[]) => {
      const op = { method, args };
      ops.push(op);
      log.push({ table, ...op });
      return chain;
    };
    for (const method of ["select", "insert", "update", "delete", "eq", "or", "upsert"]) chain[method] = record(method);
    chain.maybeSingle = () => Promise.resolve(resolveFor(table, ops));
    chain.single = () => Promise.resolve(resolveFor(table, ops));
    chain.then = (onFulfilled: (value: Result) => unknown, onRejected?: (reason: unknown) => unknown) => Promise.resolve(resolveFor(table, ops)).then(onFulfilled, onRejected);
    return chain;
  }
  return {
    log,
    from,
    storage: { from: () => ({ remove: async () => ({ error: null }), upload: async () => ({ error: null }) }) },
    auth: { getUser: vi.fn(), updateUser: vi.fn(), resetPasswordForEmail: vi.fn() },
  };
}

function userEqs(log: Array<Op & { table: string }>, table: string) {
  return log.filter(entry => entry.table === table && entry.method === "eq" && entry.args[0] === "user_id").map(entry => entry.args[1]);
}

async function redirectsTo(run: () => Promise<unknown>, url: string) {
  await expect(run()).rejects.toThrow(`REDIRECT:${url}`);
}

function foodForm() {
  const form = new FormData();
  form.set("id", rowId);
  form.set("user_id", otherUserId);
  form.set("food_name", "Havermout");
  form.set("meal_type", "ontbijt");
  form.set("portion_description", "1 kom");
  form.set("notes", "");
  form.set("eaten_at", "2026-10-30T08:30");
  return form;
}

function symptomForm(foodEntryId = "") {
  const form = new FormData();
  form.set("id", rowId);
  form.set("food_entry_id", foodEntryId);
  form.set("symptom_type", "buikpijn");
  form.set("custom_symptom", "");
  form.set("severity", "3");
  form.set("notes", "");
  form.set("experienced_at", "2026-10-30T09:00");
  return form;
}

function recipeForm() {
  const form = new FormData();
  form.set("id", rowId);
  form.set("title", "Soep");
  form.set("description", "");
  form.set("servings", "2");
  form.set("preparation_minutes", "20");
  form.set("ingredients", "water en zout");
  form.set("instructions", "even koken");
  form.set("visibility", "private");
  return form;
}

function menuForm(selection: string) {
  const form = new FormData();
  form.set("recipe_selection", selection);
  form.set("planned_for", "2026-10-30");
  form.set("meal_type", "avondeten");
  form.set("planned_servings", "4");
  return form;
}

describe("ownership checks in server actions", () => {
  let supabase: ReturnType<typeof createSupabase>;

  beforeEach(() => {
    supabase = createSupabase(() => ({ data: { id: rowId, photo_path: null }, error: null }));
    vi.mocked(requireUser).mockResolvedValue({ supabase, user: { id: userId } } as never);
    vi.mocked(createClient).mockResolvedValue(supabase as never);
  });

  it("stores a meal for the signed-in user and ignores a user id in the form", async () => {
    await redirectsTo(() => addFoodEntry(foodForm()), "/voeding?message=toegevoegd");
    const insert = supabase.log.find(entry => entry.table === "food_entries" && entry.method === "insert");
    expect(insert?.args[0]).toMatchObject({ user_id: userId, food_name: "Havermout" });
    expect(insert?.args[0]).not.toMatchObject({ user_id: otherUserId });
  });

  it("refuses to update a meal the signed-in user does not own", async () => {
    supabase = createSupabase(() => ({ data: null, error: null }));
    vi.mocked(requireUser).mockResolvedValue({ supabase, user: { id: userId } } as never);
    await redirectsTo(() => updateFoodEntry(foodForm()), "/voeding?error=onbekend");
    expect(userEqs(supabase.log, "food_entries")).toEqual([userId]);
    expect(supabase.log.some(entry => entry.method === "update")).toBe(false);
  });

  it("limits a meal update and delete to the signed-in user", async () => {
    await redirectsTo(() => updateFoodEntry(foodForm()), "/voeding?message=bijgewerkt");
    await redirectsTo(() => deleteFoodEntry(foodForm()), "/voeding?message=verwijderd");
    expect(userEqs(supabase.log, "food_entries")).toEqual([userId, userId, userId, userId]);
    const update = supabase.log.find(entry => entry.method === "update");
    expect(update?.args[0]).not.toHaveProperty("user_id");
  });

  it("refuses a symptom linked to someone else's meal and does not insert it", async () => {
    supabase = createSupabase(() => ({ data: null, error: null }));
    vi.mocked(requireUser).mockResolvedValue({ supabase, user: { id: userId } } as never);
    await redirectsTo(() => addSymptomEntry(symptomForm(rowId)), "/klachten?error=invoer");
    expect(userEqs(supabase.log, "food_entries")).toEqual([userId]);
    expect(supabase.log.some(entry => entry.table === "symptom_entries")).toBe(false);
  });

  it("stores a symptom for the signed-in user when the linked meal is theirs", async () => {
    await redirectsTo(() => addSymptomEntry(symptomForm(rowId)), "/klachten?message=toegevoegd");
    const insert = supabase.log.find(entry => entry.table === "symptom_entries" && entry.method === "insert");
    expect(insert?.args[0]).toMatchObject({ user_id: userId, food_entry_id: rowId });
  });

  it("records a reintroduction day only for an active challenge owned by the signed-in user", async () => {
    const form = new FormData();
    form.set("challenge_id", rowId);
    form.set("challenge_day", "1");
    form.set("portion_note", "Afgesproken startportie");
    form.set("symptom_severity", "2");
    form.set("symptom_note", "Lichte buikdruk");
    await redirectsTo(() => recordReintroductionDay(form), "/herintroductie?message=dag-opgeslagen");
    expect(userEqs(supabase.log, "reintroduction_challenges")).toEqual([userId]);
    const upsert = supabase.log.find(entry => entry.table === "reintroduction_logs" && entry.method === "upsert");
    expect(upsert?.args[0]).toMatchObject({ user_id: userId, challenge_id: rowId, challenge_day: 1 });
  });

  it("does not record a day for a challenge the signed-in user cannot access", async () => {
    supabase = createSupabase(table => table === "reintroduction_challenges" ? { data: null, error: null } : { data: {}, error: null });
    vi.mocked(requireUser).mockResolvedValue({ supabase, user: { id: userId } } as never);
    const form = new FormData();
    form.set("challenge_id", rowId); form.set("challenge_day", "1"); form.set("portion_note", "Startportie"); form.set("symptom_severity", "2"); form.set("symptom_note", "");
    await redirectsTo(() => recordReintroductionDay(form), "/herintroductie?error=onbekend");
    expect(supabase.log.some(entry => entry.table === "reintroduction_logs")).toBe(false);
  });

  it("rejects an unowned meal when editing a symptom", async () => {
    supabase = createSupabase(table => table === "food_entries" ? { data: null, error: null } : { data: { id: rowId }, error: null });
    vi.mocked(requireUser).mockResolvedValue({ supabase, user: { id: userId } } as never);
    await redirectsTo(() => updateSymptomEntry(symptomForm(rowId)), `/klachten/${rowId}/bewerken?error=invoer`);
    expect(supabase.log.some(entry => entry.table === "symptom_entries" && entry.method === "update")).toBe(false);
  });

  it("updates and deletes a recipe only for the signed-in user", async () => {
    await redirectsTo(() => updateRecipe(recipeForm()), `/recepten/${rowId}?message=bijgewerkt`);
    await redirectsTo(() => deleteRecipe(recipeForm()), "/recepten?message=verwijderd");
    expect(userEqs(supabase.log, "recipes")).toEqual([userId, userId]);
    const update = supabase.log.find(entry => entry.table === "recipes" && entry.method === "update");
    expect(update?.args[0]).not.toHaveProperty("user_id");
  });

  it("plans a user recipe only when the query can see it as own or public", async () => {
    supabase = createSupabase(() => ({ data: null, error: null }));
    vi.mocked(requireUser).mockResolvedValue({ supabase, user: { id: userId } } as never);
    await redirectsTo(() => addWeeklyMenuEntry(menuForm(`user:${rowId}`)), "/weekmenu?error=onbekend");
    const visibility = supabase.log.find(entry => entry.table === "recipes" && entry.method === "or");
    expect(visibility?.args[0]).toBe(`user_id.eq.${userId},is_public.eq.true`);
    expect(supabase.log.some(entry => entry.table === "weekly_menu_entries")).toBe(false);
  });

  it("plans a curated recipe only when it is published, for the signed-in user", async () => {
    await redirectsTo(() => addWeeklyMenuEntry(menuForm(`curated:${rowId}`)), "/weekmenu?week=2026-10-30&message=gepland");
    expect(supabase.log.some(entry => entry.table === "curated_recipes" && entry.method === "eq" && entry.args[0] === "published" && entry.args[1] === true)).toBe(true);
    const upsert = supabase.log.find(entry => entry.table === "weekly_menu_entries" && entry.method === "upsert");
    expect(upsert?.args[0]).toMatchObject({ user_id: userId, curated_recipe_id: rowId, recipe_id: null, planned_servings: 4 });
  });

  it("deletes a week-menu row only for the signed-in user", async () => {
    const form = new FormData();
    form.set("id", rowId);
    await redirectsTo(() => deleteWeeklyMenuEntry(form), "/weekmenu?message=verwijderd");
    expect(userEqs(supabase.log, "weekly_menu_entries")).toEqual([userId]);
  });

  it("refuses a password change without a recovery session", async () => {
    supabase.auth.getUser.mockResolvedValue({ data: { user: null } });
    const form = new FormData();
    form.set("password", "nieuw-wachtwoord");
    await redirectsTo(() => updatePassword(form), "/wachtwoord-vergeten?error=sessie");
    expect(supabase.auth.updateUser).not.toHaveBeenCalled();
  });
});
