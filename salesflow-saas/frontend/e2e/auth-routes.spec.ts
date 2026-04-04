import { test, expect } from "@playwright/test";

test.describe("Auth & shell", () => {
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
    await page.waitForURL(/\/login/, { timeout: 15_000 });
    await expect(page).toHaveURL(/\/login/);
  });
});
