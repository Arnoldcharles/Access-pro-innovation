import { NextResponse } from "next/server";
import { verifyFirebaseIdToken } from "@/lib/firebaseIdToken";

export const runtime = "nodejs";

type SendBody = {
  to: string;
  text?: string;
  link?: string;
  templateName?: string;
  parameters?: Array<{ name: string; value: string }>;
};

const requireEnv = (key: string) => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing env var ${key}`);
  return value;
};

const requireEnvOptional = (key: string) => process.env[key] ?? "";

const normalizeBearerToken = (value: string) => value.replace(/^Bearer\s+/i, "").trim();

const safeJson = async (res: Response) => res.json().catch(() => null);

const asErrorMessage = (err: unknown) =>
  err instanceof Error ? err.message : "Unknown error";

const buildWhatsAppTextBody = (textRaw: string, linkRaw: string) => {
  const parts = [textRaw.trim(), linkRaw.trim()].filter(Boolean);
  return parts.join("\n").trim().slice(0, 4096);
};

const normalizePhoneDigits = (value: string) => {
  const digits = String(value ?? "").replace(/[^\d]/g, "");

  // Nigeria-friendly normalization: 080..., 081..., 090... -> 23480..., etc.
  // Most of your app's phone numbers (and schema telephone) are NG-based.
  if (digits.length === 11 && digits.startsWith("0")) {
    return `234${digits.slice(1)}`;
  }

  return digits;
};

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization") ?? "";
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    if (!match) {
      return NextResponse.json(
        { error: "Missing Authorization: Bearer <firebase_id_token>" },
        { status: 401 },
      );
    }

    const idToken = match[1];
    try {
      await verifyFirebaseIdToken(idToken);
    } catch (err) {
      const message = asErrorMessage(err) || "Invalid Firebase ID token";
      return NextResponse.json(
        { error: `Auth failed: ${message}` },
        { status: 401 },
      );
    }

    const body = (await req.json()) as Partial<SendBody>;
    const toRaw = String(body.to ?? "");
    const textRaw = typeof body.text === "string" ? body.text : "";
    const linkRaw = typeof body.link === "string" ? body.link : "";

    const to = normalizePhoneDigits(toRaw);
    if (!to) {
      return NextResponse.json({ error: "Missing recipient phone number" }, { status: 400 });
    }
    if (to.length < 11) {
      return NextResponse.json(
        { error: "Phone number must include country code (example: 2348133689639)" },
        { status: 400 },
      );
    }

    const message = buildWhatsAppTextBody(textRaw, linkRaw);
    if (!message) {
      return NextResponse.json({ error: "Missing message text" }, { status: 400 });
    }

    const watiBaseUrl = requireEnv("WATI_BASE_URL").replace(/\/+$/g, "");
    const watiTenantId = requireEnvOptional("WATI_TENANT_ID").trim();
    const watiToken = normalizeBearerToken(requireEnv("WATI_BEARER_TOKEN"));

    const watiRoot = watiTenantId
      ? `${watiBaseUrl}/${watiTenantId}`
      : watiBaseUrl;

    const templateName =
      (typeof body.templateName === "string" ? body.templateName : "").trim() ||
      requireEnvOptional("WATI_TEMPLATE_NAME").trim();

    if (templateName) {
      const url = `${watiRoot}/api/v2/sendTemplateMessage?whatsappNumber=${encodeURIComponent(
        to,
      )}`;
      const parameters =
        Array.isArray(body.parameters) && body.parameters.length
          ? body.parameters
          : [
              { name: "1", value: textRaw.trim() },
              ...(linkRaw.trim() ? [{ name: "2", value: linkRaw.trim() }] : []),
            ];

      const broadcastPrefix = (process.env.WATI_BROADCAST_PREFIX ?? "accesspro").trim();
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${watiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          template_name: templateName,
          broadcast_name: `${broadcastPrefix}-${Date.now()}`,
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

    // Session message (works only within WhatsApp 24-hour window).
    const url = `${watiRoot}/api/v1/sendSessionMessage/${encodeURIComponent(
      to,
    )}?messageText=${encodeURIComponent(message)}`;

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
    const message = asErrorMessage(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
