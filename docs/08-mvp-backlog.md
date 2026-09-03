# 08. MVP 백로그

## 운영 원칙

- P0 세로 기능 조각을 먼저 완성합니다. 예를 들어 UI만 한꺼번에 만든 뒤 서버를 붙이지 않습니다.
- 각 작업은 요구사항 ID와 인수 조건을 연결합니다.
- 한 작업은 가능하면 1~3일 안에 검토 가능한 크기로 나눕니다.
- 완료된 기능은 정상 흐름뿐 아니라 로딩, 빈 상태, 오류, 권한을 확인합니다.

## 에픽과 작업 순서

| 순서 | 에픽 | 우선순위 | 결과물 | 연결 요구사항 |
| --- | --- | --- | --- | --- |
| 1 | 프로젝트 기반과 품질 자동화 | P0 | 앱 실행, 검사, CI, 환경 변수 예시 | NFR-SEC-01, NFR-TEST-01 |
| 2 | 상품 카탈로그 읽기 | P0 | 목록·상세와 샘플 데이터 | FR-CAT-01, 05, 06 |
| 3 | 검색·필터·정렬 | P0 | URL 기반 상품 탐색 | FR-CAT-02~04, 08 |
| 4 | 회원 인증과 권한 | P0 | 회원가입·로그인·역할 보호 | FR-AUTH-01~04 |
| 5 | 장바구니 | P0 | 옵션·수량·가격 재검증 | FR-CART-01~05 |
| 6 | 테스트 체크아웃과 주문 | P0 | 서버 계산, 재고 차감, 멱등성 | FR-ORDER-01~05 |
| 7 | 내 주문 | P0 | 주문 목록·상세·상태 | FR-ORDER-05~06 |
| 8 | 관리자 상품·재고 | P0 | 상품 CRUD, 옵션·재고 관리 | FR-ADMIN-01~02, 04 |
| 9 | 관리자 주문 | P0 | 주문 검색과 상태 변경 | FR-ADMIN-03~05 |
| 10 | 접근성·성능·보안 강화 | P0 | 감사 결과와 회귀 테스트 | 모든 NFR |
| 11 | 찜과 편집 컬렉션 | P1 | MY EDIT, STORIES | FR-WISH-01, FR-CAT-07 |
| 12 | 주문 취소 | P1 | 취소와 재고 복구 | FR-ORDER-07 |

## GitHub Issue 백로그

2단계에서 아래 P0 작업을 실제 GitHub Issue로 등록했습니다.

1. [#1 Foundation — Initialize storefront and quality gates](https://github.com/codingIQ2/seamory-commerce/issues/1)
2. [#2 Catalog — Implement product list and detail vertical slice](https://github.com/codingIQ2/seamory-commerce/issues/2)
3. [#3 Discovery — Add URL-based search, filters, and sorting](https://github.com/codingIQ2/seamory-commerce/issues/3)
4. [#4 Auth — Implement member authentication and role authorization](https://github.com/codingIQ2/seamory-commerce/issues/4)
5. [#5 Cart — Build persistent cart with server revalidation](https://github.com/codingIQ2/seamory-commerce/issues/5)
6. [#6 Checkout — Create idempotent test order and stock transaction](https://github.com/codingIQ2/seamory-commerce/issues/6)
7. [#7 Orders — Add member order history and detail](https://github.com/codingIQ2/seamory-commerce/issues/7)
8. [#8 Admin — Manage products, variants, and inventory](https://github.com/codingIQ2/seamory-commerce/issues/8)
9. [#9 Admin — Manage order status with transition rules](https://github.com/codingIQ2/seamory-commerce/issues/9)
10. [#10 Quality — Audit accessibility, performance, security, and E2E flow](https://github.com/codingIQ2/seamory-commerce/issues/10)

## 착수 조건

3~5단계에서 정보 구조, 디자인, 기술과 데이터 모델을 확정하기 전에는 위 작업을 구현 상태로 옮기지 않습니다. 지금은 제품 범위와 작업 순서를 추적하는 백로그로 사용합니다.
