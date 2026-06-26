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
STATUS: DONE
DEPENDENCIES: Playwright setup

### TASK: E2E tests for customer CRUD flow
OWNER: Agent A
STATUS: DONE
DEPENDENCIES: Playwright setup

### TASK: E2E tests for quote creation + AI generation
OWNER: Agent A
STATUS: DONE
DEPENDENCIES: Playwright setup

### TASK: E2E tests for quote lifecycle (status transitions)
OWNER: Agent A
STATUS: DONE
DEPENDENCIES: Playwright setup

### TASK: E2E tests for billing/settings page
OWNER: Agent A
STATUS: DONE
DEPENDENCIES: Playwright setup

### TASK: Write project README with setup, env, architecture
OWNER: Agent A
STATUS: DONE
DEPENDENCIES: none

### TASK: Write CONTRIBUTING.md with dev workflow
OWNER: Agent A
STATUS: DONE
DEPENDENCIES: none

### TASK: Verify all E2E tests pass
OWNER: Agent A
STATUS: DONE
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
STATUS: DONE
DEPENDENCIES: none

### TASK: Build country selector component (CountrySelect.tsx)
OWNER: Agent A
STATUS: IN_PROGRESS
DEPENDENCIES: none

### TASK: Add country/region field to signup form
OWNER: Agent A
STATUS: DONE
DEPENDENCIES: CountrySelect component

### TASK: Add country/region field to profile settings page
OWNER: Agent A
STATUS: DONE
DEPENDENCIES: CountrySelect component

### TASK: Build locale-aware address fields component
OWNER: Agent A
STATUS: DONE
DEPENDENCIES: locale config

### TASK: Global currency display audit — remove all hardcoded "$"
OWNER: Agent A
STATUS: DONE
DEPENDENCIES: locale config

### TASK: Apply date formatting per region across UI
OWNER: Agent A
STATUS: DONE
DEPENDENCIES: locale config

### TASK: Add tax label awareness (VAT/GST/Sales Tax)
OWNER: Agent A
STATUS: DONE
DEPENDENCIES: locale config

### TASK: Update E2E tests for multi-region scenarios
OWNER: Agent A
STATUS: DONE
DEPENDENCIES: all above

---

## Batch B-2026-06-06-01 (Backend: Region Localisation API)

Per Global Region & Localisation Standard — no hardcoded US defaults.

### TASK: DB migration 005 — add region, currency, locale fields to profiles
OWNER: Agent B
STATUS: DONE
DEPENDENCIES: none

### TASK: Create server-side locale config utility (lib/locale.ts)
OWNER: Agent B
STATUS: DONE
DEPENDENCIES: none

### TASK: Create formatCurrency, formatDate, validatePostalCode utilities
OWNER: Agent B
STATUS: DONE
DEPENDENCIES: locale config

### TASK: Update profile GET/PUT API with region fields
OWNER: Agent B
STATUS: DONE
DEPENDENCIES: migration

### TASK: Update signup API to accept region
OWNER: Agent B
STATUS: DONE
DEPENDENCIES: migration

### TASK: Update quote responses with currencyCode
OWNER: Agent B
STATUS: DONE
DEPENDENCIES: locale config

### TASK: Pass locale context to AI prompt for region-aware quoting
OWNER: Agent B
STATUS: DONE
DEPENDENCIES: locale config

### TASK: Update SCHEMA.md with region fields and locale docs
OWNER: Agent B
STATUS: DONE
DEPENDENCIES: all above

---

## Batch A-2026-06-08 (Frontend: Bug Fixes & UI Polish)
STATUS: All Agent A tasks ASSIGNED

Agent A tasks: #1, #2, #3, #6, #12, #14, #16, #17, #18, #19, #21, #24, #27, #29

### TASK: T-001 — Fix landing page redirect bug
OWNER: Agent A
STATUS: DONE
DEPENDENCIES: none
DESC: Unauthenticated users sometimes skip the marketing page and go straight to login. Fix middleware/redirect logic so `/` always renders the marketing page for visitors with no session.

### TASK: T-002 — Replace old popup tutorial with guided tour
OWNER: Agent A
STATUS: ASSIGNED
DEPENDENCIES: all features from this batch must be reflected in the tour
DESC: Replace the static popup tutorial that only works on some accounts with a full guided tour. Tour must follow the user across pages, highlight specific UI elements, and walk them through all key features. Must work consistently on all accounts.

### TASK: T-003 — Share link button auto-copies to clipboard
OWNER: Agent A
STATUS: ASSIGNED
DEPENDENCIES: none
DESC: Clicking the share link button on a quote should immediately copy the link to clipboard (no extra menu). Show a brief "Link copied!" confirmation toast.

### TASK: T-006 — Show share/status menu after PDF download
OWNER: Agent A
STATUS: ASSIGNED
DEPENDENCIES: none
DESC: After downloading a quote PDF, show the same action buttons (mark accepted/rejected) that appear when sharing a link. Don't leave the user on the same screen with no follow-up.

### TASK: T-012 — Clickable jobs for detailed preview
OWNER: Agent A
STATUS: ASSIGNED
DEPENDENCIES: none
DESC: Clicking a job on the Jobs page should open a detailed preview modal/panel showing all job information (customer, dates, status, linked quote, schedule).

### TASK: T-013-UI — Mass-select quotes UI: checkboxes + bulk toolbar
OWNER: Agent A
STATUS: ASSIGNED
DEPENDENCIES: T-013-API (Agent B)
DESC: Add checkboxes to the quote list. When items are selected, show a bulk action toolbar with buttons for archive and status update.

### TASK: T-014 — Fix calendar width overflow
OWNER: Agent A
STATUS: ASSIGNED
DEPENDENCIES: none
DESC: Calendar view exceeds screen width on desktop and mobile. Reduce job preview block sizes or adjust layout so it always fits the viewport. Test across mobile and desktop.

### TASK: T-016 — Date format follows country setting
OWNER: Agent A
STATUS: DONE
DEPENDENCIES: region/localisation API from Agent B
DESC: DD/MM/YYYY for UK, MM/DD/YYYY for US. Audit the entire app for hardcoded date formats and replace with locale-aware formatting using the user's country setting.

### TASK: T-017 — Calendar list view: highlight next upcoming job
OWNER: Agent A
STATUS: ASSIGNED
DEPENDENCIES: none
DESC: Add a visual indicator in the calendar list view marking the next scheduled job from the current date/time. Could be an arrow/label ("Your Next Job") or distinct colour tint.

### TASK: T-018 — Click anywhere on bar for job preview
OWNER: Agent A
STATUS: ASSIGNED
DEPENDENCIES: none
DESC: In job schedule lists and bar views, the entire bar should be clickable to open a job preview, not just a small button or icon.

### TASK: T-019 — Finance page: fix bar chart Y-axis + dynamic scaling
OWNER: Agent A
STATUS: ASSIGNED
DEPENDENCIES: none
DESC: Bars on the Finance page chart go beyond the chart boundary. Make the Y-axis scale dynamically based on the data range so bars always remain contained within the chart area, for both very large and very small values.

### TASK: T-021 — Finance page: prevent large numbers overflowing containers
OWNER: Agent A
STATUS: ASSIGNED
DEPENDENCIES: none
DESC: Apply number abbreviation (£1.2M), text truncation, or container resizing so large financial figures never break out of their display boxes.

### TASK: T-022-UI — Onboarding: service catalogue setup menu
OWNER: Agent A
STATUS: ASSIGNED
DEPENDENCIES: T-022-API (Agent B)
DESC: New onboarding step where users input services: name, unit type (m², hour, item), charge per unit, cost per unit. When creating a quote, selecting a service auto-calculates total charge, total cost, and profit based on job size.

### TASK: T-023-UI — Onboarding: set default tax rate
OWNER: Agent A
STATUS: ASSIGNED
DEPENDENCIES: T-023-API (Agent B)
DESC: Add tax rate field to the onboarding flow from T-022. Editable later in Settings. Once set, auto-apply as a separate line item on all new quotes.

### TASK: T-024 — Dark mode full review and redesign
OWNER: Agent A
STATUS: ASSIGNED
DEPENDENCIES: none
DESC: Audit all text, borders, backgrounds, and interactive elements for contrast and readability issues in dark mode. Redesign the dark mode colour scheme so everything is clearly visible.

### TASK: T-025-UI — Account creation: company info page + logo upload prompt
OWNER: Agent A
STATUS: ASSIGNED
DEPENDENCIES: T-025-API (Agent B)
DESC: Add a company info page during signup (name, address, contact details). After account creation, prompt users to upgrade to a paid plan for logo upload. Uploaded logos must appear on all quote and catalogue PDFs.

### TASK: T-027-UI — Service catalogue: manual text editing + Cleanup button
OWNER: Agent A
STATUS: ASSIGNED
DEPENDENCIES: T-027-API (Agent B)
DESC: Add text editing UI for generated service catalogue content. Add a "Clean Up" button that reformats content into a well-structured, readable layout optimised for PDF export.

### TASK: T-029 — Revenue dashboard: always show current month
OWNER: Agent A
STATUS: ASSIGNED
DEPENDENCIES: none
DESC: Revenue overview is stuck on May. Default to the current calendar month and update automatically as time progresses.

---

## Batch B-2026-06-08 (Backend: Bug Fixes, PDFs & APIs)
STATUS: All Agent B tasks COMPLETE

Agent B tasks: #4, #5, #7, #8, #9, #10, #11, #13, #15, #20, #22, #23, #25, #26, #28

### TASK: T-004 — Expired quotes: update public link + request new quote
OWNER: Agent B
STATUS: DONE
DEPENDENCIES: none
DESC: Public `/q/[id]` page: show "Expired" status, remove accept/decline buttons, add a "Request a New Quote" button that creates a notification for the trader.

### TASK: T-005 — Unarchive quotes + reboot expired quotes
OWNER: Agent B
STATUS: DONE
DEPENDENCIES: none
DESC: Add PATCH endpoint for unarchiving quotes. Add reboot endpoint for expired quotes that reactivates the quote, resets status to draft, regenerates the share link, and makes it accessible again.

### TASK: T-007 — Quote PDF layout: fix overlapping text and spacing
OWNER: Agent B
STATUS: DONE
DEPENDENCIES: none
DESC: Full redesign of the quote PDF template. Fix text overlapping, improve spacing between sections, ensure a professional layout suitable for sending to customers.

### TASK: T-008 — Quote PDF shows "Sent" status not "Draft"
OWNER: Agent B
STATUS: DONE
DEPENDENCIES: none
DESC: When generating/downloading a quote PDF, the status label in the PDF should always display as "Sent" regardless of the internal quote state.

### TASK: T-009 — Customer accept/reject: real-time sync + prominent notifications
OWNER: Agent B
STATUS: DONE
DEPENDENCIES: none
DESC: Ensure quote status syncs in real time when a customer accepts/rejects via public link. Add toast/popup notifications on action. Add a dedicated Notifications page endpoint with full accept/reject history.

### TASK: T-010 — Multi-day jobs: start and end on different dates
OWNER: Agent B
STATUS: DONE
DEPENDENCIES: none
DESC: Add `end_date` field to jobs table. Update job creation/update API to accept separate start and end dates. Update calendar and scheduling logic to handle multi-day spans.

### TASK: T-011 — Job scheduling available on all plans
OWNER: Agent B
STATUS: DONE
DEPENDENCIES: none
DESC: Remove plan-tier gating on job scheduling. Free and 3-month plans must have scheduling access. Update plan enforcement to not block scheduling features.

### TASK: T-013-API — Mass-select quotes: bulk archive + status update endpoints
OWNER: Agent B
STATUS: DONE
DEPENDENCIES: none
DESC: Add bulk PATCH/POST endpoints for archiving multiple quotes and updating statuses on multiple quotes at once. Handle validation and error reporting per-item.

### TASK: T-015 — Mark job status directly from Jobs page + Calendar
OWNER: Agent B
STATUS: DONE
DEPENDENCIES: none
DESC: Add inline status update API that can be called from both the Jobs page and Calendar views without navigating to a separate page.

### TASK: T-020 — AI finance: enable for all accounts with plan-based limits
OWNER: Agent B
STATUS: DONE
DEPENDENCIES: none
DESC: AI finance currently only works on one account. Enable for all users. Implement usage limits based on plan tier (limited queries on free, full access on paid).

### TASK: T-022-API — Onboarding: service catalogue setup API
OWNER: Agent B
STATUS: DONE
DEPENDENCIES: none
DESC: Create API for storing user services (name, unit type, charge per unit, cost per unit). Create endpoint that returns service details for quote auto-calculation (total charge, total cost, profit).

### TASK: T-023-API — Onboarding: default tax rate API
OWNER: Agent B
STATUS: DONE
DEPENDENCIES: T-022-API
DESC: Add default tax rate to profile API. Ensure it auto-applies as a separate line item on all new quotes created via the API.

### TASK: T-025-API — Account creation: company info storage + logo upload
OWNER: Agent B
STATUS: DONE
DEPENDENCIES: none
DESC: Create API for storing company info (name, address, contact). Add logo upload endpoint (3.5MB limit). Ensure logos render on all quote PDFs and catalogue PDFs.

### TASK: T-026 — Service catalogue: use all generated info in PDF export
OWNER: Agent B
STATUS: DONE
DEPENDENCIES: none
DESC: The catalogue PDF currently omits data that is visible during the generate flow. Update the PDF template to include all generated information.

### TASK: T-027-API — Service catalogue: cleanup formatter endpoint
OWNER: Agent B
STATUS: DONE
DEPENDENCIES: none
DESC: Create a cleanup/formatter API that takes raw catalogue text and returns well-structured, readable content optimised for PDF export.

### TASK: T-028 — Service catalogue PDF: fix overlapping elements
OWNER: Agent B
STATUS: DONE
DEPENDENCIES: none
DESC: Audit and fix the catalogue PDF template. Ensure all sections, text blocks, images, and layout elements are properly spaced with no overlap.

### TASK: T-032 — Uploaded logos appear on catalogue PDFs
OWNER: Agent B
STATUS: DONE
DEPENDENCIES: T-025-API
DESC: Ensure company logos uploaded via the account creation flow render on all service catalogue PDF exports, same as quote PDFs.
