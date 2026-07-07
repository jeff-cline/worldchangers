// ── Per-site configuration ──────────────────────────────────────────────────
// This is the file you edit to turn this template into a NEW site: brand colors,
// name, links, and where leads/notifications go. Everything else stays the same.
// Shared services come from the Core API (see app/lib/core.ts + .env.local).

export const brand = {
  teal: "#0d7377", // primary (Krystalore)
  deep: "#0f5257",
  orange: "#ff5b2e", // accent (R0cketShip)
  ink: "#0b2a2c",
};

export const site = {
  name: "worldchangers.ai",
  partner: "Krystalore × R0cketShip",
  tagline: "People First. Tech-Backed.",

  // Where a new lead gets attributed in the Core CRM.
  coreCreatorRef: "worldchangers.ai",
  // Who gets the "new lead" / notification emails (comma-separated).
  notifyTo: "krystalore@thecrewscoach.com, jeff.cline@me.com",

  address: "5869 Av. Isla Verde, Carolina, Puerto Rico",

  emails: {
    krystalore: "krystalore@thecrewscoach.com",
    jeff: "jeff.cline@me.com",
  },

  links: {
    krystalore: "https://www.krystalorecrews.com",
    rocketship: "https://r0cketship.com",
    // /opportunities is a CORE (shared) God-only feature — path-routed to the
    // Core at deploy. Sites just link to it; they don't host it.
    opportunities: "/opportunities",
  },
};
