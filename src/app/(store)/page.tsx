import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { getFeaturedProducts } from "@/features/catalog/data/catalog-repository";
import { ProductCard } from "@/features/catalog/ui/product-card";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await getFeaturedProducts();
  return (
    <main id="main-content">
      <section className="content-width hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow">New threads — selection 01</p>
          <div>
            <h1 className="hero-title" id="hero-title">
              오래 입을수록
              <br />
              선명해지는 옷
            </h1>
            <p className="hero-description">
              계절을 건너 남는 소재와 실루엣. 네 개의 가상 디자이너 브랜드를 HUKUPUKU의 시선으로
              골랐습니다.
            </p>
            <Link className="editorial-link" href="/products">
              전체 셀렉션 보기
              <ArrowUpRight aria-hidden="true" size={18} />
            </Link>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <span className="art-index">01</span>
        </div>
      </section>

      <section className="content-width section" id="new">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Just arrived</p>
            <h2 className="section-title">이번 주 새로 고른 것</h2>
          </div>
          <p className="section-note">
            실제 재고와 가격이 연결된 첫 번째 셀렉션입니다. 옵션을 고르고 장바구니와 테스트 주문까지
            직접 경험해 보세요.
          </p>
        </div>
        <div className="product-grid">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </section>

      <section className="content-width section manifesto" id="edit">
        <p className="manifesto-copy">
          유행의 속도보다 오래 남는 선택을 믿습니다. 상품의 태도와 구매에 필요한 정보를 같은 무게로
          편집합니다.
        </p>
        <div className="manifesto-aside" id="journal">
          <div className="manifesto-item">
            <strong>01 / MATERIAL</strong>
            <span>손이 자주 가는 소재와 관리 방법을 숨기지 않습니다.</span>
          </div>
          <div className="manifesto-item">
            <strong>02 / FIT</strong>
            <span>실루엣과 옵션을 비교하기 쉬운 언어로 보여줍니다.</span>
          </div>
          <div className="manifesto-item">
            <strong>03 / PRICE</strong>
            <span>정가와 판매가의 관계를 한눈에 이해할 수 있게 합니다.</span>
          </div>
          <div className="manifesto-item">
            <strong>04 / PROCESS</strong>
            <span>기획과 구현, 테스트 기록을 GitHub에 함께 공개합니다.</span>
          </div>
        </div>
      </section>

      <section className="content-width section" id="stage-status">
        <div className="stage-status">
          <span className="stage-number">07 / 10</span>
          <div>
            <strong>고객 구매 여정 구현</strong>
            <p>상품 탐색부터 로그인, 장바구니, 테스트 주문과 주문 조회까지 연결했습니다.</p>
          </div>
          <span className="status-pill">CUSTOMER FLOW READY</span>
        </div>
      </section>
    </main>
  );
}
