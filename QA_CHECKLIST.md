# QuoteCraft — QA Test Checklist

## Demo Account (for live testing)
URL: https://quotecraft026.vercel.app
Email: demo@quotecraft.app
Password: demo123456
(Enterprise plan, 50 customers, 175 quotes, 50+ jobs)

---

## 1. Auth & Signup

- [ ] **Signup page loads** — `/signup` shows form with Name, Region, Email, Password, TOS checkbox
- [ ] **Region selector works** — dropdown shows UK/US/CA/AU/EU, defaults to UK
- [ ] **TOS checkbox required** — "Create account" is disabled until checkbox is checked
- [ ] **TOS/Privacy links open** — Terms of Service & Privacy Policy open in new tabs
- [ ] **Signup with all fields** — creates account, redirects to dashboard
- [ ] **Signup with missing Name** — shows "Name is required"
- [ ] **Signup with missing Email** — shows "Email is required"  
- [ ] **Signup with missing Password** — shows "Password is required"
- [ ] **Signup with unchecked TOS** — button stays disabled
- [ ] **Signup with existing email** — shows appropriate error
- [ ] **Login page loads** — `/login` shows "Welcome back"
- [ ] **Login with correct credentials** — redirects to `/dashboard`
- [ ] **Login with wrong credentials** — shows error message
- [ ] **Login with empty fields** — shows validation errors
- [ ] **Navigate login ↔ signup** — links work both ways
- [ ] **Landing page (`/`) loads** — unauthenticated users see marketing page
- [ ] **Logout works** — clears session, redirects to `/`

## 2. Region / Localisation

- [ ] **Region stored on signup** — sign up as UK, check profile shows UK (GBP)
- [ ] **Currency: UK (£)** — quotes show £ throughout the app
- [ ] **Currency: US ($)** — switch to US region, quotes show $
- [ ] **Currency: EU (€)** — switch to EU region, quotes show €
- [ ] **Date: UK** — dates show DD/MM/YYYY (e.g. 01/01/2026)
- [ ] **Date: US** — dates show MM/DD/YYYY (e.g. 01/01/2026)
- [ ] **Postal label: UK** — address form shows "Postcode"
- [ ] **Postal label: US** — address form shows "ZIP code"
- [ ] **Postal label: CA** — address form shows "Postal code"
- [ ] **Tax label: UK** — tax line shows "VAT" not "Tax"
- [ ] **Tax label: US** — tax line shows "Sales Tax"
- [ ] **Tax label: AU** — tax line shows "GST"
- [ ] **No hardcoded "$"** — search for "$" in UI; none should appear for non-US regions
- [ ] **Landing page prices** — example quote amounts use region currency
- [ ] **Billing plans** — plan prices use region currency (Solo £0, Solo Pro £9.99, etc.)
- [ ] **Profile page** — shows Region and Currency code

## 3. Customer Management

- [ ] **Customer list loads** — `/customers` shows list with Name, Email, Company, Quotes
- [ ] **Search customers** — type in search box, results filter
- [ ] **Clear search** — shows all customers again
- [ ] **New customer modal** — opens, shows form fields
- [ ] **Create customer: email only** — no phone, submits successfully
- [ ] **Create customer: phone only** — no email, submits successfully  
- [ ] **Create customer: both email + phone** — submits successfully
- [ ] **Create customer: missing both** — shows "Email or phone is required."
- [ ] **Create customer: missing name** — shows "Name is required."
- [ ] **Create customer: invalid email** — shows "Enter a valid email address."
- [ ] **Customer detail page** — `/customers/[id]` shows contact info + quote history
- [ ] **Edit customer** — modal opens pre-filled, can update fields
- [ ] **Delete customer** — confirmation dialog, deletes successfully
- [ ] **Empty state** — no customers shows "No customers yet"
- [ ] **Postal label dynamic** — create customer form shows region-appropriate zip/postcode label

## 4. Quote Lifecycle

- [ ] **Quote builder loads** — `/quotes/new` shows customer select, line items, tax, notes
- [ ] **Create quote with line items** — adds items, sets quantities/prices, creates successfully
- [ ] **Add/remove line items** — + Add item, remove button works
- [ ] **Validate: no customer** — shows error when submitting without customer
- [ ] **AI generate quote** — type job description, generate, see results
- [ ] **AI apply to form** — click Apply, form fills with AI results
- [ ] **AI rate limit** — trigger rate limit, see user-friendly error
- [ ] **Quote list page** — `/quotes` shows all quotes with status badges
- [ ] **Quote list: filter by status** — select status, list filters
- [ ] **Quote list: delete** — confirmation dialog, deletes successfully
- [ ] **Quote list: empty state** — shows "No quotes yet"
- [ ] **Quote preview** — `/quotes/[id]` shows all details, line items, totals
- [ ] **Quote preview: status badge** — correct badge for draft/sent/accepted/rejected/expired
- [ ] **Status: draft → sent** — click "Mark as sent", status updates
- [ ] **Status: sent → accepted** — click "Mark accepted", scheduling modal opens
- [ ] **Status: sent → rejected** — click "Mark rejected", status updates
- [ ] **Status: sent → expired** — click "Mark expired", status updates
- [ ] **Status: invalid transition** — try invalid transition, error shows
- [ ] **Download PDF** — button works, generates and downloads PDF
- [ ] **Send/Share link** — opens dropdown, copy link works
- [ ] **Tax label on quote** — shows correct label (VAT/Sales Tax/GST) per region
- [ ] **Currency on quote** — all amounts show correct region currency

## 5. Dashboard

- [ ] **Dashboard loads** — `/dashboard` shows stats, recent quotes, recent customers
- [ ] **Stats display** — customer count, open quotes count show correctly
- [ ] **Recent quotes table** — shows quote number, customer, status, total, date
- [ ] **Recent customers table** — shows name, total quotes
- [ ] **Quick actions** — links to New Quote, New Customer work
- [ ] **Onboarding wizard** — appears for new accounts, can be dismissed
- [ ] **Currency on dashboard** — total amounts show region currency
- [ ] **Dates on dashboard** — created dates show region format

## 6. Billing & Settings

- [ ] **Settings page loads** — `/settings` shows Profile and Billing sections
- [ ] **Profile: read-only view** — shows all profile info + region
- [ ] **Profile: edit mode** — edit button, form fields show, save works
- [ ] **Profile: address labels** — state/province + postal label are region-aware
- [ ] **Profile: default tax rate** — can set and save
- [ ] **Billing: 5-tier plans** — Solo, Solo Pro, Business, Growth, Enterprise visible
- [ ] **Billing: current plan highlighted** — "Current plan" badge on active tier
- [ ] **Billing: upgrade button** — triggers Stripe checkout
- [ ] **Billing: prices region-formatted** — shows region currency, not hardcoded $

## 7. Jobs & Calendar

- [ ] **Jobs page loads** — shows list of scheduled/accepted jobs
- [ ] **Calendar view** — grid view shows jobs by date
- [ ] **Calendar: list/grid toggle** — switches between views
- [ ] **Calendar: width** — fits viewport on desktop and mobile
- [ ] **Job scheduling** — from quote acceptance, job created with date
- [ ] **Multi-day jobs** — start and end date both show/handle
- [ ] **Job status inline** — change status from list view

## 8. Public Pages

- [ ] **Public quote page** — `/q/[id]` loads without auth, shows quote
- [ ] **Public: accept quote** — customer can accept via public link
- [ ] **Public: reject quote** — customer can reject via public link
- [ ] **Public: expired quote** — shows expired status, request new quote button
- [ ] **Terms page** — `/terms` loads with full content
- [ ] **Privacy page** — `/privacy` loads with full content

## 9. Cross-cutting Concerns

- [ ] **404 page** — visit `/nonexistent`, shows custom 404
- [ ] **Error boundary** — triggers gracefully
- [ ] **Toast notifications** — appear for actions (save, delete, copy)
- [ ] **Loading skeletons** — appear during data loads
- [ ] **Mobile responsive** — test all pages at 375px width
- [ ] **Keyboard accessibility** — tab through forms, modals close with Escape
- [ ] **Dark mode** — toggle works, all UI elements readable
- [ ] **Meta tags** — view page source, title/OG tags present
- [ ] **Favicon** — visible in browser tab

## 10. Security & Auth Edge Cases

- [ ] **Protected pages redirect** — unauthenticated user hitting `/dashboard` → redirect to `/login`
- [ ] **API returns 401** — unauthenticated API calls return proper 401 JSON error
- [ ] **Plan limit enforcement** — exceeding customer/quote limits shows modal
- [ ] **Rate limiting** — too many AI requests shows rate limit error
- [ ] **CSRF protection** — forms include proper tokens
- [ ] **Login token stored** — after login, `jobstacker_token` in localStorage
- [ ] **Auth cookie set** — after login, `jobstacker_auth=true` cookie present
