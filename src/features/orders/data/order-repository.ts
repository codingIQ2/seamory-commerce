import "server-only";

import { getDb } from "@/server/db/client";

export function getOrdersByUser(userId: string) {
  return getDb().order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { items: { take: 1 }, _count: { select: { items: true } } },
  });
}

export function getOrderForUser(userId: string, orderNo: string) {
  return getDb().order.findFirst({
    where: { userId, orderNo },
    include: {
      address: true,
      items: true,
      paymentAttempts: true,
      statusHistory: { orderBy: { createdAt: "asc" } },
    },
  });
}
