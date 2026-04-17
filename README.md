# Fidooo Chat

> Real-time chat with an AI assistant — Firebase Auth + Firestore + OpenAI behind a NestJS gateway.

A production-quality monorepo built as a senior portfolio challenge. Strict TypeScript end-to-end, full test pyramid (Vitest + Jest + Playwright), Docker-first dev environment, and a Claude-inspired warm-editorial UI.

## Stack

| Layer       | Tech                                 | Why                                                      |
| ----------- | ------------------------------------ | -------------------------------------------------------- |
| Frontend    | Next.js 16 (App Router) + React 19   | RSC, server-side auth boundary via Proxy, Server Actions |
| Backend     | NestJS 11 + Fastify                  | Modular DI, fast HTTP, mature middleware ecosystem       |
| Auth        | Firebase Authentication              | Email/password + cryptographic session cookies           |
| Realtime DB | Firestore (`onSnapshot`)             | Push updates, offline persistence, no polling            |
| AI          | OpenAI `gpt-4o-mini`                 | Cost-effective, sub-5s p95                               |
| State       | Zustand 5 + TanStack Query 5         | Domain state (Zustand) vs request state (Query)          |
| Styling     | Tailwind CSS v4 + shadcn/ui + CVA    | OKLCH tokens, warm-editorial design system               |
| i18n        | next-intl (cookie-based, no routing) | ES + EN with no URL pollution                            |
| Testing     | Vitest + Jest + Playwright           | Unit + integration + E2E (desktop + mobile)              |
| Monorepo    | pnpm + Turborepo                     | Shared types, cached builds, parallel tasks              |

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                      Frontend (apps/web)                 │
│                                                          │
│   Server Components ─── verify session cookie            │
│         │                                                │
│         ▼                                                │
│   Client Components                                      │
│   ┌──────────┐  ┌──────────┐  ┌──────────────────┐       │
│   │ Zustand  │  │ TanStack │  │ Firestore        │       │
│   │ stores   │  │  Query   │  │ onSnapshot       │       │
│   └────┬─────┘  └────┬─────┘  └────────┬─────────┘       │
│        │             │                 │                 │
└────────┼─────────────┼─────────────────┼─────────────────┘
         │             │ POST /chat/reply│ realtime push
         │             ▼                 ▼
         │   ┌──────────────────┐    ┌────────────────────┐
         │   │ NestJS (apps/api)│    │ Firestore + Auth   │
         │   │                  │    └────────────────────┘
         │   │  Guard → Pipe →  │              ▲
         │   │  Service →       │              │
         │   │  ├─ Firebase ────┼──────────────┘
         │   │  └─ OpenAI ──┐   │     writes user + assistant
         │   └──────────────┼───┘
         │                  ▼
         │           OpenAI API
         │
         └──── Server proxy redirects unauthenticated → /login
```

**Highlights**

- **Optimistic chat** — message appears instantly, server reconciles via Firestore subscription.
- **Rollback on AI failure** — if OpenAI errors, the user message is best-effort deleted so retry is clean.
- **Defensive Zod schemas** — every boundary (request body, Firestore doc, env vars, API response) validates with Zod.
- **Claude warm-editorial UI** — terracotta accent, Source Serif headlines, ring-based depth (no drop shadows).
- **Hover-revealed message actions** — copy + timestamp on hover, like Claude.ai.

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+ (`corepack enable && corepack prepare pnpm@9 --activate`)
- A Firebase project with **Authentication** (email/password) and **Firestore** enabled
- An OpenAI API key with billing

### Option A — Local with pnpm (recommended for development)

```bash
git clone <repo-url> && cd challenge
pnpm install

cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env
# Fill in Firebase + OpenAI credentials in both files

pnpm dev    # web on :3000 + api on :4000 (Turborepo orchestrates)
```

### Option B — Docker (zero local setup, uses Firebase emulator)

```bash
echo "OPENAI_API_KEY=sk-..." > .env
docker compose -f docker-compose.dev.yml up --build
# Web                  → http://localhost:3000
# API                  → http://localhost:4000
# Firebase Emulator UI → http://localhost:4001
```

The compose file ships dummy Firebase credentials and points the SDKs at the local emulator, so the only secret you need is your OpenAI key. Both services have HEALTHCHECK directives and `web` waits for `api` to be healthy before starting.

### Deploy Firestore rules (required before first chat)

```bash
cd firebase
firebase login
firebase deploy --only firestore:rules --project <your-project-id>
```

Without this, Firestore rejects every read/write and the chat shows a connection error.

## Environment Variables

### Frontend (`apps/web/.env.local`)

| Variable                                   | Required | Description                                            |
| ------------------------------------------ | -------- | ------------------------------------------------------ |
| `NEXT_PUBLIC_FIREBASE_API_KEY`             | Yes      | Firebase Web SDK key                                   |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`         | Yes      | Firebase auth domain                                   |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID`          | Yes      | Firebase project ID                                    |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`      | No       | Firebase storage bucket                                |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | No       | FCM sender ID                                          |
| `NEXT_PUBLIC_FIREBASE_APP_ID`              | Yes      | Firebase app ID                                        |
| `NEXT_PUBLIC_API_URL`                      | Yes      | Backend base URL (e.g. `http://localhost:4000/api/v1`) |
| `NEXT_PUBLIC_USE_EMULATOR`                 | No       | `true` to point the Web SDK at the emulator            |
| `FIREBASE_PROJECT_ID`                      | Yes      | Server-side session cookie verification                |
| `FIREBASE_CLIENT_EMAIL`                    | Yes      | Service account email                                  |
| `FIREBASE_PRIVATE_KEY`                     | Yes      | Service account private key (escape `\n`)              |

### Backend (`apps/api/.env`)

| Variable                | Required | Default       | Description                                       |
| ----------------------- | -------- | ------------- | ------------------------------------------------- |
| `PORT`                  | No       | `4000`        | HTTP port                                         |
| `NODE_ENV`              | No       | `development` | `production` enables Helmet CSP, disables Swagger |
| `CORS_ORIGIN`           | Yes      | —             | Comma-separated allowed origins                   |
| `API_VERSION`           | No       | `1.0.0`       | Reported by `/api/v1/health`                      |
| `FIREBASE_PROJECT_ID`   | Yes      | —             | Firebase project ID                               |
| `FIREBASE_CLIENT_EMAIL` | Yes      | —             | Service account email                             |
| `FIREBASE_PRIVATE_KEY`  | Yes      | —             | Service account private key                       |
| `OPENAI_API_KEY`        | Yes      | —             | OpenAI key with billing                           |
| `OPENAI_MODEL`          | No       | `gpt-4o-mini` | Model to use                                      |
| `OPENAI_TIMEOUT_MS`     | No       | `30000`       | Hard timeout per completion                       |
| `OPENAI_MAX_TOKENS`     | No       | `1024`        | Cap on completion tokens                          |
| `RATE_LIMIT_TTL`        | No       | `60`          | Throttler window (seconds)                        |
| `RATE_LIMIT_MAX`        | No       | `20`          | Max requests per window per uid                   |
| `LOG_LEVEL`             | No       | `info`        | Pino log level                                    |

## API

### Swagger (dev only)

```
http://localhost:4000/api/docs
```

### Postman

Import `docs/postman/fidooo-chat.postman_collection.json` (and the matching environment).

### Endpoints

#### `POST /api/v1/chat/reply`

```bash
curl -X POST http://localhost:4000/api/v1/chat/reply \
  -H "Authorization: Bearer <firebase-id-token>" \
  -H "Content-Type: application/json" \
  -d '{"message": "What is TypeScript?"}'
```

```json
{ "ok": true, "messageId": "abc123", "chatId": "<user-uid>" }
```

#### `GET /api/v1/health`

```bash
curl http://localhost:4000/api/v1/health
```

```json
{ "status": "ok", "uptime": 12345, "version": "1.0.0" }
```

#### `GET /api/health` (frontend, used by the Docker HEALTHCHECK)

```json
{ "status": "ok", "uptime": 42 }
```

## Testing

```bash
pnpm test                                  # all unit + integration (api + web)
pnpm --filter @fidooo/web test             # web only (Vitest, 82 tests)
pnpm --filter @fidooo/api test             # api only (Jest, 37 tests)
pnpm --filter @fidooo/web test:coverage    # coverage report
pnpm --filter @fidooo/web test:e2e         # Playwright (desktop + mobile)
```

The first time you run E2E:

```bash
cd apps/web && npx playwright install chromium webkit
```

Eight E2E tests are intentionally `test.skip(true, …)` — they require a real Firebase Auth session (run with a seed user when you want full coverage).

## Project Structure

```
challenge/
├── apps/
│   ├── web/                       # Next.js 16 frontend
│   │   ├── src/
│   │   │   ├── app/               # (auth)/, (app)/chat, /api routes
│   │   │   ├── features/          # auth/, chat/, settings/
│   │   │   ├── components/        # ui/ (shadcn primitives) + layout/
│   │   │   ├── lib/               # firebase, api client, logger, hooks
│   │   │   ├── stores/            # Zustand (auth-store, chat-store)
│   │   │   ├── server/            # Server-only auth helpers
│   │   │   └── i18n/              # next-intl cookie-based config
│   │   ├── messages/              # ES + EN translations
│   │   ├── e2e/                   # Playwright tests
│   │   └── Dockerfile
│   └── api/                       # NestJS 11 backend
│       ├── src/
│       │   ├── chat/              # Controller + Service + ContextService
│       │   ├── firebase/          # Admin SDK adapter
│       │   ├── openai/            # OpenAI adapter
│       │   ├── common/            # Guards, pipes, filters, decorators
│       │   ├── health/            # GET /health
│       │   └── config/            # Env validation (Zod)
│       └── Dockerfile
├── packages/
│   ├── shared/                    # Zod schemas, types, constants, system prompt
│   └── config/                    # Shared tsconfig presets
├── firebase/                      # Firestore rules + emulator config
├── docs/postman/                  # Postman collection + environment
├── docker-compose.dev.yml
├── turbo.json
└── pnpm-workspace.yaml
```

The `/settings` page used to exist; it was consolidated into the avatar dropdown (`UserMenu`) in the chat header — appearance, language and sign-out all live there now.

## Deployment

### Frontend → Vercel

1. Import the repo in Vercel.
2. **Root Directory:** `apps/web`
3. **Framework:** Next.js (auto-detected; don't override the build command).
4. Set every variable from `apps/web/.env.local` in the Vercel dashboard. `NEXT_PUBLIC_API_URL` should point to the deployed backend URL once you have it.
5. Deploy.

### Backend → Railway / Fly.io / any container host

The provided `apps/api/Dockerfile` is multi-stage (deps → builder → runner), runs as a non-root `node` user, and ships a `HEALTHCHECK` against `/api/v1/health`.

Railway example:

- **Root Directory:** repo root (the Dockerfile uses workspace-aware copies).
- **Dockerfile path:** `apps/api/Dockerfile`
- **Healthcheck path:** `/api/v1/health`
- Set every variable from `apps/api/.env` in the Railway dashboard. `CORS_ORIGIN` must include the Vercel URL.

### Firebase

```bash
cd firebase
firebase deploy --only firestore:rules --project <project-id>
```
