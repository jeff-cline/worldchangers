import { NextResponse } from "next/server";
import { coreLead, coreEmail } from "@/app/lib/core";
import { site } from "@/app/_site/config";

export const runtime = "nodejs";

// Public lead endpoint for this site's forms. The browser posts here; the server
// forwards to the Core (CRM + notification) so god accounts see every lead and
// both partners get emailed. The Core secret stays server-side.
function str(v: unknown): string {
  return v == null ? "" : String(v).trim().slice(0, 4000);
}
function esc(v: unknown): string {
  const s = str(v);
  return s === "" ? "—" : s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]!);
}

export async function POST(req: Request) {
  const b = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!b || typeof b !== "object") return NextResponse.json({ error: "bad request" }, { status: 400 });

  const name = str(b.name) || "(no name)";
  const email = str(b.email);
  const phone = str(b.cellPhone) || str(b.workPhone) || str(b.phone);

  // 1) Push into the Core CRM (attributed to this site).
  const lead = coreLead({
    name,
    email,
    phone,
    creatorRef: site.coreCreatorRef,
    notes: [str(b.company) && `Company: ${str(b.company)}`, str(b.message), str(b.predictive) && `Predictive: ${str(b.predictive)}`].filter(Boolean).join(" · "),
  });

  // 2) Notify both partners via the Core (Zapmail).
  const notify = coreEmail({
    to: site.notifyTo,
    subject: `New lead — ${site.name}`,
    html: `<h2 style="margin:0 0 8px">New lead from ${site.name}</h2>
<table style="border-collapse:collapse;font-size:14px">
  <tr><td style="padding:2px 10px 2px 0;color:#61708a">Name</td><td>${esc(b.name)}</td></tr>
  <tr><td style="padding:2px 10px 2px 0;color:#61708a">Company</td><td>${esc(b.company)}</td></tr>
  <tr><td style="padding:2px 10px 2px 0;color:#61708a">Email</td><td>${esc(b.email)}</td></tr>
  <tr><td style="padding:2px 10px 2px 0;color:#61708a">Work phone</td><td>${esc(b.workPhone)}</td></tr>
  <tr><td style="padding:2px 10px 2px 0;color:#61708a">Cell phone</td><td>${esc(b.cellPhone)}</td></tr>
  <tr><td style="padding:2px 10px 2px 0;color:#61708a;vertical-align:top">Message</td><td>${esc(b.message)}</td></tr>
  <tr><td style="padding:2px 10px 2px 0;color:#61708a;vertical-align:top">Predictive interest</td><td>${esc(b.predictive)}</td></tr>
</table>`,
  });

  const [leadRes] = await Promise.all([lead, notify]);
  // Succeed for the visitor as long as the lead was captured; notification is best-effort.
  return NextResponse.json({ ok: true, lead: leadRes.ok });
}
