# Clarity

Clarity is a mobile-first app for quitting smoking that I built to sit in the gap I kept
noticing between two kinds of products: consumer quit-smoking apps that are motivational
but clinically thin, and clinical tools that are accurate but don't help anyone through
the moment they actually want a cigarette. Clarity tries to be both — a craving-management
experience that feels like a meditation app, wired directly into a validated dependence
screening (the Fagerström Test), a pharmacotherapy tracker, and a one-tap PDF summary a
user can hand to their doctor.

I wanted this to be more than a UI exercise, so the underlying data is real and connected:
the assessment score drives the medication guidance, the medication guidance and adherence
show up in the same PDF as the streak and savings data, and none of it is hardcoded demo
state — it's a real Postgres-backed account with your own quit date, your own numbers.

## Why I built it

Most quit-smoking apps I looked at fell into one of two camps: gamified streak trackers
with no clinical grounding, or dense clinical questionnaires with no craving support in
the moment someone needs it. Neither one treats quitting the way it actually feels —
which is less like "breaking a bad habit" and more like a body slowly getting its breath
back. I wanted the app to carry that framing everywhere: a progress ring that fills from
grey to teal instead of a shame-based streak counter, a relapse log that treats a slip as
a data point instead of a reset-to-zero failure, and a breathing library that actually
uses the correct pacing for each technique (box breathing is genuinely 4-4-4-4 seconds,
not just a label).

I also wanted to prove out something specific: that a consumer-facing wellness app and a
clinically useful tool aren't mutually exclusive. The Fagerström Test here is the real
6-item validated questionnaire, not an approximation, and the recommendation logic is
explicitly framed as informational rather than prescriptive, because a screening tool
built by one person without clinical review has no business telling someone what
medication to take. It's meant to make a doctor's visit more useful, not replace it —
which is why the clinician PDF export exists at all: it's the bridge between the
self-tracked data and an actual clinical conversation.

## What it does

- **Home dashboard** — smoke-free streak, a progress ring that fills grey → teal, running
  savings based on your prior spend, and a one-tap entry into craving support.
- **Craving SOS / Breathe** — four guided sessions (Craving SOS, Box Breathing, Urge
  Surfing, Wind Down), each with phase timing matched to the real technique, a pulsing
  visual guide, and tone cues generated with the Web Audio API rather than shipped audio
  files. Every session opens and closes with an urge-strength check-in so you can see the
  craving actually drop.
- **Fagerström Test** — the standard 6-item nicotine dependence questionnaire, scored
  live, mapped to a dependence level and a tailored (informational) medication
  recommendation, which flows straight into medication setup.
- **Medication tracker** — regimen, a daily dose checklist, and a 7-day adherence chart
  styled to match the savings chart so the two read as one system.
- **Progress** — a savings-over-time chart, a health-recovery timeline sourced from
  commonly cited CDC / Smokefree.gov milestones, and the clinician PDF export, generated
  live from whatever's currently true about your account.
- **Journal** — trigger and mood logging, so patterns become visible instead of anecdotal.
- **Profile** — edit your quit info, change your password, log out.

## How it's built

**Backend** — Node/Express with a PostgreSQL database and JWT auth. Every route reads
from the same tables, which is what keeps the "connected data pipeline" promise real:
the PDF export route pulls the current profile, the latest Fagerström score, the active
medication regimen, its adherence log, and recent journal triggers, and recomputes the
recommendation from the score at export time rather than reading back cached text — so if
the scoring logic ever changes, a re-export reflects it immediately. The PDF itself is
generated server-side with `pdfkit`, not rendered from a template screenshot.

**Frontend** — React on Vite, built as an installable, offline-capable PWA
(`vite-plugin-pwa`) so it can be added to a phone's home screen and launch full-screen,
no browser chrome. Data fetching and caching go through TanStack Query against the REST
API; routing is React Router with a couple of route guards (`RequireAuth` /
`RequireGuest`) that also handle the "finish onboarding before you see the dashboard"
redirect. The breathing sessions are the one place with real animation logic — a small
hook (`useBreathingSession`) drives phase timing off `performance.now()` deltas rather
than counting ticks, so pacing stays accurate over a multi-minute session even if the
browser throttles an occasional animation frame.

**Design system** — dark, glass-panelled UI with a teal/cyan accent, built with Tailwind
v4's `@theme` and `@utility` layers so the whole palette lives in one place
(`index.css`). Charts (savings, adherence) share one color language on purpose, per
FR-6.3 in my own spec — they're meant to read as one system, not two unrelated widgets.

**Data model** — quit-tracking is a `profiles` table (quit date, reasons, prior
cigarette count and cost) plus a `smoking_events` table that logs relapses as dated,
contextual entries (time, trigger, mood) instead of silently resetting a counter. The
Fagerström responses, medication regimens, adherence log, and journal entries are each
their own table, all keyed off the user, so the PDF export is really just one query per
table joined at read time — there's no separate "report" data model to keep in sync.

## Sources

The Fagerström Test for Nicotine Dependence is the standard validated 6-item
questionnaire used in cessation research and clinical practice. The health-recovery
timeline and general cessation guidance reference commonly cited CDC / Smokefree.gov
milestones and USPSTF cessation-care guidance. The app surfaces the CDC Quitline
(1-800-QUIT-NOW) as an escalation option throughout. None of this is a substitute for
clinical review — the Fagerström scoring and recommendation logic in particular should
be checked by a qualified clinician before this is used as anything more than a
self-tracking and conversation-starting tool.

## Tech stack

- **Backend:** Node.js, Express, PostgreSQL, JWT auth, pdfkit
- **Frontend:** React, Vite, Tailwind CSS v4, React Router, TanStack Query, Recharts
- **PWA:** vite-plugin-pwa (offline caching, installable manifest)

## Running it locally

### 1. Backend + database

Requires Docker (for Postgres) and Node 18+.

```bash
# Start Postgres
docker run -d --name clarity-postgres \
  -e POSTGRES_USER=clarity -e POSTGRES_PASSWORD=clarity -e POSTGRES_DB=clarity \
  -p 5432:5432 postgres:16-alpine

cd backend
cp .env.example .env      # edit JWT_SECRET to a long random string
npm install
npm run migrate           # creates tables
npm run dev                # http://localhost:4000
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env      # leave VITE_API_BASE_URL blank for local dev
npm install
npm run dev                # http://localhost:5173, proxies /api to :4000
```

Open the printed URL on your phone (same network) or in a desktop browser's mobile
device emulation to try the installable/offline behavior.

### A note if your project folder is inside iCloud Drive

If this lives inside a folder covered by iCloud Drive's "Desktop & Documents" sync,
`node_modules` (tens of thousands of small files) can make iCloud's file-provider daemon
slow enough that `node` appears to hang on startup, or the dev server occasionally serves
a stale file mid-sync. If you hit that, move `node_modules` outside the synced tree and
symlink it back:

```bash
mkdir -p ~/.clarity-cache/backend ~/.clarity-cache/frontend
mv backend/node_modules ~/.clarity-cache/backend/node_modules
ln -s ~/.clarity-cache/backend/node_modules backend/node_modules
mv frontend/node_modules ~/.clarity-cache/frontend/node_modules
ln -s ~/.clarity-cache/frontend/node_modules frontend/node_modules
```

Or simplest: keep the working copy outside `~/Desktop` or `~/Documents` entirely.

## Deploying

**Backend → Railway or Render** (either works; configs for both are included):
1. Create a new Postgres database on the platform.
2. Deploy `backend/` as a web service (`railway.json` / `render.yaml` are pre-configured
   — build: `npm install`, start: `npm run migrate && npm run start`).
3. Set env vars: `DATABASE_URL` (from the platform's Postgres instance),
   `DATABASE_SSL=true`, `JWT_SECRET` (long random string).

**Frontend → Vercel**:
1. Import `frontend/` as the project root.
2. Set env var `VITE_API_BASE_URL` to the deployed backend's URL, e.g.
   `https://clarity-api.up.railway.app/api`.
3. Deploy. `vercel.json` handles the SPA rewrite so client-side routing works.

Once both are live, open the URL on a phone: Safari → Share → "Add to Home Screen"
(iOS) or Chrome → "Install app" (Android) for the full-screen installed experience.

## What's not in here yet

This is a working prototype, not a finished clinical product, and I want to be upfront
about the gap:

- **No clinical review.** The Fagerström scoring and medication guidance need sign-off
  from a qualified clinician before this should be treated as more than a self-tracking
  tool — it's built to support a doctor's visit, not replace one.
- **No push notifications.** Reminder toggles exist in the UI and database but don't yet
  trigger anything — that needs real notification infrastructure.
- **No native app builds.** This is a PWA; porting to React Native or Flutter for app
  store distribution is a future step, not a blocker for what's here.
- **No hardware integration.** Bluetooth pairing with spirometers, pulse oximeters, or CO
  monitors is on the list but depends on third-party device APIs I haven't evaluated yet.
- **No comorbidity-aware content.** Right now the content is the same regardless of
  whether someone has COPD or asthma; a separate content branch for that is a future
  phase.
- **No monetization.** Not implemented, not decided.

## Project structure

```
backend/
  src/
    routes/       # one file per resource (auth, profile, fagerstrom, medications, ...)
    utils/        # scoring logic, streak/savings math, PDF generation
    db/           # schema + migration runner
frontend/
  src/
    pages/        # one file per screen
    components/   # shared UI (cards, buttons, nav, charts)
    hooks/        # useBreathingSession (timer/audio engine)
    lib/          # session definitions, savings math, audio engine
    api/          # API client + React Query hooks
```
