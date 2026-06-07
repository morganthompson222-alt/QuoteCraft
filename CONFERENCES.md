# QuoteCraft — Build Session Summary

## Session: 6 June 2026

### Legal Audit
- Full codebase audit of all 110+ source files for data handling, privacy, and third-party sharing
- Comprehensive report written to `LEGAL_AUDIT_REPORT.md` for lawyer review
- Key findings: no TOS/privacy consent on signup, no account deletion, no AI disclosure in privacy policy, no DPA with AI providers, no cookie consent banner
- Checklist of urgent pre-launch actions provided

### Signup TOS/Privacy Consent
- Added mandatory checkbox to signup form in `AuthForm.tsx`
- Links open `/terms` and `/privacy` in new tabs
- "Create account" button disabled until checkbox is checked
- E2E tests updated to check the box before submitting

### Job Scheduling UX Overhaul
**Problem:** Clicking "Mark accepted" on quotes silently accepted without prompting for scheduling. Date/time inputs were buried in a gray bar that users overlooked. Most quotes got accepted without ever being scheduled.

**Solution:** When user clicks "Mark accepted", a modal now opens asking **"Schedule this job on your calendar?"** with date/start/end time inputs. Two clear options:
- *Accept & Schedule* — creates the calendar job with schedule data
- *Accept without scheduling* — accepts only, skips scheduling

Removed the old inline scheduling section to reduce page clutter. Status banners (yellow/green/schedule prompt) remain for accepted quotes.

**Files changed:**
- `components/quotes/QuotePreviewPage.tsx` — added modal, removed inline scheduling, wired button
- `tests/e2e/quote-lifecycle.spec.ts` — updated accept flow test

### Verified Existing Features
- Customer detail page (`/customers/[id]`) already shows full contact info + all quote history
- Dashboard already has "Jobs next 3 days" stat card + 3-day mini calendar preview

---

## Session Date
7 June 2026

## Overview
Complete SaaS build for tradespeople: quote generation, customer management, job scheduling, AI pricing, PDF exports, revenue analytics, service catalogues, and a fully branded demo account.

---

## Features Built

### Auth & Onboarding
- Robust signup/login using raw `createClient` (no SSR cookies) — works on Vercel
- Middleware auth via `quotecraft_auth` cookie + public paths
- Logout clears auth state completely
- 5-step guided product tour for new accounts (`?tour=1` to replay)
- Terms & Privacy Policy pages with full legal content

### Plans & Pricing
- 5-tier system: Solo (free), Solo Pro (£9.99), Business (£29.99), Growth (£69.99), Enterprise (£150+)
- DB constraint updated: `solo`, `solo_pro`, `business`, `growth`, `enterprise`
- `plan_tier` default changed from `'free'` to `'solo'`
- Test mode plan switcher in settings
- Smart plan card buttons: Upgrade / Switch / Current

### Customers
- 50 realistic UK customers seeded for demo
- Customer detail page with full quote history
- Phone-only customers (email nullable)
- Customer quotes link from calendar

### Quotes
- Full CRUD with line items, tax rates, notes, attachments
- Status workflow: Draft → Sent → Accepted / Rejected / Expired
- Send button with dropdown: Share link (auto-mark sent) / Download PDF
- Paid tracking with receipt PDF generation
- Reminder PDF with "PAYMENT DUE" watermark

### Public Customer Quote Page (`/q/[id]`)
- No account required — customer views quote, accepts or rejects
- Trader gets in-app notification on customer action
- Share button: WhatsApp, Email, SMS, native mobile share, copy link

### AI Quote Generation
- Groq-powered (Llama 3.3 70B), OpenAI-compatible API
- Hybrid pricing engine: user rules → market data → AI estimate
- Custom instructions in Settings: per-service pricing
- AI Clean button reformats messy notes into structured rules
- 28-entry UK market data for fallback pricing
- 15% markup applied automatically

### PDF Exports
- Quote PDF, Reminder PDF, Receipt PDF
- Company logo embed in top-right
- "PAYMENT DUE" / "PAID" watermarks with correct diagonal geometry
- Sender details: company name, phone, email only (no address)
- Job PDF export for clients

### Calendar & Scheduling
- Monthly grid view + filterable list view (All/Scheduled/Progress/Completed/Cancelled)
- Grid/List toggle
- Inline status change dropdown in list view
- Jobs export as `.ics` (Apple Calendar) — bulk and individual
- Job → Quote bidirectional status sync
- Quote scheduling: date set when accepted, job auto-created
- Completed jobs section

### Revenue Dashboard
- Route: `/revenue`
- 4 stat cards: lifetime, this month, last month, month-over-month %
- SVG line/bar chart toggle
- Time selector: 3/6/12 months
- Empty state for no data
- CSV export (paid plans only)

### Service Catalogue (PDF)
- 12 distinct templates: Modern, Tradesperson, Luxury, Construction, Landscaping, Corporate, Price Guide, Magazine, Portfolio, AI Future, Minimalist, Sales
- 25 colour themes
- Cover page + sections per template
- Watermark on free/business tiers
- Live template preview with colour
- Tier-gated: free = Modern only

### Other
- Image upload limit: 3.5MB (logo + quote images)
- Notification bell with unread badge
- Revenue to-date card on dashboard
- 3-day mini calendar on dashboard
- List view sorted soonest-first
- Rejected quotes hide irrelevant action buttons

---

## Demo Account
```
Email: demo@quotecraft.app
Password: demo123456
URL: https://quotecraft026.vercel.app
```
- 50 customers
- 175 quotes across 12 months
- 100+ paid quotes for revenue history
- 50+ accepted quotes with linked jobs
- 5+ upcoming jobs
- Enterprise plan
- Company: Thompson's Landscaping & Maintenance

---

## Live App
```
https://quotecraft026.vercel.app
```

## Important SQL to Run in Supabase
```sql
ALTER TABLE public.profiles ALTER COLUMN plan_tier SET DEFAULT 'solo';
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS job_date DATE;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS start_time TEXT;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS end_time TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS custom_ai_instructions TEXT;
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  quote_id UUID REFERENCES public.quotes(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY notifications_self ON public.notifications FOR ALL USING (user_id = auth.uid());
```

## Vercel Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=https://qhwycqdufvoqdsrajjym.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_aZszcdgmvUD9z-ZTqgSVtA_L4sCCbJi
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFod3ljcWR1ZnZvcWRzcmFqanltIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDczNTQ2MCwiZXhwIjoyMDk2MzExNDYwfQ.woIbhvaxp-2BSn-vQCbqKzT5BnBWtD3m36-6X5KE8Xw
GROQ_API_KEY=gsk_...
```

## CI Status
- TypeScript check: ✅ passing
- Build: ✅ passing
- Docker build: ✅ passing
- Lint: skipped (Next.js 16 removed built-in ESLint support, replaced with `eslint`)

---

# MEETING — 7 June 2026 (Afternoon Update)

## Status Updates

### Catalogue System — COMPLETE
- **12 templates**: Modern, Tradesperson, Luxury, Construction, Landscaping, Corporate, Price Guide, Magazine, Portfolio, AI Future, Minimalist, Sales
- **25 colour themes**: Forest Green, Emerald, Sage, Olive, Navy, Royal Blue, Sky Blue, Steel Blue, Teal, Turquoise, Charcoal, Slate, Graphite, Burgundy, Wine, Red, Copper, Orange, Gold, Purple, Plum, Brown, Sandstone, Midnight, Indigo
- Each template has distinct cover page + layout style
- Live template preview in settings
- Colour applied independently from template
- Watermark on free/business tiers

### Quote List — COMPLETE
- New "Scheduled" column in quote records table
- "View in calendar" link when job is scheduled
- "Schedule this job" button when accepted but not scheduled (opens JobModal)

### PDF Export — FIXED
- Removed sender address from all 3 PDF types (quote, reminder, receipt)
- Only shows: company name, phone, email

### Demo Account — READY
- 50 customers, 175 quotes across 12 months
- Full revenue history in dashboard
- Active calendar with scheduled/completed jobs
- 10+ notifications

## Remaining Items
- E2E tests need updates for new features
- Stripe checkout flow needs real price IDs
- Some DB migrations may need running in Supabase

## Action Items
- **User:** Run remaining SQL migrations in Supabase
- **User:** Test Vercel app at `https://quotecraft026.vercel.app`
- **Agent E:** Verify all 12 catalogue templates generate correctly
