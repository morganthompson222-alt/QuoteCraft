import { test, expect, type Page } from "@playwright/test";
import { setupPage } from "./helpers";

const MOCK_CUSTOMERS = [
  {
    id: "cust-1",
    email: "alice@example.com",
    name: "Alice Johnson",
    phone: "555-0101",
    company: "Johnson Plumbing",
    totalQuotes: 3,
    createdAt: "2026-01-15T10:00:00Z",
  },
  {
    id: "cust-2",
    email: "bob@example.com",
    name: "Bob Smith",
    phone: "555-0102",
    company: "Smith Electric",
    totalQuotes: 1,
    createdAt: "2026-02-20T10:00:00Z",
  },
  {
    id: "cust-3",
    email: "carol@example.com",
    name: "Carol Davis",
    phone: null,
    company: null,
    totalQuotes: 0,
    createdAt: "2026-03-10T10:00:00Z",
  },
];

test.describe("Customer CRUD", () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
  });

  test("displays customer list", async ({ page }) => {
    await page.route("**/api/customers/list*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ customers: MOCK_CUSTOMERS, total: 3, page: 1, limit: 10 }),
      });
    });

    await page.goto("/customers");
    await expect(page.getByRole("heading", { name: "Customer records" })).toBeVisible();
    await expect(page.getByText("Alice Johnson")).toBeVisible();
    await expect(page.getByText("Bob Smith")).toBeVisible();
    await expect(page.getByText("Carol Davis")).toBeVisible();
  });

  test("searches customers", async ({ page }) => {
    await page.route("**/api/customers/list*", async (route) => {
      const url = new URL(route.request().url());
      const search = url.searchParams.get("search") || "";
      const filtered = MOCK_CUSTOMERS.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.company?.toLowerCase().includes(search.toLowerCase()) ||
          c.email.toLowerCase().includes(search.toLowerCase()),
      );
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ customers: filtered, total: filtered.length, page: 1, limit: 10 }),
      });
    });

    await page.goto("/customers");
    await page.getByPlaceholder("Name, company, or email").fill("Alice");
    await page.getByRole("button", { name: "Search", exact: true }).click();

    await expect(page.getByText("Alice Johnson")).toBeVisible();
    await expect(page.getByText("Bob Smith")).not.toBeVisible();
  });

  test("clears search", async ({ page }) => {
    await page.route("**/api/customers/list*", async (route) => {
      const url = new URL(route.request().url());
      const search = url.searchParams.get("search") || "";
      const filtered = MOCK_CUSTOMERS.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.company?.toLowerCase().includes(search.toLowerCase()) ||
          c.email.toLowerCase().includes(search.toLowerCase()),
      );
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ customers: filtered, total: filtered.length, page: 1, limit: 10 }),
      });
    });

    await page.goto("/customers");
    await page.getByPlaceholder("Name, company, or email").fill("Alice");
    await page.getByRole("button", { name: "Search", exact: true }).click();
    await expect(page.getByText("Alice Johnson")).toBeVisible();

    await page.getByRole("button", { name: "Clear search" }).click();
    await expect(page.getByText("Alice Johnson")).toBeVisible();
    await expect(page.getByText("Bob Smith")).toBeVisible();
  });

  test("creates a new customer", async ({ page }) => {
    await page.route("**/api/customers/list*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ customers: MOCK_CUSTOMERS, total: 3, page: 1, limit: 10 }),
      });
    });

    await page.route("**/api/customers/create", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ id: "cust-new", email: "dave@example.com", name: "Dave Wilson" }),
      });
    });

    await page.goto("/customers");
    await page.getByRole("button", { name: "New customer" }).click();
    await expect(page.getByRole("dialog", { name: "New customer" })).toBeVisible();

    await page.getByLabel("Name *").fill("Dave Wilson");
    await page.getByLabel("Email").fill("dave@example.com");
    await page.getByLabel("Phone").fill("555-0104");
    await page.getByLabel("Company").fill("Wilson Roofing");
    await page.getByRole("button", { name: "Create customer" }).click();

    await expect(page.getByRole("dialog", { name: "New customer" })).not.toBeVisible();
  });

  test("validates create customer form", async ({ page }) => {
    await page.route("**/api/customers/list*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ customers: MOCK_CUSTOMERS, total: 3, page: 1, limit: 10 }),
      });
    });

    await page.goto("/customers");
    await page.getByRole("button", { name: "New customer" }).click();
    await page.getByRole("button", { name: "Create customer" }).click();

    await expect(page.locator("#create-name-error")).toContainText("Name is required");
    await expect(page.locator("#create-email-error")).toContainText("Email or phone is required");
  });

  test("edits a customer", async ({ page }) => {
    await page.route("**/api/customers/list*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ customers: MOCK_CUSTOMERS, total: 3, page: 1, limit: 10 }),
      });
    });

    await page.route("**/api/customers/cust-1", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            ...MOCK_CUSTOMERS[0],
            address: "123 Main St",
            city: "Portland",
            state: "OR",
            zip: "97201",
            notes: "Regular customer",
          }),
        });
      }
    });

    await page.route("**/api/customers/cust-1/update", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ...MOCK_CUSTOMERS[0], name: "Alice Johnson Updated" }),
      });
    });

    await page.goto("/customers");
    await page.getByRole("button", { name: "Edit" }).first().click();
    await expect(page.getByRole("dialog", { name: "Edit customer" })).toBeVisible();

    await page.getByLabel("Name *").fill("Alice Johnson Updated");
    await page.getByRole("button", { name: "Save changes" }).click();

    await expect(page.getByRole("dialog", { name: "Edit customer" })).not.toBeVisible();
  });

  test("deletes a customer", async ({ page }) => {
    await page.route("**/api/customers/list*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ customers: MOCK_CUSTOMERS, total: 3, page: 1, limit: 10 }),
      });
    });

    await page.route("**/api/customers/cust-3/delete", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ deleted: true }),
      });
    });

    await page.goto("/customers");
    await page.getByRole("button", { name: "Delete" }).last().click();
    await expect(page.getByRole("dialog", { name: "Delete customer" })).toBeVisible();

    await page.getByLabel("Delete customer").getByRole("button", { name: "Delete" }).click();
    await expect(page.getByRole("dialog", { name: "Delete customer" })).not.toBeVisible();
  });

  test("shows empty state when no customers", async ({ page }) => {
    await page.route("**/api/customers/list*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ customers: [], total: 0, page: 1, limit: 10 }),
      });
    });

    await page.goto("/customers");
    await expect(page.getByRole("heading", { name: "No customers yet" })).toBeVisible();
  });

  test("shows error state with retry", async ({ page }) => {
    let callCount = 0;
    await page.route("**/api/customers/list*", async (route) => {
      callCount++;
      if (callCount === 1) {
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ error: { message: "Server error", statusCode: 500 } }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ customers: MOCK_CUSTOMERS, total: 3, page: 1, limit: 10 }),
        });
      }
    });

    await page.goto("/customers");
    await expect(page.getByRole("heading", { name: "Customers could not be loaded" })).toBeVisible();

    await page.getByRole("button", { name: "Try again" }).click();
    await expect(page.getByText("Alice Johnson")).toBeVisible();
  });

  test("customer detail page loads and displays info", async ({ page }) => {
    await page.route("**/api/customers/cust-1", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "cust-1",
          email: "alice@example.com",
          name: "Alice Johnson",
          phone: "555-0101",
          company: "Johnson Plumbing",
          address: "123 Main St",
          city: "Portland",
          state: "OR",
          zip: "97201",
          notes: "Prefers email contact",
          createdAt: "2026-01-15T10:00:00Z",
          quotes: [
            { id: "q-1", quoteNumber: "Q-001", status: "draft", total: 500, createdAt: "2026-01-20T10:00:00Z" },
          ],
        }),
      });
    });

    await page.goto("/customers/cust-1");
    await expect(page.getByRole("heading", { name: "Alice Johnson" })).toBeVisible();
    await expect(page.getByText("alice@example.com")).toBeVisible();
    await expect(page.getByText("555-0101")).toBeVisible();
    await expect(page.getByText("Johnson Plumbing")).toBeVisible();
    await expect(page.getByText("Prefers email contact")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Quote history" })).toBeVisible();
    await expect(page.getByText("Q-001")).toBeVisible();
  });
});
