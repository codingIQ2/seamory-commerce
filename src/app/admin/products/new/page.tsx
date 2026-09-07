import Link from "next/link";

import { getAdminProductOptions } from "@/features/admin/products/data/admin-product-repository";
import { AdminProductForm } from "@/features/admin/products/ui/admin-product-forms";

export default async function NewAdminProductPage() {
  const { brands, categories } = await getAdminProductOptions();
  return (
    <>
      <header className="admin-header">
        <div>
          <p className="eyebrow">New catalog item</p>
          <h1>상품 등록</h1>
          <p>기본 정보와 첫 번째 판매 옵션을 함께 등록합니다.</p>
        </div>
        <Link className="button button-ghost" href="/admin/products">
          목록으로
        </Link>
      </header>
      <section className="admin-panel admin-panel-padded">
        <AdminProductForm brands={brands} categories={categories} />
      </section>
    </>
  );
}
