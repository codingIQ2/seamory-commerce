import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="auth-page" id="main-content">
      <a className="skip-link" href="#auth-content">
        로그인 양식으로 바로가기
      </a>
      <Link className="wordmark auth-wordmark" href="/">
        HUKUPUKU
      </Link>
      <div id="auth-content" tabIndex={-1}>
        {children}
      </div>
    </main>
  );
}
