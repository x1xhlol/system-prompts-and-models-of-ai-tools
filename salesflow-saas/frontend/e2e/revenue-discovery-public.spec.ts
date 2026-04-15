import { test, expect } from "@playwright/test";

test.describe("Revenue discovery — public marketing alignment", () => {
  test("landing shows enterprise CTA (no public pricing section id)", async ({ page }) => {
    const res = await page.goto("/landing");
    expect(res?.ok()).toBeTruthy();
    await expect(page.locator("#enterprise")).toBeVisible();
    await expect(
      page
        .locator("#enterprise")
        .getByRole("link", { name: /عرض مؤسسي|تحدث مع المبيعات|طلب عرض مؤسسي/ })
        .first(),
    ).toBeVisible();
  });
});
