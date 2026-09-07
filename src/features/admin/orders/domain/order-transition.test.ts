import { describe, expect, it } from "vitest";

import { canTransitionOrder, getAllowedOrderTransitions } from "./order-transition";

describe("admin order transitions", () => {
  it("allows only the next fulfillment step", () => {
    expect(canTransitionOrder("PAID", "PREPARING")).toBe(true);
    expect(canTransitionOrder("PAID", "DELIVERED")).toBe(false);
  });

  it("allows cancellation only before shipping", () => {
    expect(canTransitionOrder("PREPARING", "CANCELLED")).toBe(true);
    expect(canTransitionOrder("SHIPPED", "CANCELLED")).toBe(false);
  });

  it("makes terminal states immutable", () => {
    expect(getAllowedOrderTransitions("DELIVERED")).toEqual([]);
    expect(getAllowedOrderTransitions("CANCELLED")).toEqual([]);
  });
});
