import Link from "next/link";

import { orderStatusLabels } from "@/features/admin/orders/domain/order-transition";
import { ProductStatus } from "@/generated/prisma/client";
import { formatKrw } from "@/lib/money";
import { getDb } from "@/server/db/client";

export default async function AdminDashboardPage() {
  const [activeProducts, lowStock, openOrders, revenue, recentOrders] = await Promise.all([
    getDb().product.count({ where: { status: ProductStatus.ACTIVE } }),
    getDb().productVariant.count({ where: { isActive: true, stock: { lte: 3 } } }),
    getDb().order.count({ where: { status: { in: ["PAID", "PREPARING", "SHIPPED"] } } }),
    getDb().order.aggregate({
      where: { status: { not: "CANCELLED" } },
      _sum: { totalAmount: true },
    }),
    getDb().order.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { address: true } }),
  ]);
  return (
    <>
      <header className="admin-header">
        <div>
          <p className="eyebrow">Operations overview</p>
          <h1>대시보드</h1>
          <p>상품, 재고, 주문 운영 상태를 한눈에 확인합니다.</p>
        </div>
      </header>
      <section className="admin-metrics">
        <article>
          <span>판매 상품</span>
          <strong>{activeProducts}</strong>
          <Link href="/admin/products?status=ACTIVE">상품 보기</Link>
        </article>
        <article>
          <span>재고 3개 이하 옵션</span>
          <strong>{lowStock}</strong>
          <Link href="/admin/products">재고 확인</Link>
        </article>
        <article>
          <span>처리 중 주문</span>
          <strong>{openOrders}</strong>
          <Link href="/admin/orders">주문 보기</Link>
        </article>
        <article>
          <span>테스트 누적 매출</span>
          <strong>{formatKrw(revenue._sum.totalAmount ?? 0)}</strong>
          <small>취소 주문 제외</small>
        </article>
      </section>
      <section className="admin-panel">
        <div className="admin-panel-heading">
          <div>
            <p className="eyebrow">Latest orders</p>
            <h2>최근 주문</h2>
          </div>
          <Link className="text-button" href="/admin/orders">
            전체 보기
          </Link>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>주문번호</th>
                <th>수령인</th>
                <th>상태</th>
                <th>결제액</th>
                <th>주문일</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <Link className="text-button" href={`/admin/orders/${order.orderNo}`}>
                      {order.orderNo}
                    </Link>
                  </td>
                  <td>{order.address?.recipient ?? "-"}</td>
                  <td>
                    <span className={`admin-status status-${order.status.toLowerCase()}`}>
                      {orderStatusLabels[order.status]}
                    </span>
                  </td>
                  <td>{formatKrw(order.totalAmount)}</td>
                  <td>{order.createdAt.toLocaleString("ko-KR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {recentOrders.length === 0 ? (
          <div className="admin-empty-inline">
            <strong>아직 주문이 없습니다.</strong>
            <Link href="/">스토어 보기</Link>
          </div>
        ) : null}
      </section>
    </>
  );
}
