# 16. 개발 환경과 자동화

## 문서 목적

HUKUPUKU를 새 PC와 CI에서 같은 방식으로 설치·검증하기 위한 6단계 실행 기준입니다. 이번 단계는 화면 데모만 만드는 것이 아니라 이후 고객·관리자 기능이 올라갈 공통 기반을 고정합니다.

## 6단계 결과

- Next.js 16.3.3 App Router와 React 19.2.8
- TypeScript strict와 `src/` 절대 import 별칭 `@/*`
- Tailwind CSS 4와 `docs/12-design-system.md`에서 옮긴 CSS 변수
- Prisma ORM 7.10.0과 PostgreSQL 전체 MVP schema
- Better Auth email/password 설정의 서버 경계
- Vitest 단위 테스트와 Playwright smoke test
- GitHub Actions의 format, schema, lint, type, unit, build, E2E 검사
- Dependabot의 npm·GitHub Actions 주기적 업데이트 제안

## 처음 설치하기

### 1. 필요한 프로그램

- Git
- Node.js 24 LTS
- pnpm 11.19.0

Node.js를 설치한 뒤 PowerShell에서 pnpm을 설치합니다.

```powershell
npm install -g pnpm@11.19.0
```

### 2. 저장소 준비

```powershell
git clone https://github.com/codingIQ2/seamory-commerce.git
Set-Location seamory-commerce
Copy-Item .env.example .env
pnpm install
pnpm db:generate
```

`.env`는 Git에 올라가지 않습니다. `.env.example`에는 키 이름과 로컬 예시만 두며 실제 운영 비밀값을 기록하지 않습니다.

### 3. 개발 서버 실행

```powershell
pnpm dev
```

`http://localhost:3000`에서 홈을 확인합니다. 6단계 홈 프리뷰는 정적 샘플 데이터를 사용하므로 PostgreSQL을 켜지 않아도 표시됩니다.

## 자주 쓰는 명령

| 명령 | 역할 |
| --- | --- |
| `pnpm dev` | 개발 서버 실행 |
| `pnpm build` | 배포용 빌드 |
| `pnpm lint` | ESLint 검사 |
| `pnpm typecheck` | Next route type 생성 후 TypeScript 검사 |
| `pnpm test` | Vitest 단위 테스트 |
| `pnpm test:e2e` | Playwright Chromium 흐름 테스트 |
| `pnpm db:validate` | Prisma schema 검사 |
| `pnpm db:generate` | 타입 안전한 Prisma Client 생성 |
| `pnpm db:migrate` | 연결된 개발 DB에 migration 적용 |
| `pnpm check` | 커밋 전 전체 품질 검사 |

Playwright를 로컬에서 처음 실행할 때는 브라우저 바이너리를 한 번 준비합니다.

```powershell
pnpm exec playwright install chromium
```

## 코드 구조

```text
src/
├─ app/                  Next.js route와 root metadata
│  └─ (store)/           고객용 공통 layout과 홈
├─ components/layout/    고객 header와 footer
├─ features/catalog/     카탈로그가 소유하는 data와 UI
├─ generated/prisma/     생성 파일, Git에서 제외
├─ lib/                  소유권이 분명한 작은 순수 함수
├─ server/auth/          Better Auth 구성
├─ server/db/            Prisma Client 생성 경계
├─ server/env.ts         서버 환경 변수 검증
└─ styles/tokens.css     디자인 토큰의 단일 원본

prisma/
├─ schema.prisma         전체 MVP 관계 모델
└─ migrations/           PostgreSQL 제약조건과 인덱스

tests/e2e/               배포와 같은 브라우저 흐름
```

의존 방향은 `app/feature → server service → repository → Prisma/PostgreSQL`을 유지합니다. React 컴포넌트에 가격·재고·주문 상태 규칙을 직접 작성하지 않습니다.

## 데이터베이스 준비 상태

`prisma/schema.prisma`에는 인증, 주소, 브랜드, 카테고리, 상품, 옵션, 장바구니, 찜, 주문, 결제 시도, 상태 이력, 재고 감사 모델이 들어 있습니다. 초기 migration은 Prisma가 생성한 SQL에 다음 DB 제약을 보완했습니다.

- 상품 판매가가 정가를 넘지 않음
- 재고와 모든 금액이 음수가 되지 않음
- 회원 또는 비회원 중 하나만 장바구니를 소유함
- 장바구니 수량은 1~10
- 주문 합계와 주문 품목 소계가 계산식과 일치함
- 사용자별 기본 배송지는 하나
- 재고 변경 전후 값과 증감량이 일치함

실제 PostgreSQL 인스턴스 생성과 migration 적용, seed는 7단계 카탈로그 구현에서 함께 수행합니다. DB 연결 없이도 `pnpm db:validate`와 `pnpm db:generate`로 schema 자체는 검증할 수 있습니다.

## 자동화 흐름

`main` push 또는 Pull Request가 생성되면 GitHub Actions가 다음 순서로 검사합니다.

```text
의존성 잠금 설치
→ Prisma schema 검증·Client 생성
→ format
→ lint
→ typecheck
→ unit test
→ production build
→ Chromium smoke test
```

어느 한 단계라도 실패하면 병합 가능한 품질 기준을 충족하지 못한 것으로 봅니다. 배포 자동화와 Preview/Production 환경 분리는 10단계에서 연결합니다.

## 6단계 완료 조건

- [x] 공식 Next.js 생성 결과를 기존 기획 저장소에 병합함
- [x] 패키지 버전을 lockfile로 고정함
- [x] 디자인 토큰과 고객용 반응형 shell을 코드로 옮김
- [x] Prisma schema, 초기 migration, Better Auth 서버 경계를 준비함
- [x] 단위·E2E 테스트와 CI workflow를 추가함
- [ ] 실제 PostgreSQL에 migration 적용 — 7단계에서 수행
- [ ] 실제 상품 data와 고객 구매 흐름 연결 — 7단계에서 수행
