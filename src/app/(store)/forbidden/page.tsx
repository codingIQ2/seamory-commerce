import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <main className="content-width admin-empty" id="main-content" tabIndex={-1}>
      <p className="eyebrow">403 / Access denied</p>
      <h1>관리자 권한이 없습니다.</h1>
      <p>일반 회원 계정은 스토어와 본인의 주문 내역만 이용할 수 있습니다.</p>
      <Link className="button button-dark" href="/">
        스토어로 돌아가기
      </Link>
    </main>
  );
}
