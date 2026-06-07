# TASK_BOARD.md

Task and status registry.

Rules:
- Only one OWNER per task.
- No duplicate tasks.
- Must claim a task before working.
- Must mark status changes immediately.
- Only Agent D assigns or reassigns tasks.
- Allowed statuses: TODO, ASSIGNED, IN_PROGRESS, BLOCKED, DONE.
- Agent D controls transitions: TODO to ASSIGNED, BLOCKED to ASSIGNED, and reassignment for stalled IN_PROGRESS tasks.

---

All Phase 1-8 core tasks complete as of 2026-06-05.

Core features built:
- Project structure, Supabase schema, env setup
- Auth: login, register, me, middleware
- Customers: CRUD, search/pagination, detail, quote history, deletion guard
- Quotes: CRUD, status transitions, sort/pagination, preview, PDF
- AI: quote generation with rate limits + error codes
- Billing: Stripe checkout, webhook, subscription status, plan limits
- Dashboard: summary endpoint, query optimization
- Error envelope: standardized across all APIs
- Tests: smoke tests, plan enforcement tests, profile API tests
- Health endpoint, rate limit headers, quote collision safety, E2E setup
- Frontend: landing, auth, dashboard, customers (list/detail/create/edit), quotes (list/builder/preview/PDF), AI (generate/edit/save), billing, settings, profile
- UX: toast notifications, 404, error boundary, plan limit modal, delete confirmations, loading skeletons, empty states, mobile responsive, route transitions
- Database: migrations 001-004 (schema, subscriptions, profile fields, atomic quote numbering)

---

Remaining work for MVP completion:

## Batch A-2026-06-05-03 (Frontend: MVP Final Polish)

### TASK: First-time onboarding / setup wizard
OWNER: Agent A
STATUS: DONE
DEPENDENCIES: profile API

### TASK: Terms of service page
OWNER: Agent A
STATUS: DONE
DEPENDENCIES: none

### TASK: Privacy policy page
OWNER: Agent A
STATUS: DONE
DEPENDENCIES: none

### TASK: Keyboard accessibility pass
OWNER: Agent A
STATUS: DONE
DEPENDENCIES: none

### TASK: Meta tags / SEO pass for landing page
OWNER: Agent A
STATUS: DONE
DEPENDENCIES: none

### TASK: Favicon + PWA manifest
OWNER: Agent A
STATUS: DONE
DEPENDENCIES: none

### TASK: Form autofill / browser save support
OWNER: Agent A
STATUS: DONE
DEPENDENCIES: none

### TASK: Final production build verification
OWNER: Agent A
STATUS: DONE
DEPENDENCIES: none

---

## Batch B-2026-06-05-03 (Backend: Deployment & Hardening) — COMPLETE

### TASK: Dockerfile for production build
OWNER: Agent B
STATUS: DONE
DEPENDENCIES: none

### TASK: Docker compose for local dev
OWNER: Agent B
STATUS: DONE
DEPENDENCIES: Dockerfile for production build

### TASK: GitHub Actions CI workflow
OWNER: Agent B
STATUS: DONE
DEPENDENCIES: none

### TASK: Environment variable validation at startup
OWNER: Agent B
STATUS: DONE
DEPENDENCIES: none

### TASK: Database seed script (demo data)
OWNER: Agent B
STATUS: DONE
DEPENDENCIES: none

### TASK: Structured logging middleware
OWNER: Agent B
STATUS: DONE
DEPENDENCIES: none

### TASK: CORS configuration for API
OWNER: Agent B
STATUS: DONE
DEPENDENCIES: none

### TASK: CSRF protection
OWNER: Agent B
STATUS: DONE
DEPENDENCIES: none

### TASK: API response compression
OWNER: Agent B
STATUS: DONE
DEPENDENCIES: none

### TASK: Rate limiting config via env vars
OWNER: Agent B
STATUS: DONE
DEPENDENCIES: none

---

## Batch A-2026-06-05-04 (Frontend: E2E Tests & Documentation)

### TASK: E2E tests for auth flow (login, signup, logout)
OWNER: Agent A
STATUS: ASSIGNED
DEPENDENCIES: Playwright setup

### TASK: E2E tests for customer CRUD flow
OWNER: Agent A
STATUS: ASSIGNED
DEPENDENCIES: Playwright setup

### TASK: E2E tests for quote creation + AI generation
OWNER: Agent A
STATUS: ASSIGNED
DEPENDENCIES: Playwright setup

### TASK: E2E tests for quote lifecycle (status transitions)
OWNER: Agent A
STATUS: ASSIGNED
DEPENDENCIES: Playwright setup

### TASK: E2E tests for billing/settings page
OWNER: Agent A
STATUS: ASSIGNED
DEPENDENCIES: Playwright setup

### TASK: Write project README with setup, env, architecture
OWNER: Agent A
STATUS: ASSIGNED
DEPENDENCIES: none

### TASK: Write CONTRIBUTING.md with dev workflow
OWNER: Agent A
STATUS: ASSIGNED
DEPENDENCIES: none

### TASK: Verify all E2E tests pass
OWNER: Agent A
STATUS: ASSIGNED
DEPENDENCIES: all E2E test tasks

---

## Batch B-2026-06-05-04 (Backend: Final Verification & Documentation) — COMPLETE

### TASK: Run full smoke test suite and fix any failures
OWNER: Agent B
STATUS: DONE
DEPENDENCIES: none

### TASK: Run E2E test suite and fix any failures
OWNER: Agent B
STATUS: DONE
DEPENDENCIES: none

### TASK: Add API documentation for all endpoints
OWNER: Agent B
STATUS: DONE
DEPENDENCIES: none

### TASK: Generate .env.example with all required vars documented
OWNER: Agent B
STATUS: DONE
DEPENDENCIES: none

### TASK: Generate deployment guide for README
OWNER: Agent B
STATUS: DONE
DEPENDENCIES: none

### TASK: Verify Docker build succeeds end-to-end
OWNER: Agent B
STATUS: DONE
DEPENDENCIES: none

### TASK: Add database migration rollback scripts
OWNER: Agent B
STATUS: DONE
DEPENDENCIES: none

### TASK: Add input sanitization edge case coverage
OWNER: Agent B
STATUS: DONE
DEPENDENCIES: none

### TASK: Verify all Stripe webhook event paths
OWNER: Agent B
STATUS: DONE
DEPENDENCIES: none

### TASK: Add API rate limit integration tests
OWNER: Agent B
STATUS: DONE
DEPENDENCIES: none

---

## Batch B-2026-06-05-05 (Backend: Known Limitations & Cleanup) — COMPLETE

### TASK: Fix login 401 with placeholder Supabase creds
OWNER: Agent B
STATUS: DONE
DEPENDENCIES: none

### TASK: Add placeholder credential detection at login route
OWNER: Agent B
STATUS: DONE
DEPENDENCIES: none

### TASK: Verify Docker build succeeds
OWNER: Agent B
STATUS: DONE
DEPENDENCIES: none

### TASK: Run smoke tests — confirm 23/23 pass
OWNER: Agent B
STATUS: DONE
DEPENDENCIES: all above

### TASK: Review Agent A E2E tests for API correctness
OWNER: Agent B
STATUS: DONE
DEPENDENCIES: Agent A E2E test completion

---

## Batch A-2026-06-06-01 (Frontend: Region Localisation UI)

Per Global Region & Localisation Standard — no hardcoded US defaults.

### TASK: Create client-side locale config (locale-client.ts)
OWNER: Agent A
STATUS: ASSIGNED
DEPENDENCIES: none

### TASK: Build country selector component (CountrySelect.tsx)
OWNER: Agent A
STATUS: ASSIGNED
DEPENDENCIES: none

### TASK: Add country/region field to signup form
OWNER: Agent A
STATUS: ASSIGNED
DEPENDENCIES: CountrySelect component

### TASK: Add country/region field to profile settings page
OWNER: Agent A
STATUS: ASSIGNED
DEPENDENCIES: CountrySelect component

### TASK: Build locale-aware address fields component
OWNER: Agent A
STATUS: ASSIGNED
DEPENDENCIES: locale config

### TASK: Global currency display audit — remove all hardcoded "$"
OWNER: Agent A
STATUS: ASSIGNED
DEPENDENCIES: locale config

### TASK: Apply date formatting per region across UI
OWNER: Agent A
STATUS: ASSIGNED
DEPENDENCIES: locale config

### TASK: Add tax label awareness (VAT/GST/Sales Tax)
OWNER: Agent A
STATUS: ASSIGNED
DEPENDENCIES: locale config

### TASK: Update E2E tests for multi-region scenarios
OWNER: Agent A
STATUS: ASSIGNED
DEPENDENCIES: all above

---

## Batch B-2026-06-06-01 (Backend: Region Localisation API)

Per Global Region & Localisation Standard — no hardcoded US defaults.

### TASK: DB migration 005 — add region, currency, locale fields to profiles
OWNER: Agent B
STATUS: ASSIGNED
DEPENDENCIES: none

### TASK: Create server-side locale config utility (lib/locale.ts)
OWNER: Agent B
STATUS: ASSIGNED
DEPENDENCIES: none

### TASK: Create formatCurrency, formatDate, validatePostalCode utilities
OWNER: Agent B
STATUS: ASSIGNED
DEPENDENCIES: locale config

### TASK: Update profile GET/PUT API with region fields
OWNER: Agent B
STATUS: ASSIGNED
DEPENDENCIES: migration

### TASK: Update signup API to accept region
OWNER: Agent B
STATUS: ASSIGNED
DEPENDENCIES: migration

### TASK: Update quote responses with currencyCode
OWNER: Agent B
STATUS: ASSIGNED
DEPENDENCIES: locale config

### TASK: Pass locale context to AI prompt for region-aware quoting
OWNER: Agent B
STATUS: ASSIGNED
DEPENDENCIES: locale config

### TASK: Update SCHEMA.md with region fields and locale docs
OWNER: Agent B
STATUS: ASSIGNED
DEPENDENCIES: all above
