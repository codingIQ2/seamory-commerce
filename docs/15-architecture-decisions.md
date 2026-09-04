# 15. 기술 결정 기록

## 작성 규칙

기술 선택의 결과뿐 아니라 당시의 이유와 비용을 남깁니다. 구현 중 전제가 바뀌면 기존 결정을 지우지 않고 상태를 `대체됨`으로 바꾼 뒤 새 결정을 추가합니다.

## ADR-001 모듈형 모놀리스

- 상태: 승인
- 날짜: 2026-09-03
- 맥락: 고객·관리자·주문 도메인이 있지만 한 명이 MVP를 개발하고 운영합니다.
- 결정: 하나의 Next.js 배포 안에서 기능 모듈과 도메인 계층을 분리합니다.
- 결과: 배포와 추적이 단순하고 트랜잭션을 한 DB에서 처리할 수 있습니다. 모듈 경계를 지키지 않으면 코드가 얽힐 수 있으므로 의존 방향을 테스트와 리뷰로 관리합니다.

## ADR-002 Next.js App Router와 서버 우선 렌더링

- 상태: 승인
- 날짜: 2026-09-03
- 맥락: 공개 상품은 초기 표시와 검색 노출이 중요하고, 계정·관리자 데이터는 서버 권한 검사가 필요합니다.
- 결정: Next.js 16 App Router를 사용하고 route는 Server Component를 기본으로 합니다. 브라우저 상태가 필요한 옵션 선택·필터 시트 같은 작은 영역만 Client Component로 둡니다.
- 결과: 브라우저 JavaScript와 데이터 노출을 줄일 수 있습니다. 서버/클라이언트 경계를 이해해야 하며 client directive를 상위 layout에 넓게 적용하지 않습니다.

## ADR-003 Server Functions와 내부 Data Access Layer

- 상태: 승인
- 날짜: 2026-09-03
- 맥락: 별도 모바일 앱이나 외부 API 소비자가 없는 MVP입니다.
- 결정: UI 변경은 Server Function으로 처리하고, 외부 프로토콜이 필요한 인증·웹훅만 Route Handler를 사용합니다. 모든 데이터 접근은 `server-only` DAL과 domain service를 통과합니다.
- 결과: 중복 REST 계층 없이 타입과 폼 흐름을 단순화합니다. Server Function도 공개 공격 표면이므로 매 호출에서 인증·인가·입력 검증이 필요합니다.

## ADR-004 PostgreSQL을 단일 원본으로 사용

- 상태: 승인
- 날짜: 2026-09-03
- 맥락: 가격, 옵션, 재고, 주문은 강한 관계와 원자적 변경이 필요합니다.
- 결정: PostgreSQL을 catalog, cart, order, audit의 단일 원본으로 사용합니다. 별도 검색 엔진, Redis, 메시지 큐는 MVP에서 추가하지 않습니다.
- 결과: FK·unique·check·transaction으로 핵심 규칙을 보호할 수 있습니다. 트래픽이 커졌을 때 측정 결과에 따라 캐시나 검색 서비스를 추가합니다.

## ADR-005 Prisma ORM 7을 첫 구현 버전으로 선택

- 상태: 승인
- 날짜: 2026-09-03
- 맥락: 2026년 현재 Prisma 8이 출시됐지만 새 contract·migration 흐름을 사용합니다. Better Auth의 공식 Prisma adapter 문서는 Prisma 7 + PostgreSQL 구성을 명시합니다.
- 결정: 인증 호환성과 일반적인 schema/migration 흐름을 우선해 Prisma ORM 7을 lockfile에 고정합니다. Prisma 8 전환은 인증 adapter와 migration 경로를 별도 branch에서 검증한 뒤 결정합니다.
- 결과: 최신 major 기능을 즉시 사용하지 않는 대신 통합 위험과 학습 범위를 줄입니다. Prisma 7 지원 종료 전에 업그레이드 ADR이 필요합니다.

## ADR-006 Better Auth database session

- 상태: 승인
- 날짜: 2026-09-03
- 맥락: email/password, 로그아웃, Member/Admin 역할과 서버 측 세션 무효화가 필요합니다.
- 결정: Better Auth의 email/password와 Prisma adapter, database session을 사용합니다. ADMIN 부여는 공개 가입 흐름에서 제외합니다.
- 결과: 인증 암호화·쿠키·세션을 직접 구현하는 위험을 줄입니다. 라이브러리 schema와 도메인 User 필드를 migration에서 함께 관리해야 합니다.

## ADR-007 URL을 상품 탐색 상태의 원본으로 사용

- 상태: 승인
- 날짜: 2026-09-03
- 맥락: 검색·필터·정렬은 공유와 새로고침, 뒤로 가기에서 복원되어야 합니다.
- 결정: 탐색 상태는 `/products` search params로 관리합니다. 전역 클라이언트 상태 라이브러리는 초기 MVP에 도입하지 않습니다.
- 결과: 링크 공유와 서버 렌더링이 단순해집니다. URL parsing과 정규화 schema를 한곳에서 관리해야 합니다.

## ADR-008 주문 멱등성과 조건부 재고 차감

- 상태: 승인
- 날짜: 2026-09-03
- 맥락: 중복 클릭과 동시에 들어온 주문이 중복 주문 또는 음수 재고를 만들 수 있습니다.
- 결정: `(userId, idempotencyKey)` unique, PostgreSQL transaction, `stock >= quantity` 조건부 update, append-only inventory movement를 함께 사용합니다.
- 결과: 재시도해도 같은 결과를 반환하고 재고 무결성을 유지합니다. 충돌을 정상 도메인 오류로 처리하고 integration test가 필요합니다.

## ADR-009 Vercel과 Marketplace Neon 배포

- 상태: 승인
- 날짜: 2026-09-03
- 맥락: 개인 포트폴리오에서 관리 부담이 낮은 Preview와 Production 배포가 필요합니다. Vercel Postgres 자체 제품은 신규 제공이 종료됐습니다.
- 결정: 애플리케이션은 Vercel, PostgreSQL은 Vercel Marketplace의 Neon을 사용합니다. 앱과 DB 리전을 가깝게 두고 pooled/direct 연결을 용도별로 분리합니다.
- 결과: PR Preview와 관리형 DB를 빠르게 구성할 수 있습니다. 공급자 비용·휴면 정책을 확인하고 DB 연결과 migration을 특정 플랫폼 API에 직접 묶지 않습니다.

## ADR-010 디자인 토큰은 CSS 변수를 원본으로 사용

- 상태: 승인
- 날짜: 2026-09-03
- 맥락: Tailwind utility와 일반 CSS, Server/Client Component가 같은 디자인 값을 사용해야 합니다.
- 결정: `tokens.css`의 의미 CSS 변수를 단일 원본으로 두고 Tailwind theme가 이를 참조합니다.
- 결과: 런타임 의존 없이 일관된 스타일을 유지하고 이후 테마 확장이 가능합니다. 임의값 사용을 코드 리뷰와 lint 규칙으로 줄입니다.

## 보류한 결정

| 항목 | 보류 이유 | 결정 시점 |
| --- | --- | --- |
| 실제 PG | MVP는 테스트 결제이며 사업자·보안·정산 범위가 달라짐 | 상용화 단계 |
| 객체 저장소 | 초기에는 허가된 정적 sample image로 충분 | 관리자 이미지 업로드 구현 전 |
| 이메일 발송 | 가입 확인·주문 알림이 MVP 핵심 데모에 필수 아님 | 인증 정책 확장 시 |
| Redis·queue | 현재 부하와 비동기 작업 요구가 없음 | 측정 또는 웹훅 재시도 필요 시 |
| Prisma 8 | 인증 adapter와 migration 호환성 검증 필요 | MVP 안정화 후 |
| 다크 모드 | 핵심 구매 흐름과 무관하고 디자인·접근성 검증 범위 증가 | 출시 이후 |
