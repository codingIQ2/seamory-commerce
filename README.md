# HUKUPUKU

> 취향과 옷의 기록이 쌓이는 멀티브랜드 패션 커머스

HUKUPUKU는 다양한 브랜드와 상품을 발견하고, 비교하고, 자신의 취향으로 저장한 뒤 구매까지 이어갈 수 있는 패션 커머스 포트폴리오 프로젝트입니다. 단순한 쇼핑몰 화면 복제가 아니라 **상품 탐색 → 구매 → 주문 관리 → 운영자 관리**까지 실제 서비스의 흐름을 설계하고 구현하는 것이 목표입니다.

## 프로젝트 개요

| 항목 | 내용 |
| --- | --- |
| 프로젝트 유형 | 개인 풀스택 포트폴리오 |
| 역할 | 기획, UX/UI, 프론트엔드, 백엔드, 테스트, 배포 |
| 현재 단계 | 7단계 완료 — 고객 상품 탐색·인증·장바구니·테스트 주문 |
| 핵심 사용자 | 여러 브랜드를 한곳에서 비교하고 취향에 맞는 상품을 찾고 싶은 사용자 |
| 핵심 가치 | 발견의 즐거움, 빠른 비교, 신뢰할 수 있는 구매 경험 |

## 해결하려는 문제

- 상품이 많아질수록 사용자가 자신의 취향에 맞는 상품을 찾기 어렵습니다.
- 가격, 할인, 옵션, 재고, 배송 정보를 여러 화면에서 확인해야 합니다.
- 포트폴리오 쇼핑몰은 화면 구현에 그치기 쉬워 주문과 운영 로직을 보여주기 어렵습니다.

HUKUPUKU는 편집숍형 큐레이션과 명확한 상품 정보를 결합하고, 고객 화면과 관리자 화면을 함께 만들어 이 문제를 해결합니다.

## MVP 범위

- 회원가입·로그인과 사용자 프로필
- 홈, 카테고리, 검색, 필터, 정렬
- 상품 상세, 옵션·재고, 찜
- 장바구니와 테스트 결제 흐름
- 주문 내역과 주문 상태 조회
- 관리자 상품·재고·주문 관리
- 반응형 UI, 접근성 기본 점검, 핵심 시나리오 테스트

## 차별점

1. **취향 중심 탐색** — 브랜드만 나열하지 않고 스타일 태그와 컬렉션으로 연결합니다.
2. **결정하기 쉬운 정보 구조** — 가격, 할인, 옵션, 재고, 배송 정보를 한 흐름에서 이해하게 합니다.
3. **운영까지 구현** — 관리자 기능과 상태 변화를 포함해 실제 커머스 구조를 보여줍니다.
4. **과정을 기록하는 포트폴리오** — 기획 근거, 설계 결정, 테스트 결과, 회고를 GitHub에 남깁니다.

## 문서

- [제품 정의서](docs/01-product-brief.md)
- [브랜드 콘셉트](docs/02-brand-concept.md)
- [벤치마킹 원칙](docs/03-benchmark.md)
- [성공 지표와 MVP 완료 조건](docs/04-success-metrics.md)
- [요구사항 명세](docs/05-requirements.md)
- [사용자 시나리오와 인수 조건](docs/06-user-scenarios.md)
- [핵심 도메인 규칙](docs/07-domain-rules.md)
- [MVP 백로그](docs/08-mvp-backlog.md)
- [정보 구조와 탐색 체계](docs/09-information-architecture.md)
- [화면 목록과 책임](docs/10-screen-inventory.md)
- [핵심 화면 와이어프레임](docs/11-wireframes.md)
- [HUKUPUKU 디자인 시스템](docs/12-design-system.md)
- [기술 아키텍처](docs/13-technical-architecture.md)
- [데이터 모델과 무결성 규칙](docs/14-data-model.md)
- [기술 결정 기록](docs/15-architecture-decisions.md)
- [개발 환경과 자동화](docs/16-development-setup.md)
- [7단계 고객 구매 흐름](docs/17-customer-mvp.md)
- [GitHub Issues](https://github.com/codingIQ2/seamory-commerce/issues)
- [개발 방식](CONTRIBUTING.md)
- [변경 기록](CHANGELOG.md)

## 개발 로드맵

- [x] 1. 브랜드·제품 콘셉트 정의
- [x] 2. 요구사항과 사용자 시나리오
- [x] 3. 정보 구조와 화면 목록
- [x] 4. 와이어프레임과 디자인 시스템
- [x] 5. 기술 설계와 데이터 모델
- [x] 6. 프로젝트 초기화와 자동화
- [x] 7. 고객용 MVP 구현
- [ ] 8. 관리자 기능 구현
- [ ] 9. 테스트, 보안, 성능 개선
- [ ] 10. 배포와 포트폴리오 정리

## 확정 기술 스택

Node.js 24 LTS, TypeScript, Next.js 16.3.3 App Router, React 19.2.8, Tailwind CSS 4, PostgreSQL, Prisma ORM 7.10.0, Better Auth 1.7.2, Vitest, Playwright, GitHub Actions, Vercel과 Neon을 사용합니다. 재현 가능한 설치 버전은 `pnpm-lock.yaml`로 고정합니다.

## 로컬에서 실행하기

처음 한 번은 [Node.js 24 LTS](https://nodejs.org/)를 설치한 뒤 PowerShell에서 아래 명령을 실행합니다.

```powershell
npm install -g pnpm@11.19.0
Copy-Item .env.example .env
pnpm install
pnpm db:dev --detach --name hukupuku
pnpm db:create
pnpm prisma migrate deploy
pnpm db:generate
pnpm db:seed
pnpm dev
```

브라우저에서 `http://localhost:3000`을 열면 실제 로컬 DB 상품으로 HUKUPUKU 고객 흐름을 체험할 수 있습니다. 결제는 카드 정보를 받지 않는 테스트 주문이며 실제 승인이나 배송은 발생하지 않습니다.

전체 품질 검사는 다음 한 줄로 실행합니다.

```powershell
pnpm check
```

## 포트폴리오 기록 원칙

- 기능 단위로 이슈를 만들고 작은 커밋으로 진행합니다.
- README에는 결과를, `docs/`에는 결정 과정과 근거를 남깁니다.
- 완성 화면뿐 아니라 데이터 모델, 테스트, 성능 지표와 트레이드오프를 공개합니다.
- 실결제 키, 개인정보, 비밀 환경 변수는 저장소에 올리지 않습니다.

> 현재 이름과 시각 콘셉트는 포트폴리오 제작을 위한 가안입니다. 실제 상용화 전에는 상표·도메인·법률 검토가 별도로 필요합니다.
