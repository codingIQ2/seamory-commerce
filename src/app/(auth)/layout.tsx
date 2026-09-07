import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="auth-page" id="main-content">
      <Link className="wordmark auth-wordmark" href="/">
        HUKUPUKU
      </Link>
      {children}
    </main>
  );
}
