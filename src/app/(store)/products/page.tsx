import Link from "next/link";

import { getCatalogOptions, getCatalogProducts } from "@/features/catalog/data/catalog-repository";
import { parseCatalogFilters } from "@/features/catalog/domain/catalog";
import { ProductCard } from "@/features/catalog/ui/product-card";

export const dynamic = "force-dynamic";

type ProductsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const filters = parseCatalogFilters(await searchParams);
  const [catalog, options] = await Promise.all([getCatalogProducts(filters), getCatalogOptions()]);
  const { products, total, page, pageCount } = catalog;

  function pageHref(targetPage: number) {
    const params = new URLSearchParams();
    if (filters.query) params.set("q", filters.query);
    if (filters.brand) params.set("brand", filters.brand);
    if (filters.category) params.set("category", filters.category);
    if (filters.size) params.set("size", filters.size);
    if (filters.minPrice !== undefined) params.set("minPrice", String(filters.minPrice));
    if (filters.maxPrice !== undefined) params.set("maxPrice", String(filters.maxPrice));
    if (filters.sort !== "newest") params.set("sort", filters.sort);
    if (targetPage > 1) params.set("page", String(targetPage));
    const query = params.toString();
    return query ? `/products?${query}` : "/products";
  }

  return (
    <main className="content-width catalog-page" id="main-content" tabIndex={-1}>
      <header className="page-heading">
        <p className="eyebrow">Selected goods / 2026</p>
        <h1>SHOP</h1>
        <p>계절을 넘어 오래 입을 수 있는 형태와 소재를 골랐습니다.</p>
      </header>

      <form className="catalog-filters" method="get">
        <label className="field field-wide">
          <span>검색</span>
          <input defaultValue={filters.query} name="q" placeholder="상품명 또는 브랜드" />
        </label>
        <label className="field">
          <span>브랜드</span>
          <select defaultValue={filters.brand} name="brand">
            <option value="">전체</option>
            {options.brands.map((brand) => (
              <option key={brand.id} value={brand.slug}>
                {brand.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>카테고리</span>
          <select defaultValue={filters.category} name="category">
            <option value="">전체</option>
            {options.categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>사이즈</span>
          <select defaultValue={filters.size} name="size">
            <option value="">전체</option>
            {options.sizes.map((size) => (
              <option key={size}>{size}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>최저 가격</span>
          <input
            defaultValue={filters.minPrice}
            min="0"
            name="minPrice"
            placeholder="0"
            step="1000"
            type="number"
          />
        </label>
        <label className="field">
          <span>최고 가격</span>
          <input
            defaultValue={filters.maxPrice}
            min="0"
            name="maxPrice"
            placeholder="300000"
            step="1000"
            type="number"
          />
        </label>
        <label className="field">
          <span>정렬</span>
          <select defaultValue={filters.sort} name="sort">
            <option value="newest">신상품순</option>
            <option value="price-asc">낮은 가격순</option>
            <option value="price-desc">높은 가격순</option>
          </select>
        </label>
        <button className="button button-dark" type="submit">
          적용
        </button>
        <Link className="button button-ghost" href="/products">
          초기화
        </Link>
      </form>

      <div className="catalog-result-bar">
        <strong>{total} PRODUCTS</strong>
        <span>표시 가격은 부가세 포함 금액입니다.</span>
      </div>

      {products.length > 0 ? (
        <div className="product-grid">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      ) : (
        <section className="empty-state">
          <p className="eyebrow">No result</p>
          <h2>조건에 맞는 상품이 없습니다.</h2>
          <p>검색어나 필터를 바꿔 다시 찾아보세요.</p>
          <Link className="button button-dark" href="/products">
            전체 상품 보기
          </Link>
        </section>
      )}
      {total > 0 && pageCount > 1 ? (
        <nav aria-label="상품 목록 페이지" className="pagination">
          {page > 1 ? (
            <Link href={pageHref(page - 1)} rel="prev">
              이전
            </Link>
          ) : (
            <span aria-disabled="true">이전</span>
          )}
          <strong aria-current="page">
            {page} / {pageCount}
          </strong>
          {page < pageCount ? (
            <Link href={pageHref(page + 1)} rel="next">
              다음
            </Link>
          ) : (
            <span aria-disabled="true">다음</span>
          )}
        </nav>
      ) : null}
    </main>
  );
}
