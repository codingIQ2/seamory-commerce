import { expect, test } from "@playwright/test";

test("홈에서 브랜드와 첫 셀렉션을 확인한다", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/HUKUPUKU/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("오래 입을수록");
  await expect(page.getByRole("heading", { level: 2, name: "이번 주 새로 고른 것" })).toBeVisible();
  await expect(page.getByRole("article")).toHaveCount(4);
});
