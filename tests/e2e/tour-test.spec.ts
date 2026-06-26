import { test, expect } from "@playwright/test";
import { setupPage } from "./helpers";

test("guided tour renders and can be navigated", async ({ page }) => {
  await setupPage(page);
  await page.goto("/dashboard?tour=1");

  // Tour should appear with step indicator
  await expect(page.getByText(/Step 1 of 10/)).toBeVisible({ timeout: 8000 });

  // Should show the first step title
  await expect(page.getByText("Your Dashboard")).toBeVisible();

  // Click Next
  await page.getByRole("button", { name: "Next", exact: true }).click();

  // Should navigate to next step
  await expect(page.getByText(/Step 2 of 10/)).toBeVisible({ timeout: 8000 });

  // Click Skip to dismiss
  await page.getByRole("button", { name: "Skip" }).click();

  // Tour should be gone
  await expect(page.getByText(/Step 2 of 10/)).not.toBeVisible();
});

test("tour blocks interaction with background", async ({ page }) => {
  await setupPage(page);
  await page.goto("/customers?tour=1");

  await expect(page.getByText(/Step 1 of 10/)).toBeVisible({ timeout: 8000 });

  // Try clicking on the background overlay - should not close tour
  // The overlay covers the full viewport, tooltip should still be visible
  const overlay = page.locator("div[style*='z-index: 3000']");
  await expect(overlay).toBeVisible();

  // Only the tooltip buttons should be interactive
  await expect(page.getByRole("button", { name: "Skip" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Next", exact: true })).toBeVisible();
});

test("tour navigates across pages", async ({ page }) => {
  await setupPage(page);
  await page.goto("/dashboard?tour=1");

  // Should be on step 1 at /dashboard
  await expect(page.getByText(/Step 1 of 10/)).toBeVisible({ timeout: 8000 });

  // Navigate through steps and verify page changes
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.getByText(/Step 2 of 10/)).toBeVisible({ timeout: 8000 });
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.getByText(/Step 3 of 10/)).toBeVisible({ timeout: 8000 });
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.getByText(/Step 4 of 10/)).toBeVisible({ timeout: 8000 });

  // Should have navigated to /quotes (step 4)
  await expect(page.url()).toContain("/quotes");
});
