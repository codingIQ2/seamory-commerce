import { Boxes, LayoutDashboard, LogOut, PackagePlus, ReceiptText, Store } from "lucide-react";
import Link from "next/link";

import { SignOutButton } from "@/features/auth/ui/sign-out-button";

export function AdminSidebar({ adminName }: { adminName: string }) {
  return (
    <aside className="admin-sidebar">
      <div>
        <Link className="admin-wordmark" href="/admin/products">
          HUKUPUKU<span>ADMIN</span>
        </Link>
        <nav aria-label="관리자 메뉴">
          <Link href="/admin">
            <LayoutDashboard aria-hidden="true" size={18} />
            대시보드
          </Link>
          <Link href="/admin/products">
            <Boxes aria-hidden="true" size={18} />
            상품 관리
          </Link>
          <Link href="/admin/products/new">
            <PackagePlus aria-hidden="true" size={18} />
            상품 등록
          </Link>
          <Link href="/admin/orders">
            <ReceiptText aria-hidden="true" size={18} />
            주문 관리
          </Link>
        </nav>
      </div>
      <div className="admin-account">
        <strong>{adminName}</strong>
        <span>ADMINISTRATOR</span>
        <Link href="/">
          <Store aria-hidden="true" size={16} />
          스토어 보기
        </Link>
        <span className="admin-signout">
          <LogOut aria-hidden="true" size={16} />
          <SignOutButton />
        </span>
      </div>
    </aside>
  );
}
