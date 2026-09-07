"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getOrCreateCart } from "@/features/cart/data/cart-repository";
import { ProductStatus } from "@/generated/prisma/client";
import { getDb } from "@/server/db/client";

export type CartActionState = { status: "idle" | "success" | "error"; message: string };

const variantSchema = z.string().uuid();

export async function addToCartAction(
  _previous: CartActionState,
  formData: FormData,
): Promise<CartActionState> {
  const parsed = variantSchema.safeParse(formData.get("variantId"));
  if (!parsed.success) return { status: "error", message: "옵션을 선택해 주세요." };

  const variant = await getDb().productVariant.findUnique({
    where: { id: parsed.data },
    include: { product: true },
  });
  if (!variant || !variant.isActive || variant.product.status !== ProductStatus.ACTIVE) {
    return { status: "error", message: "현재 구매할 수 없는 옵션입니다." };
  }
  if (variant.stock < 1) return { status: "error", message: "선택한 옵션은 품절되었습니다." };

  const cart = await getOrCreateCart();
  const existing = await getDb().cartItem.findUnique({
    where: { cartId_variantId: { cartId: cart.id, variantId: variant.id } },
  });
  const quantity = (existing?.quantity ?? 0) + 1;
  if (quantity > 10 || quantity > variant.stock) {
    return { status: "error", message: "구매 가능한 수량을 초과했습니다." };
  }

  await getDb().cartItem.upsert({
    where: { cartId_variantId: { cartId: cart.id, variantId: variant.id } },
    update: { quantity, priceAtAdded: variant.product.salePrice },
    create: {
      cartId: cart.id,
      variantId: variant.id,
      quantity: 1,
      priceAtAdded: variant.product.salePrice,
    },
  });
  revalidatePath("/cart");
  return { status: "success", message: "장바구니에 담았습니다." };
}

export async function updateCartItemAction(formData: FormData) {
  const parsed = z
    .object({
      itemId: z.string().uuid(),
      quantity: z.coerce.number().int().min(1).max(10),
    })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  const cart = await getOrCreateCart();
  const item = await getDb().cartItem.findFirst({
    where: { id: parsed.data.itemId, cartId: cart.id },
    include: { variant: true },
  });
  if (!item) return;
  if (item.variant.stock < 1) return;
  await getDb().cartItem.update({
    where: { id: item.id },
    data: { quantity: Math.min(parsed.data.quantity, item.variant.stock, 10) },
  });
  revalidatePath("/cart");
}

export async function removeCartItemAction(formData: FormData) {
  const itemId = variantSchema.safeParse(formData.get("itemId"));
  if (!itemId.success) return;
  const cart = await getOrCreateCart();
  await getDb().cartItem.deleteMany({ where: { id: itemId.data, cartId: cart.id } });
  revalidatePath("/cart");
}
