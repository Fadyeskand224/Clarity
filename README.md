# Clarity — Quit Smoking

A mobile-first, installable PWA for smoking cessation that pairs a meditation-app-style
craving management library with clinically grounded screening (Fagerström Test) and
pharmacotherapy tracking, connected end-to-end to a one-tap clinician PDF export.

Built from `Clarity_BRD.docx` (Business Requirements Document). See the FR/NFR mapping
at the bottom of this file.

## Architecture

- **`backend/`** — Node.js + Express REST API, PostgreSQL, JWT auth. Live-generates the
  clinician PDF (`pdfkit`) from the same data every other screen reads, so the
  assessment → medication recommendation → PDF pipeline stays connected (BRD 4.7).
- **`frontend/`** — React + Vite PWA (installable, offline-capable via `vite-plugin-pwa`),
  Tailwind CSS, React Router, TanStack Query, Recharts. Breathing-session pacing and tones
  are driven by `requestAnimationFrame` + the Web Audio API — no external audio assets.

## Local setup

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

### Known environment note (iCloud "Desktop & Documents" sync)

If this project lives inside a folder covered by iCloud Drive's "Desktop & Documents"
sync, `npm install`'s `node_modules` (tens of thousands of small files) can make
iCloud's file-provider daemon extremely slow to the point that `node` appears to hang
on startup. If you hit that, move `node_modules` outside the synced tree and symlink
it back, e.g.:

```bash
mkdir -p ~/.clarity-cache/backend ~/.clarity-cache/frontend
mv backend/node_modules ~/.clarity-cache/backend/node_modules
ln -s ~/.clarity-cache/backend/node_modules backend/node_modules
mv frontend/node_modules ~/.clarity-cache/frontend/node_modules
ln -s ~/.clarity-cache/frontend/node_modules frontend/node_modules
```

Or simplest: keep the working copy outside `~/Desktop` or `~/Documents` entirely.

## Deployment

**Backend → Railway or Render** (either works; configs for both are included):
1. Create a new Postgres database on the platform.
2. Deploy `backend/` as a web service (`railway.json` / `render.yaml` are pre-configured
   — build: `npm install`, start: `npm run migrate && npm run start`).
3. Set env vars: `DATABASE_URL` (from the platform's Postgres instance),
   `DATABASE_SSL=true`, `JWT_SECRET` (long random string).

**Frontend → Vercel**:
1. Import `frontend/` as the project root.
2. Set env var `VITE_API_BASE_URL` to your deployed backend's URL, e.g.
   `https://clarity-api.up.railway.app/api`.
3. Deploy. `vercel.json` handles the SPA rewrite so client-side routing works.

Once both are live, open the Vercel URL on a phone: Safari → Share → "Add to Home
Screen" (iOS) or Chrome → "Install app" (Android) for the full-screen installed
experience (NFR-1).

## BRD requirement mapping (high level)

| Area | Where |
|---|---|
| Streak, progress ring, savings, SOS banner, assessment card (FR-1.x) | `frontend/src/pages/Home.jsx`, `backend/src/routes/dashboard.js` |
| Breathing session library + guided player + reflection (FR-2.x) | `frontend/src/lib/sessionLibrary.js`, `hooks/useBreathingSession.js`, `pages/BreatheSession.jsx` |
| Savings chart, health timeline, clinician PDF (FR-3.x) | `pages/Progress.jsx`, `backend/src/utils/pdfExport.js`, `routes/pdf.js` |
| Journal (FR-4.x) | `pages/Journal.jsx`, `backend/src/routes/journal.js` |
| Fagerström Test (FR-5.x) | `backend/src/utils/fagerstrom.js`, `routes/fagerstrom.js`, `frontend/src/pages/Fagerstrom.jsx` |
| Medication tracker (FR-6.x) | `pages/Medications.jsx`, `backend/src/routes/medications.js` |
| Connected data pipeline (4.7) | Fagerström score is recomputed live for the PDF (`recommendationForScore`), not cached text |
| Installable/offline (NFR-1/2) | `frontend/vite.config.js` (`vite-plugin-pwa`), `index.html` meta tags |
| Evidence-based content, CDC Quitline (NFR-4) | `backend/src/utils/metrics.js` (health milestones), `Progress.jsx` footer |
| Relapse as data, not shame-reset (Section 6) | `smoking_events` table + `Home.jsx` slip-log sheet |

### Not in this build (explicitly future-phase per the BRD, Section 8)

Push notification delivery (reminder toggles are wired in the UI/DB but don't send
notifications), native iOS/Android builds, hardware pairing, comorbidity-aware content
branches, and monetization.
