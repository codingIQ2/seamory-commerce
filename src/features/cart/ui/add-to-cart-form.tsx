"use client";

import { useActionState } from "react";

import { addToCartAction, type CartActionState } from "@/features/cart/actions";

type Variant = { id: string; colorName: string; size: string; stock: number };
const initialState: CartActionState = { status: "idle", message: "" };

export function AddToCartForm({
  available,
  variants,
}: {
  available: boolean;
  variants: Variant[];
}) {
  const [state, action, pending] = useActionState(addToCartAction, initialState);
  return (
    <form action={action} className="add-cart-form">
      <fieldset disabled={!available || pending}>
        <legend>옵션 선택</legend>
        <div className="variant-grid">
          {variants.map((variant) => (
            <label
              className={variant.stock === 0 ? "variant sold-out" : "variant"}
              key={variant.id}
            >
              <input
                disabled={variant.stock === 0}
                name="variantId"
                required
                type="radio"
                value={variant.id}
              />
              <span>
                {variant.colorName} / {variant.size}
              </span>
              <small>{variant.stock === 0 ? "품절" : `${variant.stock}개 남음`}</small>
            </label>
          ))}
        </div>
      </fieldset>
      <button
        className="button button-dark button-full"
        disabled={!available || pending}
        type="submit"
      >
        {pending ? "담는 중…" : available ? "장바구니에 담기" : "품절"}
      </button>
      {state.message ? (
        <p className={`form-message ${state.status}`} role="status">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
