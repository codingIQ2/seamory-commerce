"use client";

import { useActionState } from "react";

import {
  addVariantAction,
  adjustStockAction,
  createProductAction,
  updateProductAction,
  type AdminFormState,
} from "@/features/admin/products/actions";
import { editableProductStatuses } from "@/features/admin/products/domain/product-form";

const initialState: AdminFormState = { status: "idle", message: "" };
type Option = { id: string; name: string };
type ProductDefaults = {
  name: string;
  slug: string;
  brandId: string;
  categoryId: string;
  description: string;
  material: string;
  listPrice: number;
  salePrice: number;
  status: string;
  imageUrl: string;
  imageAlt: string;
};

const statusLabels = { DRAFT: "초안", ACTIVE: "판매 중", SOLD_OUT: "품절", ARCHIVED: "보관" };

export function AdminProductForm({
  brands,
  categories,
  productId,
  defaults,
}: {
  brands: Option[];
  categories: Option[];
  productId?: string;
  defaults?: ProductDefaults;
}) {
  const action = productId ? updateProductAction.bind(null, productId) : createProductAction;
  const [state, formAction, pending] = useActionState(action, initialState);
  return (
    <form action={formAction} className="admin-form-stack">
      <div className="admin-form-grid">
        <label className="field admin-span-2">
          <span>상품명</span>
          <input defaultValue={defaults?.name} maxLength={160} name="name" required />
        </label>
        <label className="field">
          <span>URL slug</span>
          <input
            defaultValue={defaults?.slug}
            name="slug"
            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
            required
          />
        </label>
        <label className="field">
          <span>판매 상태</span>
          <select defaultValue={defaults?.status ?? "DRAFT"} name="status">
            {editableProductStatuses.map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>브랜드</span>
          <select defaultValue={defaults?.brandId} name="brandId" required>
            <option value="">선택</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>카테고리</span>
          <select defaultValue={defaults?.categoryId} name="categoryId" required>
            <option value="">선택</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>정상가</span>
          <input
            defaultValue={defaults?.listPrice}
            min="0"
            name="listPrice"
            required
            type="number"
          />
        </label>
        <label className="field">
          <span>판매가</span>
          <input
            defaultValue={defaults?.salePrice}
            min="0"
            name="salePrice"
            required
            type="number"
          />
        </label>
        <label className="field admin-span-2">
          <span>대표 이미지 경로</span>
          <input
            defaultValue={defaults?.imageUrl}
            name="imageUrl"
            placeholder="/images/products/example.webp"
            required
          />
        </label>
        <label className="field admin-span-2">
          <span>이미지 대체 설명</span>
          <input defaultValue={defaults?.imageAlt} name="imageAlt" required />
        </label>
        <label className="field admin-span-2">
          <span>상품 설명</span>
          <textarea defaultValue={defaults?.description} name="description" required rows={5} />
        </label>
        <label className="field admin-span-2">
          <span>소재 및 관리법</span>
          <textarea defaultValue={defaults?.material} name="material" required rows={3} />
        </label>
      </div>
      {!productId ? <InitialVariantFields /> : null}
      <FormResult state={state} />
      <button className="button button-dark" disabled={pending} type="submit">
        {pending ? "저장 중…" : productId ? "상품 정보 저장" : "상품과 첫 옵션 등록"}
      </button>
    </form>
  );
}

function InitialVariantFields() {
  return (
    <fieldset className="admin-fieldset">
      <legend>첫 번째 옵션</legend>
      <VariantFields />
    </fieldset>
  );
}

function VariantFields() {
  return (
    <div className="admin-form-grid admin-form-grid-variant">
      <label className="field">
        <span>SKU</span>
        <input name="sku" placeholder="HKP-JACKET-BLK-M" required />
      </label>
      <label className="field">
        <span>색상명</span>
        <input name="colorName" required />
      </label>
      <label className="field">
        <span>색상 코드</span>
        <input defaultValue="#111111" name="colorCode" pattern="#[0-9A-Fa-f]{6}" />
      </label>
      <label className="field">
        <span>사이즈</span>
        <input name="size" placeholder="M" required />
      </label>
      <label className="field">
        <span>초기 재고</span>
        <input defaultValue="0" min="0" name="stock" required type="number" />
      </label>
    </div>
  );
}

export function AddVariantForm({ productId }: { productId: string }) {
  const [state, action, pending] = useActionState(
    addVariantAction.bind(null, productId),
    initialState,
  );
  return (
    <form action={action} className="admin-form-stack">
      <VariantFields />
      <FormResult state={state} />
      <button className="button button-dark" disabled={pending} type="submit">
        {pending ? "추가 중…" : "옵션 추가"}
      </button>
    </form>
  );
}

export function StockAdjustmentForm({
  productId,
  variantId,
  stock,
}: {
  productId: string;
  variantId: string;
  stock: number;
}) {
  const [state, action, pending] = useActionState(
    adjustStockAction.bind(null, productId, variantId),
    initialState,
  );
  return (
    <form action={action} className="stock-form">
      <label className="field">
        <span>변경 후 수량</span>
        <input defaultValue={stock} min="0" name="newStock" required type="number" />
      </label>
      <label className="field">
        <span>변경 사유</span>
        <input minLength={3} name="reason" placeholder="입고, 실사 조정 등" required />
      </label>
      <button className="button button-ghost" disabled={pending} type="submit">
        {pending ? "저장 중…" : "재고 저장"}
      </button>
      <FormResult state={state} />
    </form>
  );
}

function FormResult({ state }: { state: AdminFormState }) {
  return state.message ? (
    <p className={`form-message ${state.status}`} role="status">
      {state.message}
    </p>
  ) : null;
}
