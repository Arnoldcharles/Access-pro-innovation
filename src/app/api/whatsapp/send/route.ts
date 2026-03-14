import { NextResponse } from "next/server";
import { verifyFirebaseIdToken } from "@/lib/firebaseIdToken";
import twilio from "twilio";

export const runtime = "nodejs";

type SendBody = {
  to: string;
  text: string;
  link?: string;
};

const requireEnv = (key: string) => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing env var ${key}`);
  return value;
};

const normalizeBearerToken = (value: string) => value.replace(/^Bearer\s+/i, "").trim();

const normalizeRecipient = (value: string) => {
  const v = String(value ?? "").trim();
  if (!v) return "";
  if (v.toLowerCase().startsWith("whatsapp:")) return v;
  if (v.startsWith("+")) return `whatsapp:${v}`;
  const digits = v.replace(/[^\d]/g, "");
  return digits ? `whatsapp:+${digits}` : "";
};

const asObject = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : null;

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
      const message = err instanceof Error ? err.message : "Invalid Firebase ID token";
      return NextResponse.json(
        { error: `Auth failed: ${message}` },
        { status: 401 },
      );
    }

    const body = (await req.json()) as Partial<SendBody>;
    const toRaw = String(body.to ?? "");
    const textRaw = String(body.text ?? "");
    const linkRaw = typeof body.link === "string" ? body.link : "";

    const to = normalizeRecipient(toRaw);
    if (!to) {
      return NextResponse.json({ error: "Missing recipient phone number" }, { status: 400 });
    }

    const messageParts = [textRaw.trim(), linkRaw.trim()].filter(Boolean);
    const message = messageParts.join("\n").trim();
    if (!message) {
      return NextResponse.json({ error: "Missing message text" }, { status: 400 });
    }

    const accountSid = requireEnv("TWILIO_ACCOUNT_SID");
    const authToken = requireEnv("TWILIO_AUTH_TOKEN");
    const fromRaw = requireEnv("TWILIO_WHATSAPP_FROM");
    const from = normalizeRecipient(fromRaw);
    if (!from) throw new Error("Invalid TWILIO_WHATSAPP_FROM. Example: whatsapp:+14155238886");

    const client = twilio(accountSid, authToken);
    let result: { sid: string } | null = null;
    try {
      result = await client.messages.create({
        from,
        to,
        body: message.slice(0, 1600),
      });
    } catch (err) {
      const obj = asObject(err);
      const code = typeof obj?.code === "number" ? obj.code : undefined;
      const status = typeof obj?.status === "number" ? obj.status : undefined;
      const moreInfo =
        typeof obj?.moreInfo === "string" ? obj.moreInfo : undefined;
      const message =
        err instanceof Error ? err.message : "Twilio send failed";

      return NextResponse.json(
        {
          error: `Twilio error: ${message}`,
          provider: "twilio",
          twilio: { code, status, moreInfo },
        },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true, provider: "twilio", sid: result.sid });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
