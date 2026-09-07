import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: {
    default: "HUKUPUKU — 오래 남는 패션 셀렉션",
    template: "%s | HUKUPUKU",
  },
  description:
    "서울과 도쿄의 감각을 담은 컨템포러리 패션 셀렉트숍. 상품 탐색부터 테스트 주문까지 경험해 보세요.",
  openGraph: {
    title: "HUKUPUKU — 오래 남는 패션 셀렉션",
    description: "상품 탐색부터 테스트 주문까지 연결된 패션 커머스 포트폴리오",
    images: [{ url: "/og-hukupuku.png", width: 1536, height: 1024, alt: "HUKUPUKU 패션 셀렉션" }],
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
