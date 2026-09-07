"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { z } from "zod";

import { calculateCartTotals } from "@/features/cart/domain/cart";
import {
  InventoryMovementType,
  OrderStatus,
  PaymentStatus,
  ProductStatus,
  Prisma,
} from "@/generated/prisma/client";
import { getCurrentSession } from "@/server/auth/session";
import { getDb } from "@/server/db/client";

export type CheckoutState = { error: string };

const checkoutSchema = z.object({
  idempotencyKey: z.string().uuid(),
  recipient: z.string().trim().min(2).max(80),
  phone: z
    .string()
    .trim()
    .regex(/^01[016789]-?\d{3,4}-?\d{4}$/),
  postalCode: z.string().trim().min(5).max(12),
  address1: z.string().trim().min(5).max(240),
  address2: z.string().trim().max(240).optional(),
});

class OrderError extends Error {}

export async function placeOrderAction(
  _previous: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const session = await getCurrentSession();
  if (!session) redirect("/login?returnTo=%2Fcheckout");

  const parsed = checkoutSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "배송지 정보를 정확히 입력해 주세요." };

  let orderNo: string;
  try {
    orderNo = await getDb().$transaction(
      async (tx) => {
        const previous = await tx.order.findUnique({
          where: {
            userId_idempotencyKey: {
              userId: session.user.id,
              idempotencyKey: parsed.data.idempotencyKey,
            },
          },
        });
        if (previous) return previous.orderNo;

        const cart = await tx.cart.findUnique({
          where: { userId: session.user.id },
          include: {
            items: { include: { variant: { include: { product: { include: { brand: true } } } } } },
          },
        });
        if (!cart || cart.items.length === 0) throw new OrderError("장바구니가 비어 있습니다.");

        for (const item of cart.items) {
          if (
            item.variant.product.status !== ProductStatus.ACTIVE ||
            !item.variant.isActive ||
            item.variant.stock < item.quantity
          ) {
            throw new OrderError(`${item.variant.product.name}의 재고가 변경되었습니다.`);
          }
        }

        const totals = calculateCartTotals(
          cart.items.map((item) => ({
            unitPrice: item.variant.product.salePrice,
            quantity: item.quantity,
          })),
        );
        const discountAmount = cart.items.reduce(
          (sum, item) =>
            sum + (item.variant.product.listPrice - item.variant.product.salePrice) * item.quantity,
          0,
        );
        const generatedOrderNo = `HKP-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${randomUUID().slice(0, 8).toUpperCase()}`;
        const order = await tx.order.create({
          data: {
            orderNo: generatedOrderNo,
            userId: session.user.id,
            idempotencyKey: parsed.data.idempotencyKey,
            status: OrderStatus.PAID,
            itemsAmount: totals.itemsAmount,
            discountAmount,
            shippingAmount: totals.shippingAmount,
            totalAmount: totals.totalAmount,
            paidAt: new Date(),
            address: {
              create: {
                recipient: parsed.data.recipient,
                phone: parsed.data.phone,
                postalCode: parsed.data.postalCode,
                address1: parsed.data.address1,
                address2: parsed.data.address2 || null,
              },
            },
            items: {
              create: cart.items.map((item) => ({
                variantId: item.variantId,
                productName: item.variant.product.name,
                brandName: item.variant.product.brand.name,
                sku: item.variant.sku,
                colorName: item.variant.colorName,
                size: item.variant.size,
                listUnitPrice: item.variant.product.listPrice,
                saleUnitPrice: item.variant.product.salePrice,
                quantity: item.quantity,
                lineAmount: item.variant.product.salePrice * item.quantity,
              })),
            },
            paymentAttempts: {
              create: {
                providerRef: `TEST-${randomUUID()}`,
                status: PaymentStatus.SUCCEEDED,
                amount: totals.totalAmount,
                processedAt: new Date(),
              },
            },
            statusHistory: {
              create: {
                toStatus: OrderStatus.PAID,
                actorUserId: session.user.id,
                reason: "포트폴리오 테스트 결제 승인",
              },
            },
          },
        });

        for (const item of cart.items) {
          const changed = await tx.productVariant.updateMany({
            where: {
              id: item.variantId,
              stock: { gte: item.quantity },
              version: item.variant.version,
            },
            data: { stock: { decrement: item.quantity }, version: { increment: 1 } },
          });
          if (changed.count !== 1)
            throw new OrderError(`${item.variant.product.name}의 재고가 방금 변경되었습니다.`);
          await tx.inventoryMovement.create({
            data: {
              variantId: item.variantId,
              type: InventoryMovementType.ORDER_DECREMENT,
              quantityDelta: -item.quantity,
              stockBefore: item.variant.stock,
              stockAfter: item.variant.stock - item.quantity,
              orderId: order.id,
              actorUserId: session.user.id,
              reason: "테스트 주문 재고 차감",
            },
          });
        }
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
        return generatedOrderNo;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  } catch (error) {
    return {
      error:
        error instanceof OrderError
          ? error.message
          : "주문 처리 중 문제가 생겼습니다. 잠시 후 다시 시도해 주세요.",
    };
  }
  redirect(`/orders/${orderNo}/complete`);
}
