import { test, expect } from "@playwright/test";

test("health endpoint returns ok", async ({ request }) => {
  const resp = await request.get("/api/health");
  expect(resp.ok()).toBeTruthy();
  const body = await resp.json();
  expect(body.status).toBe("ok");
  expect(body.service).toBe("quotecraft-api");
});

test("unauthenticated endpoints return 401", async ({ request }) => {
  const endpoints = [
    "/api/auth/me",
    "/api/customers/list",
    "/api/quotes/list",
    "/api/dashboard/summary",
    "/api/billing/status",
    "/api/profile",
  ];

  for (const endpoint of endpoints) {
    const resp = await request.get(endpoint);
    expect(resp.status(), `${endpoint} should return 401`).toBe(401);
  }
});
