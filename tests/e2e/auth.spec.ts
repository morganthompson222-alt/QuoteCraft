import { test, expect } from "@playwright/test";

const MOCK_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-token";

async function mockLogin(page: import("@playwright/test").Page) {
  await page.route("**/api/auth/login", async (route) => {
    const body = JSON.parse(route.request().postData() || "{}");
    if (body.email === "test@example.com" && body.password === "password123") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          userId: "user-1",
          email: "test@example.com",
          token: MOCK_TOKEN,
        }),
      });
    } else {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({
          error: { message: "Invalid email or password", statusCode: 401 },
        }),
      });
    }
  });
}

async function mockRegister(page: import("@playwright/test").Page) {
  await page.route("**/api/auth/signup", async (route) => {
    const body = JSON.parse(route.request().postData() || "{}");
    if (body.email === "existing@example.com") {
      await route.fulfill({
        status: 409,
        contentType: "application/json",
        body: JSON.stringify({
          error: { message: "Email already registered", statusCode: 409, code: "DUPLICATE_ENTRY" },
        }),
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          userId: "user-2",
          email: body.email,
          token: MOCK_TOKEN,
        }),
      });
    }
  });
}

test.describe("Auth flow", () => {
  test("login page renders and signs in successfully", async ({ page }) => {
    await mockLogin(page);

    await page.route("**/api/dashboard/summary", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          customerCount: 5,
          openQuotesCount: 2,
          recentQuotes: [],
          recentCustomers: [],
        }),
      });
    });

    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();

    await page.getByLabel("Email").fill("test@example.com");
    await page.getByLabel("Password").fill("password123");
    await page.getByRole("button", { name: "Sign in" }).click();

    await page.waitForURL("/dashboard");
    await expect(page.getByRole("heading", { name: "Workspace overview" })).toBeVisible();
  });

  test("login shows error for invalid credentials", async ({ page }) => {
    await mockLogin(page);

    await page.goto("/login");
    await page.getByLabel("Email").fill("wrong@example.com");
    await page.getByLabel("Password").fill("wrongpass");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page.locator(".auth-form__error")).toContainText("Invalid email or password");
  });

  test("login validates required fields", async ({ page }) => {
    await page.goto("/login");
    await page.evaluate(() =>
      document.querySelector('button[type="submit"]')?.removeAttribute("disabled"),
    );
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page.locator("#email-error")).toContainText("Email is required");
    await expect(page.locator("#password-error")).toContainText("Password is required");
  });

  test("signup page creates account successfully", async ({ page }) => {
    await mockRegister(page);

    await page.route("**/api/auth/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          userId: "user-2",
          email: "new@example.com",
          name: "New User",
          avatarUrl: null,
        }),
      });
    });

    await page.goto("/signup");
    await expect(page.getByRole("heading", { name: "Create your workspace" })).toBeVisible();

    await page.getByLabel("Name").fill("New User");
    await page.getByLabel("Email").fill("new@example.com");
    await page.getByLabel("Password").fill("password123");
    await page.getByLabel(/I agree to the/).check();
    await page.getByRole("button", { name: "Create account" }).click();

    await page.waitForURL("/setup");
    await expect(page.getByText("Setup your workspace")).toBeVisible();
  });

  test("signup shows error for duplicate email", async ({ page }) => {
    await mockRegister(page);

    await page.goto("/signup");
    await page.getByLabel("Name").fill("Existing User");
    await page.getByLabel("Email").fill("existing@example.com");
    await page.getByLabel("Password").fill("password123");
    await page.getByLabel(/I agree to the/).check();
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page.locator(".auth-form__error")).toContainText("Email already registered");
  });

  test("navigates between login and signup", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("link", { name: "Create an account" }).click();
    await page.waitForURL("/signup");
    await expect(page.getByRole("heading", { name: "Create your workspace" })).toBeVisible();

    await page.getByRole("link", { name: "Log in" }).last().click();
    await page.waitForURL("/login");
    await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
  });

  test("unauthenticated API requests are rejected", async ({ page }) => {
    const response = await page.request.get("/api/dashboard/summary");
    expect(response.status()).toBe(401);
  });
});
