import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AddToCartForm } from "@/features/cart/ui/add-to-cart-form";
import { getProductBySlug } from "@/features/catalog/data/catalog-repository";
import { calculateDiscountRate, formatKrw } from "@/lib/money";
import { getPublicAppUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/products/[slug]">): Promise<Metadata> {
  const product = await getProductBySlug((await params).slug);
  if (!product) return { title: "상품을 찾을 수 없습니다" };
  const title = `${product.brand.name} ${product.name}`;
  const description = product.description.slice(0, 150);
  const image = product.images[0]
    ? new URL(product.images[0].url, getPublicAppUrl()).toString()
    : undefined;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: image ? [{ url: image, alt: product.images[0].alt }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const discountRate = calculateDiscountRate(product.listPrice, product.salePrice);
  const available = product.variants.some((variant) => variant.stock > 0);

  return (
    <main className="content-width detail-page" id="main-content" tabIndex={-1}>
      <nav className="breadcrumb" aria-label="현재 위치">
        <Link href="/products">SHOP</Link>
        <span>/</span>
        <span>{product.name}</span>
      </nav>
      <div className="product-detail">
        <div className="detail-gallery">
          {product.images[0] ? (
            <Image
              alt={product.images[0].alt}
              fill
              priority
              sizes="(max-width: 860px) 100vw, 58vw"
              src={product.images[0].url}
            />
          ) : null}
        </div>
        <section className="detail-info">
          <p className="product-brand">{product.brand.name}</p>
          <h1>{product.name}</h1>
          <div className="detail-price">
            {discountRate > 0 ? <strong className="discount-rate">{discountRate}%</strong> : null}
            <strong>{formatKrw(product.salePrice)}</strong>
            {discountRate > 0 ? <del>{formatKrw(product.listPrice)}</del> : null}
          </div>
          <p className="detail-description">{product.description}</p>
          <dl className="detail-facts">
            <div>
              <dt>소재</dt>
              <dd>{product.material}</dd>
            </div>
            <div>
              <dt>배송</dt>
              <dd>3,000원 · 10만원 이상 무료배송</dd>
            </div>
            <div>
              <dt>안내</dt>
              <dd>포트폴리오용 테스트 상품이며 실제 결제되지 않습니다.</dd>
            </div>
          </dl>
          <AddToCartForm available={available} variants={product.variants} />
        </section>
      </div>
    </main>
  );
}
