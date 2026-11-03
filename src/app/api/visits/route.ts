import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const visitSchema = z.object({ visitorId: z.string().uuid(), sessionId: z.string().uuid() });

export async function POST(request: Request) {
  try {
    const parsed = visitSchema.safeParse(await request.json());
    if (!parsed.success) return new Response(null, { status: 400 });
    const supabase = await createClient();
    const { error } = await supabase.rpc("record_app_visit", {
      visitor_id: parsed.data.visitorId,
      session_id: parsed.data.sessionId,
    });
    return new Response(null, { status: error ? 503 : 204 });
  } catch { return new Response(null, { status: 400 }); }
}
