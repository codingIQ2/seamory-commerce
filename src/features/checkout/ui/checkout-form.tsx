"use client";

import { useActionState } from "react";

import { placeOrderAction } from "@/features/checkout/actions";
import { formatKrw } from "@/lib/money";

export function CheckoutForm({
  idempotencyKey,
  totalAmount,
}: {
  idempotencyKey: string;
  totalAmount: number;
}) {
  const [state, action, pending] = useActionState(placeOrderAction, { error: "" });
  return (
    <form action={action} aria-busy={pending} className="checkout-form">
      <input name="idempotencyKey" type="hidden" value={idempotencyKey} />
      <section className="checkout-panel">
        <p className="eyebrow">Shipping address</p>
        <h2>배송지</h2>
        <div className="form-grid">
          <label className="field">
            <span>받는 분</span>
            <input autoComplete="name" name="recipient" required />
          </label>
          <label className="field">
            <span>연락처</span>
            <input autoComplete="tel" name="phone" placeholder="010-1234-5678" required />
          </label>
          <label className="field">
            <span>우편번호</span>
            <input autoComplete="postal-code" name="postalCode" required />
          </label>
          <label className="field field-full">
            <span>주소</span>
            <input autoComplete="address-line1" name="address1" required />
          </label>
          <label className="field field-full">
            <span>상세 주소</span>
            <input autoComplete="address-line2" name="address2" />
          </label>
        </div>
      </section>
      <section className="checkout-panel test-payment">
        <p className="eyebrow">Test payment</p>
        <h2>테스트 결제</h2>
        <p>카드번호를 입력하지 않습니다. 버튼을 누르면 테스트 주문이 즉시 생성됩니다.</p>
      </section>
      {state.error ? (
        <p className="form-error" role="alert">
          {state.error}
        </p>
      ) : null}
      <button className="button button-dark button-full" disabled={pending} type="submit">
        {pending ? "주문 처리 중…" : `${formatKrw(totalAmount)} 테스트 결제하기`}
      </button>
    </form>
  );
}
