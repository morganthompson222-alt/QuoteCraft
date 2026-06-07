import { test, expect, type Page } from "@playwright/test";
import { setupPage } from "./helpers";

const MOCK_CUSTOMERS_FOR_SELECT = [
  { id: "cust-1", name: "Alice Johnson", email: "alice@example.com" },
  { id: "cust-2", name: "Bob Smith", email: "bob@example.com" },
];

async function mockCustomersList(page: Page) {
  await page.route("**/api/customers/list*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ customers: MOCK_CUSTOMERS_FOR_SELECT, total: 2, page: 1, limit: 100 }),
    });
  });
}

test.describe("Quote creation and AI generation", () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
  });

  test("quote builder page loads with form fields", async ({ page }) => {
    await mockCustomersList(page);

    await page.goto("/quotes/new");
    await expect(page.getByLabel("Customer *")).toBeVisible();
    await expect(page.getByPlaceholder("Item description")).toBeVisible();
    await expect(page.getByText("+ Add item")).toBeVisible();
    await expect(page.getByLabel("Notes")).toBeVisible();
    await expect(page.getByLabel("Valid until")).toBeVisible();
    await expect(page.getByRole("button", { name: "Create quote" })).toBeVisible();
  });

  test("creates a quote with line items", async ({ page }) => {
    await mockCustomersList(page);

    await page.route("**/api/quotes/create", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ id: "q-new", quoteNumber: "Q-001", status: "draft", total: 1250 }),
      });
    });

    await page.goto("/quotes/new");
    await page.getByLabel("Customer *").selectOption("cust-1");

    const descInputs = page.locator("input[placeholder='Item description']");
    await descInputs.first().fill("Electrical wiring installation");

    const qtyInputs = page.locator("input[type='number']");
    await qtyInputs.nth(0).fill("10");
    await qtyInputs.nth(1).fill("125");

    await page.getByRole("button", { name: "Create quote" }).click();
    await page.waitForURL("/quotes/q-new");
  });

  test("adds and removes line items", async ({ page }) => {
    await mockCustomersList(page);

    await page.goto("/quotes/new");

    const addBtn = page.getByRole("button", { name: "+ Add item" });
    await addBtn.click();

    const descInputs = page.locator("input[placeholder='Item description']");
    await expect(descInputs).toHaveCount(2);

    await page.getByRole("button", { name: "Remove item" }).last().click();
    await expect(descInputs).toHaveCount(1);
  });

  test("validates quote form requires customer", async ({ page }) => {
    await mockCustomersList(page);

    await page.goto("/quotes/new");
    await page.getByRole("button", { name: "Create quote" }).click();
    await expect(page.locator(".field__error").first()).toBeVisible();
  });

  test("AI generation populates quote form", async ({ page }) => {
    await mockCustomersList(page);

    await page.route("**/api/ai/generate-quote", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          description: "Replace faulty electrical panel",
          materials: [
            { name: "Circuit breaker panel", quantity: 1, unitPrice: 450 },
            { name: "Wiring cable (50ft)", quantity: 1, unitPrice: 120 },
          ],
          labourCost: 600,
          total: 1170,
        }),
      });
    });

    await page.goto("/quotes/new");
    await page.getByLabel("Describe the job in natural language").fill("Replace a faulty electrical panel");
    await page.getByRole("button", { name: "Generate quote" }).click();

    await expect(page.locator(".ai-result")).toBeVisible();
    await expect(page.locator(".ai-result__desc")).toContainText("Replace faulty electrical panel");

    await page.getByRole("button", { name: "Apply to form" }).click();
    await expect(page.locator("input[placeholder='Item description']").first()).toHaveValue(/Circuit breaker panel/i);
  });

  test("AI generation shows rate limit error", async ({ page }) => {
    await mockCustomersList(page);

    await page.route("**/api/ai/generate-quote", async (route) => {
      await route.fulfill({
        status: 429,
        contentType: "application/json",
        body: JSON.stringify({
          error: { message: "Too many requests. Try again in 60 seconds.", statusCode: 429, code: "RATE_LIMITED" },
        }),
      });
    });

    await page.goto("/quotes/new");
    await page.getByLabel("Describe the job in natural language").fill("Replace a faulty electrical panel");
    await page.getByRole("button", { name: "Generate quote" }).click();

    await expect(page.locator(".auth-form__error")).toContainText("Rate limit reached");
  });

  test("quote list page shows quotes", async ({ page }) => {
    await page.route("**/api/quotes/list*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          quotes: [
            { id: "q-1", quoteNumber: "Q-001", customerName: "Alice Johnson", status: "draft", total: 1250, createdAt: "2026-01-20T10:00:00Z" },
            { id: "q-2", quoteNumber: "Q-002", customerName: "Bob Smith", status: "sent", total: 3000, createdAt: "2026-02-15T10:00:00Z" },
          ],
          pagination: { total: 2, page: 1, limit: 10, totalPages: 1, hasNext: false, hasPrev: false },
          sort: { by: "created_at", order: "desc" },
        }),
      });
    });

    await page.goto("/quotes");
    await expect(page.getByRole("heading", { name: "Quote records" })).toBeVisible();
    await expect(page.getByText("Q-001")).toBeVisible();
    await expect(page.getByText("Q-002")).toBeVisible();
    await expect(page.getByText("Alice Johnson")).toBeVisible();
    await expect(page.locator(".status-badge--draft")).toBeVisible();
    await expect(page.locator(".status-badge--sent")).toBeVisible();
  });

  test("quote list filters by status", async ({ page }) => {
    await page.route("**/api/quotes/list*", async (route) => {
      const url = new URL(route.request().url());
      const status = url.searchParams.get("status");
      const all = [
        { id: "q-1", quoteNumber: "Q-001", customerName: "Alice", status: "draft", total: 1250, createdAt: "2026-01-20T10:00:00Z" },
        { id: "q-2", quoteNumber: "Q-002", customerName: "Bob", status: "sent", total: 3000, createdAt: "2026-02-15T10:00:00Z" },
      ];
      const filtered = status ? all.filter((q) => q.status === status) : all;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          quotes: filtered,
          pagination: { total: filtered.length, page: 1, limit: 10, totalPages: 1, hasNext: false, hasPrev: false },
          sort: { by: "created_at", order: "desc" },
        }),
      });
    });

    await page.goto("/quotes");
    await page.locator("#quote-status-filter").selectOption("sent");
    await expect(page.getByText("Q-002")).toBeVisible();
    await expect(page.getByText("Q-001")).not.toBeVisible();
  });

  test("quote list shows empty state", async ({ page }) => {
    await page.route("**/api/quotes/list*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          quotes: [],
          pagination: { total: 0, page: 1, limit: 10, totalPages: 0, hasNext: false, hasPrev: false },
          sort: { by: "created_at", order: "desc" },
        }),
      });
    });

    await page.goto("/quotes");
    await expect(page.getByRole("heading", { name: "No quotes yet" })).toBeVisible();
  });

  test("deletes a quote", async ({ page }) => {
    await page.route("**/api/quotes/list*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          quotes: [
            { id: "q-1", quoteNumber: "Q-001", customerName: "Alice Johnson", status: "draft", total: 1250, createdAt: "2026-01-20T10:00:00Z" },
          ],
          pagination: { total: 1, page: 1, limit: 10, totalPages: 1, hasNext: false, hasPrev: false },
          sort: { by: "created_at", order: "desc" },
        }),
      });
    });

    await page.route("**/api/quotes/q-1/delete", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ deleted: true }),
      });
    });

    await page.goto("/quotes");
    await page.getByRole("button", { name: "Delete" }).click();
    await expect(page.getByRole("dialog", { name: "Delete quote" })).toBeVisible();

    await page.getByLabel("Delete quote").getByRole("button", { name: "Delete" }).click();
    await expect(page.getByRole("dialog", { name: "Delete quote" })).not.toBeVisible();
  });
});
