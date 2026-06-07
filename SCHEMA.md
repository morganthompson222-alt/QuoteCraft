# SCHEMA.md

Backend authoritative API and database contracts.

Owner: Agent B
Status: COMPLETE (All phases + deployment infrastructure)

Rules:
- Agent A may read but not edit.
- API mismatches must be resolved by Agent B updating this file.
- If not documented here, it does not exist.

---

## Database Schema

### Table: public.users
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | Matches auth.users.id |
| email | TEXT UNIQUE NOT NULL | |
| name | TEXT | nullable |
| avatar_url | TEXT | nullable |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| last_sign_in | TIMESTAMPTZ | nullable |

### Table: public.profiles
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | FK → users.id CASCADE |
| company_name | TEXT | nullable |
| logo_url | TEXT | nullable |
| phone | TEXT | nullable |
| address | TEXT | nullable |
| city | TEXT | nullable |
| state | TEXT | nullable |
| zip | TEXT | nullable |
| default_tax_rate | NUMERIC(5,2) | DEFAULT 0 |
| quote_prefix | TEXT | DEFAULT 'Q-' |
| next_quote_number | INT | DEFAULT 1 |
| plan_tier | TEXT | 'free' \| 'pro' \| 'unlimited', DEFAULT 'free' |
| stripe_customer_id | TEXT | nullable |
| stripe_subscription_id | TEXT | nullable |
| subscription_status | TEXT | nullable |
| subscription_period_start | TIMESTAMPTZ | nullable |
| subscription_period_end | TIMESTAMPTZ | nullable |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |
| region_code | TEXT | 'UK' \| 'US' \| 'CA' \| 'AU' \| 'EU', DEFAULT 'UK' |
| currency_code | TEXT | 'GBP' \| 'USD' \| 'CAD' \| 'AUD' \| 'EUR', DEFAULT 'GBP' |
| locale | TEXT | 'en-GB' \| 'en-US' \| 'en-CA' \| 'en-AU' \| 'en-IE', DEFAULT 'en-GB' |

### Table: public.customers
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | gen_random_uuid() |
| user_id | UUID NOT NULL | FK → users.id CASCADE |
| email | TEXT NOT NULL | UNIQUE(user_id, email) |
| name | TEXT NOT NULL | |
| phone | TEXT | nullable |
| company | TEXT | nullable |
| address | TEXT | nullable |
| city | TEXT | nullable |
| state | TEXT | nullable |
| zip | TEXT | nullable |
| country | TEXT | DEFAULT 'US' |
| notes | TEXT | nullable |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |

### Table: public.quotes
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | gen_random_uuid() |
| user_id | UUID NOT NULL | FK → users.id CASCADE |
| customer_id | UUID NOT NULL | FK → customers.id CASCADE |
| quote_number | TEXT NOT NULL | UNIQUE(user_id, quote_number) |
| status | TEXT NOT NULL | 'draft' \| 'sent' \| 'accepted' \| 'rejected' \| 'expired' |
| subtotal | NUMERIC(12,2) | DEFAULT 0, auto-calculated |
| tax_rate | NUMERIC(5,2) | DEFAULT 0 |
| tax_amount | NUMERIC(12,2) | DEFAULT 0, auto-calculated |
| total | NUMERIC(12,2) | DEFAULT 0, auto-calculated |
| notes | TEXT | nullable |
| valid_until | DATE | nullable |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |

### Table: public.quote_items
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | gen_random_uuid() |
| quote_id | UUID NOT NULL | FK → quotes.id CASCADE |
| description | TEXT NOT NULL | |
| quantity | NUMERIC(10,2) | DEFAULT 1 |
| unit_price | NUMERIC(12,2) | DEFAULT 0 |
| amount | NUMERIC(12,2) | DEFAULT 0, auto-calculated (qty × price) |
| sort_order | INT | DEFAULT 0 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

### Status Transition Rules
draft → sent, expired
sent → accepted, rejected, expired
accepted → (terminal)
rejected → (terminal)
expired → (terminal)

---

## API Endpoints

### Standard Error Envelope

All API errors follow this format:

```json
{
  "error": {
    "message": "Description of the error",
    "statusCode": 400,
    "code": "VALIDATION_ERROR"
  }
}
```

- `message` — human-readable description
- `statusCode` — HTTP status code (mirrors the response header)
- `code` — optional machine-readable identifier for programmatic handling

Common error codes by status:
| Status | Common codes |
|--------|-------------|
| 400 | `VALIDATION_ERROR`, `MISSING_FIELD`, `INVALID_FORMAT` |
| 401 | `UNAUTHORIZED`, `TOKEN_EXPIRED` |
| 403 | `FORBIDDEN`, `PLAN_LIMIT_REACHED` |
| 404 | `NOT_FOUND` |
| 409 | `DUPLICATE_ENTRY`, `HAS_ACCEPTED_QUOTES` |
| 429 | `RATE_LIMITED` |
| 500 | `INTERNAL_ERROR` |

### Auth

#### POST /api/auth/login
**Request:** `{ email: string, password: string }`
**Response (200):** `{ userId: uuid, email: string, token: string }`
**Errors:** 401 invalid credentials, 400 missing fields

#### POST /api/auth/register
**Request:** `{ email: string, password: string, name?: string }`
**Response (200):** `{ userId: uuid, email: string, token: string }`
**Errors:** 409 email exists, 400 invalid input

#### GET /api/auth/me
**Headers:** Authorization: Bearer \<token\>
**Response (200):** `{ userId: uuid, email: string, name: string|null, avatarUrl: string|null }`
**Errors:** 401 unauthorized

### Customers

#### POST /api/customers/create
**Request:** `{ email: string, name: string, phone?: string, company?: string, address?: string, city?: string, state?: string, zip?: string }`
**Response (200):** `{ id: uuid, email: string, name: string }`
**Errors:** 400 invalid, 409 duplicate, 401 unauthorized

#### GET /api/customers/list
**Query:** `?page=1&limit=10&search=string`
**Response (200):**
```json
{
  "customers": [{ "id": "uuid", "email": "string", "name": "string", "phone": "string|null", "company": "string|null", "totalQuotes": 0, "createdAt": "ISO8601" }],
  "total": 0, "page": 1, "limit": 10
}
```

#### GET /api/customers/[id]/quotes
**Headers:** Authorization: Bearer \<token\>
**Query:** `?page=1&limit=10&status=draft`
**Response (200):**
```json
{
  "quotes": [
    { "id": "uuid", "quoteNumber": "Q-001", "status": "draft", "total": 1250.00, "createdAt": "ISO8601" }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```
**Errors:** 401 unauthorized, 400 invalid params

#### GET /api/customers/[id]
**Headers:** Authorization: Bearer \<token\>
**Response (200):**
```json
{
  "id": "uuid",
  "email": "string",
  "name": "string",
  "phone": "string|null",
  "company": "string|null",
  "address": "string|null",
  "city": "string|null",
  "state": "string|null",
  "zip": "string|null",
  "notes": "string|null",
  "createdAt": "ISO8601",
  "quotes": [
    {
      "id": "uuid",
      "quoteNumber": "Q-001",
      "status": "draft",
      "total": 0,
      "createdAt": "ISO8601"
    }
  ]
}
```
**Errors:** 404 not found, 401 unauthorized

#### PUT /api/customers/[id]/update
**Request:** (partial) `{ email?, name?, phone?, company?, address?, city?, state?, zip?, notes? }`
**Response (200):** updated customer object
**Errors:** 404, 400, 409, 401

#### DELETE /api/customers/[id]/delete
**Response (200):** `{ deleted: true }`
**Errors:** 404, 401

### Quotes

#### POST /api/quotes/create
**Request:** `{ customerId: uuid, items: [{ description: string, quantity: number, unitPrice: number }], taxRate?: number, notes?: string, validUntil?: ISO8601 }`
**Response (200):** full quote object with items
**Errors:** 400 invalid, 404 customer not found, 401

#### GET /api/quotes/list
**Query params:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | number | 1 | Page number (1-indexed) |
| limit | number | 10 | Items per page (max 100) |
| status | string | — | Filter by status: draft, sent, accepted, rejected, expired |
| customerId | uuid | — | Filter by customer |
| sortBy | string | created_at | Sort field: created_at, total, status, quote_number |
| sortOrder | string | desc | Sort direction: asc or desc |

**Response (200):**
```json
{
  "quotes": [
    {
      "id": "uuid",
      "quoteNumber": "Q-001",
      "customerId": "uuid",
      "customerName": "string",
      "status": "draft",
      "total": 1250.00,
      "createdAt": "ISO8601"
    }
  ],
  "pagination": {
    "total": 42,
    "page": 1,
    "limit": 10,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  },
  "sort": {
    "by": "created_at",
    "order": "desc"
  }
}
```

#### GET /api/quotes/[id]
**Response (200):** full quote with nested `customer` and `items` arrays
**Errors:** 404, 401

#### GET /api/quotes/[id]/preview
**Headers:** Authorization: Bearer \<token\>
**Description:** Lightweight payload shaped specifically for the frontend quote preview UI. Omits internal IDs, returns display-friendly structure.
**Response (200):**
```json
{
  "quoteNumber": "Q-0007",
  "status": "draft",
  "createdAt": "ISO8601",
  "validUntil": "ISO8601",
  "customer": {
    "name": "Acme Corp",
    "company": "Acme Ltd",
    "email": "billing@acme.com",
    "phone": "01234 567890"
  },
  "items": [
    { "description": "Fence panels", "quantity": 10, "unitPrice": 45.00, "amount": 450.00 }
  ],
  "subtotal": 450.00,
  "taxRate": 20,
  "taxAmount": 90.00,
  "total": 540.00,
  "notes": "Payment due within 30 days"
}
```
**Errors:** 404, 401

#### PUT /api/quotes/[id]/update
**Request:** (draft-only) `{ customerId?, items?, taxRate?, notes?, validUntil? }`
**Response (200):** updated quote
**Errors:** 400 (non-draft), 404, 401

#### PATCH /api/quotes/[id]/status
**Request:** `{ status: "sent"|"accepted"|"rejected"|"expired" }`
**Response (200):** `{ id, status, quoteNumber }`
**Errors:** 400 invalid transition, 404, 401

#### DELETE /api/quotes/[id]/delete
**Response (200):** `{ deleted: true }`
**Errors:** 404, 401

### PDF

#### GET /api/quotes/[id]/pdf
**Headers:** Authorization: Bearer \<token\>
**Response (200):** application/pdf (attachment download)
**Errors:** 404, 401

### AI Quote Generator

#### POST /api/ai/generate-quote
**Headers:** Authorization: Bearer \<token\>
**Request:** `{ input: string }`
**Response (200):**
```json
{
  "description": "string",
  "materials": [{ "name": "string", "quantity": number, "unitPrice": number }],
  "labourCost": number,
  "total": number
}
```

**Error codes:**
| Status | Code | Condition |
|--------|------|-----------|
| 400 | `VALIDATION_ERROR` | Input under 3 characters |
| 401 | `UNAUTHORIZED` | Missing or invalid token |
| 403 | `PLAN_LIMIT_REACHED` | Free tier cannot use AI |
| 429 | `RATE_LIMITED` | More than 10 requests/minute |
| 500 | `AI_GENERATION_FAILED` | OpenAI returned no response |
| 500 | `INTERNAL_ERROR` | AI returned unparseable JSON |

**Rate limit response headers (429):**
| Header | Description |
|--------|-------------|
| `X-RateLimit-Limit` | Max requests per window (10) |
| `X-RateLimit-Remaining` | Requests remaining in current window |
| `X-RateLimit-Reset` | Unix timestamp when window resets |

### Stripe Subscriptions

#### POST /api/stripe/create-checkout
**Request:** `{ priceId: string, returnUrl?: string }`
**Response (200):** `{ url: string }` (Stripe Checkout URL)
**Errors:** 401 unauthorized

#### POST /api/stripe/webhook
**Processing:** Stripe webhook events (checkout.session.completed, customer.subscription.updated, customer.subscription.deleted)
**Response (200):** `{ received: true }`

---

### Profile

#### GET /api/profile
**Headers:** Authorization: Bearer \<token\>
**Response (200):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "string|null",
  "avatarUrl": "string|null",
  "companyName": "string|null",
  "logoUrl": "string|null",
  "phone": "string|null",
  "address": "string|null",
  "city": "string|null",
  "state": "string|null",
  "zip": "string|null",
  "defaultTaxRate": 20,
  "quotePrefix": "Q-",
  "planTier": "free"
}
```
**Errors:** 401 unauthorized

#### PUT /api/profile
**Headers:** Authorization: Bearer \<token\>
**Request (all fields optional):**
```json
{
  "name": "string",
  "companyName": "string",
  "phone": "string",
  "address": "string",
  "city": "string",
  "state": "string",
  "zip": "string",
  "defaultTaxRate": 20,
  "quotePrefix": "Q-",
  "logoUrl": "string"
}
```
**Response (200):** same shape as GET /api/profile
**Errors:** 400 no fields, 400 invalid tax rate, 401 unauthorized

---

### Billing

#### GET /api/billing/status
**Headers:** Authorization: Bearer \<token\>
**Query params:** None
**Description:** Returns the authenticated user's current subscription plan, status, period dates, and resource limits.

**Response (200) — Pro tier (active subscription):**
```json
{
  "tier": "pro",
  "subscriptionStatus": "active",
  "periodStart": "2026-06-01T00:00:00Z",
  "periodEnd": "2026-07-01T00:00:00Z",
  "stripeCustomerId": "cus_abc123",
  "limits": {
    "maxQuotes": 100,
    "maxCustomers": 500,
    "aiGenerations": 50
  }
}
```

**Response (200) — Free tier (no subscription):**
```json
{
  "tier": "free",
  "subscriptionStatus": null,
  "periodStart": null,
  "periodEnd": null,
  "stripeCustomerId": null,
  "limits": {
    "maxQuotes": 5,
    "maxCustomers": 20,
    "aiGenerations": 0
  }
}
```

**Field rules:**
- `tier` — always present, one of `"free"`, `"pro"`, `"unlimited"`
- `subscriptionStatus` — `null` for free tier; `"active"`, `"past_due"`, `"canceled"`, or `"trialing"` for paid tiers
- `periodStart` / `periodEnd` — ISO8601 strings when subscription exists, `null` for free
- `limits` — always present, reflects the tier's current allowances

**Errors:** 401 unauthorized

---

### Dashboard

#### GET /api/dashboard/summary
**Headers:** Authorization: Bearer \<token\>
**Query params:** None (no pagination — returns latest data only)
**Description:** Returns aggregate counts and recent activity for the authenticated user's dashboard.

**Response (200) — Populated:**
```json
{
  "customerCount": 42,
  "openQuotesCount": 5,
  "recentQuotes": [
    {
      "id": "uuid",
      "quoteNumber": "Q-0007",
      "customerName": "Acme Corp",
      "status": "draft",
      "total": 1250.00,
      "createdAt": "2026-06-05T10:00:00Z"
    }
  ],
  "recentCustomers": [
    {
      "id": "uuid",
      "name": "Acme Corp",
      "totalQuotes": 3
    }
  ]
}
```

**Response (200) — Empty state (fresh account, no data):**
```json
{
  "customerCount": 0,
  "openQuotesCount": 0,
  "recentQuotes": [],
  "recentCustomers": []
}
```

**Field rules:**
- `customerCount` — total customers belonging to the authenticated user
- `openQuotesCount` — total quotes with status `draft` or `sent`
- `recentQuotes` — last 10 quotes (newest first), regardless of status
- `recentCustomers` — last 5 customers (newest first), each with their total quote count
- Empty arrays are returned instead of `null` when no data exists
- All monetary values (`total`) are returned as numbers (not strings)

**Errors:** 401 unauthorized

---

## Plan Limits

| Tier | Max Quotes | Max Customers | AI Generations |
|------|-----------|--------------|----------------|
| Free | 5 | 20 | 0 |
| Pro | 100 | 500 | 50 |
| Unlimited | Unlimited | Unlimited | Unlimited |

---

## RLS Policies

All tables use Supabase Row Level Security scoped to `auth.uid()`:
- users: `id = auth.uid()`
- profiles: `id = auth.uid()`
- customers: `user_id = auth.uid()`
- quotes: `user_id = auth.uid()`
- quote_items: `quote_id IN (quotes WHERE user_id = auth.uid())`

---

## Environment Variables

### Required
| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (admin operations) |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |

### Optional
| Variable | Default | Description |
|----------|---------|-------------|
| `STRIPE_WEBHOOK_SECRET` | — | Stripe webhook signing secret |
| `OPENAI_API_KEY` | — | OpenAI API key for AI quote generator |
| `STRIPE_PRO_PRICE_ID` | — | Stripe price ID for Pro plan |
| `STRIPE_UNLIMITED_PRICE_ID` | — | Stripe price ID for Unlimited plan |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | Public-facing app URL |
| `AI_RATE_LIMIT` | `10` | Max AI requests per window |
| `AI_RATE_WINDOW_MS` | `60000` | AI rate limit window in ms |
| `CORS_ALLOWED_ORIGINS` | — | Comma-separated allowed CORS origins |
| `DEBUG` | — | Enable debug-level logging |

## Seed Script

Run with Supabase keys configured in `.env.local`:
```
npx tsx scripts/seed.ts
```

Creates:
- Demo user: `demo@quotecraft.com` / `demo123456`
- 5 sample customers
- 4 sample quotes with line items (draft, sent, accepted, draft)

## Docker & CI

- `Dockerfile` — Multi-stage production build (standalone Next.js output)
- `docker-compose.yml` — App service with healthcheck, requires `.env` file
- `.github/workflows/ci.yml` — Runs typecheck, lint, build, and Docker build on push/PR
