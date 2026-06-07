/**
 * Plan Limit Enforcement Unit Tests
 * Run: npx tsx tests/plan-enforcement.test.ts
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
    throw new Error(`Expected ${expected}, got ${resp.status}`);
  }
}

async function main() {
  console.log("\n🔒 Plan Limit Enforcement Tests\n");

  // All unauthenticated requests should return 401 before plan check
  console.log("── Unauthenticated (401 gate) ──");

  await test("POST /api/customers/create returns 401 without auth", async () => {
    const resp = await fetch(`${BASE}/api/customers/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@test.com", name: "Test" }),
    });
    expectStatus(resp, 401);
  });

  await test("POST /api/quotes/create returns 401 without auth", async () => {
    const resp = await fetch(`${BASE}/api/quotes/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId: "none", items: [] }),
    });
    expectStatus(resp, 401);
  });

  await test("POST /api/ai/generate-quote returns 401 without auth", async () => {
    const resp = await fetch(`${BASE}/api/ai/generate-quote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input: "test" }),
    });
    expectStatus(resp, 401);
  });

  // ── Error envelope verification ──
  console.log("\n── Error Envelope ──");

  await test("Unauthenticated error has standardized envelope", async () => {
    const resp = await fetch(`${BASE}/api/customers/list`);
    const body = await resp.json();
    if (!body.error || body.error.statusCode !== 401) {
      throw new Error("Missing or invalid error envelope");
    }
  });

  // ── Summary ──
  const total = passed + failed;
  console.log(`\n${"─".repeat(40)}`);
  console.log(`Results: ${passed}/${total} passed, ${failed}/${total} failed\n`);

  if (failed > 0) process.exit(1);
}

main().catch(console.error);
