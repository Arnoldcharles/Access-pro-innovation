import { NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";

type SendBody = {
  to: string;
  text: string;
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

const normalizeRecipient = (value: string) => {
  // WhatsApp Cloud API examples typically use digits only.
  const digits = String(value ?? "").replace(/[^\d]/g, "");
  return digits;
};

const buildWatiRoot = (baseUrl: string, tenantId: string) => {
  const base = baseUrl.replace(/\/+$/g, "");
  // Some accounts might provide base URLs that already include tenantId.
  if (new RegExp(`/${tenantId}(/|$)`).test(base)) return base;
  return `${base}/${tenantId}`;
};

const parseParametersEnv = (value: string) => {
  if (!value.trim()) return null;
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return null;
    const items = parsed
      .map((item) => {
        const it = item as { name?: unknown; value?: unknown };
        if (typeof it?.name !== "string") return null;
        if (typeof it?.value !== "string") return null;
        return { name: it.name, value: it.value };
      })
      .filter(Boolean) as Array<{ name: string; value: string }>;
    return items.length ? items : null;
  } catch {
    return null;
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
    await getAdminAuth().verifyIdToken(idToken);

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

    const watiBaseUrl = requireEnv("WATI_BASE_URL");
    const watiTenantId = requireEnvOptional("WATI_TENANT_ID").trim();
    const watiTokenRaw = requireEnv("WATI_BEARER_TOKEN");
    const watiToken = normalizeBearerToken(watiTokenRaw);
    const watiRoot = watiTenantId
      ? buildWatiRoot(watiBaseUrl, watiTenantId)
      : watiBaseUrl.replace(/\/+$/g, "");

    // Prefer templates for outbound messages; otherwise use session messages
    // (only valid within the 24-hour customer care window).
    const templateName =
      (typeof body.templateName === "string" ? body.templateName : "").trim() ||
      requireEnvOptional("WATI_TEMPLATE_NAME").trim();

    const channelNumber = requireEnvOptional("WATI_CHANNEL_NUMBER").trim();
    const channelPhoneNumber = requireEnvOptional("WATI_CHANNEL_PHONE_NUMBER").trim();

    if (templateName) {
      const templateVersion = (process.env.WATI_TEMPLATE_API_VERSION ?? "v2").trim();
      const url = `${watiRoot}/api/${templateVersion}/sendTemplateMessage?whatsappNumber=${encodeURIComponent(to)}`;

      const fallbackParamsEnv = parseParametersEnv(
        requireEnvOptional("WATI_DEFAULT_TEMPLATE_PARAMETERS_JSON"),
      );
      const parameters =
        Array.isArray(body.parameters) && body.parameters.length
          ? body.parameters
          : fallbackParamsEnv ??
            [
              { name: "1", value: textRaw.trim() },
              ...(linkRaw.trim() ? [{ name: "2", value: linkRaw.trim() }] : []),
            ];

      const broadcastPrefix = (process.env.WATI_BROADCAST_PREFIX ?? "accesspro").trim();
      const payload: Record<string, unknown> = {
        template_name: templateName,
        broadcast_name: `${broadcastPrefix}-${Date.now()}`,
        parameters,
      };
      if (channelNumber) payload.channelNumber = channelNumber;

      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${watiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        return NextResponse.json(
          { error: "WATI API error (template)", status: res.status, details: data },
          { status: 502 },
        );
      }

      return NextResponse.json({ ok: true, provider: "wati", mode: "template", result: data });
    }

    // Session message (24-hour window); WATI commonly accepts messageText as query param.
    const url = `${watiRoot}/api/v1/sendSessionMessage/${encodeURIComponent(to)}?messageText=${encodeURIComponent(
      message.slice(0, 4096),
    )}`;
    const sessionPayload: Record<string, unknown> = {};
    if (channelPhoneNumber) sessionPayload.channelPhoneNumber = channelPhoneNumber;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${watiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sessionPayload),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      return NextResponse.json(
        { error: "WATI API error (session)", status: res.status, details: data },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true, provider: "wati", mode: "session", result: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
