import type { PreviewProduct } from "@/features/catalog/data/preview-products";
import { calculateDiscountRate, formatKrw } from "@/lib/money";

type ProductCardProps = {
  index: number;
  product: PreviewProduct;
};

export function ProductCard({ index, product }: ProductCardProps) {
  const discountRate = calculateDiscountRate(product.listPrice, product.salePrice);

  return (
    <article className="product-card">
      <div
        className="product-visual"
        data-tone={product.tone}
        role="img"
        aria-label={`${product.name} 이미지 자리표시자`}
      >
        <span className="product-number">{String(index + 1).padStart(2, "0")}</span>
        {product.badge ? <span className="product-badge">{product.badge}</span> : null}
      </div>
      <p className="product-brand">{product.brand}</p>
      <h3 className="product-name">{product.name}</h3>
      <div className="product-price" aria-label="상품 가격">
        {discountRate > 0 ? <span className="discount-rate">{discountRate}%</span> : null}
        <span className="sale-price">{formatKrw(product.salePrice)}</span>
        {discountRate > 0 ? (
          <span className="list-price">정가 {formatKrw(product.listPrice)}</span>
        ) : null}
      </div>
    </article>
  );
}
