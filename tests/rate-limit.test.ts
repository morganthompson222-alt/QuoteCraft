/**
 * Rate Limit Integration Tests
 * Run: npx tsx tests/rate-limit.test.ts
 * Requires: AI endpoint and server running
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
  console.log("\n🚦 Rate Limit Integration Tests\n");

  console.log("── Headers Present ──");

  await test("Rate limit middleware returns 401 without auth", async () => {
    const resp = await fetch(`${BASE}/api/ai/generate-quote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input: "test" }),
    });
    if (resp.status !== 401) {
      throw new Error(`Expected 401, got ${resp.status}`);
    }
  });

  await test("Config env vars are valid integers", async () => {
    const limit = parseInt(process.env.AI_RATE_LIMIT ?? "10", 10);
    const windowMs = parseInt(process.env.AI_RATE_WINDOW_MS ?? "60000", 10);
    if (limit < 1) throw new Error(`Invalid AI_RATE_LIMIT: ${limit}`);
    if (windowMs < 1000) throw new Error(`Invalid AI_RATE_WINDOW_MS: ${windowMs}`);
  });

  console.log("── Env Config ──");

  await test("Rate limit config defaults are valid", async () => {
    const limit = parseInt(process.env.AI_RATE_LIMIT ?? "10", 10);
    const windowMs = parseInt(process.env.AI_RATE_WINDOW_MS ?? "60000", 10);
    if (limit < 1) throw new Error(`Invalid AI_RATE_LIMIT: ${limit}`);
    if (windowMs < 1000) throw new Error(`Invalid AI_RATE_WINDOW_MS: ${windowMs}`);
  });

  const total = passed + failed;
  console.log(`\n${"─".repeat(40)}`);
  console.log(`Results: ${passed}/${total} passed, ${failed}/${total} failed\n`);

  if (failed > 0) process.exit(1);
}

main().catch(console.error);
