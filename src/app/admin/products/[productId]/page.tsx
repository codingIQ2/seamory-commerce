import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getAdminProductById,
  getAdminProductOptions,
} from "@/features/admin/products/data/admin-product-repository";
import { productStatusLabel } from "@/features/admin/products/domain/product-form";
import {
  AddVariantForm,
  AdminProductForm,
  StockAdjustmentForm,
} from "@/features/admin/products/ui/admin-product-forms";

export default async function AdminProductDetailPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const [product, options] = await Promise.all([
    getAdminProductById(productId),
    getAdminProductOptions(),
  ]);
  if (!product) notFound();
  const primaryImage = product.images[0];
  return (
    <>
      <header className="admin-header">
        <div>
          <p className="eyebrow">Catalog detail · {productStatusLabel(product.status)}</p>
          <h1>{product.name}</h1>
          <p>
            {product.brand.name} · {product.slug}
          </p>
        </div>
        <Link className="button button-ghost" href="/admin/products">
          목록으로
        </Link>
      </header>
      <section className="admin-panel admin-panel-padded">
        <h2>기본 정보</h2>
        <AdminProductForm
          brands={options.brands}
          categories={options.categories}
          productId={product.id}
          defaults={{
            name: product.name,
            slug: product.slug,
            brandId: product.brandId,
            categoryId: product.categories[0]?.categoryId ?? "",
            description: product.description,
            material: product.material,
            listPrice: product.listPrice,
            salePrice: product.salePrice,
            status: product.status,
            imageUrl: primaryImage?.url ?? "",
            imageAlt: primaryImage?.alt ?? product.name,
          }}
        />
      </section>
      <section className="admin-section">
        <div className="admin-section-heading">
          <div>
            <p className="eyebrow">Variants & inventory</p>
            <h2>옵션·재고</h2>
          </div>
        </div>
        <div className="admin-variant-list">
          {product.variants.map((variant) => (
            <article className="admin-variant-card" key={variant.id}>
              <div className="admin-variant-title">
                <div>
                  <strong>
                    {variant.colorName} / {variant.size}
                  </strong>
                  <small>{variant.sku}</small>
                </div>
                <strong>{variant.stock}개</strong>
              </div>
              <StockAdjustmentForm
                productId={product.id}
                stock={variant.stock}
                variantId={variant.id}
              />
              <details>
                <summary>최근 재고 변경 이력 {variant.inventoryMovements.length}건</summary>
                <ol className="audit-list">
                  {variant.inventoryMovements.map((movement) => (
                    <li key={movement.id}>
                      <span>
                        {movement.stockBefore} → {movement.stockAfter} (
                        {movement.quantityDelta > 0 ? "+" : ""}
                        {movement.quantityDelta})
                      </span>
                      <small>
                        {movement.reason} · {movement.actor?.name ?? "시스템"} ·{" "}
                        {movement.createdAt.toLocaleString("ko-KR")}
                      </small>
                    </li>
                  ))}
                </ol>
              </details>
            </article>
          ))}
        </div>
      </section>
      <section className="admin-panel admin-panel-padded">
        <h2>새 옵션 추가</h2>
        <AddVariantForm productId={product.id} />
      </section>
    </>
  );
}
