# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Auth flow >> login page renders and signs in successfully
- Location: tests/e2e/auth.spec.ts:56:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Sign in' })
    - locator resolved to <button disabled type="submit" class="button button--primary auth-form__button">Sign in</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is not enabled
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is not enabled
    - retrying click action
      - waiting 100ms
    58 × waiting for element to be visible, enabled and stable
       - element is not enabled
     - retrying click action
       - waiting 500ms

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - banner [ref=e3]:
    - link "QuoteCraft home" [ref=e4] [cursor=pointer]:
      - /url: /
      - generic [ref=e5]: QC
      - generic [ref=e6]: QuoteCraft
    - generic [ref=e7]:
      - link "Log in" [ref=e8] [cursor=pointer]:
        - /url: /login
      - link "Sign up" [ref=e9] [cursor=pointer]:
        - /url: /signup
  - main [ref=e11]:
    - generic [ref=e13]:
      - generic [ref=e14]:
        - paragraph [ref=e15]: QuoteCraft
        - heading "Sign in to keep quotes moving." [level=1] [ref=e16]
        - paragraph [ref=e17]: Return to your workspace to manage customers, review quote drafts, and prepare approval-ready PDFs.
      - region "Welcome back" [ref=e18]:
        - generic [ref=e19]:
          - heading "Welcome back" [level=2] [ref=e20]
          - paragraph [ref=e21]: Use your workspace credentials to continue.
        - generic [ref=e22]:
          - generic [ref=e23]:
            - generic [ref=e24]: Email
            - textbox "Email" [ref=e25]: test@example.com
          - generic [ref=e26]:
            - generic [ref=e27]:
              - generic [ref=e28]: Password
              - link "Forgot password?" [ref=e29] [cursor=pointer]:
                - /url: /forgot-password
            - textbox "Password" [active] [ref=e30]: password123
          - button "Sign in" [disabled] [ref=e31]
          - paragraph [ref=e32]:
            - text: New to QuoteCraft?
            - link "Create an account" [ref=e33] [cursor=pointer]:
              - /url: /signup
```

# Test source

```ts
  1   | import { test, expect } from "@playwright/test";
  2   | 
  3   | const MOCK_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-token";
  4   | 
  5   | async function mockLogin(page: import("@playwright/test").Page) {
  6   |   await page.route("**/api/auth/login", async (route) => {
  7   |     const body = JSON.parse(route.request().postData() || "{}");
  8   |     if (body.email === "test@example.com" && body.password === "password123") {
  9   |       await route.fulfill({
  10  |         status: 200,
  11  |         contentType: "application/json",
  12  |         body: JSON.stringify({
  13  |           userId: "user-1",
  14  |           email: "test@example.com",
  15  |           token: MOCK_TOKEN,
  16  |         }),
  17  |       });
  18  |     } else {
  19  |       await route.fulfill({
  20  |         status: 401,
  21  |         contentType: "application/json",
  22  |         body: JSON.stringify({
  23  |           error: { message: "Invalid email or password", statusCode: 401 },
  24  |         }),
  25  |       });
  26  |     }
  27  |   });
  28  | }
  29  | 
  30  | async function mockRegister(page: import("@playwright/test").Page) {
  31  |   await page.route("**/api/auth/signup", async (route) => {
  32  |     const body = JSON.parse(route.request().postData() || "{}");
  33  |     if (body.email === "existing@example.com") {
  34  |       await route.fulfill({
  35  |         status: 409,
  36  |         contentType: "application/json",
  37  |         body: JSON.stringify({
  38  |           error: { message: "Email already registered", statusCode: 409, code: "DUPLICATE_ENTRY" },
  39  |         }),
  40  |       });
  41  |     } else {
  42  |       await route.fulfill({
  43  |         status: 200,
  44  |         contentType: "application/json",
  45  |         body: JSON.stringify({
  46  |           userId: "user-2",
  47  |           email: body.email,
  48  |           token: MOCK_TOKEN,
  49  |         }),
  50  |       });
  51  |     }
  52  |   });
  53  | }
  54  | 
  55  | test.describe("Auth flow", () => {
  56  |   test("login page renders and signs in successfully", async ({ page }) => {
  57  |     await mockLogin(page);
  58  | 
  59  |     await page.route("**/api/dashboard/summary", async (route) => {
  60  |       await route.fulfill({
  61  |         status: 200,
  62  |         contentType: "application/json",
  63  |         body: JSON.stringify({
  64  |           customerCount: 5,
  65  |           openQuotesCount: 2,
  66  |           recentQuotes: [],
  67  |           recentCustomers: [],
  68  |         }),
  69  |       });
  70  |     });
  71  | 
  72  |     await page.goto("/login");
  73  |     await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
  74  | 
  75  |     await page.getByLabel("Email").fill("test@example.com");
  76  |     await page.getByLabel("Password").fill("password123");
> 77  |     await page.getByRole("button", { name: "Sign in" }).click();
      |                                                         ^ Error: locator.click: Test timeout of 30000ms exceeded.
  78  | 
  79  |     await page.waitForURL("/dashboard");
  80  |     await expect(page.getByRole("heading", { name: "Workspace overview" })).toBeVisible();
  81  |   });
  82  | 
  83  |   test("login shows error for invalid credentials", async ({ page }) => {
  84  |     await mockLogin(page);
  85  | 
  86  |     await page.goto("/login");
  87  |     await page.getByLabel("Email").fill("wrong@example.com");
  88  |     await page.getByLabel("Password").fill("wrongpass");
  89  |     await page.getByRole("button", { name: "Sign in" }).click();
  90  | 
  91  |     await expect(page.locator(".auth-form__error")).toContainText("Invalid email or password");
  92  |   });
  93  | 
  94  |   test("login validates required fields", async ({ page }) => {
  95  |     await page.goto("/login");
  96  |     await page.evaluate(() =>
  97  |       document.querySelector('button[type="submit"]')?.removeAttribute("disabled"),
  98  |     );
  99  |     await page.getByRole("button", { name: "Sign in" }).click();
  100 | 
  101 |     await expect(page.locator("#email-error")).toContainText("Email is required");
  102 |     await expect(page.locator("#password-error")).toContainText("Password is required");
  103 |   });
  104 | 
  105 |   test("signup page creates account successfully", async ({ page }) => {
  106 |     await mockRegister(page);
  107 | 
  108 |     await page.route("**/api/auth/me", async (route) => {
  109 |       await route.fulfill({
  110 |         status: 200,
  111 |         contentType: "application/json",
  112 |         body: JSON.stringify({
  113 |           userId: "user-2",
  114 |           email: "new@example.com",
  115 |           name: "New User",
  116 |           avatarUrl: null,
  117 |         }),
  118 |       });
  119 |     });
  120 | 
  121 |     await page.route("**/api/dashboard/summary", async (route) => {
  122 |       await route.fulfill({
  123 |         status: 200,
  124 |         contentType: "application/json",
  125 |         body: JSON.stringify({
  126 |           customerCount: 0,
  127 |           openQuotesCount: 0,
  128 |           recentQuotes: [],
  129 |           recentCustomers: [],
  130 |         }),
  131 |       });
  132 |     });
  133 | 
  134 |     await page.goto("/signup");
  135 |     await expect(page.getByRole("heading", { name: "Create your workspace" })).toBeVisible();
  136 | 
  137 |     await page.getByLabel("Name").fill("New User");
  138 |     await page.getByLabel("Email").fill("new@example.com");
  139 |     await page.getByLabel("Password").fill("password123");
  140 |     await page.getByLabel(/I agree to the/).check();
  141 |     await page.getByRole("button", { name: "Create account" }).click();
  142 | 
  143 |     await page.waitForURL("/dashboard");
  144 |     await expect(page.getByRole("heading", { name: "Workspace overview" })).toBeVisible();
  145 |   });
  146 | 
  147 |   test("signup shows error for duplicate email", async ({ page }) => {
  148 |     await mockRegister(page);
  149 | 
  150 |     await page.goto("/signup");
  151 |     await page.getByLabel("Name").fill("Existing User");
  152 |     await page.getByLabel("Email").fill("existing@example.com");
  153 |     await page.getByLabel("Password").fill("password123");
  154 |     await page.getByLabel(/I agree to the/).check();
  155 |     await page.getByRole("button", { name: "Create account" }).click();
  156 | 
  157 |     await expect(page.locator(".auth-form__error")).toContainText("Email already registered");
  158 |   });
  159 | 
  160 |   test("navigates between login and signup", async ({ page }) => {
  161 |     await page.goto("/login");
  162 |     await page.getByRole("link", { name: "Create an account" }).click();
  163 |     await page.waitForURL("/signup");
  164 |     await expect(page.getByRole("heading", { name: "Create your workspace" })).toBeVisible();
  165 | 
  166 |     await page.getByRole("link", { name: "Log in" }).last().click();
  167 |     await page.waitForURL("/login");
  168 |     await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
  169 |   });
  170 | 
  171 |   test("unauthenticated API requests are rejected", async ({ page }) => {
  172 |     const response = await page.request.get("/api/dashboard/summary");
  173 |     expect(response.status()).toBe(401);
  174 |   });
  175 | });
  176 | 
```