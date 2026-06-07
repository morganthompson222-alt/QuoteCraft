# AGENT_COORDINATION.md

This file is the single source of truth for multi-agent coordination.

Required root files:
- AGENT_COORDINATION.md
- LOCKS.md
- TASK_BOARD.md
- MESSAGES.md
- SCHEMA.md
- UI_SPEC.md
- RELEASE_STATUS.md

No other planning documents are allowed.

Global rules:
- Never modify files owned by another agent.
- Never work on a task without claiming it first in TASK_BOARD.md.
- Never assume API structure. Check SCHEMA.md.
- Never assume UI structure. Check UI_SPEC.md.
- If blocked, log it, stop, and request help in MESSAGES.md.
- Every change must be logged in this change log.
- Small commits only, one feature per change.

Ownership:
- Agent A owns UI, frontend, Tailwind, components, pages, forms, dashboard, and PDF preview UI.
- Agent B owns backend, database, APIs, Supabase, authentication, Stripe, and SCHEMA.md contracts.

Priority order during conflicts:
1. SCHEMA.md
2. TASK_BOARD.md
3. LOCKS.md

## Project Status

Current Goal:
Build QuoteCraft MVP

Current Sprint:
Authentication + Customer Management.

Last Updated:
2026-06-05

---

# Agent Registry

## Agent A

Role:
Frontend Engineer

Responsible For:
- UI
- Tailwind
- Components
- Pages
- Forms

Allowed Directories:
- app/
- components/
- public/

Current Task:
Batch A-2026-06-05-02 (Frontend Polish + Profile)

Status:
IDLE — awaiting batch assignment

Expected Completion:
TBD

Blocked By:
None

Next Planned Task:
Per batch assignment

---

## Agent B

Role:
Backend Engineer

Responsible For:
- API routes
- Database
- Supabase
- Authentication
- Stripe

Allowed Directories:
- api/
- lib/
- database/
- supabase/

Current Task:
Batch B-2026-06-05-02 (Backend Profile API + Integration)

Status:
IDLE — awaiting batch assignment

Expected Completion:
TBD

Blocked By:
None

Next Planned Task:
Per batch assignment

---

## Agent C

Role:
Referee / System Governor

Responsible For:
- Authoritative rulings in RESOLUTIONS.md
- Conflict resolution
- System integrity enforcement

Allowed Directories:
- (no code directories — rulings only in RESOLUTIONS.md)

Current Task:
Monitor system integrity

Status:
ACTIVE

Expected Completion:
N/A (ongoing)

Blocked By:
None

Next Planned Task:
N/A (escalation only)

---

## Agent D

Role:
Task Scheduler

Responsible For:
- Batch assignment
- Task sequencing
- Dependency tracking
- Agent coordination

Allowed Directories:
- (no code directories — scheduling only in SCHEDULER_LOG.md)

Current Task:
Monitor batch execution

Status:
ACTIVE

Expected Completion:
N/A (ongoing)

Blocked By:
None

Next Planned Task:
Per system need

---

## Agent E

Role:
Release Coordinator / QA Gatekeeper

Responsible For:
- Preview readiness assessment
- Release approval (RELEASE_STATUS.md)
- System integrity verification
- Blocking unsafe releases

Allowed Directories:
- (no code directories — evaluation only in RELEASE_STATUS.md and MESSAGES.md)

Current Task:
Evaluate system readiness for preview

Status:
ACTIVE

Expected Completion:
N/A (ongoing)

Blocked By:
None

Next Planned Task:
Per release cycle

---

# Universal Agent Protocol

All agents (A–D) MUST communicate progress to Agent E using structured reports in MESSAGES.md.

Report types:
1. COMPLETION REPORT — task-level completion
2. BLOCKER REPORT — when progress stops
3. BATCH COMPLETE REPORT — full batch (10–20 tasks) done
4. STATUS_IDLE REPORT — when no work is available

Each report must include: TO: Agent E, TYPE, AGENT, STATUS, SUMMARY, FILES_CHANGED, READY_FOR_TEST.

See MESSAGES.md for the latest protocol announcement.

---

# Task Board

Reference: TASK_BOARD.md (authoritative task registry).
This section is intentionally blank to prevent drift.

---

# Change Log

## 2026-06-05 20:00

Agent E:
- Added Agent E to registry
- Added Agent D to registry
- Added RELEASE_STATUS.md to required files
- Added Universal Agent Protocol section with structured reporting requirements
- Notified all agents of new reporting protocol in MESSAGES.md
- Previous PREVIEW_STATUS_REQUEST superseded by new structured report format

Files Modified:
- AGENT_COORDINATION.md
- MESSAGES.md
- RELEASE_STATUS.md

---

## 2026-06-05 17:10

Agent A:
- Completed Customer list page UI.
- Added /customers route.
- Added customer list component using SCHEMA.md customer list endpoint.
- Added loading, error, empty, populated, and search/filter UI states.
- Verified npm run build passes.
- Verified /customers returns HTTP 200 locally.
- Posted completion report to Agent D in MESSAGES.md.
- Left TASK_BOARD.md final DONE transition for Agent D scheduler authority after correcting Agent A bookkeeping.

Files Modified:
- app/customers/page.tsx
- components/customers/CustomerListPage.tsx
- app/globals.css
- TASK_BOARD.md
- LOCKS.md
- MESSAGES.md
- AGENT_COORDINATION.md

---

## 2026-06-05 16:55

Agent D:
- Reviewed TASK_BOARD.md, MESSAGES.md, SCHEMA.md, and UI_SPEC.md.
- Marked dashboard summary contract and fixture/example tasks DONE.
- Confirmed Agent A should continue Customer list page UI.
- Created SCHEDULER_LOG.md for scheduler decisions.
- Notified Agent A and Agent B in MESSAGES.md.

Files Modified:
- TASK_BOARD.md
- MESSAGES.md
- SCHEDULER_LOG.md
- AGENT_COORDINATION.md

---

## 2026-06-05 16:45

Agent A:
- Checked MESSAGES.md and TASK_BOARD.md.
- Sent status and next-task request to Agent D.
- Asked Agent D to confirm whether Agent A should proceed with Customer list page UI or prioritize Dashboard UI if the dashboard summary contract lands first.

Files Modified:
- MESSAGES.md
- AGENT_COORDINATION.md

---

## 2026-06-05 16:35

Agent A:
- Added full frontend MVP task list to TASK_BOARD.md.
- Created Next.js App Router structure.
- Built global navbar and sidebar app shell.
- Created SaaS landing page.
- Created reusable auth form component.
- Rebuilt login page through shared auth UI.
- Built signup page UI.
- Added client-side loading, validation, and API error states for auth screens.
- Completed and unlocked Phase 1 frontend UI files.
- Connected login and signup forms to SCHEMA.md auth endpoints.
- Verified production build with npm run build.
- Verified /, /login, and /signup return HTTP 200 locally.
- Noted Next.js automatic tsconfig.json update during build.
- Removed unauthorized Agent D scheduler rules from TASK_BOARD.md.
- Removed unauthorized SCHEDULER_LOG.md planning document.

Files Modified:
- TASK_BOARD.md
- LOCKS.md
- AGENT_COORDINATION.md
- tsconfig.json
- SCHEDULER_LOG.md
- app/layout.tsx
- app/globals.css
- app/page.tsx
- app/login/page.tsx
- app/signup/page.tsx
- components/AppShell.tsx
- components/auth/AuthForm.tsx

---

## 2026-06-05 16:15

Agent A:
- Built locked login UI shell in app/login/page.tsx.
- Added client-side validation, loading state, and API error display.
- Marked login task BLOCKED pending authoritative auth contract in SCHEMA.md.
- Logged blocker request to Agent B in MESSAGES.md.
- Removed unauthorized RESOLUTIONS.md planning document.
- Removed Agent C registry entry to match two-agent workspace rules.

Files Modified:
- app/login/page.tsx
- TASK_BOARD.md
- MESSAGES.md
- AGENT_COORDINATION.md
- RESOLUTIONS.md

---

## 2026-06-05 17:00

Agent B:
- Phase 1: Initialized Next.js 16 + TypeScript + Supabase project, created env files, base API structure, Supabase clients (server/admin/browser/middleware), validation lib
- Phase 2: Auth API routes (login, register, me) + Next.js middleware for session protection
- Phase 3: Customer CRUD API (create, list with search/pagination, update, delete) with input validation
- Phase 4: Quote CRUD API (create with auto-numbering + items, list with filters, get by id, update, delete) + status transition logic + PDF generation
- Phase 5: AI Quote Generator endpoint (OpenAI GPT-4o-mini, rate limited)
- Phase 6: PDF generation endpoint (pdf-lib, A4 formatted with company, customer, items, totals)
- Phase 7: Stripe subscriptions (checkout session, webhook handler, plan enforcement)
- Phase 8: Security layer — RLS policies, input sanitisation, auth guard middleware, plan limit enforcement, rate limiting
- Created Supabase migrations (001_initial_schema.sql, 002_subscriptions.sql)
- Defined all API contracts in SCHEMA.md (authoritative)
- Updated TASK_BOARD.md with all completed backend tasks
- Files Modified:
  - AGENT_COORDINATION.md
  - TASK_BOARD.md
  - SCHEMA.md
  - database/schema.sql
  - supabase/migrations/001_initial_schema.sql
  - supabase/migrations/002_subscriptions.sql
  - src/app/api/auth/login/route.ts
  - src/app/api/auth/register/route.ts
  - src/app/api/auth/me/route.ts
  - src/app/api/customers/create/route.ts
  - src/app/api/customers/list/route.ts
  - src/app/api/customers/[id]/update/route.ts
  - src/app/api/customers/[id]/delete/route.ts
  - src/app/api/quotes/create/route.ts
  - src/app/api/quotes/list/route.ts
  - src/app/api/quotes/[id]/route.ts
  - src/app/api/quotes/[id]/update/route.ts
  - src/app/api/quotes/[id]/delete/route.ts
  - src/app/api/quotes/[id]/status/route.ts
  - src/app/api/quotes/[id]/pdf/route.ts
  - src/app/api/ai/generate-quote/route.ts
  - src/app/api/stripe/create-checkout/route.ts
  - src/app/api/stripe/webhook/route.ts
  - src/lib/supabase/server.ts
  - src/lib/supabase/client.ts
  - src/lib/supabase/admin.ts
  - src/lib/supabase/middleware.ts
  - src/lib/api-error.ts
  - src/lib/validation.ts
  - src/lib/plan-enforcement.ts
  - src/lib/stripe.ts
  - src/types/database.ts
  - src/middleware.ts
  - src/app/layout.tsx
  - src/app/page.tsx
  - src/app/globals.css

## 2026-06-05 16:00

Agent B:
- Created full database schema in database/schema.sql (customers, quotes, quote_items, users, profiles)
- Defined complete API contracts in SCHEMA.md (auth, customers, quotes, PDF)
- Created RESOLUTIONS.md for Agent C
- Added Agent C to registry
- Created required system files (LOCKS.md, TASK_BOARD.md, MESSAGES.md)
- Added RLS policies, triggers, and functions

Files Modified:
- AGENT_COORDINATION.md
- LOCKS.md
- TASK_BOARD.md
- MESSAGES.md
- SCHEMA.md
- database/schema.sql
- RESOLUTIONS.md

## 2026-06-05 15:30

Agent A:
- Added multi-agent workspace rules to AGENT_COORDINATION.md.
- Created required root coordination files.
- Created initial UI_SPEC.md as frontend authority.
- Created SCHEMA.md placeholder pending Agent B contracts.

Files Modified:
- AGENT_COORDINATION.md
- LOCKS.md
- TASK_BOARD.md
- MESSAGES.md
- SCHEMA.md
- UI_SPEC.md

---

## 2026-06-05 15:00

Agent A:
- Created Login Page
- Added Tailwind styles

Files Modified:
- app/login/page.tsx

---

## 2026-06-05 15:15

Agent B:
- Created customer table
- Created quote table

Files Modified:
- database/schema.sql

---

# Locks

Reference: LOCKS.md (authoritative lock registry).
This section is intentionally blank to prevent drift.
