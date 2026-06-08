# JobStacker

Quote generation platform for tradespeople. Create professional customer quotes, manage estimates, track status, and export to PDF.

## Tech stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript
- **UI:** CSS custom properties + BEM-style classes (no Tailwind)
- **Database:** Supabase (PostgreSQL + auth)
- **AI:** OpenAI API for natural language quote generation
- **Payments:** Stripe (subscriptions)
- **Testing:** Playwright (E2E)

## Architecture

```
app/
  page.tsx            Landing page
  login/              Auth (login)
  signup/             Auth (signup)
  dashboard/          Workspace overview
  customers/          Customer list
  customers/[id]/     Customer detail
  quotes/             Quote list
  quotes/new/         Quote builder (with AI generation)
  quotes/[id]/        Quote preview / PDF / status
  settings/           Profile + billing
  terms/              Terms of service
  privacy/            Privacy policy
  api/*               Backend APIs (Agent B)
  globals.css         All styles

components/           Reusable UI components
  Modal.tsx
  ConfirmDialog.tsx
  Toast.tsx
  OnboardingWizard.tsx
  AppShell.tsx
  auth/AuthForm.tsx
  customers/CustomerListPage.tsx
  customers/CustomerCreateModal.tsx
  customers/CustomerEditModal.tsx
  customers/CustomerDetailPage.tsx
  dashboard/DashboardPage.tsx
  quotes/QuoteListPage.tsx
  quotes/QuoteBuilderPage.tsx
  quotes/QuotePreviewPage.tsx
  settings/BillingPage.tsx
  settings/ProfilePage.tsx
  PlanLimitModal.tsx

tests/e2e/            Playwright E2E tests
```

## Environment variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Auth
JWT_SECRET=your_jwt_secret

# Stripe
STRIPE_SECRET_KEY=sk_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_UNLIMITED_PRICE_ID=price_...

# OpenAI
OPENAI_API_KEY=sk-...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
CORS_ALLOWED_ORIGINS=http://localhost:3000
AI_RATE_LIMIT=10
AI_RATE_WINDOW_MS=60000
```

## Getting started

```bash
# Install dependencies
npm install

# Copy and fill in environment variables
cp .env.example .env.local

# Run database migrations (see scripts/)
npm run db:migrate

# Seed demo data
npm run seed

# Start dev server
npm run dev
```

Open http://localhost:3000.

## Commands

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run Next.js lint |
| `npx playwright test` | Run E2E tests |

## Deployment

### Docker (recommended)

```bash
# Build image
docker build -t quotecraft .

# Run with env file
docker run -p 3000:3000 --env-file .env.local quotecraft
```

### Docker Compose

```bash
docker compose up -d
```

### Production build (standalone)

```bash
# Build
npm run build

# Start (uses standalone output)
node .next/standalone/server.js
```

### Required services

JobStacker requires these external services:
- **Supabase** — Database + Auth (project must exist with migrations applied)
- **Stripe** — Subscription billing (products and prices configured)
- **OpenAI** — AI quote generation (optional, disabled for free tier)

### Database setup

```bash
# Apply Supabase migrations from supabase/migrations/
# Or use the Supabase dashboard SQL editor

# Seed demo data (requires SUPABASE_SERVICE_ROLE_KEY)
cp .env.example .env.local  # Fill in your credentials
npm run seed
```

See `Dockerfile` and `docker-compose.yml` for production configuration.

## API

All API endpoints are documented in [SCHEMA.md](./SCHEMA.md).

## Agents

This project is built by a multi-agent system:

| Agent | Role |
|---|---|
| Agent A | Frontend (UI, components, styles) |
| Agent B | Backend (APIs, database, Stripe, Supabase) |
| Agent C | Conflict resolver |
| Agent D | Task scheduler |
| Agent E | Release / QA gatekeeper |

See [TASK_BOARD.md](./TASK_BOARD.md) for task tracking and [MESSAGES.md](./MESSAGES.md) for agent communication.
