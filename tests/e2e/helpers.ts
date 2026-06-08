import type { Page } from "@playwright/test";

const MOCK_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-token";

export function base64URLEncode(str: string): string {
  return Buffer.from(str)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function makeSupabaseSessionCookie() {
  const session = {
    access_token: MOCK_TOKEN,
    refresh_token: "mock-refresh-token",
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: "bearer",
  };
  const encoded = base64URLEncode(JSON.stringify(session));
  return {
    name: "supabase.auth.token",
    value: `base64-${encoded}`,
    domain: "localhost",
    path: "/",
  };
}

export async function setupPage(page: Page) {
  await page.context().addCookies([makeSupabaseSessionCookie()]);

  await page.addInitScript((token) => {
    window.localStorage.setItem("jobstacker_token", token);
  }, MOCK_TOKEN);

  await page.route("**/api/auth/me", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        userId: "user-1",
        email: "test@example.com",
        name: "Test User",
        avatarUrl: null,
      }),
    });
  });
}
