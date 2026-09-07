"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { InventoryMovementType, Prisma, ProductStatus } from "@/generated/prisma/client";
import {
  parseProductForm,
  stockAdjustmentSchema,
  variantFormSchema,
} from "@/features/admin/products/domain/product-form";
import { assertAdmin, AdminAuthorizationError } from "@/server/auth/admin";
import { getDb } from "@/server/db/client";

export type AdminFormState = { status: "idle" | "success" | "error"; message: string };
const uuidSchema = z.string().uuid();

function errorMessage(error: unknown, fallback: string) {
  if (error instanceof AdminAuthorizationError) return error.message;
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    return "이미 사용 중인 slug, SKU 또는 옵션 조합입니다.";
  }
  return fallback;
}

function revalidateProduct(productId?: string) {
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/admin/products");
  if (productId) revalidatePath(`/admin/products/${productId}`);
}

export async function createProductAction(
  _previous: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const admin = await assertAdmin();
  const product = parseProductForm(formData);
  const variant = variantFormSchema.safeParse(Object.fromEntries(formData));
  if (!product.success || !variant.success) {
    return { status: "error", message: "상품과 첫 옵션의 입력값을 확인해 주세요." };
  }

  let productId: string;
  try {
    productId = await getDb().$transaction(async (tx) => {
      const created = await tx.product.create({
        data: {
          brandId: product.data.brandId,
          name: product.data.name,
          slug: product.data.slug,
          description: product.data.description,
          material: product.data.material,
          listPrice: product.data.listPrice,
          salePrice: product.data.salePrice,
          status: product.data.status,
          publishedAt: product.data.status === ProductStatus.ACTIVE ? new Date() : null,
          images: {
            create: { url: product.data.imageUrl, alt: product.data.imageAlt, sortOrder: 0 },
          },
          categories: { create: { categoryId: product.data.categoryId } },
        },
      });
      const createdVariant = await tx.productVariant.create({
        data: {
          productId: created.id,
          sku: variant.data.sku.toUpperCase(),
          colorName: variant.data.colorName,
          colorCode: variant.data.colorCode || null,
          size: variant.data.size.toUpperCase(),
          stock: variant.data.stock,
        },
      });
      await tx.inventoryMovement.create({
        data: {
          variantId: createdVariant.id,
          type: InventoryMovementType.ADMIN_ADJUSTMENT,
          quantityDelta: variant.data.stock,
          stockBefore: 0,
          stockAfter: variant.data.stock,
          actorUserId: admin.id,
          reason: "상품 등록 초기 재고",
        },
      });
      return created.id;
    });
  } catch (error) {
    return { status: "error", message: errorMessage(error, "상품을 등록하지 못했습니다.") };
  }
  revalidateProduct(productId);
  redirect(`/admin/products/${productId}`);
}

export async function updateProductAction(
  productId: string,
  _previous: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await assertAdmin();
  if (!uuidSchema.safeParse(productId).success)
    return { status: "error", message: "잘못된 상품입니다." };
  const parsed = parseProductForm(formData);
  if (!parsed.success) return { status: "error", message: "상품 입력값을 확인해 주세요." };
  try {
    await getDb().$transaction(async (tx) => {
      const current = await tx.product.findUniqueOrThrow({ where: { id: productId } });
      await tx.product.update({
        where: { id: productId },
        data: {
          brandId: parsed.data.brandId,
          name: parsed.data.name,
          slug: parsed.data.slug,
          description: parsed.data.description,
          material: parsed.data.material,
          listPrice: parsed.data.listPrice,
          salePrice: parsed.data.salePrice,
          status: parsed.data.status,
          publishedAt:
            parsed.data.status === ProductStatus.ACTIVE
              ? (current.publishedAt ?? new Date())
              : current.publishedAt,
          categories: {
            deleteMany: {},
            create: { categoryId: parsed.data.categoryId },
          },
          images: {
            upsert: {
              where: { productId_sortOrder: { productId, sortOrder: 0 } },
              create: { url: parsed.data.imageUrl, alt: parsed.data.imageAlt, sortOrder: 0 },
              update: { url: parsed.data.imageUrl, alt: parsed.data.imageAlt },
            },
          },
        },
      });
    });
  } catch (error) {
    return { status: "error", message: errorMessage(error, "상품을 수정하지 못했습니다.") };
  }
  revalidateProduct(productId);
  return { status: "success", message: "상품 정보를 저장했습니다." };
}

export async function addVariantAction(
  productId: string,
  _previous: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const admin = await assertAdmin();
  const parsedId = uuidSchema.safeParse(productId);
  const parsed = variantFormSchema.safeParse(Object.fromEntries(formData));
  if (!parsedId.success || !parsed.success) {
    return { status: "error", message: "옵션 입력값을 확인해 주세요." };
  }
  try {
    await getDb().$transaction(async (tx) => {
      const variant = await tx.productVariant.create({
        data: {
          productId,
          sku: parsed.data.sku.toUpperCase(),
          colorName: parsed.data.colorName,
          colorCode: parsed.data.colorCode || null,
          size: parsed.data.size.toUpperCase(),
          stock: parsed.data.stock,
        },
      });
      await tx.inventoryMovement.create({
        data: {
          variantId: variant.id,
          type: InventoryMovementType.ADMIN_ADJUSTMENT,
          quantityDelta: parsed.data.stock,
          stockBefore: 0,
          stockAfter: parsed.data.stock,
          actorUserId: admin.id,
          reason: "신규 옵션 초기 재고",
        },
      });
    });
  } catch (error) {
    return { status: "error", message: errorMessage(error, "옵션을 추가하지 못했습니다.") };
  }
  revalidateProduct(productId);
  return { status: "success", message: "새 옵션을 추가했습니다." };
}

export async function adjustStockAction(
  productId: string,
  variantId: string,
  _previous: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const admin = await assertAdmin();
  const parsed = stockAdjustmentSchema.safeParse(Object.fromEntries(formData));
  if (
    !uuidSchema.safeParse(productId).success ||
    !uuidSchema.safeParse(variantId).success ||
    !parsed.success
  ) {
    return { status: "error", message: "수량과 변경 사유를 확인해 주세요." };
  }
  try {
    await getDb().$transaction(
      async (tx) => {
        const current = await tx.productVariant.findFirstOrThrow({
          where: { id: variantId, productId },
        });
        const changed = await tx.productVariant.updateMany({
          where: { id: variantId, version: current.version },
          data: { stock: parsed.data.newStock, version: { increment: 1 } },
        });
        if (changed.count !== 1) throw new Error("inventory_conflict");
        await tx.inventoryMovement.create({
          data: {
            variantId,
            type: InventoryMovementType.ADMIN_ADJUSTMENT,
            quantityDelta: parsed.data.newStock - current.stock,
            stockBefore: current.stock,
            stockAfter: parsed.data.newStock,
            actorUserId: admin.id,
            reason: parsed.data.reason,
          },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  } catch (error) {
    return {
      status: "error",
      message: errorMessage(error, "재고가 변경되었습니다. 새로고침 후 다시 시도해 주세요."),
    };
  }
  revalidateProduct(productId);
  return { status: "success", message: "재고와 감사 이력을 저장했습니다." };
}
