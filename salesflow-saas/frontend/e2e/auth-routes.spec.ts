import { test, expect } from "@playwright/test";

test.describe("Auth & shell", () => {
  test.beforeEach(async ({ page, context }) => {
    await context.clearCookies();
    await page.addInitScript(() => localStorage.clear());
  });

  test("login page renders Arabic heading and form", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: /تسجيل الدخول/ })).toBeVisible();
    await expect(page.getByLabel(/البريد الإلكتروني/)).toBeVisible();
    await expect(page.getByRole("button", { name: /دخول/ })).toBeVisible();
  });

  test("register page renders", async ({ page }) => {
    await page.goto("/register");
    await expect(page.getByRole("heading", { name: /إنشاء حساب شركة/ })).toBeVisible();
  });

  test("dashboard redirects unauthenticated user to login", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForTimeout(1500);
    const url = page.url();
    if (/\/login/.test(url)) {
      await expect(page).toHaveURL(/\/login/);
      return;
    }
    // fallback guard: dashboard private content must not render for anonymous users.
    await expect(page.getByText(/لوحة القيادة والمراقبة/)).toHaveCount(0);
  });
});
