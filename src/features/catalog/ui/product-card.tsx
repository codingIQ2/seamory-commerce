import Image from "next/image";
import Link from "next/link";

import type { CatalogProduct } from "@/features/catalog/data/catalog-repository";
import { calculateDiscountRate, formatKrw } from "@/lib/money";

type ProductCardProps = {
  index: number;
  product: CatalogProduct;
};

export function ProductCard({ index, product }: ProductCardProps) {
  const discountRate = calculateDiscountRate(product.listPrice, product.salePrice);

  return (
    <article className="product-card">
      <Link className="product-visual" href={`/products/${product.slug}`}>
        {product.images[0] ? (
          <Image
            alt={product.images[0].alt}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 960px) 50vw, 25vw"
            src={product.images[0].url}
          />
        ) : null}
        <span className="product-number">{String(index + 1).padStart(2, "0")}</span>
        {product.variants.every((variant) => variant.stock === 0) ? (
          <span className="product-badge">SOLD OUT</span>
        ) : null}
      </Link>
      <p className="product-brand">{product.brand.name}</p>
      <h3 className="product-name">
        <Link href={`/products/${product.slug}`}>{product.name}</Link>
      </h3>
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
