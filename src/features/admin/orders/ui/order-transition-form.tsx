"use client";

import { useActionState } from "react";

import { transitionOrderAction, type OrderTransitionState } from "@/features/admin/orders/actions";
import { orderStatusLabels } from "@/features/admin/orders/domain/order-transition";
import type { OrderStatus } from "@/generated/prisma/client";

const initialState: OrderTransitionState = { status: "idle", message: "" };

export function OrderTransitionForm({
  orderId,
  orderNo,
  allowed,
}: {
  orderId: string;
  orderNo: string;
  allowed: readonly OrderStatus[];
}) {
  const [state, action, pending] = useActionState(
    transitionOrderAction.bind(null, orderId, orderNo),
    initialState,
  );
  if (allowed.length === 0)
    return (
      <p className="admin-terminal-note">이 주문은 최종 상태이므로 더 이상 변경할 수 없습니다.</p>
    );
  return (
    <form action={action} className="order-transition-form">
      <label className="field">
        <span>다음 상태</span>
        <select name="toStatus" required>
          {allowed.map((status) => (
            <option key={status} value={status}>
              {orderStatusLabels[status]}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>변경 사유</span>
        <input minLength={3} name="reason" placeholder="출고 처리, 고객 요청 취소 등" required />
      </label>
      <button className="button button-dark" disabled={pending} type="submit">
        {pending ? "변경 중…" : "상태 변경"}
      </button>
      {state.message ? (
        <p className={`form-message ${state.status}`} role="status">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
