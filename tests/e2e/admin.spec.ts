import { expect, test } from "@playwright/test";

const adminEmail = process.env.ADMIN_SEED_EMAIL ?? "admin@hukupuku.local";
const adminPassword = process.env.ADMIN_SEED_PASSWORD ?? "Hukupuku!2026";

test("관리자는 운영 대시보드와 상품·주문 화면을 사용할 수 있다", async ({ page }) => {
  await page.goto("/login?returnTo=/admin");
  await page.getByLabel("이메일").fill(adminEmail);
  await page.getByLabel("비밀번호").fill(adminPassword);
  await page.getByRole("button", { name: "로그인" }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole("heading", { name: "대시보드" })).toBeVisible();

  await page.getByRole("link", { name: "상품 관리" }).click();
  await expect(page.getByRole("heading", { name: "상품 관리" })).toBeVisible();
  await page.getByRole("link", { name: "주문 관리" }).click();
  await expect(page.getByRole("heading", { name: "주문 관리" })).toBeVisible();
});

test("일반 회원은 관리자 화면에 접근할 수 없다", async ({ page }) => {
  await page.goto("/signup?returnTo=/admin");
  await page.getByLabel("이름").fill("일반 회원");
  await page.getByLabel("이메일").fill(`member-${Date.now()}@example.com`);
  await page.getByLabel("비밀번호").fill("MemberTest!2026");
  await page.getByRole("button", { name: "회원가입" }).click();
  await expect(page).toHaveURL(/\/forbidden$/);
  await expect(page.getByRole("heading", { name: "관리자 권한이 없습니다." })).toBeVisible();
});
