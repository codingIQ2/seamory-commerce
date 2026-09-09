import { expect, test } from "@playwright/test";

test("비회원 장바구니가 가입 후 테스트 주문까지 이어진다", async ({ page }) => {
  await page.goto("/products/washed-utility-jacket-charcoal");
  await page.locator('input[name="variantId"]:not(:disabled)').first().check();
  await page.getByRole("button", { name: "장바구니에 담기" }).click();
  await expect(page.getByRole("status")).toContainText("장바구니");

  await page.goto("/cart");
  await expect(page.getByRole("heading", { name: "CART" })).toBeVisible();
  await page.getByRole("link", { name: "주문하기" }).click();
  await expect(page).toHaveURL(/\/login\?returnTo=/);

  await page.getByRole("link", { name: "회원가입" }).click();
  const unique = Date.now();
  await page.getByLabel("이름").fill("품질 테스트 회원");
  await page.getByLabel("이메일").fill(`quality-${unique}@example.com`);
  await page.getByLabel("비밀번호").fill("QualityTest!2026");
  await page.getByRole("button", { name: "회원가입" }).click();
  await expect(page).toHaveURL(/\/checkout$/);

  await page.getByLabel("받는 분").fill("테스트 수령인");
  await page.getByLabel("연락처").fill("010-1234-5678");
  await page.getByLabel("우편번호").fill("04524");
  await page.getByLabel("주소", { exact: true }).fill("서울특별시 중구 세종대로 110");
  await page.getByLabel("상세 주소").fill("테스트 주문");
  await page.getByRole("button", { name: /테스트 결제하기/ }).click();
  await expect(page).toHaveURL(/\/orders\/HKP-[^/]+\/complete$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("주문");
});
