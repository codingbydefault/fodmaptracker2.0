import { NextResponse } from "next/server";
import { loadOwnAccountData, mealsToCsv, symptomsToCsv, type AccountDataClient } from "@/lib/account-data";
import { requireUser } from "@/lib/data";

export async function GET(request: Request) {
  const { supabase, user } = await requireUser();
  const format = new URL(request.url).searchParams.get("format");
  const data = await loadOwnAccountData(supabase as unknown as AccountDataClient, { id: user.id, email: user.email });
  const headers = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex" };

  if (format === "meals") {
    return new NextResponse(mealsToCsv(data.food_entries), {
      headers: { ...headers, "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "attachment; filename=\"fodmap-maaltijden.csv\"" },
    });
  }
  if (format === "symptoms") {
    return new NextResponse(symptomsToCsv(data.symptom_entries), {
      headers: { ...headers, "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "attachment; filename=\"fodmap-klachten.csv\"" },
    });
  }

  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: { ...headers, "Content-Type": "application/json; charset=utf-8", "Content-Disposition": "attachment; filename=\"fodmap-tracker-export.json\"" },
  });
}
