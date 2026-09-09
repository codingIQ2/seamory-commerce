import Image from "next/image";
import Link from "next/link";

import { removeCartItemAction, updateCartItemAction } from "@/features/cart/actions";
import { getCartForDisplay } from "@/features/cart/data/cart-repository";
import { calculateCartTotals } from "@/features/cart/domain/cart";
import { ProductStatus } from "@/generated/prisma/client";
import { formatKrw } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const cart = await getCartForDisplay();
  const items = cart?.items ?? [];
  const totals = calculateCartTotals(
    items.map((item) => ({
      unitPrice: item.variant.product.salePrice,
      quantity: item.quantity,
    })),
  );
  const invalid = items.some(
    (item) =>
      item.variant.product.status !== ProductStatus.ACTIVE ||
      !item.variant.isActive ||
      item.variant.stock < item.quantity,
  );

  return (
    <main className="content-width cart-page" id="main-content" tabIndex={-1}>
      <header className="page-heading compact">
        <p className="eyebrow">Your selection</p>
        <h1>CART</h1>
      </header>
      {items.length === 0 ? (
        <section className="empty-state">
          <h2>장바구니가 비어 있습니다.</h2>
          <p>오래 함께할 옷을 천천히 골라보세요.</p>
          <Link className="button button-dark" href="/products">
            상품 보러 가기
          </Link>
        </section>
      ) : (
        <div className="cart-layout">
          <section className="cart-lines" aria-label="장바구니 상품">
            {items.map((item) => {
              const product = item.variant.product;
              const unavailable =
                product.status !== ProductStatus.ACTIVE ||
                !item.variant.isActive ||
                item.variant.stock < item.quantity;
              const changed = item.priceAtAdded !== product.salePrice;
              return (
                <article className="cart-line" key={item.id}>
                  <Link className="cart-thumb" href={`/products/${product.slug}`}>
                    {product.images[0] ? (
                      <Image
                        alt={product.images[0].alt}
                        fill
                        sizes="120px"
                        src={product.images[0].url}
                      />
                    ) : null}
                  </Link>
                  <div className="cart-line-info">
                    <p className="product-brand">{product.brand.name}</p>
                    <h2>
                      <Link href={`/products/${product.slug}`}>{product.name}</Link>
                    </h2>
                    <p>
                      {item.variant.colorName} / {item.variant.size}
                    </p>
                    {changed ? (
                      <p className="notice">
                        현재 가격 {formatKrw(product.salePrice)}으로 갱신되었습니다.
                      </p>
                    ) : null}
                    {unavailable ? (
                      <p className="form-error">재고가 부족하거나 판매가 종료된 상품입니다.</p>
                    ) : null}
                  </div>
                  <div className="cart-line-controls">
                    <strong>{formatKrw(product.salePrice * item.quantity)}</strong>
                    <form action={updateCartItemAction}>
                      <input name="itemId" type="hidden" value={item.id} />
                      <label>
                        <span className="sr-only">수량</span>
                        <select defaultValue={item.quantity} name="quantity">
                          {Array.from(
                            { length: Math.min(10, item.variant.stock) },
                            (_, index) => index + 1,
                          ).map((qty) => (
                            <option key={qty}>{qty}</option>
                          ))}
                        </select>
                      </label>
                      <button className="text-button" type="submit">
                        변경
                      </button>
                    </form>
                    <form action={removeCartItemAction}>
                      <input name="itemId" type="hidden" value={item.id} />
                      <button className="text-button muted" type="submit">
                        삭제
                      </button>
                    </form>
                  </div>
                </article>
              );
            })}
          </section>
          <aside className="order-summary">
            <p className="eyebrow">Order summary</p>
            <dl>
              <div>
                <dt>상품 금액</dt>
                <dd>{formatKrw(totals.itemsAmount)}</dd>
              </div>
              <div>
                <dt>배송비</dt>
                <dd>{totals.shippingAmount === 0 ? "무료" : formatKrw(totals.shippingAmount)}</dd>
              </div>
              <div className="summary-total">
                <dt>결제 예정 금액</dt>
                <dd>{formatKrw(totals.totalAmount)}</dd>
              </div>
            </dl>
            <Link
              aria-disabled={invalid}
              className={`button button-dark button-full${invalid ? "disabled" : ""}`}
              href={invalid ? "/cart" : "/checkout"}
            >
              주문하기
            </Link>
            <small>실제 결제가 발생하지 않는 포트폴리오 테스트 주문입니다.</small>
          </aside>
        </div>
      )}
    </main>
  );
}
