const encoder = new TextEncoder();

type RateEntry = { count: number; resetAt: number };

export class FixedWindowRateLimiter {
  private readonly entries = new Map<string, RateEntry>();

  check(key: string, limit: number, windowMs: number, now = Date.now()) {
    const current = this.entries.get(key);
    if (!current || current.resetAt <= now) {
      const resetAt = now + windowMs;
      this.entries.set(key, { count: 1, resetAt });
      return { allowed: true, remaining: Math.max(0, limit - 1), resetAt };
    }

    current.count += 1;
    if (this.entries.size > 5_000) {
      for (const [entryKey, entry] of this.entries) {
        if (entry.resetAt <= now) this.entries.delete(entryKey);
      }
    }
    return {
      allowed: current.count <= limit,
      remaining: Math.max(0, limit - current.count),
      resetAt: current.resetAt,
    };
  }
}

const limiter = new FixedWindowRateLimiter();

export function isAllowedOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

export function rejectCrossOrigin(request: Request) {
  return isAllowedOrigin(request)
    ? null
    : Response.json({ error: "cross_origin_request_blocked" }, { status: 403, headers: { "Cache-Control": "no-store" } });
}

async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
}

export async function requestFingerprint(request: Request, subject?: string | null) {
  if (subject) return `user:${subject}`;
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const address = forwarded || request.headers.get("x-real-ip") || "unknown";
  return `network:${await sha256(address)}`;
}

export async function enforceRateLimit(
  request: Request,
  namespace: string,
  limit: number,
  windowMs: number,
  subject?: string | null,
) {
  const fingerprint = await requestFingerprint(request, subject);
  const result = limiter.check(`${namespace}:${fingerprint}`, limit, windowMs);
  if (result.allowed) return null;
  const retryAfter = Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1_000));
  return Response.json(
    { error: "rate_limit_exceeded" },
    { status: 429, headers: { "Cache-Control": "no-store", "Retry-After": String(retryAfter) } },
  );
}

export function rejectOversizedBody(request: Request, maxBytes: number) {
  const rawLength = request.headers.get("content-length");
  if (!rawLength) return null;
  const length = Number(rawLength);
  return Number.isFinite(length) && length >= 0 && length <= maxBytes
    ? null
    : Response.json({ error: "payload_too_large" }, { status: 413, headers: { "Cache-Control": "no-store" } });
}

export async function readJsonBody<T>(request: Request, maxBytes: number): Promise<T> {
  const preflight = rejectOversizedBody(request, maxBytes);
  if (preflight) throw new PayloadTooLargeError();
  if (!request.body) throw new SyntaxError("Missing body");

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      throw new PayloadTooLargeError();
    }
    chunks.push(value);
  }

  const body = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return JSON.parse(new TextDecoder().decode(body)) as T;
}

export class PayloadTooLargeError extends Error {
  constructor() {
    super("payload_too_large");
    this.name = "PayloadTooLargeError";
  }
}
