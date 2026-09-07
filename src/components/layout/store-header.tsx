import { Menu, Search, ShoppingBag, UserRound } from "lucide-react";
import Link from "next/link";

import { SignOutButton } from "@/features/auth/ui/sign-out-button";
import { getCartForDisplay } from "@/features/cart/data/cart-repository";
import { getCurrentSession } from "@/server/auth/session";

export async function StoreHeader() {
  const [session, cart] = await Promise.all([getCurrentSession(), getCartForDisplay()]);
  const cartCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return (
    <>
      <a className="skip-link" href="#main-content">
        본문으로 바로가기
      </a>
      <div className="announcement">
        PORTFOLIO TEST STORE · 모든 주문은 실제 결제 없이 생성됩니다
      </div>
      <header className="store-header">
        <div className="header-inner">
          <Link aria-label="상품 목록" className="icon-button mobile-menu" href="/products">
            <Menu aria-hidden="true" size={22} />
          </Link>
          <Link aria-label="HUKUPUKU 홈" className="wordmark" href="/">
            HUKUPUKU
          </Link>
          <nav className="main-nav" aria-label="주요 메뉴">
            <Link href="/products">SHOP</Link>
            <Link href="/products?sort=newest">NEW</Link>
            <Link href="/#edit">EDITORIAL</Link>
          </nav>
          <div className="header-actions" aria-label="사용자 메뉴">
            <Link aria-label="상품 검색" className="icon-button search-action" href="/products">
              <Search aria-hidden="true" size={20} />
            </Link>
            <Link
              aria-label={session ? "주문 내역" : "로그인"}
              className="icon-button account-action"
              href={session ? "/account/orders" : "/login"}
            >
              <UserRound aria-hidden="true" size={20} />
            </Link>
            <Link
              aria-label={`장바구니 상품 ${cartCount}개`}
              className="icon-button cart-action"
              href="/cart"
            >
              <ShoppingBag aria-hidden="true" size={20} />
              {cartCount > 0 ? <span className="cart-count">{cartCount}</span> : null}
            </Link>
            {session ? <SignOutButton /> : null}
          </div>
        </div>
      </header>
    </>
  );
}
