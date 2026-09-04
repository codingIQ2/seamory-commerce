# 13. 기술 아키텍처

## 문서 목적

HUKUPUKU MVP를 한 명이 개발·운영하면서도 실제 서비스 수준의 경계, 보안, 테스트 가능성을 유지하기 위한 기술 구조를 정의합니다. 6단계 프로젝트 초기화는 이 문서를 기준으로 진행합니다.

## 결정 요약

| 영역 | 선택 | 이유 |
| --- | --- | --- |
| 런타임 | Node.js 24 LTS | 현재 도구 호환성과 장기 지원 기준 |
| 웹 프레임워크 | Next.js 16 App Router + React 19 + TypeScript strict | 서버 렌더링, 파일 기반 라우팅, Server Components/Functions를 한 프로젝트에서 사용 |
| 패키지 관리자 | pnpm | 재현 가능한 lockfile과 효율적인 설치 |
| 스타일 | Tailwind CSS 4 + CSS 변수 디자인 토큰 | 빠른 UI 구현과 `12-design-system.md`의 의미 토큰 분리 |
| 입력 검증 | Zod | 폼·Server Function·환경 변수 스키마를 공유 |
| 인증 | Better Auth + database session + email/password | 검증된 인증 라이브러리와 서버 측 세션·역할 관리 |
| 데이터베이스 | PostgreSQL 17+ | 관계, 제약조건, 트랜잭션과 동시성 제어 |
| ORM | Prisma ORM 7 + PostgreSQL driver adapter | Better Auth Prisma 어댑터와의 확인된 호환성을 우선 |
| 단위·통합 테스트 | Vitest + 실제 PostgreSQL 테스트 DB | 가격·재고·주문 규칙을 실제 제약조건과 함께 검증 |
| E2E | Playwright | 고객 구매와 관리자 처리 흐름을 브라우저 수준에서 검증 |
| 배포 | Vercel + Marketplace Neon Postgres | Next.js 배포와 관리형 PostgreSQL, 미리보기 환경 구성 |
| CI | GitHub Actions | 타입·정적 검사·테스트·빌드를 PR마다 확인 |

버전은 6단계에서 lockfile로 정확히 고정합니다. Prisma 8은 현재 릴리스지만 새 계약·마이그레이션 흐름을 사용하며, Better Auth의 Prisma 통합 문서는 Prisma 7 조합을 기준으로 설명합니다. MVP에서는 호환성이 확인된 Prisma 7을 사용하고 Prisma 8 전환은 별도 ADR로 검토합니다.

## 시스템 구성

```text
Browser
  │ HTTPS
  ▼
Next.js application on Vercel
  ├─ Server Components: 공개 목록·상세·계정 조회
  ├─ Client Components: 필터 시트·옵션·수량 등 국소 상호작용
  ├─ Server Functions: 장바구니·체크아웃·관리자 변경
  ├─ Route Handlers: Better Auth, 향후 웹훅 전용
  ├─ Data Access Layer: 세션·권한·DTO·조회 정책
  └─ Domain services: 가격·재고·주문 상태·멱등성
          │ pooled TLS connection
          ▼
    Neon PostgreSQL
          ├─ auth/session
          ├─ catalog/inventory
          ├─ cart/order
          └─ audit history
```

MVP는 별도 백엔드 서버나 메시지 큐를 만들지 않는 모듈형 모놀리스입니다. 도메인 로직은 UI와 분리해 향후 워커나 독립 API로 옮길 수 있게 하지만, 초기부터 분산 시스템 복잡도를 도입하지 않습니다.

## 요청 처리 원칙

### 읽기

1. Route의 Server Component가 기능별 query 함수를 호출합니다.
2. query는 `server-only` Data Access Layer에서 세션과 권한을 확인합니다.
3. 필요한 필드만 DTO로 만들어 렌더링 계층에 반환합니다.
4. 브라우저에 ORM 객체, 비밀번호 해시, 내부 ID, 전체 개인정보를 전달하지 않습니다.

### 쓰기

1. 폼 또는 Client Component가 Server Function을 호출합니다.
2. Server Function은 인증·권한·Zod 입력 검증을 항상 다시 수행합니다.
3. Domain service가 가격·재고·상태 전이 규칙을 적용합니다.
4. Repository가 트랜잭션과 제약조건을 이용해 저장합니다.
5. 성공 후 관련 경로·캐시 태그를 무효화하고 안전한 DTO만 반환합니다.

Server Function은 공개 HTTP 엔드포인트와 같은 보안 경계로 취급합니다. 화면에서 버튼을 숨겼다는 이유로 인증이나 인가를 생략하지 않습니다.

## 코드 구조

```text
src/
├─ app/
│  ├─ (store)/
│  │  ├─ layout.tsx
│  │  ├─ page.tsx
│  │  ├─ products/
│  │  └─ cart/
│  ├─ (auth)/
│  │  ├─ login/
│  │  └─ signup/
│  ├─ (account)/
│  │  ├─ checkout/
│  │  ├─ orders/
│  │  └─ account/
│  ├─ admin/
│  │  ├─ layout.tsx
│  │  ├─ products/
│  │  └─ orders/
│  ├─ api/auth/[...all]/route.ts
│  ├─ error.tsx
│  ├─ not-found.tsx
│  └─ layout.tsx
├─ features/
│  ├─ auth/
│  ├─ catalog/
│  ├─ cart/
│  ├─ checkout/
│  ├─ orders/
│  └─ admin/
│     └─ 각 기능의 ui, actions, queries, schemas
├─ server/
│  ├─ auth/
│  ├─ db/
│  ├─ dal/
│  ├─ domain/
│  ├─ repositories/
│  └─ observability/
├─ components/
│  ├─ ui/
│  └─ layout/
├─ styles/
│  └─ tokens.css
└─ test/
   ├─ factories/
   └─ helpers/
prisma/
├─ schema.prisma
├─ migrations/
└─ seed.ts
tests/
└─ e2e/
```

### 의존 방향

```text
app / feature UI
       ↓
actions · queries · schemas
       ↓
DAL · domain services
       ↓
repositories
       ↓
Prisma · PostgreSQL
```

- 아래 계층은 위 계층을 import하지 않습니다.
- React 컴포넌트 안에 재고 차감이나 주문 상태 규칙을 작성하지 않습니다.
- 공용 `utils` 폴더를 잡동사니 저장소로 만들지 않고 기능 또는 서버 계층에 소유권을 둡니다.

## 렌더링과 상태 관리

| 데이터 | 기본 처리 | 이유 |
| --- | --- | --- |
| 홈·공개 상품 목록·상세 | Server Component + 선택적 태그 캐시 | SEO와 초기 표시, 관리자 변경 후 재검증 |
| 검색·필터·정렬 | URL search params | 공유·새로고침·뒤로 가기 복원 |
| 상품 옵션·수량 | 국소 Client Component state | 즉시 상호작용이 필요하지만 전역 상태는 불필요 |
| 장바구니 | 서버 원본 + 낙관적 UI는 제한적으로 사용 | 가격·재고 재검증 필요 |
| 세션·주문·관리자 | 요청 시 동적 조회 | 사용자별·민감 데이터 캐시 혼합 방지 |
| 폼 오류 | Server Function 반환 상태 | 서버 검증 결과를 필드와 연결 |

- 전역 상태 라이브러리는 초기 MVP에 추가하지 않습니다.
- React Context는 세션 원본이나 상품 데이터를 보관하는 용도로 사용하지 않습니다.
- URL로 표현 가능한 상태를 브라우저 메모리에만 숨기지 않습니다.

## 데이터 접근과 캐시

### 공개 카탈로그

- 목록 query는 필터·정렬·페이지를 명시적 인자로 받습니다.
- 상품 상세는 `product:{id}`, 목록은 `catalog` 태그로 무효화할 수 있게 설계합니다.
- 관리자 상품·가격·재고 변경 후 관련 상세와 목록 캐시를 무효화합니다.
- 재고 수량을 오래 캐시해 구매 가능성을 확정하지 않으며 체크아웃에서 항상 DB를 재조회합니다.

### 개인 데이터

- 장바구니, 주문, 주소, 관리자 데이터는 사용자별 캐시 공유를 하지 않습니다.
- DAL은 `getCurrentUser`, `requireMember`, `requireAdmin`, `getOwnedOrder` 같은 좁은 함수를 제공합니다.
- DTO는 화면에 필요한 필드만 선택하며 내부 사용자 ID나 감사 로그의 민감 정보는 기본 제외합니다.

## 인증과 권한

- Better Auth의 email/password와 database session을 사용합니다.
- 세션 쿠키는 `HttpOnly`, `Secure`(배포), `SameSite=Lax`, 루트 경로를 기본으로 합니다.
- `User.role`은 `MEMBER` 또는 `ADMIN`이며 회원가입 기본값은 `MEMBER`입니다.
- 관리자 역할은 공개 회원가입 입력으로 설정할 수 없습니다. seed 또는 보호된 운영 절차로만 부여합니다.
- 빠른 경로 이동 검사는 Proxy에서 할 수 있지만, 실제 권한 검사는 DAL과 모든 Server Function에서 데이터 가까이에 수행합니다.
- 로그인 복귀 주소는 상대 내부 경로만 허용해 open redirect를 차단합니다.
- 다른 회원의 주문 접근은 존재 여부를 구분하지 않는 응답으로 처리합니다.

## API와 Server Function 경계

### Server Functions

- 장바구니 추가·수량 변경·삭제
- 체크아웃과 테스트 주문 생성
- 프로필·배송지 수정
- 관리자 상품·옵션·재고·주문 상태 변경

### Route Handlers

- `/api/auth/[...all]`: Better Auth handler
- 향후 실제 결제 웹훅: 서명 검증과 원문 body가 필요한 경우
- 외부 클라이언트를 위한 API는 MVP에 없으므로 별도 REST 계층을 만들지 않습니다.

### 입력·출력 규칙

- 모든 외부 입력은 Zod schema로 파싱하고 알 수 없는 필드를 신뢰하지 않습니다.
- 금액, 역할, 최종 주문 상태를 클라이언트 입력으로 받지 않습니다.
- 오류는 `VALIDATION`, `AUTHENTICATION`, `AUTHORIZATION`, `CONFLICT`, `NOT_FOUND`, `INTERNAL`로 분류합니다.
- 사용자 오류에는 수정 행동을, 시스템 오류에는 개인정보 없는 request ID를 제공합니다.

## 체크아웃 트랜잭션

```text
1. Member session과 cart 소유권 확인
2. idempotency key 형식·사용자 범위 확인
3. PostgreSQL transaction 시작
4. 같은 사용자+key 주문이 있으면 기존 결과 반환
5. cart item과 최신 product variant 조회
6. 판매 상태·가격·수량 검증
7. 각 variant를 stock >= quantity 조건으로 원자적 차감
8. Order + OrderAddress + OrderItem snapshot 생성
9. 테스트 결제 결과와 PAID 상태·history 기록
10. transaction commit
11. cart 정리와 관련 화면 재검증
```

- 3~9단계 사이에는 외부 네트워크 요청을 넣지 않습니다.
- 주문 생성, 주문 품목, 재고 차감, 상태 이력은 모두 성공하거나 모두 롤백됩니다.
- `(userId, idempotencyKey)` unique 제약으로 중복 주문을 막습니다.
- 조건부 재고 차감이 한 행이라도 실패하면 `CONFLICT`로 전체 트랜잭션을 롤백합니다.
- Serializable 충돌을 사용하는 구현이라면 제한된 횟수와 짧은 backoff로 전체 트랜잭션을 다시 시도합니다.
- 테스트 결제는 화면과 데이터에 명확히 표시하며 실제 카드 정보를 받지 않습니다.

상세한 테이블과 제약조건은 `14-data-model.md`를 따릅니다.

## 관측성과 감사 기록

- 요청마다 외부 노출 가능한 request ID를 생성하거나 플랫폼 ID를 전달합니다.
- JSON 구조 로그에 `level`, `event`, `requestId`, `route`, `durationMs`, 안전한 도메인 ID를 기록합니다.
- 비밀번호, 세션 토큰, 전체 주소·전화번호, DB URL, raw request body는 기록하지 않습니다.
- 재고와 주문 상태 변경은 별도 감사 테이블에 수행자·시간·이전값·새값·사유를 남깁니다.
- MVP 알림은 Vercel 로그와 오류 추적 도구의 무료 범위를 우선하며 공급자 종속 API는 얇은 어댑터 뒤에 둡니다.

## 테스트 전략

| 계층 | 대상 | 예시 |
| --- | --- | --- |
| Unit | 순수 도메인 함수 | 할인율, 주문 합계, 상태 전이, 수량 규칙 |
| Integration | PostgreSQL + repository/service | 재고 조건부 차감, rollback, 소유권, 멱등성 |
| Component | 상호작용 컴포넌트 | 옵션 선택, 수량 stepper, 오류·포커스 |
| E2E | 배포와 같은 브라우저 흐름 | 검색 → 담기 → 로그인 → 주문 → 관리자 처리 → 고객 확인 |
| Accessibility | 핵심 화면 | axe + 키보드 + 포커스 복귀 |

- ORM을 과도하게 mock하지 않고 중요한 제약조건은 실제 PostgreSQL로 검증합니다.
- E2E는 테스트 전용 사용자·상품·재고를 seed하고 테스트 간 독립성을 유지합니다.
- 재고 동시성 테스트는 같은 SKU에 병렬 주문을 보내 재고가 음수가 되지 않는지 확인합니다.

## CI 파이프라인

```text
pull request / push
  → install --frozen-lockfile
  → format check
  → lint
  → typecheck
  → unit tests
  → PostgreSQL integration tests
  → production build
  → 핵심 Playwright smoke test
```

- migration 파일과 schema 변경은 같은 PR에 포함합니다.
- CI 실패 상태에서는 `main` 병합을 완료로 보지 않습니다.
- 비밀 탐지와 의존성 업데이트는 GitHub 기본 보안 기능을 활용하고 비밀 키는 Actions secret에만 둡니다.

## 배포 구조

| 환경 | 애플리케이션 | 데이터베이스 | 목적 |
| --- | --- | --- | --- |
| Local | 개발 서버 | 로컬 PostgreSQL 또는 개발 DB | 구현·단위·통합 테스트 |
| Preview | Vercel Preview | 격리된 preview branch/schema | PR 검토·E2E |
| Production | Vercel Production | Production Neon Postgres | 포트폴리오 공개 |

- Vercel 자체 Postgres 제품은 종료되었으므로 Marketplace의 Neon 같은 외부 PostgreSQL을 연결합니다.
- 애플리케이션 함수와 DB 리전을 가깝게 두고 serverless 환경에서는 pooled URL을 사용합니다.
- migration은 배포 애플리케이션 시작 시 자동 실행하지 않고 승인된 배포 단계에서 한 번 수행합니다.
- production seed는 가상 브랜드·상품과 데모 계정만 포함하며 실제 개인정보를 넣지 않습니다.
- Preview가 Production 데이터베이스에 연결되지 않게 환경 변수를 분리합니다.

## 환경 변수 계약

| 이름 | 범위 | 설명 |
| --- | --- | --- |
| `DATABASE_URL` | Server secret | pooled PostgreSQL 연결 |
| `DIRECT_DATABASE_URL` | migration only | direct PostgreSQL 연결 |
| `BETTER_AUTH_SECRET` | Server secret | 세션·인증 비밀 |
| `BETTER_AUTH_URL` | Server/public config | 환경별 기준 URL |
| `NEXT_PUBLIC_APP_URL` | Public | 안전한 절대 링크와 메타데이터 기준 URL |
| `DEMO_PAYMENT_MODE` | Server config | 테스트 결제만 허용하는 플래그 |

- `.env.example`에는 키 이름과 설명만 기록하고 실제 값을 넣지 않습니다.
- 시작 시 환경 변수 schema를 검증해 누락된 비밀로 서버가 불완전하게 실행되지 않게 합니다.
- `NEXT_PUBLIC_` 변수에는 비밀이나 내부 연결 문자열을 넣지 않습니다.

## 성능 예산

- 고객 주요 route는 불필요한 Client Component와 전역 hydration을 피합니다.
- 상품 목록 이미지는 반응형 크기와 지연 로딩을 사용하고 첫 화면 대표 이미지만 우선 처리합니다.
- DB 목록 query는 페이지 크기를 제한하고 검색·필터 인덱스를 사용합니다.
- 번들 분석은 이상 증가 시 수행하며 새로운 UI 라이브러리는 실제 중복 제거 효과가 있을 때만 추가합니다.
- 배포 후 Core Web Vitals와 느린 query를 측정해 추측이 아닌 데이터로 최적화합니다.

## 공식 참고 자료

- [Node.js 릴리스와 LTS 상태](https://nodejs.org/en/about/previous-releases)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Next.js 설치와 현재 요구사항](https://nextjs.org/docs/app/getting-started/installation)
- [Next.js 인증·인가와 Data Access Layer](https://nextjs.org/docs/app/guides/authentication)
- [Next.js Server Function 보안](https://nextjs.org/docs/app/getting-started/mutating-data)
- [Better Auth email/password](https://better-auth.com/docs/authentication/email-password)
- [Better Auth Prisma adapter](https://better-auth.com/docs/adapters/prisma)
- [Prisma 트랜잭션과 멱등성](https://www.prisma.io/docs/orm/prisma-client/queries/transactions)
- [PostgreSQL 트랜잭션 격리](https://www.postgresql.org/docs/current/transaction-iso.html)
- [Vercel Marketplace Storage](https://vercel.com/docs/marketplace-storage)
- [Vercel Postgres 변경 안내](https://vercel.com/docs/postgres)
