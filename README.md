# Cooked 🍽️

> Snap a photo of food → get matching recipes from TheMealDB & Edamam → watch how to cook it on YouTube.

A **Progressive Web App** (installable on any phone) built with Next.js 16, TypeScript, and TensorFlow.js. All image recognition runs on-device — no AI API costs ever.

---

## How it works

1. **Scan** — tap the camera button, photograph your food
2. **Identify** — TF.js MobileNet v2 classifies the image on-device; you pick from the top 3 predictions
3. **Recipes** — TheMealDB (free, no key) and Edamam (free tier) return matching recipes in parallel
4. **Cook** — full instructions and ingredient list inline; YouTube cooking video one tap away

---

## Tech stack

| Concern | Choice | Why |
|---|---|---|
| Framework | Next.js 16 (App Router) | SSR API routes hide Edamam keys; Vercel free deploy |
| Language | TypeScript | Type-safe API shapes catch integration bugs at build time |
| Styling | Tailwind CSS v4 | Mobile-first utility classes |
| Image recognition | TensorFlow.js + MobileNet v2 | 100% on-device, zero API cost |
| Recipe APIs | TheMealDB + Edamam (parallel) | TheMealDB: free/no key, full instructions; Edamam: large database, nutrition data |
| YouTube | URL redirect only | No API quota consumed |
| Storage | localStorage | Cross-session history + favorites, no backend needed |
| PWA | next-pwa (Workbox) | Installable, offline-capable |
| Hosting | Vercel free tier | Zero-config Next.js deploy |

---

## Getting started

### Prerequisites

- Node.js 20+
- Docker + make (for containerised builds)
- [gitleaks](https://github.com/gitleaks/gitleaks) (optional, for pre-commit secret scanning)

### Local development

```bash
cp .env.example .env.local
# Fill in EDAMAM_APP_ID and EDAMAM_APP_KEY (see below)

npm install
npm run dev          # http://localhost:3000
```

### Getting Edamam API credentials (free)

1. Register at [developer.edamam.com](https://developer.edamam.com)
2. Create a new application — choose **Recipe Search v2**
3. Copy the `app_id` and `app_key` into `.env.local`:
   ```
   EDAMAM_APP_ID=your_app_id_here
   EDAMAM_APP_KEY=your_app_key_here
   ```
4. Free tier: 10 requests/minute, 10,000 requests/month

> **TheMealDB** requires no API key and has no rate limits on the free public API.

### Install git hooks

```bash
make install-hooks   # enables gitleaks pre-commit secret scanning
```

---

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `EDAMAM_APP_ID` | Yes | Edamam Recipe Search v2 app ID |
| `EDAMAM_APP_KEY` | Yes | Edamam Recipe Search v2 app key |

API keys are read server-side only (Next.js API route at `/api/recipes/edamam`) and never sent to the browser.

For **Vercel**: add both variables under **Project Settings → Environment Variables**.

---

## Running tests

```bash
npm test                  # run all tests once
npm run test:watch        # watch mode
npm run test:coverage     # with coverage report
```

Tests cover all business logic in `src/lib/` and `src/types/` (38 tests, 6 files) using Vitest + jsdom.

---

## Docker / Makefile

```bash
make build        # build the production artifact image
make test         # run tests inside the test container
make run          # run the app container on PORT 3000
make debug        # shell into the artifact container
make trivy-scan   # CVE scan the image
make sonar-scan   # static analysis (requires SONAR_TOKEN)
```

---

## Deploying to Vercel

1. Push this repo to GitHub
2. Import it at [vercel.com/new](https://vercel.com/new)
3. Add `EDAMAM_APP_ID` and `EDAMAM_APP_KEY` to Environment Variables
4. Deploy — Vercel auto-detects Next.js, no config needed

---

## License

[MIT](LICENSE)
