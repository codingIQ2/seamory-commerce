import Link from "next/link";

export default function NotFound() {
  return (
    <main className="content-width section" id="main-content" tabIndex={-1}>
      <p className="eyebrow">404 / Not found</p>
      <h1 className="section-title">아직 준비되지 않은 페이지입니다.</h1>
      <p className="hero-description">상품과 구매 화면은 다음 개발 단계에서 하나씩 연결됩니다.</p>
      <Link className="editorial-link" href="/">
        홈으로 돌아가기
      </Link>
    </main>
  );
}
