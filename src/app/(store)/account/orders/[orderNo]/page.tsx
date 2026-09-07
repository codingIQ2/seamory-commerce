import { notFound, redirect } from "next/navigation";

import { getOrderForUser } from "@/features/orders/data/order-repository";
import { orderStatusLabel } from "@/features/orders/domain/order";
import { formatKrw } from "@/lib/money";
import { getCurrentSession } from "@/server/auth/session";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({ params }: PageProps<"/account/orders/[orderNo]">) {
  const session = await getCurrentSession();
  if (!session) redirect("/login?returnTo=%2Faccount%2Forders");
  const order = await getOrderForUser(session.user.id, (await params).orderNo);
  if (!order) notFound();
  return (
    <main className="content-width order-detail-page" id="main-content">
      <header className="page-heading compact">
        <p className="eyebrow">Order detail</p>
        <h1>{order.orderNo}</h1>
        <span className="status-pill">{orderStatusLabel[order.status]}</span>
      </header>
      <div className="order-detail-layout">
        <section className="checkout-panel">
          <h2>주문 상품</h2>
          {order.items.map((item) => (
            <div className="checkout-line" key={item.id}>
              <span>
                <strong>{item.brandName}</strong> {item.productName}
                <small>
                  {item.colorName} / {item.size} · {item.quantity}개
                </small>
              </span>
              <strong>{formatKrw(item.lineAmount)}</strong>
            </div>
          ))}
        </section>
        <aside className="order-summary">
          <p className="eyebrow">Payment</p>
          <dl>
            <div>
              <dt>상품 금액</dt>
              <dd>{formatKrw(order.itemsAmount)}</dd>
            </div>
            <div>
              <dt>할인 금액</dt>
              <dd>-{formatKrw(order.discountAmount)}</dd>
            </div>
            <div>
              <dt>배송비</dt>
              <dd>{order.shippingAmount ? formatKrw(order.shippingAmount) : "무료"}</dd>
            </div>
            <div className="summary-total">
              <dt>총 결제금액</dt>
              <dd>{formatKrw(order.totalAmount)}</dd>
            </div>
          </dl>
          {order.address ? (
            <address>
              {order.address.recipient} · {order.address.phone}
              <br />[{order.address.postalCode}] {order.address.address1} {order.address.address2}
            </address>
          ) : null}
        </aside>
      </div>
    </main>
  );
}
