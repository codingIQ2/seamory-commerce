import { expect, test } from "@playwright/test";

test("모든 화면에 기본 보안 헤더가 적용된다", async ({ request }) => {
  const response = await request.get("/");
  expect(response.headers()["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(response.headers()["x-content-type-options"]).toBe("nosniff");
  expect(response.headers()["x-frame-options"]).toBe("DENY");
  expect(response.headers()["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(response.headers()["permissions-policy"]).toContain("camera=()");
});

test("비로그인 사용자는 관리자 화면에 직접 접근할 수 없다", async ({ request }) => {
  const response = await request.get("/admin", { maxRedirects: 0 });
  expect(response.status()).toBe(307);
  expect(response.headers().location).toContain("/login");
});

test("외부 주소를 로그인 복귀 경로로 사용할 수 없다", async ({ page }) => {
  await page.goto("/login?returnTo=https://example.com/steal");
  await expect(page.getByRole("link", { name: "회원가입" })).toHaveAttribute(
    "href",
    "/signup?returnTo=%2F",
  );
});
