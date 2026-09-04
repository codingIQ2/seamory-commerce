import Link from "next/link";
import { Heart, Menu, Search, ShoppingBag, UserRound } from "lucide-react";

const pendingTitle = "7단계 고객 기능에서 연결됩니다";

export function StoreHeader() {
  return (
    <>
      <a className="skip-link" href="#main-content">
        본문으로 바로가기
      </a>
      <div className="announcement">PORTFOLIO PREVIEW · 결제와 배송은 실제 서비스가 아닙니다</div>
      <header className="store-header">
        <div className="header-inner">
          <button
            aria-label="메뉴 — 다음 단계에서 제공"
            className="icon-button mobile-menu"
            disabled
            title={pendingTitle}
            type="button"
          >
            <Menu aria-hidden="true" size={22} strokeWidth={2} />
          </button>
          <Link className="wordmark" href="/" aria-label="HUKUPUKU 홈">
            HUKUPUKU
          </Link>
          <nav className="main-nav" aria-label="주요 메뉴">
            <a href="#new">NEW</a>
            <a href="#edit">EDIT</a>
            <a href="#journal">JOURNAL</a>
          </nav>
          <div className="header-actions" aria-label="사용자 메뉴">
            <button
              aria-label="검색 — 다음 단계에서 제공"
              className="icon-button search-action"
              disabled
              title={pendingTitle}
              type="button"
            >
              <Search aria-hidden="true" size={20} />
            </button>
            <button
              aria-label="찜 — 다음 단계에서 제공"
              className="icon-button wishlist-action"
              disabled
              title={pendingTitle}
              type="button"
            >
              <Heart aria-hidden="true" size={20} />
            </button>
            <button
              aria-label="계정 — 다음 단계에서 제공"
              className="icon-button account-action"
              disabled
              title={pendingTitle}
              type="button"
            >
              <UserRound aria-hidden="true" size={20} />
            </button>
            <button
              aria-label="장바구니 — 다음 단계에서 제공"
              className="icon-button"
              disabled
              title={pendingTitle}
              type="button"
            >
              <ShoppingBag aria-hidden="true" size={20} />
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
