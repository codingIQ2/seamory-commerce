import { redirect } from "next/navigation";

import { AuthForm } from "@/features/auth/ui/auth-form";
import { getCurrentSession, safeReturnTo } from "@/server/auth/session";

type AuthPageProps = { searchParams: Promise<{ returnTo?: string }> };

export default async function SignupPage({ searchParams }: AuthPageProps) {
  const returnTo = safeReturnTo((await searchParams).returnTo);
  if (await getCurrentSession()) redirect(returnTo);
  return (
    <section className="auth-panel">
      <p className="eyebrow">Join HUKUPUKU</p>
      <h1>당신의 셀렉션을 시작하세요.</h1>
      <p>회원가입 즉시 장바구니가 계정에 안전하게 연결됩니다.</p>
      <AuthForm mode="signup" returnTo={returnTo} />
    </section>
  );
}
