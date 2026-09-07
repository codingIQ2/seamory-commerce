import { describe, expect, it } from "vitest";

import { calculateCartTotals } from "@/features/cart/domain/cart";

describe("calculateCartTotals", () => {
  it("adds shipping below the free-shipping threshold", () => {
    expect(calculateCartTotals([{ unitPrice: 49_000, quantity: 2 }])).toEqual({
      itemsAmount: 98_000,
      shippingAmount: 3_000,
      totalAmount: 101_000,
    });
  });

  it("ships free from 100,000 won", () => {
    expect(calculateCartTotals([{ unitPrice: 50_000, quantity: 2 }]).shippingAmount).toBe(0);
  });
});
