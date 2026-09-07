import Link from "next/link";
import { notFound } from "next/navigation";

import { getAdminOrderByNo } from "@/features/admin/orders/data/admin-order-repository";
import {
  getAllowedOrderTransitions,
  orderStatusLabels,
} from "@/features/admin/orders/domain/order-transition";
import { OrderTransitionForm } from "@/features/admin/orders/ui/order-transition-form";
import { formatKrw } from "@/lib/money";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ orderNo: string }>;
}) {
  const { orderNo } = await params;
  const order = await getAdminOrderByNo(orderNo);
  if (!order) notFound();
  return (
    <>
      <header className="admin-header">
        <div>
          <p className="eyebrow">Order detail</p>
          <h1>{order.orderNo}</h1>
          <p>
            {order.user.name} · {order.user.email} · {order.createdAt.toLocaleString("ko-KR")}
          </p>
        </div>
        <Link className="button button-ghost" href="/admin/orders">
          목록으로
        </Link>
      </header>
      <div className="admin-detail-grid">
        <section className="admin-panel admin-panel-padded">
          <div className="admin-section-heading">
            <h2>주문 상품</h2>
            <span className={`admin-status status-${order.status.toLowerCase()}`}>
              {orderStatusLabels[order.status]}
            </span>
          </div>
          <div className="admin-order-items">
            {order.items.map((item) => (
              <div className="admin-order-line" key={item.id}>
                <div>
                  <strong>{item.productName}</strong>
                  <small>
                    {item.brandName} · {item.colorName} / {item.size} · {item.sku}
                  </small>
                </div>
                <span>{item.quantity}개</span>
                <strong>{formatKrw(item.lineAmount)}</strong>
              </div>
            ))}
          </div>
          <dl className="admin-totals">
            <div>
              <dt>상품 금액</dt>
              <dd>{formatKrw(order.itemsAmount)}</dd>
            </div>
            <div>
              <dt>할인</dt>
              <dd>-{formatKrw(order.discountAmount)}</dd>
            </div>
            <div>
              <dt>배송비</dt>
              <dd>{formatKrw(order.shippingAmount)}</dd>
            </div>
            <div className="total">
              <dt>총 결제액</dt>
              <dd>{formatKrw(order.totalAmount)}</dd>
            </div>
          </dl>
        </section>
        <aside className="admin-detail-aside">
          <section className="admin-panel admin-panel-padded">
            <h2>배송지</h2>
            {order.address ? (
              <address>
                <strong>{order.address.recipient}</strong>
                <span>{order.address.phone}</span>
                <span>
                  ({order.address.postalCode}) {order.address.address1}
                </span>
                {order.address.address2 ? <span>{order.address.address2}</span> : null}
              </address>
            ) : (
              <p>배송지 정보가 없습니다.</p>
            )}
          </section>
          <section className="admin-panel admin-panel-padded">
            <h2>상태 변경</h2>
            <OrderTransitionForm
              allowed={getAllowedOrderTransitions(order.status)}
              orderId={order.id}
              orderNo={order.orderNo}
            />
          </section>
        </aside>
      </div>
      <section className="admin-section">
        <div className="admin-section-heading">
          <div>
            <p className="eyebrow">Immutable audit trail</p>
            <h2>상태 변경 이력</h2>
          </div>
        </div>
        <ol className="admin-timeline">
          {order.statusHistory.map((history) => (
            <li key={history.id}>
              <span className="timeline-dot" />
              <div>
                <strong>
                  {history.fromStatus ? `${orderStatusLabels[history.fromStatus]} → ` : ""}
                  {orderStatusLabels[history.toStatus]}
                </strong>
                <p>{history.reason ?? "사유 없음"}</p>
                <small>
                  {history.actor?.name ?? "시스템"} · {history.createdAt.toLocaleString("ko-KR")}
                </small>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
