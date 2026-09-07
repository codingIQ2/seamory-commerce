import { redirect } from "next/navigation";

import { AuthForm } from "@/features/auth/ui/auth-form";
import { getCurrentSession, safeReturnTo } from "@/server/auth/session";

type AuthPageProps = { searchParams: Promise<{ returnTo?: string }> };

export default async function LoginPage({ searchParams }: AuthPageProps) {
  const returnTo = safeReturnTo((await searchParams).returnTo);
  if (await getCurrentSession()) redirect(returnTo);
  return (
    <section className="auth-panel">
      <p className="eyebrow">Member access</p>
      <h1>다시 만나 반가워요.</h1>
      <p>주문을 이어가고 구매 내역을 확인하세요.</p>
      <AuthForm mode="login" returnTo={returnTo} />
    </section>
  );
}
