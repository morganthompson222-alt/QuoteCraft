# LOCKS.md

File ownership registry.

Rules:
- Must lock a file before editing.
- Must unlock when task is DONE.
- If a file is locked by another agent, stop.
- Never modify files owned by another agent.

---

FILE: app/login/page.tsx
OWNER: Agent A
TASK: Build login UI
STATUS: UNLOCKED

---

FILE: app/layout.tsx
OWNER: Agent A
TASK: Create Next.js App Router structure
STATUS: UNLOCKED

---

FILE: app/globals.css
OWNER: Agent A
TASK: Create Next.js App Router structure
STATUS: UNLOCKED

---

FILE: app/page.tsx
OWNER: Agent A
TASK: Create landing page
STATUS: UNLOCKED

---

FILE: app/signup/page.tsx
OWNER: Agent A
TASK: Build signup page UI
STATUS: UNLOCKED

---

FILE: components/AppShell.tsx
OWNER: Agent A
TASK: Build global layout shell
STATUS: UNLOCKED

---

FILE: components/auth/AuthForm.tsx
OWNER: Agent A
TASK: Create auth form components; Connect auth forms to documented auth endpoints
STATUS: UNLOCKED

---

FILE: app/customers/page.tsx
OWNER: Agent A
TASK: Customer list page UI
STATUS: UNLOCKED

---

FILE: components/customers/CustomerListPage.tsx
OWNER: Agent A
TASK: Customer list page UI
STATUS: UNLOCKED

---

FILE: app/globals.css
OWNER: Agent A
TASK: Batch A-2026-06-05-01
STATUS: UNLOCKED

---

FILE: database/schema.sql
OWNER: Agent B
TASK: Create Supabase schema
STATUS: UNLOCKED

---

FILE: src/lib/*
OWNER: Agent B
TASK: Backend infrastructure (validation, stripe, supabase clients)
STATUS: UNLOCKED

---

FILE: src/app/api/*
OWNER: Agent B
TASK: All API routes (auth, customers, quotes, AI, Stripe)
STATUS: UNLOCKED

---

FILE: src/types/database.ts
OWNER: Agent B
TASK: Database types
STATUS: UNLOCKED

---

FILE: src/middleware.ts
OWNER: Agent B
TASK: Auth middleware
STATUS: UNLOCKED

---

FILE: app/dashboard/page.tsx
OWNER: Agent A
TASK: Dashboard UI (Batch A-2026-06-05-01)
STATUS: UNLOCKED

---

FILE: components/dashboard/DashboardPage.tsx
OWNER: Agent A
TASK: Dashboard UI (Batch A-2026-06-05-01)
STATUS: UNLOCKED

---

FILE: app/quotes/page.tsx
OWNER: Agent A
TASK: Quote list page UI (Batch A-2026-06-05-01)
STATUS: UNLOCKED

---

FILE: app/quotes/new/page.tsx
OWNER: Agent A
TASK: Quote builder form UI (Batch A-2026-06-05-01)
STATUS: UNLOCKED

---

FILE: app/quotes/[id]/page.tsx
OWNER: Agent A
TASK: Quote preview screen (Batch A-2026-06-05-01)
STATUS: UNLOCKED

---

FILE: app/settings/page.tsx
OWNER: Agent A
TASK: Billing page UI (Batch A-2026-06-05-01)
STATUS: UNLOCKED

---

FILE: components/Modal.tsx
OWNER: Agent A
TASK: Customer create modal (Batch A-2026-06-05-01)
STATUS: UNLOCKED

---

FILE: components/quotes/QuoteBuilderPage.tsx
OWNER: Agent A
TASK: Quote builder form UI (Batch A-2026-06-05-01)
STATUS: UNLOCKED

---

FILE: components/quotes/QuotePreviewPage.tsx
OWNER: Agent A
TASK: Quote preview screen (Batch A-2026-06-05-01)
STATUS: UNLOCKED

---

FILE: components/quotes/QuoteListPage.tsx
OWNER: Agent A
TASK: Quote list page UI (Batch A-2026-06-05-01)
STATUS: UNLOCKED

---

FILE: components/customers/CustomerCreateModal.tsx
OWNER: Agent A
TASK: Customer create modal (Batch A-2026-06-05-01)
STATUS: UNLOCKED

---

FILE: components/customers/CustomerEditModal.tsx
OWNER: Agent A
TASK: Customer edit modal (Batch A-2026-06-05-01)
STATUS: UNLOCKED

---

FILE: components/customers/CustomerDetailPage.tsx
OWNER: Agent A
TASK: Customer detail page UI (Batch A-2026-06-05-01)
STATUS: UNLOCKED

---

FILE: components/settings/BillingPage.tsx
OWNER: Agent A
TASK: Billing page UI (Batch A-2026-06-05-01)
STATUS: UNLOCKED

---

FILE: src/app/api/dashboard/summary/route.ts
OWNER: Agent B
TASK: Dashboard summary endpoint
STATUS: UNLOCKED

---

FILE: src/app/api/billing/status/route.ts
OWNER: Agent B
TASK: Billing status endpoint
STATUS: UNLOCKED
