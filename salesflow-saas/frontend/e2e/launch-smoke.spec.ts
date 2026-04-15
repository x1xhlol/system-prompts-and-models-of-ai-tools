import { test, expect } from "@playwright/test";

/**
 * Public / low-auth smoke for launch readiness (strategy docs shell, landing).
 */
test.describe("Launch smoke — public routes", () => {
  test("strategy page loads without 5xx", async ({ page }) => {
    const res = await page.goto("/strategy");
    expect(res?.ok()).toBeTruthy();
    await expect(page.locator("body")).toBeVisible();
  });

  test("landing or root resolves", async ({ page }) => {
    const res = await page.goto("/landing");
    expect(res?.ok()).toBeTruthy();
    await expect(page.locator("body")).toBeVisible();
  });
});
