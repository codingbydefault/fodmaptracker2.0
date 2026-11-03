import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const eventSchema = z.object({
  eventType: z.enum(["client_error", "route_error"]),
  path: z.string().trim().min(1).max(240),
  errorCode: z.string().trim().max(120).optional(),
});

export async function POST(request: Request) {
  try {
    const payload = eventSchema.safeParse(await request.json());
    if (!payload.success) return Response.json({ error: "Ongeldige monitoringgegevens." }, { status: 400 });

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return Response.json({ error: "Niet aangemeld." }, { status: 401 });

    const { error } = await supabase.from("app_monitoring_events").insert({
      user_id: user.id,
      event_type: payload.data.eventType,
      path: payload.data.path,
      error_code: payload.data.errorCode || null,
    });
    if (error) return Response.json({ error: "Monitoring is niet beschikbaar." }, { status: 503 });

    return new Response(null, { status: 204 });
  } catch {
    return Response.json({ error: "Monitoring is niet beschikbaar." }, { status: 503 });
  }
}
