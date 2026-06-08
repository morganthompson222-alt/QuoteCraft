# JobStacker — Data Handling, Privacy & Third-Party Sharing Audit

**Date:** 6 June 2026
**Prepared for:** Legal review (Terms & Conditions / Privacy Policy drafting)

---

## 1. APP OVERVIEW

JobStacker is a SaaS application for creating, managing, and accepting job quotes. Users (typically tradespeople or small businesses) sign up, create customer profiles, build quotes with line items, optionally generate quotes via AI, accept quotes into jobs, and manage subscriptions via Stripe.

**Stack:** Next.js 15 (App Router), React 19, TypeScript, Supabase (PostgreSQL + Auth), Stripe Billing, Groq/OpenAI (AI), pdf-lib (PDF generation)
**Deployment:** Docker container, GitHub Actions CI/CD

---

## 2. DATA COLLECTED

### 2.1 Account Data
| Field | Collected at | Stored | Purpose |
|---|---|---|---|
| Email | Signup form | Supabase Auth + public.users table | Authentication, communication, Stripe checkout |
| Password | Signup form | Supabase Auth (hashed — never in app tables) | Authentication |
| Name | Signup form, Profile settings | Supabase Auth metadata + public.users.name | Display, quotes, PDFs |
| Region / Country | Signup form dropdown | public.profiles.region_code | Currency, locale, tax labelling |

### 2.2 Profile Data
| Field | Stored | Purpose |
|---|---|---|
| Company name | public.profiles.company_name | PDF headers, quotes |
| Phone | public.profiles.phone | PDF generation |
| Address, City, State, ZIP | public.profiles.{address,city,state,zip} | PDF generation, company info |
| Default tax rate | public.profiles.default_tax_rate | Quote tax calculation |
| Quote numbering prefix | public.profiles.quote_prefix | Quote identifiers |
| Logo URL (optional) | public.profiles.logo_url | Company branding on PDFs |
| Currency code | public.profiles.currency_code | Derived from region — formatting |
| Locale | public.profiles.locale | Derived from region — formatting |

### 2.3 Customer Data (entered by user)
| Field | Stored | Purpose |
|---|---|---|
| Name | public.customers.name | Quote display, PDFs |
| Email | public.customers.email | Contact reference |
| Phone | public.customers.phone | Contact reference |
| Company | public.customers.company | Display |
| Address, City, State, ZIP | public.customers.{address,city,state,zip} | Quote/PDF details |
| Country | public.customers.country | Localisation (defaults to "US") |
| Notes | public.customers.notes | Internal reference |

### 2.4 Quote & Financial Data
| Field | Stored | Purpose |
|---|---|---|
| Quote number | public.quotes.quote_number | Identification |
| Line items (description, qty, unit price, total) | public.quote_items | Pricing, PDF |
| Tax rate | public.quotes.tax_rate | Tax calculation |
| Subtotal, tax amount, total | public.quotes (auto-calculated by DB triggers) | Pricing |
| Notes | public.quotes.notes | Quote details |
| Valid until date | public.quotes.valid_until | Quote expiry |
| Status (draft/sent/accepted/declined) | public.quotes.status | Workflow |
| Payment status (paid, paid_at) | public.quotes.{paid,paid_at} | Payment tracking |
| Job scheduling (date, start, end) | public.quotes.{job_date,start_time,end_time} | Scheduling |
| Tax rate on quote | public.quotes.tax_rate | Tax calculation |

### 2.5 Job Data
| Field | Stored | Purpose |
|---|---|---|
| Job title | public.jobs.job_title | Calendar display |
| Customer name | public.jobs.customer_name | Calendar display |
| Date, start/end time | public.jobs.{job_date,start_time,end_time} | Scheduling |
| Location | public.jobs.location | Calendar |
| Notes | public.jobs.notes | Internal |
| Status | public.jobs.status | Workflow tracking |

### 2.6 Subscription & Billing Data
| Field | Stored | Source |
|---|---|---|
| Plan tier (free/starter/pro/business) | public.profiles.plan_tier | Stripe webhook or admin override |
| Stripe customer ID | public.profiles.stripe_customer_id | Stripe webhook |
| Stripe subscription ID | public.profiles.stripe_subscription_id | Stripe webhook |
| Subscription status | public.profiles.subscription_status | Stripe webhook |
| Period start/end dates | public.profiles.{subscription_period_start,subscription_period_end} | Stripe webhook |

---

## 3. DATA STORED IN USER'S BROWSER (localStorage)

| Key | Data | Purpose |
|---|---|---|
| `jobstacker_token` | JWT authentication token | API authentication (persisted until logout) |
| `jobstacker_region` | Region code (e.g. "GB", "US") | Currency/date formatting preference |
| `jobstacker_onboarded` | Boolean flag | Tracks whether onboarding tour completed |
| `jobstacker_onboarding_dismissed` | Boolean flag | Tracks dashboard wizard dismissal |

**Cookies:** Supabase SSR middleware sets `supabase-auth-token` cookie (encrypted session data) for server-side authentication. No third-party or tracking cookies are used.

---

## 4. THIRD-PARTY SERVICES & DATA SHARING

### 4.1 Supabase (Database + Authentication)
- **Provider:** Supabase Inc. (US-based)
- **Data shared:** ALL stored data — user accounts, profiles, customers, quotes, jobs, subscription metadata
- **Basis:** Core infrastructure (PostgreSQL database and authentication service)
- **Security:** All connections over HTTPS. Row-Level Security policies restrict data to the authenticated user. Admin operations use a service role key (privileged bypass).
- **Supabase DPA:** Required. Confirm with Supabase directly.

### 4.2 Stripe (Payment Processing)
- **Provider:** Stripe Inc. (US-based)
- **Data sent:** User email, user ID, price selection — to Stripe Checkout
- **Data received:** Stripe subscription events, customer IDs, subscription statuses, period dates
- **Payment card details:** Never touch JobStacker servers — handled entirely by Stripe.js/Checkout
- **Stripe DPA:** Standard Stripe Data Processing Agreement available at stripe.com/dpa

### 4.3 AI Providers — Groq / OpenAI
- **Providers:** Groq Inc. (US-based) or OpenAI L.L.C. (US-based)
- **Data sent:** A system prompt with pricing instructions, plus the user's natural language input (verbatim). The user types a description of work needed (e.g. "Replace a leaking hot water cylinder, 2 storey house, supply and install") and this exact text is forwarded to the AI provider.
- **Data returned:** Structured JSON with job description, materials, labour cost, and total price.
- **What is NOT shared:** Customer names, emails, phone numbers, addresses, or any personally identifiable information of the end customer. Only the work description is sent.
- **Opt-out mechanism:** Users on free tier cannot access AI features. Users on paid tiers must use AI to generate quotes — there is no separate AI opt-out toggle at time of audit.
- **AI DPA:** Groq and OpenAI each offer Data Processing Agreements. Required for GDPR compliance.
- **Note:** The system prompt is currently hardcoded to use "GBP pricing" — this should be region-aware.

### 4.4 No Analytics, No Ad Networks, No Tracking
No Google Analytics, Facebook Pixel, Mixpanel, Hotjar, or any analytics/tracking scripts are present in the codebase. No data is sold or shared with advertisers.

### 4.5 GitHub Actions (CI/CD)
- **Data shared:** Source code only (no user data, no environment secrets beyond what is configured in GitHub secrets)
- **Purpose:** Automated builds, type checking, linting, Docker builds

---

## 5. DATA FLOW DIAGRAM (Textual)

```
USER'S BROWSER
  │
  │  localStorage: jobstacker_token (JWT), jobstacker_region, onboarding flags
  │
  ├──> POST /api/auth/login ───> Supabase Auth ───> Returns JWT token
  ├──> POST /api/auth/signup ──> Supabase Auth + creates profile ──> Returns JWT token
  │
  ├──> API Routes (all require Bearer token)
  │      ├─ Customers CRUD ──> Supabase PostgreSQL (RLS-protected)
  │      ├─ Quotes CRUD   ──> Supabase PostgreSQL (RLS-protected)
  │      ├─ AI /generate-quote ──> Groq/OpenAI API ──> Returns structured JSON
  │      ├─ Stripe /create-checkout ──> Stripe API ──> Returns checkout URL [user leaves app]
  │      ├─ Billing status ──> Supabase PostgreSQL (RLS-protected)
  │      ├─ Dashboard ──> Supabase PostgreSQL (RLS-protected)
  │      └─ PDF generation ──> Server-side pdf-lib ──> Downloads PDF
  │
  └──> Stripe Checkout (external) ──> Stripe webhook ──> POST /api/stripe/webhook ──> Updates subscription in DB

DATA LOCATIONS:
  ┌───────────────────────────────────────────────────────┐
  │  Supabase (US)      ← All user, customer, quote data  │
  │  Stripe (US)        ← Email, user ID, price selection │
  │  Groq/OpenAI (US)   ← Natural language work description│
  └───────────────────────────────────────────────────────┘
```

---

## 6. SECURITY POSTURE

### 6.1 In Transit
- All API connections use HTTPS (enforced for production URLs)
- Stripe, Supabase, Groq, OpenAI APIs all accessed over HTTPS

### 6.2 At Rest (Database)
- Supabase PostgreSQL encryption at rest (managed by Supabase)
- No application-level encryption of PII fields (customer names, emails, addresses, phone numbers stored as plaintext)
- Passwords are bcrypt-hashed by Supabase Auth

### 6.3 Authentication
- JWT-based (issued and verified by Supabase Auth)
- Bearer token stored in browser localStorage
- All API routes verify the token on every request (`supabase.auth.getUser(token)`)
- Supabase Auth session cookies for server-side middleware
- Logout clears localStorage token and navigates to `/`

### 6.4 Authorization
- Row-Level Security (RLS) on all database tables — users can only access their own data
- Plan enforcement middleware gates features by subscription tier (free tier: 50 customers, 25 quotes/month, no AI; paid tiers: higher limits)
- Admin operations (webhooks, plan changes, initial account setup) use a privileged service role key

### 6.5 Input Protection
- Input sanitisation (string, email, number, UUID, array, boolean, enum validation)
- Standardised error responses (no stack traces leaked to client)
- CORS validation against allowed origins
- CSRF origin validation for state-changing methods

### 6.6 Rate Limiting
- In-memory rate limiting for AI endpoint (10 requests per 60-second window, configurable)
- No rate limiting on other endpoints

### 6.7 Logging
- Structured JSON logs to stdout/stderr only (no persistent log storage)
- Logged fields: request ID, HTTP method, path, status code, duration, error messages
- No PII intentionally logged; error messages could contain user-submitted data in edge cases
- No audit logging or access logging implemented

---

## 7. KNOWN SECURITY & PRIVACY GAPS

| # | Issue | Severity | Recommendation |
|---|---|---|---|
| 1 | **Auth token in localStorage** — vulnerable to XSS. No HttpOnly/Secure/SameSite flags. | Medium | Switch to HttpOnly cookie-based token storage via Supabase SSR (already partially done via cookies but frontend still stores token in localStorage for API calls). |
| 2 | **No account deletion mechanism** — the privacy policy claims data is removed within 30 days of account deletion, but no deletion endpoint or automated process exists. | High | Implement a self-service account deletion API and a background job to purge data. |
| 3 | **No data export mechanism** — GDPR Article 20 (data portability) requires an export endpoint. Not implemented. | Medium | Implement a GET /api/account/export endpoint. |
| 4 | **No explicit consent collection** — users are not asked to agree to terms or privacy policy during signup. GDPR lawful basis unclear. | High | Add a mandatory checkbox to signup form: "I agree to the Terms & Conditions and Privacy Policy." |
| 5 | **No AI disclosure in Privacy Policy** — the current privacy policy (in-app) does not mention Groq/OpenAI or that user content is sent to AI providers. | High | Disclose AI data sharing prominently in the privacy policy. |
| 6 | **Customer PII stored as plaintext** — emails, names, phones, addresses have no application-layer encryption. | Medium | Evaluate field-level encryption or document the risk. |
| 7 | **No Data Processing Agreements (DPAs) configured** — required for GDPR-compliant use of Supabase, Groq, and OpenAI. | High | Sign DPAs with Supabase, Groq, and OpenAI. |
| 8 | **International data transfers to US without adequacy safeguards** — all data processors are US-based. UK GDPR requires an adequacy decision or Standard Contractual Clauses (SCCs). | High | Obtain SCCs from Supabase, Groq, and OpenAI. |
| 9 | **No cookie consent banner** — localStorage and cookies are set without consent. PECR (UK) / ePrivacy Directive requires consent for non-essential cookies/storage. | Medium | Add a cookie consent banner to obtain consent for localStorage and auth cookies, or document which cookies are strictly necessary. |
| 10 | **Hardcoded AI system prompt** — currently instructs AI to use "GBP pricing" regardless of user's region. May produce region-inappropriate quotes. | Low | Make pricing instruction region-aware (already on roadmap). |
| 11 | **In-memory rate limiting** — resets on server restart. Not suitable for multi-instance deployments. | Low | Move rate limiting to a persistent store if scaling beyond single instance. |
| 12 | **No privacy policy link in signup/settings** — the privacy policy exists at /privacy but is not linked from signup or account settings. | Medium | Add links to privacy policy and terms of service in the signup flow and settings page. |

---

## 8. REGULATORY CONSIDERATIONS

### 8.1 UK GDPR / EU GDPR
- **Data controller:** The JobStacker operator/company
- **Data processors:** Supabase, Stripe, Groq, OpenAI
- **Personal data processed:** Email, name, phone, address (users + their customers)
- **Processing purpose:** Provision of quoting SaaS service
- **Lawful basis:** Not yet explicit (recommend: contractual necessity + consent for AI features)
- **Data subject rights:** Right to access, rectification, deletion, portability — deletion and portability not yet implemented
- **International transfers:** All processors are US-based — Standard Contractual Clauses required
- **Data breach notification:** No breach detection or notification process in place
- **DPIA:** A Data Protection Impact Assessment is recommended given the use of AI and processing of third-party customer data

### 8.2 PECR (UK Privacy and Electronic Communications Regulations)
- Cookies/localStorage are set without consent — consent banner required
- No marketing emails, so no PECR marketing consent issues

### 8.3 CCPA/CPRA (California)
- No data sale occurs
- Right to delete and right to know not yet technically implemented
- The app could serve California residents

### 8.4 PCI DSS
- Payment card data is handled entirely by Stripe — QuotesCraft does not touch card numbers
- SAQ A or SAQ A-EP compliance likely sufficient (Stripe Checkout integration)

---

## 9. URGENT ACTIONS FOR LAUNCH PREPAREDNESS

1. **Add terms/privacy consent checkbox to signup**
2. **Implement account deletion endpoint + 30-day purge job**
3. **Disclose AI data sharing in Privacy Policy**
4. **Sign DPAs with Supabase, Groq, OpenAI**
5. **Add cookie consent banner** (or document cookies as strictly necessary)
6. **Add privacy policy / terms links to signup and settings pages**
7. **Update the in-app Privacy Policy page** to cover AI providers, cookies, and data retention details

---

## 10. SUGGESTED TERMS & CONDITIONS TOPICS

Based on the codebase, Terms should cover:

- **Service description:** Quote and job management SaaS
- **Account registration:** Requirements, accuracy obligations, password security
- **Subscription & billing:** Tiered plans (free/starter/pro/business), Stripe processing, auto-renewal, cancellation
- **User content:** Customer data, quote data entered by user — user retains ownership, grants licence to operate service
- **Third-party customer data:** User warrants they have lawful basis to enter their customers' personal data
- **AI features:** Description of AI quote generation, disclaimer that AI-generated content is for assistance only, user responsibility for final quotes
- **Acceptable use:** No illegal content, no misuse of customer data
- **Intellectual property:** App code remains with JobStacker, user data remains with user
- **Limitation of liability:** Standard SaaS limitations
- **Data retention & deletion:** Data retained while account active, deleted within 30 days of account deletion
- **Governing law:** Specify jurisdiction

---

## 11. SUGGESTED PRIVACY POLICY TOPICS

- **Data controller identity & contact**
- **Categories of personal data** (account data, profile data, customer data entered by user, quote data, billing data)
- **Purposes of processing** (service provision, authentication, payment, AI features, support)
- **Lawful basis** for each purpose
- **Third-party data sharing** — full disclosure of Supabase, Stripe, Groq, OpenAI
- **International transfers** — US-based processors, SCCs in place
- **Data retention periods**
- **Data subject rights** (access, rectification, deletion, portability, objection, restriction)
- **Cookie policy** — localStorage usage, auth cookies, how to clear
- **Children's privacy** (not intended for under-18s, no knowing collection)
- **AI data processing** — what is sent, how it's used, opt-out via free tier
- **Contact for privacy inquiries**
- **Policy update procedure**

---

*End of audit report. This document is based on a complete codebase review of all 110+ source files as of 6 June 2026.*
