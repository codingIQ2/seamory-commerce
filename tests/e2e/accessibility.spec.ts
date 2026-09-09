import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const criticalRoutes = ["/", "/products", "/products/washed-utility-jacket-charcoal"];

for (const route of criticalRoutes) {
  test(`${route}에 자동 감지 가능한 주요 접근성 위반이 없다`, async ({ page }) => {
    await page.goto(route);
    await expect(page.locator("main")).toBeVisible();
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}

test("키보드 사용자는 본문으로 바로 이동할 수 있다", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skipLink = page.getByRole("link", { name: "본문으로 바로가기" });
  await expect(skipLink).toBeFocused();
  await skipLink.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
});
