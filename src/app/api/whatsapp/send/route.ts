import { NextResponse } from "next/server";
import { verifyFirebaseIdToken } from "@/lib/firebaseIdToken";

export const runtime = "nodejs";

type SendBody = {
  to: string;
  text?: string;
  link?: string;
};

const requireEnv = (key: string) => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing env var ${key}`);
  return value;
};

const normalizeMetaRecipient = (value: string) => String(value ?? "").replace(/[^\d]/g, "");

const safeJson = async (res: Response) => res.json().catch(() => null);

const asErrorMessage = (err: unknown) => (err instanceof Error ? err.message : "Unknown error");

const buildWhatsAppTextBody = (textRaw: string, linkRaw: string) => {
  const parts = [textRaw.trim(), linkRaw.trim()].filter(Boolean);
  return parts.join("\n").trim().slice(0, 4096);
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

    const to = normalizeMetaRecipient(toRaw);
    if (!to) {
      return NextResponse.json({ error: "Missing recipient phone number" }, { status: 400 });
    }

    const message = buildWhatsAppTextBody(textRaw, linkRaw);
    if (!message) {
      return NextResponse.json({ error: "Missing message text" }, { status: 400 });
    }

    const accessToken = requireEnv("WHATSAPP_ACCESS_TOKEN");
    const phoneNumberId = requireEnv("WHATSAPP_PHONE_NUMBER_ID");
    const graphVersion = process.env.WHATSAPP_GRAPH_VERSION?.trim() || "v20.0";
    const url = `https://graph.facebook.com/${graphVersion}/${phoneNumberId}/messages`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "text",
        text: { body: message, preview_url: true },
      }),
    });

    const data = await safeJson(res);
    if (!res.ok) {
      return NextResponse.json(
        { error: "WhatsApp API error", provider: "meta", status: res.status, details: data },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true, provider: "meta", result: data });
  } catch (err) {
    const message = asErrorMessage(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
