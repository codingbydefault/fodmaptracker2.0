import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { PayloadTooLargeError, enforceRateLimit, readJsonBody, rejectCrossOrigin } from "@/lib/api-security";

const visitSchema = z.object({ visitorId: z.string().uuid(), sessionId: z.string().uuid() });

export async function POST(request: Request) {
  const originError = rejectCrossOrigin(request);
  if (originError) return originError;
  try {
    const rateError = await enforceRateLimit(request, "visits", 20, 60_000);
    if (rateError) return rateError;
    const parsed = visitSchema.safeParse(await readJsonBody(request, 2_048));
    if (!parsed.success) return new Response(null, { status: 400 });
    const supabase = await createClient();
    const { error } = await supabase.rpc("record_app_visit", {
      visitor_id: parsed.data.visitorId,
      session_id: parsed.data.sessionId,
    });
    return new Response(null, { status: error ? 503 : 204 });
  } catch (error) { return new Response(null, { status: error instanceof PayloadTooLargeError ? 413 : 400 }); }
}
