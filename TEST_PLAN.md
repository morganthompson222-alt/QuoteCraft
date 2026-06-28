# JobStacker — Complete Test Plan

## Setup
- Demo account: demo@quotecraft.app / demo123456
- URL: https://quotecraft026.vercel.app
- `?tour=1` to replay the guided tour
- Apply setup: `/setup` for fresh accounts

---

## 1. New Account Flow

### 1.1 Signup
1. Go to `/signup`
2. Enter Name, select Region (UK/US/CA/AU/EU), enter Email + Password
3. Check TOS/Privacy checkbox → "Create account" enables
4. Submit → redirected to `/setup`

### 1.2 Company Setup
1. Step 1: Enter company name, phone, address, city, state/province, postcode
2. Click "Save & continue" → saves to profile
3. Step 2: Enter services/pricing (e.g. "Tree trimming — £150 per hour")
4. Click "Save & continue" → AI auto-cleans text, saves structured version
5. Step 3: Set default tax rate (e.g. 20)
6. Click "Finish" → redirected to `/dashboard`

### 1.3 Guided Tour
- After setup, 10-step tour should start immediately on dashboard
- [ ] Tour shows proper spotlight cutout with dimmed overlay
- [ ] Background clicks are blocked
- [ ] Step indicator shows "Step X of 10"
- [ ] Click "Next" → advances through dashboard → customers → quotes → jobs → calendar → finance → revenue → settings → AI pricing
- [ ] Click "Skip" → tour dismissed, never shows again
- [ ] `?tour=1` replays the tour
- [ ] On replay, `jobstacker_tour_done` requires version check (current: v2)

---

## 2. Authentication & Redirects

### 2.1 Landing Page
- [ ] Go to `/` without being logged in → see marketing page, NOT redirected to login
- [ ] Click "Log in" → `/login`
- [ ] Click "Sign up" → `/signup`

### 2.2 Login
- [ ] Valid credentials → redirect to `/dashboard`
- [ ] Invalid credentials → show error message
- [ ] Empty fields → validation errors appear

### 2.3 Protected Pages
- [ ] Go to `/dashboard` without auth → redirect to `/login`
- [ ] API calls without auth → 401 JSON response

### 2.4 Logout
- [ ] Click "Log out" → clears auth cookie + localStorage → redirect to `/`

---

## 3. Customers

### 3.1 List & Search
- [ ] `/customers` shows customer list with name, email, company, quotes count
- [ ] Search by name/company/email → results filter
- [ ] Clear search → all customers shown again

### 3.2 Create Customer
- [ ] Click "New customer" → modal opens
- [ ] Fill Name + Email only → submits successfully
- [ ] Fill Name + Phone only (no email) → submits successfully
- [ ] Fill Name + Email + Phone → submits successfully
- [ ] Leave both Email and Phone empty → shows "Email or phone is required."
- [ ] Leave Name empty → shows "Name is required."
- [ ] Invalid email → shows "Enter a valid email address."

### 3.3 Edit Customer
- [ ] Click "Edit" on a customer → modal pre-filled with data
- [ ] Change name/email/phone → saves successfully

### 3.4 Delete Customer
- [ ] Click "Delete" → confirmation dialog
- [ ] Confirm → customer deleted
- [ ] Cancel → dialog closes, no deletion

### 3.5 Customer Detail
- [ ] Click customer name → `/customers/[id]` shows contact info
- [ ] Quote history shows all linked quotes with status + totals
- [ ] Region-aware postal label shows "Postcode" / "ZIP code" / "Postal code"

---

## 4. Quotes

### 4.1 Create Quote
- [ ] `/quotes/new` — customer select, line items, tax rate, notes, valid-until
- [ ] Select customer → fill item description, quantity, unit price
- [ ] Click "+ Add item" → additional row appears
- [ ] Click "Remove item" on a row → row deleted
- [ ] Submit with no customer → validation error
- [ ] Submit with valid data → quote created, redirected to quote page

### 4.2 AI Generation
- [ ] Type job description → click "Generate quote"
- [ ] AI returns line items + labour + total
- [ ] Click "Apply to form" → form fills with AI data
- [ ] Trigger rate limit → see "Rate limit reached" error message

### 4.3 Quote List
- [ ] `/quotes` shows all quotes with status badges
- [ ] Filter by status → list updates
- [ ] Filter by payment (paid/unpaid) → list updates

### 4.4 Bulk Select
- [ ] Click checkbox on a quote → selected
- [ ] Click checkbox on header → all selected / deselect all
- [ ] With items selected → bulk toolbar appears showing count
- [ ] Click "Archive all" → all selected archived
- [ ] Select items → use status dropdown → bulk status change

### 4.5 Delete Quote
- [ ] Click "Delete" → confirmation dialog
- [ ] Confirm → quote deleted

### 4.6 Archive/Unarchive
- [ ] Archive button on completed/cancelled quotes → archives it
- [ ] Works via toggle (sends `archived: !currentlyArchived`)

---

## 5. Quote Lifecycle & Actions

### 5.1 Status Transitions
- [ ] Draft → Sent / Expired
- [ ] Sent → Accepted / Rejected / Expired
- [ ] Accepted/Rejected/Expired → no further transitions (except reboot)

### 5.2 Share Link
- [ ] Draft quote → click "Send ▾" → dropdown shows "Share link"
- [ ] Click "Share link" → **immediately copies URL** + marks as sent
- [ ] Toast: "Link copied! Marking as sent..."
- [ ] Sent quote → "Copy link" button → immediately copies URL + toast

### 5.3 Download PDF
- [ ] Click "Download PDF" → PDF downloads with filename `quote-XXXX.pdf`
- [ ] PDF header shows company name + logo (if uploaded)
- [ ] PDF status always shows "SENT" regardless of actual status
- [ ] All line items + totals + tax shown correctly

### 5.4 Rebooting Expired Quotes
- [ ] Quote marked expired → "Reboot quote" button appears
- [ ] Click "Reboot quote" → resets to "sent" status, public link reactivates

### 5.5 Public Quote Page
- [ ] Share link opens `/q/[id]` without auth
- [ ] Shows quote details, line items, totals
- [ ] Sent → Accept / Decline buttons visible
- [ ] Accepted → green confirmation banner
- [ ] Rejected → red decline banner
- [ ] Expired → grey "Expired" banner, accept/decline hidden
- [ ] Expired → "Request a new quote" button → sends notification to trader

### 5.6 Scheduling
- [ ] Click "Mark accepted" → scheduling modal opens
- [ ] Fill date/time → "Accept & Schedule" → creates job
- [ ] "Accept without scheduling" → accepts only

---

## 6. Jobs

### 6.1 Jobs Page
- [ ] `/jobs` lists all active jobs
- [ ] Click any row → detail modal opens showing customer, date, time, status, location, notes

### 6.2 Inline Status Change
- [ ] Each job has a status dropdown (Scheduled / In progress / Completed / Cancelled)
- [ ] Change status → updates immediately

### 6.3 Calendar Integration
- [ ] `/calendar` — Grid view shows jobs by date
- [ ] List view shows jobs in table format
- [ ] "Your Next Job" indicator in list view highlights next upcoming job
- [ ] Click job chip in grid → detail modal opens
- [ ] Click row in list → detail modal opens (entire row clickable)
- [ ] Detail modal: Edit, Export PDF, View quote links

### 6.4 Job PDF Export
- [ ] From detail modal → "Export PDF" → generates PDF
- [ ] PDF shows: company header, job title, customer, date/time, status, linked quote, notes
- [ ] Long text is truncated with "..." no overflow

### 6.5 Multi-Day Support
- [ ] (Verify with Agent B: `end_date` field on jobs)

---

## 7. Dashboard

- [ ] `/dashboard` shows stat cards: customers, open quotes, revenue
- [ ] Recent quotes table with status badges
- [ ] Recent customers table
- [ ] "New quote" quick action button
- [ ] Onboarding wizard for empty accounts
- [ ] All currency amounts use region format (£/$/€)
- [ ] All dates use locale format (DD/MM/YYYY or MM/DD/YYYY)

---

## 8. Finance & Revenue

### 8.1 Finance Overview
- [ ] `/finance` shows stat cards: revenue, profit, expenses, est. tax, outstanding, avg job value
- [ ] Bar chart with revenue (green) and expenses (red) bars
- [ ] Dynamic Y-axis scaling (nice round numbers)
- [ ] Large numbers abbreviated: £1.2M, £45K (with tooltip for full value)
- [ ] Period selector: This month / 3m / 6m / 12m / All time
- [ ] Tax rate input with disclaimer

### 8.2 Revenue Dashboard
- [ ] `/revenue` shows chart + stat cards
- [ ] Defaults to current month (period "1")
- [ ] Line/bar chart toggle

---

## 9. Settings & Profile

### 9.1 Profile Page
- [ ] `/settings` shows Profile section
- [ ] Read-only view: name, company, phone, address, region, currency, tax rate, quote prefix
- [ ] Edit mode: all fields editable
- [ ] Region display: shows code + currency code (e.g. "UK (GBP)")

### 9.2 Company Logo
- [ ] Logo upload section in Settings (paid plans)
- [ ] Uploaded logo appears on quote PDFs

### 9.3 Dark Mode
- [ ] Dark mode toggle works
- [ ] All sections readable: backgrounds, text, borders, inputs, buttons

---

## 10. Billing

- [ ] `/settings` Billing section shows 5-tier plans
- [ ] Solo, Solo Pro, Business, Growth, Enterprise
- [ ] Current plan highlighted with "Current plan" badge
- [ ] Upgrade buttons trigger Stripe checkout
- [ ] Prices shown with region currency symbol

---

## 11. Calendar

- [ ] Grid view: 7 equal columns, all cells visible
- [ ] No horizontal scroll at any viewport width (320px–1920px)
- [ ] Cell height is uniform across all rows
- [ ] Job chips truncated with "…" for overflow
- [ ] Mobile: cells reduce to 54px min, font sizes smaller
- [ ] List view: status tabs (All/Scheduled/In progress/Completed/Cancelled)
- [ ] Inline status dropdown in list view
- [ ] Export .ics button
- [ ] Upgrade prompt for free plans

---

## 12. Guided Tour Tests

- [ ] Tour starts after setup completion on `/dashboard`
- [ ] Tour starts for all existing users on next login (version 2 check)
- [ ] Tour navigates 10 steps across pages
- [ ] Spotlight cutout covers all non-highlighted areas
- [ ] Background clicks are blocked
- [ ] Tooltip stays on-screen at 320px width
- [ ] Step progress dots show current/done/remaining
- [ ] "Skip" dismisses permanently
- [ ] `?tour=1` forces replay

---

## 13. Mobile Responsiveness

Test at: 320px, 375px, 430px, 768px, 1024px

- [ ] No horizontal scrolling on any page
- [ ] Hamburger menu visible ≤768px
- [ ] Sidebar hidden ≤768px, overlay nav works
- [ ] All inputs 44px+ touch targets
- [ ] Tables scroll horizontally on narrow screens
- [ ] Auth forms are single-column, full-width
- [ ] Modals are 95% width on mobile
- [ ] Calendar cells fit on screen

---

## 14. Cross-Cutting

- [ ] Region selected on signup persists in profile
- [ ] Currency format changes (£/$/€) across ALL pages
- [ ] Date format changes (DD/MM/YY vs MM/DD/YY) across ALL pages
- [ ] Postal label changes (Postcode/ZIP code/Postal code) in forms
- [ ] Tax label changes (VAT/Sales Tax/GST) on quotes
- [ ] No hardcoded "$" in any component
- [ ] 404 page renders for unknown routes
- [ ] Toast notifications appear for key actions
- [ ] Loading skeletons show during data fetches

---

## 15. Regression Check

- [ ] Login still works (existing accounts)
- [ ] Signup still works (new accounts)
- [ ] All existing customer data visible and editable
- [ ] All existing quotes visible, status changes work
- [ ] Existing jobs visible, status changes work
- [ ] Calendar still shows all data
- [ ] Finance data unchanged
- [ ] Dark mode still toggles
