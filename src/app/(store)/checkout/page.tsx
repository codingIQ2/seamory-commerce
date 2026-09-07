import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";

import { getCartForDisplay } from "@/features/cart/data/cart-repository";
import { calculateCartTotals } from "@/features/cart/domain/cart";
import { CheckoutForm } from "@/features/checkout/ui/checkout-form";
import { formatKrw } from "@/lib/money";
import { getCurrentSession } from "@/server/auth/session";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/login?returnTo=%2Fcheckout");
  const cart = await getCartForDisplay();
  if (!cart || cart.items.length === 0) redirect("/cart");
  const totals = calculateCartTotals(
    cart.items.map((item) => ({
      unitPrice: item.variant.product.salePrice,
      quantity: item.quantity,
    })),
  );
  return (
    <main className="content-width checkout-page" id="main-content">
      <header className="page-heading compact">
        <p className="eyebrow">Secure test order</p>
        <h1>CHECKOUT</h1>
        <p>{session.user.name}님의 주문입니다.</p>
      </header>
      <div className="checkout-layout">
        <CheckoutForm idempotencyKey={randomUUID()} totalAmount={totals.totalAmount} />
        <aside className="order-summary">
          <p className="eyebrow">Your order</p>
          {cart.items.map((item) => (
            <div className="checkout-line" key={item.id}>
              <span>
                {item.variant.product.name}
                <small>
                  {item.variant.colorName} / {item.variant.size} · {item.quantity}개
                </small>
              </span>
              <strong>{formatKrw(item.variant.product.salePrice * item.quantity)}</strong>
            </div>
          ))}
          <dl>
            <div>
              <dt>상품 금액</dt>
              <dd>{formatKrw(totals.itemsAmount)}</dd>
            </div>
            <div>
              <dt>배송비</dt>
              <dd>{totals.shippingAmount ? formatKrw(totals.shippingAmount) : "무료"}</dd>
            </div>
            <div className="summary-total">
              <dt>총 결제금액</dt>
              <dd>{formatKrw(totals.totalAmount)}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </main>
  );
}
