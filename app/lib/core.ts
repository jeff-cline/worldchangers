import "server-only";

// ── R0cketShip Core API client ───────────────────────────────────────────────
// The shared "body" every site sits on. Leads, email, SMS, and data all go
// THROUGH the Core so integrations (Zapmail, Twilio, CRM, PredictiveData) live in
// ONE place. Credentials are read from env only and never reach the browser.
//
// This whole file is server-only — importing it in a client component is a build
// error, which guarantees the Core secret can't leak into the bundle.

const BASE = process.env.CORE_API_BASE ?? "https://worldchangers.ai";
const KEY = process.env.CORE_API_KEY;
const SECRET = process.env.CORE_API_SECRET;

export function coreConfigured(): boolean {
  return Boolean(KEY && SECRET);
}

type CoreResult = { ok: boolean; error?: string; [k: string]: unknown };

async function call(path: string, body: unknown): Promise<CoreResult> {
  if (!coreConfigured()) return { ok: false, error: "core api not configured" };
  try {
    const res = await fetch(`${BASE}${path}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-core-key": KEY!,
        "x-core-secret": SECRET!,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
      cache: "no-store",
    });
    const json = (await res.json().catch(() => ({}))) as CoreResult;
    return res.ok && json.ok !== false ? { ...json, ok: true } : { ...json, ok: false, error: json.error ?? `http ${res.status}` };
  } catch (e) {
    return { ok: false, error: String((e as Error)?.message ?? e).slice(0, 200) };
  }
}

export interface CoreEmail {
  to: string; // comma-separated ok
  subject: string;
  html?: string;
  text?: string;
  provider?: "zapmail" | "google_workspace" | "smtp";
}
/** Send email via the Core (Zapmail by default). Scope: email:send. */
export function coreEmail(msg: CoreEmail): Promise<CoreResult> {
  return call("/api/core/email", msg);
}

export interface CoreLead {
  name: string;
  email: string;
  phone?: string;
  zip?: string;
  state?: string;
  creatorRef?: string; // which site sent it
  notes?: string;
}
/** Push a lead into the Core CRM (enriched + attributed). Scope: lead:create. */
export function coreLead(lead: CoreLead): Promise<CoreResult> {
  return call("/api/core/lead", lead);
}

export interface CoreSms {
  to: string; // E.164
  body: string;
}
/** Send SMS via the Core's Twilio. Scope: sms:send. */
export function coreSms(msg: CoreSms): Promise<CoreResult> {
  return call("/api/core/sms", msg);
}
