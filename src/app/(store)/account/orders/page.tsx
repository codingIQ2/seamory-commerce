import Link from "next/link";
import { redirect } from "next/navigation";

import { getOrdersByUser } from "@/features/orders/data/order-repository";
import { orderStatusLabel } from "@/features/orders/domain/order";
import { formatKrw } from "@/lib/money";
import { getCurrentSession } from "@/server/auth/session";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/login?returnTo=%2Faccount%2Forders");
  const orders = await getOrdersByUser(session.user.id);
  return (
    <main className="content-width orders-page" id="main-content" tabIndex={-1}>
      <header className="page-heading compact">
        <p className="eyebrow">My account</p>
        <h1>ORDERS</h1>
        <p>{session.user.name}님의 주문 내역입니다.</p>
      </header>
      {orders.length === 0 ? (
        <section className="empty-state">
          <h2>아직 주문이 없습니다.</h2>
          <Link className="button button-dark" href="/products">
            첫 상품 고르기
          </Link>
        </section>
      ) : (
        <div className="order-list">
          {orders.map((order) => (
            <article className="order-card" key={order.id}>
              <div>
                <p className="eyebrow">{order.createdAt.toLocaleDateString("ko-KR")}</p>
                <h2>
                  {order.items[0]?.productName}
                  {order._count.items > 1 ? ` 외 ${order._count.items - 1}건` : ""}
                </h2>
                <p>{order.orderNo}</p>
              </div>
              <div>
                <span className="status-pill">{orderStatusLabel[order.status]}</span>
                <strong>{formatKrw(order.totalAmount)}</strong>
                <Link className="text-button" href={`/account/orders/${order.orderNo}`}>
                  상세 보기 →
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
