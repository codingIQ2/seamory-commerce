import { Check } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getOrderForUser } from "@/features/orders/data/order-repository";
import { formatKrw } from "@/lib/money";
import { getCurrentSession } from "@/server/auth/session";

export const dynamic = "force-dynamic";

export default async function OrderCompletePage({
  params,
}: PageProps<"/orders/[orderNo]/complete">) {
  const session = await getCurrentSession();
  if (!session) redirect("/login?returnTo=%2Faccount%2Forders");
  const order = await getOrderForUser(session.user.id, (await params).orderNo);
  if (!order) notFound();
  return (
    <main className="content-width complete-page" id="main-content" tabIndex={-1}>
      <div className="complete-mark">
        <Check aria-hidden="true" />
      </div>
      <p className="eyebrow">Order complete</p>
      <h1>주문이 완료되었습니다.</h1>
      <p>테스트 주문이 안전하게 생성되었습니다. 실제 결제와 배송은 진행되지 않습니다.</p>
      <dl className="complete-summary">
        <div>
          <dt>주문번호</dt>
          <dd>{order.orderNo}</dd>
        </div>
        <div>
          <dt>결제금액</dt>
          <dd>{formatKrw(order.totalAmount)}</dd>
        </div>
      </dl>
      <div className="button-row">
        <Link className="button button-dark" href={`/account/orders/${order.orderNo}`}>
          주문 상세 보기
        </Link>
        <Link className="button button-ghost" href="/products">
          쇼핑 계속하기
        </Link>
      </div>
    </main>
  );
}
