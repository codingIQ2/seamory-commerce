import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";

import { getCurrentSession } from "@/server/auth/session";
import { getDb } from "@/server/db/client";

const CART_COOKIE = "hukupuku_cart";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function getCartForDisplay() {
  const [session, cookieStore] = await Promise.all([getCurrentSession(), cookies()]);
  const token = cookieStore.get(CART_COOKIE)?.value;
  const where = session?.user.id
    ? { userId: session.user.id }
    : token
      ? { anonymousTokenHash: hashToken(token) }
      : null;

  if (!where) return null;

  return getDb().cart.findFirst({
    where,
    include: {
      items: {
        orderBy: { createdAt: "asc" },
        include: {
          variant: {
            include: {
              product: {
                include: { brand: true, images: { orderBy: { sortOrder: "asc" }, take: 1 } },
              },
            },
          },
        },
      },
    },
  });
}

export async function getOrCreateCart() {
  const session = await getCurrentSession();
  if (session?.user.id) {
    return getDb().cart.upsert({
      where: { userId: session.user.id },
      update: {},
      create: { userId: session.user.id },
    });
  }

  const cookieStore = await cookies();
  let token = cookieStore.get(CART_COOKIE)?.value;
  if (!token) {
    token = randomBytes(32).toString("base64url");
    cookieStore.set(CART_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
  }

  const anonymousTokenHash = hashToken(token);
  return getDb().cart.upsert({
    where: { anonymousTokenHash },
    update: {},
    create: { anonymousTokenHash },
  });
}

export async function mergeGuestCartIntoMember() {
  const [session, cookieStore] = await Promise.all([getCurrentSession(), cookies()]);
  const token = cookieStore.get(CART_COOKIE)?.value;
  if (!session?.user.id || !token) return;

  const anonymousTokenHash = hashToken(token);
  const guestCart = await getDb().cart.findUnique({
    where: { anonymousTokenHash },
    include: { items: true },
  });
  if (!guestCart) return;

  await getDb().$transaction(async (tx) => {
    const memberCart = await tx.cart.upsert({
      where: { userId: session.user.id },
      update: {},
      create: { userId: session.user.id },
    });
    for (const item of guestCart.items) {
      const existing = await tx.cartItem.findUnique({
        where: { cartId_variantId: { cartId: memberCart.id, variantId: item.variantId } },
      });
      await tx.cartItem.upsert({
        where: { cartId_variantId: { cartId: memberCart.id, variantId: item.variantId } },
        update: { quantity: Math.min(10, (existing?.quantity ?? 0) + item.quantity) },
        create: {
          cartId: memberCart.id,
          variantId: item.variantId,
          quantity: item.quantity,
          priceAtAdded: item.priceAtAdded,
        },
      });
    }
    await tx.cart.delete({ where: { id: guestCart.id } });
  });
  cookieStore.delete(CART_COOKIE);
}
