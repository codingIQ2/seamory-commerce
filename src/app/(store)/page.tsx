import { ArrowUpRight } from "lucide-react";

import { previewProducts } from "@/features/catalog/data/preview-products";
import { ProductCard } from "@/features/catalog/ui/product-card";

export default function HomePage() {
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
            <a className="editorial-link" href="#new">
              이번 주 셀렉션 보기
              <ArrowUpRight aria-hidden="true" size={18} />
            </a>
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
            지금은 프로젝트 기반을 보여주는 프리뷰입니다. 실제 상품 이미지, 검색과 상세 구매 흐름은
            7단계에서 데이터와 연결합니다.
          </p>
        </div>
        <div className="product-grid">
          {previewProducts.map((product, index) => (
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
          <span className="stage-number">06 / 10</span>
          <div>
            <strong>프로젝트 기반과 자동화 준비</strong>
            <p>Next.js, TypeScript, Prisma, 테스트와 CI가 같은 기준으로 동작합니다.</p>
          </div>
          <span className="status-pill">FOUNDATION READY</span>
        </div>
      </section>
    </main>
  );
}
