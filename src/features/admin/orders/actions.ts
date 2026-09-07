"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { InventoryMovementType, OrderStatus, Prisma } from "@/generated/prisma/client";
import { canTransitionOrder } from "@/features/admin/orders/domain/order-transition";
import { assertAdmin, AdminAuthorizationError } from "@/server/auth/admin";
import { getDb } from "@/server/db/client";

export type OrderTransitionState = { status: "idle" | "success" | "error"; message: string };
const transitionSchema = z.object({
  toStatus: z.enum(["PENDING_PAYMENT", "PAID", "PREPARING", "SHIPPED", "DELIVERED", "CANCELLED"]),
  reason: z.string().trim().min(3).max(300),
});

class OrderTransitionError extends Error {}

export async function transitionOrderAction(
  orderId: string,
  orderNo: string,
  _previous: OrderTransitionState,
  formData: FormData,
): Promise<OrderTransitionState> {
  const admin = await assertAdmin();
  const parsed = transitionSchema.safeParse(Object.fromEntries(formData));
  if (!z.string().uuid().safeParse(orderId).success || !parsed.success) {
    return { status: "error", message: "변경할 상태와 사유를 확인해 주세요." };
  }
  try {
    await getDb().$transaction(
      async (tx) => {
        const order = await tx.order.findUniqueOrThrow({
          where: { id: orderId },
          include: { items: true },
        });
        if (!canTransitionOrder(order.status, parsed.data.toStatus)) {
          throw new OrderTransitionError(
            "현재 상태에서 허용되지 않는 변경입니다. 새로고침 후 확인해 주세요.",
          );
        }

        if (parsed.data.toStatus === OrderStatus.CANCELLED) {
          for (const item of order.items) {
            const previousRestore = await tx.inventoryMovement.findUnique({
              where: {
                orderId_variantId_type: {
                  orderId: order.id,
                  variantId: item.variantId,
                  type: InventoryMovementType.ORDER_CANCEL_RESTORE,
                },
              },
            });
            if (previousRestore) throw new OrderTransitionError("이미 재고가 복구된 주문입니다.");
            const variant = await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stock: { increment: item.quantity }, version: { increment: 1 } },
            });
            await tx.inventoryMovement.create({
              data: {
                variantId: item.variantId,
                type: InventoryMovementType.ORDER_CANCEL_RESTORE,
                quantityDelta: item.quantity,
                stockBefore: variant.stock - item.quantity,
                stockAfter: variant.stock,
                orderId: order.id,
                actorUserId: admin.id,
                reason: parsed.data.reason,
              },
            });
          }
        }

        await tx.order.update({
          where: { id: order.id },
          data: {
            status: parsed.data.toStatus,
            ...(parsed.data.toStatus === OrderStatus.PAID && !order.paidAt
              ? { paidAt: new Date() }
              : {}),
            ...(parsed.data.toStatus === OrderStatus.CANCELLED ? { cancelledAt: new Date() } : {}),
            statusHistory: {
              create: {
                fromStatus: order.status,
                toStatus: parsed.data.toStatus,
                actorUserId: admin.id,
                reason: parsed.data.reason,
              },
            },
          },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof OrderTransitionError || error instanceof AdminAuthorizationError
          ? error.message
          : "주문 상태를 변경하지 못했습니다.",
    };
  }
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderNo}`);
  revalidatePath("/account/orders");
  revalidatePath(`/account/orders/${orderNo}`);
  return { status: "success", message: "주문 상태와 감사 이력을 저장했습니다." };
}
