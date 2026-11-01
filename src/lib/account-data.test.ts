import { describe, expect, it } from "vitest";
import { listOwnPhotoPaths, loadOwnAccountData, mealsToCsv, onlyOwnedRows, removeOwnStorage, safeStorageName, symptomsToCsv, type AccountDataClient, type AccountRow } from "@/lib/account-data";
import { PRIVACY_CONTACT_EMAIL, PRIVACY_NOTICE_VERSION, privacyController, privacyNotice } from "@/lib/privacy";

const userId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const otherUserId = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";

type Op = { table: string; method: string; args: unknown[] };

function exportClient(rows: Record<string, AccountRow[]>): { client: AccountDataClient; log: Op[]; removed: Record<string, string[]> } {
  const log: Op[] = [];
  const removed: Record<string, string[]> = {};
  const client: AccountDataClient = {
    from(table) {
      return {
        select(columns) {
          log.push({ table, method: "select", args: [columns] });
          return {
            eq(column, value) {
              log.push({ table, method: "eq", args: [column, value] });
              return Promise.resolve({ data: rows[table] ?? [], error: null });
            },
          };
        },
      };
    },
    storage: {
      from(bucket) {
        return {
          list(folder) {
            log.push({ table: bucket, method: "list", args: [folder] });
            const files = bucket === "meal-photos"
              ? [{ name: "mine.webp" }, { name: "../secret.webp" }, { name: ".emptyFolderPlaceholder" }]
              : bucket === "label-photos" ? [{ name: "label.webp" }] : [{ name: "avatar.webp" }];
            return Promise.resolve({ data: files, error: null });
          },
          remove(paths) {
            removed[bucket] = paths;
            return Promise.resolve({ error: null });
          },
        };
      },
    },
  };
  return { client, log, removed };
}

describe("export ownership", () => {
  it("queries and returns only the signed-in user's rows", async () => {
    const { client, log } = exportClient({
      profiles: [{ id: userId, display_name: "Sam" }, { id: otherUserId, display_name: "Other" }],
      food_entries: [
        { id: "1", user_id: userId, food_name: "Havermout" },
        { id: "2", user_id: otherUserId, food_name: "Andermans maaltijd" },
      ],
      symptom_entries: [{ id: "3", user_id: userId, symptom_type: "buikpijn" }],
    });
    const data = await loadOwnAccountData(client, { id: userId, email: "sam@example.com" }, "2026-10-30T12:00:00.000Z");
    expect(data.account).toEqual({ id: userId, email: "sam@example.com" });
    expect(data.profile).toMatchObject({ id: userId });
    expect(data.food_entries.map(row => row.food_name)).toEqual(["Havermout"]);
    expect(data.symptom_entries).toHaveLength(1);
    expect(JSON.stringify(data)).not.toContain(otherUserId);
    expect(JSON.stringify(data)).not.toContain("Andermans maaltijd");
    for (const table of ["profiles", "food_entries", "symptom_entries", "recipes", "weekly_menu_entries", "diet_phases", "recipe_likes", "product_catalog", "product_scan_evidence"]) {
      const filter = log.find(entry => entry.table === table && entry.method === "eq");
      expect(filter?.args[1]).toBe(userId);
      expect(filter?.args[1]).not.toBe(otherUserId);
    }
    expect(log.find(entry => entry.table === "profiles" && entry.method === "eq")?.args[0]).toBe("id");
    expect(log.find(entry => entry.table === "food_entries" && entry.method === "eq")?.args[0]).toBe("user_id");
  });

  it("lists only files inside the user's own storage folder", async () => {
    const { client, removed } = exportClient({});
    const photos = await listOwnPhotoPaths(client, userId);
    expect(photos).toEqual([
      { bucket: "meal-photos", path: `${userId}/mine.webp` },
      { bucket: "profile-photos", path: `${userId}/avatar.webp` },
      { bucket: "label-photos", path: `${userId}/label.webp` },
    ]);
    await removeOwnStorage(client, userId);
    expect(removed["meal-photos"]).toEqual([`${userId}/mine.webp`]);
    expect(removed["profile-photos"]).toEqual([`${userId}/avatar.webp`]);
    expect(removed["label-photos"]).toEqual([`${userId}/label.webp`]);
    expect(safeStorageName("../secret.webp")).toBe(false);
  });

  it("drops rows that do not belong to the user even if a query returned them", () => {
    expect(onlyOwnedRows([{ user_id: userId }, { user_id: otherUserId }], userId, "user_id")).toEqual([{ user_id: userId }]);
  });
});

describe("csv export", () => {
  it("writes meal and symptom columns and escapes quotes", () => {
    const meals = mealsToCsv([{ id: "1", eaten_at: "2026-10-30T08:00:00Z", meal_type: "ontbijt", food_name: 'Haver, "groot"', portion_description: null, notes: "regel\ntwee", photo_path: null, created_at: "2026-10-30T08:00:00Z" }]);
    expect(meals.split("\r\n")[0]).toBe("id,eaten_at,meal_type,food_name,portion_description,notes,photo_path,created_at");
    expect(meals).toContain('"Haver, ""groot"""');
    expect(meals).toContain('"regel\ntwee"');
    const symptoms = symptomsToCsv([{ id: "3", experienced_at: "2026-10-30T09:00:00Z", symptom_type: "buikpijn", custom_symptom: null, severity: 4, notes: "", food_entry_id: "1", created_at: "2026-10-30T09:00:00Z" }]);
    expect(symptoms).toContain("buikpijn");
    expect(symptoms.split("\r\n")[1]?.split(",")).toContain("4");
  });
});

describe("privacy notice draft", () => {
  it("names the controller in Hulst, uses the contact address, and leaves the hosting region open", () => {
    const notice = privacyNotice("nl");
    const text = JSON.stringify(notice);
    expect(text).toContain(privacyController.legalName);
    expect(text).toContain(privacyController.place);
    expect(text).toContain("Hulst, Zeeland (Nederland)");
    expect(text).toContain(privacyController.kvk);
    expect(text).toContain(privacyController.btw);
    expect(text).not.toContain("privacy@example.com");
    expect(PRIVACY_CONTACT_EMAIL).toBe("codedbydefault@gmail.com");
    expect(notice.regionTodo).toContain("TODO");
    expect(notice.draft.toLowerCase()).toContain("concept");
    expect(PRIVACY_NOTICE_VERSION).toBe("2026-11-01");
  });
});
