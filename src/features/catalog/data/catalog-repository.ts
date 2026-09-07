import "server-only";

import { ProductStatus, Prisma } from "@/generated/prisma/client";
import type { CatalogFilters } from "@/features/catalog/domain/catalog";
import { getDb } from "@/server/db/client";

export type CatalogProduct = {
  id: string;
  slug: string;
  name: string;
  listPrice: number;
  salePrice: number;
  brand: { name: string; slug: string };
  images: { url: string; alt: string }[];
  variants: { stock: number }[];
};

const cardSelect = {
  id: true,
  slug: true,
  name: true,
  listPrice: true,
  salePrice: true,
  brand: { select: { name: true, slug: true } },
  images: { orderBy: { sortOrder: "asc" as const }, select: { url: true, alt: true } },
  variants: { where: { isActive: true }, select: { stock: true } },
} satisfies Prisma.ProductSelect;

export async function getCatalogProducts(filters: CatalogFilters) {
  const where: Prisma.ProductWhereInput = {
    status: ProductStatus.ACTIVE,
    ...(filters.query
      ? {
          OR: [
            { name: { contains: filters.query, mode: "insensitive" } },
            { brand: { name: { contains: filters.query, mode: "insensitive" } } },
          ],
        }
      : {}),
    ...(filters.brand ? { brand: { slug: filters.brand } } : {}),
    ...(filters.category ? { categories: { some: { category: { slug: filters.category } } } } : {}),
    ...(filters.size
      ? { variants: { some: { size: filters.size, isActive: true, stock: { gt: 0 } } } }
      : {}),
    ...(filters.minPrice !== undefined || filters.maxPrice !== undefined
      ? {
          salePrice: {
            ...(filters.minPrice !== undefined ? { gte: filters.minPrice } : {}),
            ...(filters.maxPrice !== undefined ? { lte: filters.maxPrice } : {}),
          },
        }
      : {}),
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    filters.sort === "price-asc"
      ? { salePrice: "asc" }
      : filters.sort === "price-desc"
        ? { salePrice: "desc" }
        : { publishedAt: "desc" };

  return getDb().product.findMany({ where, orderBy, select: cardSelect });
}

export async function getFeaturedProducts(limit = 4) {
  return getDb().product.findMany({
    where: { status: ProductStatus.ACTIVE },
    orderBy: { publishedAt: "desc" },
    take: limit,
    select: cardSelect,
  });
}

export async function getCatalogOptions() {
  const [brands, categories, sizes] = await Promise.all([
    getDb().brand.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    getDb().category.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    getDb().productVariant.findMany({
      where: { isActive: true, stock: { gt: 0 } },
      distinct: ["size"],
      select: { size: true },
      orderBy: { size: "asc" },
    }),
  ]);
  return { brands, categories, sizes: sizes.map((item) => item.size) };
}

export async function getProductBySlug(slug: string) {
  return getDb().product.findFirst({
    where: { slug, status: ProductStatus.ACTIVE },
    include: {
      brand: true,
      images: { orderBy: { sortOrder: "asc" } },
      variants: { where: { isActive: true }, orderBy: [{ colorName: "asc" }, { size: "asc" }] },
      categories: { include: { category: true } },
    },
  });
}
