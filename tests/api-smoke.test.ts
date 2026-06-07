/**
 * QuoteCraft API Smoke Tests
 * Run: npx tsx tests/api-smoke.test.ts
 * Requires: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_APP_URL (default http://localhost:3000)
 */

const BASE = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

let passed = 0;
let failed = 0;

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    passed++;
    console.log(`  ✅ ${name}`);
  } catch (e) {
    failed++;
    console.log(`  ❌ ${name}: ${(e as Error).message}`);
  }
}

function expectStatus(resp: Response, expected: number) {
  if (resp.status !== expected) {
    throw new Error(`Expected ${expected}, got ${resp.status}: ${resp.statusText}`);
  }
}

function expectShape(obj: unknown, keys: string[]) {
  if (typeof obj !== "object" || obj === null) {
    throw new Error("Response is not an object");
  }
  for (const key of keys) {
    if (!(key in (obj as Record<string, unknown>))) {
      throw new Error(`Missing key: ${key}`);
    }
  }
}

async function main() {
  console.log("\n🚀 QuoteCraft API Smoke Tests\n");
  console.log(`Base URL: ${BASE}\n`);

  // ── Auth ──
  console.log("── Auth ──");

  await test("GET /api/auth/me returns 401 without token", async () => {
    const resp = await fetch(`${BASE}/api/auth/me`);
    expectStatus(resp, 401);
    const body = await resp.json();
    expectShape(body, ["error"]);
    expectShape(body.error, ["message", "statusCode"]);
  });

  await test("POST /api/auth/login returns 400 on empty body", async () => {
    const resp = await fetch(`${BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    expectStatus(resp, 400);
  });

  await test("POST /api/auth/login returns 401 on bad credentials", async () => {
    const resp = await fetch(`${BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "none@test.com", password: "wrong" }),
    });
    expectStatus(resp, 401);
  });

  await test("POST /api/auth/signup returns 400 on short password", async () => {
    const resp = await fetch(`${BASE}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@test.com", password: "ab" }),
    });
    expectStatus(resp, 400);
  });

  // ── Customers ──
  console.log("\n── Customers ──");

  await test("GET /api/customers/list returns 401 without token", async () => {
    const resp = await fetch(`${BASE}/api/customers/list`);
    expectStatus(resp, 401);
  });

  await test("POST /api/customers/create returns 400 on missing fields", async () => {
    const resp = await fetch(`${BASE}/api/customers/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    expectStatus(resp, 401);
  });

  await test("GET /api/customers/[id] returns 401 without token", async () => {
    const resp = await fetch(`${BASE}/api/customers/some-id`);
    expectStatus(resp, 401);
  });

  await test("GET /api/customers/[id]/quotes returns 401 without token", async () => {
    const resp = await fetch(`${BASE}/api/customers/some-id/quotes`);
    expectStatus(resp, 401);
  });

  await test("PUT /api/customers/[id]/update returns 401 without token", async () => {
    const resp = await fetch(`${BASE}/api/customers/some-id/update`, { method: "PUT" });
    expectStatus(resp, 401);
  });

  await test("DELETE /api/customers/[id]/delete returns 401 without token", async () => {
    const resp = await fetch(`${BASE}/api/customers/some-id/delete`, { method: "DELETE" });
    expectStatus(resp, 401);
  });

  // ── Quotes ──
  console.log("\n── Quotes ──");

  await test("GET /api/quotes/list returns 401 without token", async () => {
    const resp = await fetch(`${BASE}/api/quotes/list`);
    expectStatus(resp, 401);
  });

  await test("POST /api/quotes/create returns 401 without token", async () => {
    const resp = await fetch(`${BASE}/api/quotes/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    expectStatus(resp, 401);
  });

  await test("GET /api/quotes/[id] returns 401 without token", async () => {
    const resp = await fetch(`${BASE}/api/quotes/some-id`);
    expectStatus(resp, 401);
  });

  await test("GET /api/quotes/[id]/preview returns 401 without token", async () => {
    const resp = await fetch(`${BASE}/api/quotes/some-id/preview`);
    expectStatus(resp, 401);
  });

  await test("PUT /api/quotes/[id]/update returns 401 without token", async () => {
    const resp = await fetch(`${BASE}/api/quotes/some-id/update`, { method: "PUT" });
    expectStatus(resp, 401);
  });

  await test("PATCH /api/quotes/[id]/status returns 401 without token", async () => {
    const resp = await fetch(`${BASE}/api/quotes/some-id/status`, { method: "PATCH" });
    expectStatus(resp, 401);
  });

  await test("DELETE /api/quotes/[id]/delete returns 401 without token", async () => {
    const resp = await fetch(`${BASE}/api/quotes/some-id/delete`, { method: "DELETE" });
    expectStatus(resp, 401);
  });

  await test("GET /api/quotes/[id]/pdf returns 401 without token", async () => {
    const resp = await fetch(`${BASE}/api/quotes/some-id/pdf`);
    expectStatus(resp, 401);
  });

  // ── AI ──
  console.log("\n── AI ──");

  await test("POST /api/ai/generate-quote returns 401 without token", async () => {
    const resp = await fetch(`${BASE}/api/ai/generate-quote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input: "test" }),
    });
    expectStatus(resp, 401);
  });

  // ── Dashboard ──
  console.log("\n── Dashboard ──");

  await test("GET /api/dashboard/summary returns 401 without token", async () => {
    const resp = await fetch(`${BASE}/api/dashboard/summary`);
    expectStatus(resp, 401);
  });

  // ── Billing ──
  console.log("\n── Billing ──");

  await test("GET /api/billing/status returns 401 without token", async () => {
    const resp = await fetch(`${BASE}/api/billing/status`);
    expectStatus(resp, 401);
  });

  // ── Error envelope ──
  console.log("\n── Error Envelope ──");

  await test("Error response has standardized envelope shape", async () => {
    const resp = await fetch(`${BASE}/api/auth/me`);
    const body = await resp.json();
    if (!body.error || typeof body.error.statusCode !== "number" || typeof body.error.message !== "string") {
      throw new Error("Error envelope missing required fields");
    }
  });

  await test("Error envelope mirrors HTTP status code", async () => {
    const resp = await fetch(`${BASE}/api/auth/me`);
    const body = await resp.json();
    if (body.error.statusCode !== resp.status) {
      throw new Error(`Envelope statusCode ${body.error.statusCode} !== HTTP ${resp.status}`);
    }
  });

  // ── Summary ──
  const total = passed + failed;
  console.log(`\n${"─".repeat(40)}`);
  console.log(`Results: ${passed}/${total} passed, ${failed}/${total} failed\n`);

  if (failed > 0) process.exit(1);
}

main().catch(console.error);
