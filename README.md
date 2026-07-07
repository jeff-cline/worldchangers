# worldchangers.ai

A **self-contained site on top of the R0cketShip Core** — and the **template** for
launching new sites the same way.

## The model: heads on top, Core below

```
   worldchangers.ai   nextsite.com   another.ai      ← self-contained "heads"
   (app :3030)        (:3040)        (:3050)            own repo · own deploy ·
        \                |              /                can't break each other
         ▼              ▼             ▼
   ┌──────────────────────────────────────────┐
   │  THE CORE  (/api/core)                    │  ← shared "body"
   │  leads · email · SMS · data · /opportunities
   └──────────────────────────────────────────┘
   nginx routes each domain → its head;  /api/core → the Core
```

- **This app is a head.** It renders its own marketing site and nothing else. It has
  **no database and no auth.** A crash or bad deploy here affects *only this site*.
- **Shared muscle comes from the Core** via `/api/core` (see `app/lib/core.ts`):
  lead tracking, email (Zapmail), SMS (Twilio), data enrichment. You never
  re-configure those integrations per site — the Core owns them.
- **`/opportunities`** (the joint God-only CRM) is a **Core** feature. This site only
  *links* to it; it does not host it.

## Local dev

```bash
cp .env.example .env.local     # fill in the real CORE_API_KEY / CORE_API_SECRET
npm install
npm run dev                    # http://localhost:3000
```

Leads submitted on the site POST to `/api/lead`, which forwards to the Core
(`/api/core/lead` + `/api/core/email`). The Core secret stays server-side.

## Deploy (isolated — never touches other sites)

On the box (`137.220.56.129`), each site is its own PM2 process on its own port:

```bash
# 1. code
git clone git@github.com:jeff-cline/worldchangers.git /var/www/worldchangers
cd /var/www/worldchangers && cp .env.example .env.local   # set Core key + PORT=3030
npm ci && npm run build

# 2. run (own process, own port — nothing else restarts)
pm2 start "npm run start" --name worldchangers
pm2 save

# 3. nginx — ADD a new server block (never edit existing sites' blocks):
#    server_name worldchangers.ai www.worldchangers.ai;
#    location /api/core { proxy_pass http://127.0.0.1:3020; }   # → the Core
#    location /         { proxy_pass http://127.0.0.1:3030; }   # → this site
sudo nginx -t && sudo certbot --nginx -d worldchangers.ai -d www.worldchangers.ai
sudo systemctl reload nginx

# 4. DNS: point worldchangers.ai (A) → 137.220.56.129
```

## Launch a NEW site from this template

1. `git clone` this repo into a **new repo** for the new site.
2. Edit **`app/_site/config.ts`** (name, brand colors, links, `notifyTo`,
   `coreCreatorRef`) and **`app/_site/tiers.ts`** (offer/pricing data). Restyle
   `app/page.tsx` as needed.
3. Ask the Core owner (God) to **issue a new Core API key** with the scopes you
   need (`lead:create`, `email:send`, `sms:send`) → put it in `.env.local`.
4. Deploy on a **new port** with its own PM2 process + an **additive** nginx block
   (steps above). Never touch another site's app or nginx block.

That's it — a new head on the same Core, isolated by construction.

## Stack

Next.js 15 (App Router) · React 19 · Tailwind v4 · TypeScript. No database, no auth —
those live in the Core.
