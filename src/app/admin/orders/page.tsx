import Link from "next/link";

import { getAdminOrders } from "@/features/admin/orders/data/admin-order-repository";
import { orderStatusLabels } from "@/features/admin/orders/domain/order-transition";
import { OrderStatus } from "@/generated/prisma/client";
import { formatKrw } from "@/lib/money";

type Props = { searchParams: Promise<{ q?: string; status?: string; from?: string; to?: string }> };
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
function dateParam(value: string | undefined, end = false) {
  if (!value || !datePattern.test(value)) return undefined;
  const date = new Date(`${value}T${end ? "23:59:59.999" : "00:00:00"}+09:00`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export default async function AdminOrdersPage({ searchParams }: Props) {
  const params = await searchParams;
  const status = Object.values(OrderStatus).includes(params.status as OrderStatus)
    ? (params.status as OrderStatus)
    : "";
  const orders = await getAdminOrders({
    query: params.q?.trim().slice(0, 80) ?? "",
    status,
    from: dateParam(params.from),
    to: dateParam(params.to, true),
  });
  return (
    <>
      <header className="admin-header">
        <div>
          <p className="eyebrow">Order operations</p>
          <h1>주문 관리</h1>
          <p>결제 이후의 준비·배송·취소 상태를 안전하게 처리합니다.</p>
        </div>
      </header>
      <section className="admin-panel">
        <form className="admin-filters admin-order-filters" method="get">
          <label className="field">
            <span>검색</span>
            <input defaultValue={params.q} name="q" placeholder="주문번호, 이메일, 수령인" />
          </label>
          <label className="field">
            <span>상태</span>
            <select defaultValue={status} name="status">
              <option value="">전체</option>
              {Object.values(OrderStatus).map((value) => (
                <option key={value} value={value}>
                  {orderStatusLabels[value]}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>시작일</span>
            <input defaultValue={params.from} name="from" type="date" />
          </label>
          <label className="field">
            <span>종료일</span>
            <input defaultValue={params.to} name="to" type="date" />
          </label>
          <button className="button button-dark" type="submit">
            조회
          </button>
          <Link className="button button-ghost" href="/admin/orders">
            초기화
          </Link>
        </form>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>주문번호</th>
                <th>주문자</th>
                <th>상태</th>
                <th>품목</th>
                <th>결제액</th>
                <th>주문일</th>
                <th>
                  <span className="sr-only">관리</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <strong>{order.orderNo}</strong>
                  </td>
                  <td>
                    {order.address?.recipient ?? "-"}
                    <small className="admin-cell-sub">{order.user.email}</small>
                  </td>
                  <td>
                    <span className={`admin-status status-${order.status.toLowerCase()}`}>
                      {orderStatusLabels[order.status]}
                    </span>
                  </td>
                  <td>{order._count.items}</td>
                  <td>{formatKrw(order.totalAmount)}</td>
                  <td>{order.createdAt.toLocaleString("ko-KR")}</td>
                  <td>
                    <Link className="text-button" href={`/admin/orders/${order.orderNo}`}>
                      상세
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {orders.length === 0 ? (
          <div className="admin-empty-inline">
            <strong>조건에 맞는 주문이 없습니다.</strong>
            <Link href="/admin/orders">전체 주문 보기</Link>
          </div>
        ) : null}
      </section>
    </>
  );
}
