import { NextResponse } from "next/server";
import { verifyFirebaseIdToken } from "@/lib/firebaseIdToken";
import { normalizePhoneDigits } from "@/lib/phone";
import crypto from "crypto";

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

const computeInviteSig = (secret: string, token: string, toDigits: string) => {
  return crypto
    .createHmac("sha256", secret)
    .update(`${token}.${toDigits}`)
    .digest("base64url")
    .slice(0, 24);
};

const maybeSignInviteLink = (linkRaw: string, token: string, toDigits: string) => {
  const secret = (process.env.INVITE_LINK_SECRET ?? "").trim();
  if (!secret) return linkRaw;
  if (!token) return linkRaw;
  if (!toDigits) return linkRaw;

  try {
    const url = new URL(linkRaw);
    const sig = computeInviteSig(secret, token, toDigits);
    url.searchParams.set("k", sig);
    return url.toString();
  } catch {
    return linkRaw;
  }
};

const extractTokenFromLink = (linkRaw: string) => {
  try {
    const url = new URL(linkRaw);
    const parts = url.pathname.split("/").filter(Boolean);
    return parts[parts.length - 1] ?? "";
  } catch {
    const parts = linkRaw.split("?")[0].split("/").filter(Boolean);
    return parts[parts.length - 1] ?? "";
  }
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

    const to = normalizePhoneDigits(toRaw, { defaultCountryCallingCode: "234" });
    if (!to) {
      return NextResponse.json({ error: "Missing recipient phone number" }, { status: 400 });
    }
    if (to.length < 11) {
      return NextResponse.json(
        { error: "Phone number must include country code (example: 2348133689639)" },
        { status: 400 },
      );
    }

    const inviteToken = extractTokenFromLink(linkRaw);
    const signedLink = maybeSignInviteLink(linkRaw, inviteToken, to);
    const message = buildWhatsAppTextBody(textRaw, signedLink);
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
              ...(signedLink.trim() ? [{ name: "2", value: signedLink.trim() }] : []),
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
