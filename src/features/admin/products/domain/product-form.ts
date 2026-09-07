import { z } from "zod";

import type { ProductStatus } from "@/generated/prisma/client";

export const editableProductStatuses = ["DRAFT", "ACTIVE", "SOLD_OUT", "ARCHIVED"] as const;

const money = z.coerce.number().int().min(0).max(100_000_000);
const imagePath = z
  .string()
  .trim()
  .min(1, "대표 이미지 경로를 입력해 주세요.")
  .refine(
    (value) => value.startsWith("/") || /^https:\/\//.test(value),
    "이미지는 /로 시작하는 내부 경로 또는 https 주소여야 합니다.",
  );

export const productFormSchema = z
  .object({
    name: z.string().trim().min(2).max(160),
    slug: z
      .string()
      .trim()
      .min(2)
      .max(180)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    brandId: z.string().uuid(),
    categoryId: z.string().uuid(),
    description: z.string().trim().min(10).max(4_000),
    material: z.string().trim().min(2).max(500),
    listPrice: money,
    salePrice: money,
    status: z.enum(editableProductStatuses),
    imageUrl: imagePath,
    imageAlt: z.string().trim().min(2).max(240),
  })
  .refine((value) => value.salePrice <= value.listPrice, {
    path: ["salePrice"],
    message: "판매가는 정상가보다 높을 수 없습니다.",
  });

export const variantFormSchema = z.object({
  sku: z
    .string()
    .trim()
    .min(3)
    .max(80)
    .regex(/^[A-Za-z0-9_-]+$/),
  colorName: z.string().trim().min(1).max(80),
  colorCode: z
    .string()
    .trim()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .or(z.literal("")),
  size: z.string().trim().min(1).max(40),
  stock: z.coerce.number().int().min(0).max(1_000_000),
});

export const stockAdjustmentSchema = z.object({
  newStock: z.coerce.number().int().min(0).max(1_000_000),
  reason: z.string().trim().min(3, "재고 변경 사유를 3자 이상 입력해 주세요.").max(300),
});

export type ProductFormInput = z.infer<typeof productFormSchema>;

export function parseProductForm(formData: FormData) {
  return productFormSchema.safeParse(Object.fromEntries(formData));
}

export function productStatusLabel(status: ProductStatus) {
  return {
    DRAFT: "초안",
    ACTIVE: "판매 중",
    SOLD_OUT: "품절",
    ARCHIVED: "보관",
  }[status];
}
