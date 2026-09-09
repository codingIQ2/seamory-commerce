import { describe, expect, it } from "vitest";

import { parseCatalogFilters } from "@/features/catalog/domain/catalog";

describe("parseCatalogFilters", () => {
  it("normalizes query, size and valid price filters", () => {
    expect(parseCatalogFilters({ q: "  재킷 ", size: "m", minPrice: "10000" })).toMatchObject({
      query: "재킷",
      size: "M",
      minPrice: 10000,
      sort: "newest",
      page: 1,
    });
  });

  it("rejects invalid sort and negative prices", () => {
    expect(parseCatalogFilters({ sort: "popular", maxPrice: "-1" })).toMatchObject({
      sort: "newest",
      maxPrice: undefined,
      page: 1,
    });
  });

  it("accepts only a bounded positive page number", () => {
    expect(parseCatalogFilters({ page: "3" }).page).toBe(3);
    expect(parseCatalogFilters({ page: "0" }).page).toBe(1);
    expect(parseCatalogFilters({ page: "99999" }).page).toBe(1000);
  });
});
