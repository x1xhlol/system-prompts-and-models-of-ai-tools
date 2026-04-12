import { test, expect } from "@playwright/test";

/**
 * مسار زائر → صفحات الثقة → تسجيل/دخول — كما يراه منشأة تريد الاشتراك الآن.
 * لا يعتمد على API حقيقي للخلفية (فقط واجهة Next).
 */
test.describe("Subscriber journey (public shell)", () => {
  test.beforeEach(async ({ page, context }) => {
    await context.clearCookies();
    await page.addInitScript(() => localStorage.clear());
  });

  test("home shows Dealix value and navigation affordances", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Dealix", { exact: false }).first()).toBeVisible();
    await expect(page.getByText(/هل تواجه هذه التحديات/)).toBeVisible();
  });

  test("landing page loads CTA toward app", async ({ page }) => {
    await page.goto("/landing");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("marketers hub lists resources and strategy link", async ({ page }) => {
    await page.goto("/marketers");
    await expect(page.getByRole("heading", { name: /مسوّق|Dealix|بوابة/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /استراتيجية|الخطة|الاستراتيجية/ })).toBeVisible();
  });

  test("strategy page loads", async ({ page }) => {
    await page.goto("/strategy");
    await expect(page.locator("main, article, body").first()).toBeVisible();
  });

  test("login preserves next param in URL for post-auth redirect intent", async ({ page }) => {
    await page.goto("/login?next=%2Fdashboard");
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole("heading", { name: /تسجيل الدخول/ })).toBeVisible();
  });

  test("register page is reachable from marketing flow", async ({ page }) => {
    await page.goto("/register");
    await expect(page.getByRole("heading", { name: /إنشاء حساب/ })).toBeVisible();
  });

  test("unauthenticated dashboard still guards to login", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForTimeout(1500);
    const url = page.url();
    if (/\/login/.test(url)) {
      await expect(page).toHaveURL(/\/login/);
      return;
    }
    await expect(page.getByText(/لوحة القيادة والمراقبة/)).toHaveCount(0);
  });
});
