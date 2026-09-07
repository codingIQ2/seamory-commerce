import "server-only";

import { Prisma, ProductStatus } from "@/generated/prisma/client";
import { getDb } from "@/server/db/client";

export type AdminProductFilters = { query: string; status: ProductStatus | "" };

export async function getAdminProducts(filters: AdminProductFilters) {
  const where: Prisma.ProductWhereInput = {
    ...(filters.query
      ? {
          OR: [
            { name: { contains: filters.query, mode: "insensitive" } },
            { slug: { contains: filters.query, mode: "insensitive" } },
            { brand: { name: { contains: filters.query, mode: "insensitive" } } },
          ],
        }
      : {}),
    ...(filters.status ? { status: filters.status } : {}),
  };
  return getDb().product.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: {
      brand: true,
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      variants: { select: { stock: true, isActive: true } },
    },
  });
}

export async function getAdminProductById(id: string) {
  return getDb().product.findUnique({
    where: { id },
    include: {
      brand: true,
      images: { orderBy: { sortOrder: "asc" } },
      categories: { include: { category: true } },
      variants: {
        orderBy: [{ colorName: "asc" }, { size: "asc" }],
        include: {
          inventoryMovements: {
            orderBy: { createdAt: "desc" },
            take: 5,
            include: { actor: { select: { name: true } } },
          },
        },
      },
    },
  });
}

export async function getAdminProductOptions() {
  const [brands, categories] = await Promise.all([
    getDb().brand.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    getDb().category.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
  ]);
  return { brands, categories };
}
