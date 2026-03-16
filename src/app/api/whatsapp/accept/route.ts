import { NextResponse } from "next/server";
import crypto from "crypto";

export const runtime = "nodejs";

type AcceptBody = {
  to: string;
  token: string;
  sig: string;
  eventName?: string;
  guestName?: string;
};

const requireEnv = (key: string) => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing env var ${key}`);
  return value;
};

const requireEnvOptional = (key: string) => process.env[key] ?? "";

const normalizeBearerToken = (value: string) => value.replace(/^Bearer\s+/i, "").trim();

const safeJson = async (res: Response) => res.json().catch(() => null);

const normalizePhoneDigits = (value: string) => {
  const digits = String(value ?? "").replace(/[^\d]/g, "");
  if (digits.length === 11 && digits.startsWith("0")) return `234${digits.slice(1)}`;
  return digits;
};

const computeInviteSig = (secret: string, token: string, toDigits: string) => {
  // Keep it URL-safe and short.
  return crypto
    .createHmac("sha256", secret)
    .update(`${token}.${toDigits}`)
    .digest("base64url")
    .slice(0, 24);
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<AcceptBody>;
    const token = String(body.token ?? "").trim();
    const sig = String(body.sig ?? "").trim();
    const toDigits = normalizePhoneDigits(String(body.to ?? ""));
    if (!token || !sig || !toDigits) {
      return NextResponse.json({ error: "Missing token/sig/to" }, { status: 400 });
    }

    const secret = requireEnv("INVITE_LINK_SECRET");
    const expected = computeInviteSig(secret, token, toDigits);
    const ok =
      sig.length === expected.length &&
      crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
    if (!ok) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const watiBaseUrl = requireEnv("WATI_BASE_URL").replace(/\/+$/g, "");
    const watiTenantId = requireEnvOptional("WATI_TENANT_ID").trim();
    const watiToken = normalizeBearerToken(requireEnv("WATI_BEARER_TOKEN"));
    const watiRoot = watiTenantId ? `${watiBaseUrl}/${watiTenantId}` : watiBaseUrl;

    const templateName = (process.env.WATI_ACCEPT_TEMPLATE_NAME ?? "").trim();
    const eventName = (typeof body.eventName === "string" ? body.eventName : "").trim();
    const guestName = (typeof body.guestName === "string" ? body.guestName : "").trim();

    if (templateName) {
      const url = `${watiRoot}/api/v2/sendTemplateMessage?whatsappNumber=${encodeURIComponent(
        toDigits,
      )}`;
      const broadcastPrefix = (process.env.WATI_BROADCAST_PREFIX ?? "accesspro").trim();
      const parameters = [
        { name: "1", value: guestName || "there" },
        { name: "2", value: eventName || "the event" },
      ];

      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${watiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          template_name: templateName,
          broadcast_name: `${broadcastPrefix}-accept-${Date.now()}`,
          parameters,
        }),
      });

      const data = await safeJson(res);
      if (!res.ok) {
        return NextResponse.json(
          { error: "WATI API error (template)", provider: "wati", status: res.status, details: data },
          { status: 502 },
        );
      }
      return NextResponse.json({ ok: true, provider: "wati", mode: "template", result: data });
    }

    // Session message fallback.
    const msg = eventName
      ? `You have accepted the invite for ${eventName}. See you there!`
      : "You have accepted the invite. See you there!";
    const url = `${watiRoot}/api/v1/sendSessionMessage/${encodeURIComponent(
      toDigits,
    )}?messageText=${encodeURIComponent(msg.slice(0, 4096))}`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${watiToken}`,
        "Content-Type": "application/json",
      },
      body: "{}",
    });

    const data = await safeJson(res);
    if (!res.ok) {
      return NextResponse.json(
        { error: "WATI API error (session)", provider: "wati", status: res.status, details: data },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true, provider: "wati", mode: "session", result: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

