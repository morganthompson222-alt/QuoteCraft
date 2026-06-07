import { test, expect } from "@playwright/test";
import { setupPage } from "./helpers";

const MOCK_PROFILE = {
  id: "user-1",
  email: "test@example.com",
  name: "Test User",
  avatarUrl: null,
  companyName: "Test Company",
  logoUrl: null,
  phone: "555-0000",
  address: "123 Main St",
  city: "Portland",
  state: "OR",
  zip: "97201",
  defaultTaxRate: 10,
  quotePrefix: "Q-",
  planTier: "free",
};

test.describe("Billing and settings", () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
  });

  test("billing page shows free tier plan card", async ({ page }) => {
    await page.route("**/api/billing/status", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          tier: "free",
          subscriptionStatus: null,
          periodStart: null,
          periodEnd: null,
          stripeCustomerId: null,
          limits: { maxQuotes: 5, maxCustomers: 20, aiGenerations: 0 },
        }),
      });
    });

    await page.route("**/api/profile", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_PROFILE),
      });
    });

    await page.goto("/settings");
    await expect(page.getByRole("heading", { name: "Free" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Pro", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Unlimited" })).toBeVisible();
    await expect(page.getByText("Current plan")).toBeVisible();
  });

  test("billing page shows pro tier subscription", async ({ page }) => {
    await page.route("**/api/billing/status", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          tier: "pro",
          subscriptionStatus: "active",
          periodStart: "2026-06-01T00:00:00Z",
          periodEnd: "2026-07-01T00:00:00Z",
          stripeCustomerId: "cus_abc123",
          limits: { maxQuotes: 100, maxCustomers: 500, aiGenerations: 50 },
        }),
      });
    });

    await page.route("**/api/profile", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ...MOCK_PROFILE, planTier: "pro" }),
      });
    });

    await page.goto("/settings");
    await expect(page.getByRole("heading", { name: "Pro", exact: true })).toBeVisible();
    await expect(page.getByText("Active")).toBeVisible();
    await expect(page.getByText("100 quotes")).toBeVisible();
    await expect(page.getByText("500 customers")).toBeVisible();
    await expect(page.getByText("50 AI generations")).toBeVisible();
  });

  test("profile page shows and edits profile", async ({ page }) => {
    let putCalled = false;

    await page.route("**/api/profile", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(MOCK_PROFILE),
        });
      } else if (route.request().method() === "PUT") {
        putCalled = true;
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ ...MOCK_PROFILE, name: "Updated User", companyName: "Updated Company" }),
        });
      }
    });

    await page.route("**/api/billing/status", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          tier: "free",
          subscriptionStatus: null,
          periodStart: null,
          periodEnd: null,
          stripeCustomerId: null,
          limits: { maxQuotes: 5, maxCustomers: 20, aiGenerations: 0 },
        }),
      });
    });

    await page.goto("/settings");
    await expect(page.getByRole("heading", { name: "Profile" })).toBeVisible();
    await expect(page.getByText("Test User")).toBeVisible();
    await expect(page.getByText("Test Company")).toBeVisible();

    await page.getByRole("button", { name: "Edit" }).click();
    await page.getByRole("textbox", { name: "Name", exact: true }).fill("Updated User");
    await page.getByLabel("Company name").fill("Updated Company");
    await page.getByRole("button", { name: "Save changes" }).click();

    expect(putCalled).toBe(true);
  });

  test("upgrade button triggers Stripe checkout", async ({ page }) => {
    await page.route("**/api/billing/status", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          tier: "free",
          subscriptionStatus: null,
          periodStart: null,
          periodEnd: null,
          stripeCustomerId: null,
          limits: { maxQuotes: 5, maxCustomers: 20, aiGenerations: 0 },
        }),
      });
    });

    await page.route("**/api/profile", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_PROFILE),
      });
    });

    let checkoutCalled = false;
    await page.route("**/api/stripe/create-checkout", async (route) => {
      checkoutCalled = true;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ url: "https://checkout.stripe.com/test" }),
      });
    });

    await page.goto("/settings");
    await page.getByRole("button", { name: "Upgrade to Pro" }).click();
    expect(checkoutCalled).toBe(true);
  });
});
