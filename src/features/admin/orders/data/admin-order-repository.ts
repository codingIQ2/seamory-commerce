import "server-only";

import { OrderStatus, Prisma } from "@/generated/prisma/client";
import { getDb } from "@/server/db/client";

export type AdminOrderFilters = { query: string; status: OrderStatus | ""; from?: Date; to?: Date };

export async function getAdminOrders(filters: AdminOrderFilters) {
  const where: Prisma.OrderWhereInput = {
    ...(filters.query
      ? {
          OR: [
            { orderNo: { contains: filters.query, mode: "insensitive" as const } },
            { user: { email: { contains: filters.query, mode: "insensitive" as const } } },
            { address: { recipient: { contains: filters.query, mode: "insensitive" as const } } },
          ],
        }
      : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.from || filters.to
      ? {
          createdAt: {
            ...(filters.from ? { gte: filters.from } : {}),
            ...(filters.to ? { lte: filters.to } : {}),
          },
        }
      : {}),
  };
  return getDb().order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { email: true } },
      address: true,
      _count: { select: { items: true } },
    },
  });
}

export async function getAdminOrderByNo(orderNo: string) {
  return getDb().order.findUnique({
    where: { orderNo },
    include: {
      user: { select: { name: true, email: true } },
      address: true,
      items: { orderBy: { id: "asc" } },
      paymentAttempts: { orderBy: { createdAt: "desc" } },
      statusHistory: {
        orderBy: { createdAt: "desc" },
        include: { actor: { select: { name: true, email: true } } },
      },
    },
  });
}
