import type { OrderStatus } from "@/generated/prisma/client";

export const orderStatusLabels: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "결제 대기",
  PAID: "결제 완료",
  PREPARING: "상품 준비 중",
  SHIPPED: "배송 중",
  DELIVERED: "배송 완료",
  CANCELLED: "주문 취소",
};

const transitions: Record<OrderStatus, readonly OrderStatus[]> = {
  PENDING_PAYMENT: ["PAID", "CANCELLED"],
  PAID: ["PREPARING", "CANCELLED"],
  PREPARING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

export function getAllowedOrderTransitions(status: OrderStatus) {
  return transitions[status];
}

export function canTransitionOrder(from: OrderStatus, to: OrderStatus) {
  return transitions[from].includes(to);
}
