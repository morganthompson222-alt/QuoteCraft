import { test, expect, type Page } from "@playwright/test";
import { setupPage } from "./helpers";

const MOCK_QUOTE = {
  id: "q-1",
  quoteNumber: "Q-001",
  customerId: "cust-1",
  status: "draft",
  subtotal: 1000,
  taxRate: 10,
  taxAmount: 100,
  total: 1100,
  notes: "Payment due within 30 days",
  validUntil: "2026-07-01",
  createdAt: "2026-06-01T10:00:00Z",
  updatedAt: "2026-06-01T10:00:00Z",
  customer: {
    id: "cust-1",
    name: "Alice Johnson",
    email: "alice@example.com",
    company: "Johnson Plumbing",
    phone: "555-0101",
  },
  items: [
    { id: "item-1", description: "Electrical wiring", quantity: 10, unitPrice: 100, amount: 1000, sortOrder: 1 },
  ],
};

test.describe("Quote lifecycle (status transitions)", () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
  });

  test("preview page shows draft quote details", async ({ page }) => {
    await page.route("**/api/quotes/q-1", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_QUOTE),
      });
    });

    await page.goto("/quotes/q-1");
    await expect(page.getByRole("heading", { name: "Q-001" })).toBeVisible();
    await expect(page.getByText("Alice Johnson")).toBeVisible();
    await expect(page.locator(".status-badge--draft")).toBeVisible();
    await expect(page.getByText("Electrical wiring")).toBeVisible();
    await expect(page.getByText("$1,100.00")).toBeVisible();
    await expect(page.getByText("Payment due within 30 days")).toBeVisible();
  });

  test("transitions from draft to sent", async ({ page }) => {
    let currentStatus = "draft";

    await page.route("**/api/quotes/q-1", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ...MOCK_QUOTE, status: currentStatus }),
      });
    });

    await page.route("**/api/quotes/q-1/status", async (route) => {
      const body = JSON.parse(route.request().postData() || "{}");
      currentStatus = body.status;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ id: "q-1", status: body.status, quoteNumber: "Q-001" }),
      });
    });

    await page.goto("/quotes/q-1");
    await expect(page.locator(".status-badge--draft")).toBeVisible();

    await page.getByRole("button", { name: "Mark as sent" }).click();
    await expect(page.locator(".status-badge--sent")).toBeVisible();
    await expect(page.getByRole("button", { name: "Mark accepted" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Mark rejected" })).toBeVisible();
  });

  test("transitions from sent to accepted", async ({ page }) => {
    let currentStatus = "sent";

    await page.route("**/api/quotes/q-1", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ...MOCK_QUOTE, status: currentStatus }),
      });
    });

    await page.route("**/api/quotes/q-1/status", async (route) => {
      const body = JSON.parse(route.request().postData() || "{}");
      currentStatus = body.status;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ id: "q-1", status: body.status, quoteNumber: "Q-001" }),
      });
    });

    await page.goto("/quotes/q-1");
    await expect(page.locator(".status-badge--sent")).toBeVisible();

    await page.getByRole("button", { name: "Mark accepted" }).click();
    await expect(page.locator(".status-badge--accepted")).toBeVisible();
  });

  test("transitions from sent to rejected", async ({ page }) => {
    let currentStatus = "sent";

    await page.route("**/api/quotes/q-1", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ...MOCK_QUOTE, status: currentStatus }),
      });
    });

    await page.route("**/api/quotes/q-1/status", async (route) => {
      const body = JSON.parse(route.request().postData() || "{}");
      currentStatus = body.status;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ id: "q-1", status: body.status, quoteNumber: "Q-001" }),
      });
    });

    await page.goto("/quotes/q-1");
    await expect(page.locator(".status-badge--sent")).toBeVisible();

    await page.getByRole("button", { name: "Mark rejected" }).click();
    await expect(page.locator(".status-badge--rejected")).toBeVisible();
  });

  test("transitions from sent to expired", async ({ page }) => {
    let currentStatus = "sent";

    await page.route("**/api/quotes/q-1", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ...MOCK_QUOTE, status: currentStatus }),
      });
    });

    await page.route("**/api/quotes/q-1/status", async (route) => {
      const body = JSON.parse(route.request().postData() || "{}");
      currentStatus = body.status;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ id: "q-1", status: body.status, quoteNumber: "Q-001" }),
      });
    });

    await page.goto("/quotes/q-1");
    await expect(page.locator(".status-badge--sent")).toBeVisible();

    await page.getByRole("button", { name: "Mark expired" }).click();
    await expect(page.locator(".status-badge--expired")).toBeVisible();
  });

  test("shows error on invalid transition", async ({ page }) => {
    await page.route("**/api/quotes/q-1", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_QUOTE),
      });
    });

    await page.route("**/api/quotes/q-1/status", async (route) => {
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({
          error: { message: "Invalid status transition", statusCode: 400, code: "INVALID_TRANSITION" },
        }),
      });
    });

    await page.goto("/quotes/q-1");
    await page.getByRole("button", { name: "Mark as sent" }).click();
    await expect(page.locator(".auth-form__error")).toContainText("Invalid status transition");
  });

  test("download PDF button is present", async ({ page }) => {
    await page.route("**/api/quotes/q-1", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_QUOTE),
      });
    });

    await page.goto("/quotes/q-1");
    await expect(page.getByRole("button", { name: "Download PDF" })).toBeVisible();
  });
});
