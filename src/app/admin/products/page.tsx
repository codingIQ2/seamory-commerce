import Image from "next/image";
import Link from "next/link";

import { ProductStatus } from "@/generated/prisma/client";
import { getAdminProducts } from "@/features/admin/products/data/admin-product-repository";
import { formatKrw } from "@/lib/money";

const statusLabel: Record<ProductStatus, string> = {
  DRAFT: "초안",
  ACTIVE: "판매 중",
  SOLD_OUT: "품절",
  ARCHIVED: "보관",
};
type AdminProductsPageProps = { searchParams: Promise<{ q?: string; status?: string }> };

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  const params = await searchParams;
  const status = Object.values(ProductStatus).includes(params.status as ProductStatus)
    ? (params.status as ProductStatus)
    : "";
  const products = await getAdminProducts({ query: params.q?.trim().slice(0, 80) ?? "", status });
  return (
    <>
      <header className="admin-header">
        <div>
          <p className="eyebrow">Catalog operations</p>
          <h1>상품 관리</h1>
          <p>고객에게 노출되는 상품과 옵션 재고를 관리합니다.</p>
        </div>
        <Link className="button button-dark" href="/admin/products/new">
          새 상품 등록
        </Link>
      </header>
      <section className="admin-panel">
        <form className="admin-filters" method="get">
          <label className="field">
            <span>검색</span>
            <input defaultValue={params.q} name="q" placeholder="상품명, 브랜드, slug" />
          </label>
          <label className="field">
            <span>판매 상태</span>
            <select defaultValue={status} name="status">
              <option value="">전체</option>
              {Object.values(ProductStatus).map((value) => (
                <option key={value} value={value}>
                  {statusLabel[value]}
                </option>
              ))}
            </select>
          </label>
          <button className="button button-dark" type="submit">
            조회
          </button>
          <Link className="button button-ghost" href="/admin/products">
            초기화
          </Link>
        </form>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>상품</th>
                <th>상태</th>
                <th>판매가</th>
                <th>옵션</th>
                <th>총 재고</th>
                <th>최근 수정</th>
                <th>
                  <span className="sr-only">관리</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const stock = product.variants
                  .filter((variant) => variant.isActive)
                  .reduce((sum, variant) => sum + variant.stock, 0);
                return (
                  <tr key={product.id}>
                    <td>
                      <div className="admin-product-cell">
                        {product.images[0] ? (
                          <span className="admin-thumb">
                            <Image alt="" fill sizes="64px" src={product.images[0].url} />
                          </span>
                        ) : null}
                        <span>
                          <strong>{product.name}</strong>
                          <small>
                            {product.brand.name} · {product.slug}
                          </small>
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`admin-status status-${product.status.toLowerCase()}`}>
                        {statusLabel[product.status]}
                      </span>
                    </td>
                    <td>{formatKrw(product.salePrice)}</td>
                    <td>{product.variants.length}</td>
                    <td>{stock}</td>
                    <td>{product.updatedAt.toLocaleDateString("ko-KR")}</td>
                    <td>
                      <Link className="text-button" href={`/admin/products/${product.id}`}>
                        관리 →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {products.length === 0 ? (
          <div className="admin-empty-inline">
            <strong>조건에 맞는 상품이 없습니다.</strong>
            <Link href="/admin/products">전체 상품 보기</Link>
          </div>
        ) : null}
      </section>
    </>
  );
}
