import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "HUKUPUKU — 오래 남는 셀렉션",
    template: "%s | HUKUPUKU",
  },
  description:
    "취향이 또렷해지는 국내 디자이너 브랜드 셀렉션. HUKUPUKU의 커머스 포트폴리오 프로젝트입니다.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
