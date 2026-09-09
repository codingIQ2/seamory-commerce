export const catalogSortValues = ["newest", "price-asc", "price-desc"] as const;
export type CatalogSort = (typeof catalogSortValues)[number];

export type CatalogFilters = {
  query: string;
  brand: string;
  category: string;
  size: string;
  minPrice?: number;
  maxPrice?: number;
  sort: CatalogSort;
  page: number;
};

export const catalogPageSize = 12;

export function parseCatalogFilters(
  params: Record<string, string | string[] | undefined>,
): CatalogFilters {
  const one = (value: string | string[] | undefined) =>
    typeof value === "string" ? value.trim() : "";
  const number = (value: string | string[] | undefined) => {
    const parsed = Number(one(value));
    return Number.isInteger(parsed) && parsed >= 0 ? parsed : undefined;
  };
  const sortValue = one(params.sort);

  return {
    query: one(params.q).slice(0, 80),
    brand: one(params.brand),
    category: one(params.category),
    size: one(params.size).toUpperCase(),
    minPrice: number(params.minPrice),
    maxPrice: number(params.maxPrice),
    sort: catalogSortValues.includes(sortValue as CatalogSort)
      ? (sortValue as CatalogSort)
      : "newest",
    page: Math.min(Math.max(number(params.page) ?? 1, 1), 1_000),
  };
}
