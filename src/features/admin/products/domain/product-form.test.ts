import { describe, expect, it } from "vitest";

import { productFormSchema, stockAdjustmentSchema } from "./product-form";

const validProduct = {
  name: "Archive Work Jacket",
  slug: "archive-work-jacket",
  brandId: "123e4567-e89b-12d3-a456-426614174000",
  categoryId: "123e4567-e89b-12d3-a456-426614174001",
  description: "튼튼한 코튼으로 제작한 워크 재킷입니다.",
  material: "Cotton 100%",
  listPrice: 159000,
  salePrice: 139000,
  status: "DRAFT",
  imageUrl: "/images/products/archive-work-jacket.webp",
  imageAlt: "아카이브 워크 재킷",
};

describe("admin product validation", () => {
  it("accepts a valid product", () => {
    expect(productFormSchema.safeParse(validProduct).success).toBe(true);
  });

  it("rejects a sale price above the list price", () => {
    expect(
      productFormSchema.safeParse({ ...validProduct, salePrice: validProduct.listPrice + 1 })
        .success,
    ).toBe(false);
  });

  it("requires a reason for inventory adjustments", () => {
    expect(stockAdjustmentSchema.safeParse({ newStock: 10, reason: "" }).success).toBe(false);
  });
});
