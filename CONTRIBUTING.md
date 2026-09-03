# 개발 방식

이 프로젝트는 혼자 개발하더라도 팀 프로젝트와 같은 기록 방식을 연습합니다.

## 작업 흐름

1. 기능이나 문제를 GitHub Issue로 정의합니다.
2. `codex/<issue-number>-<short-name>` 형식의 브랜치를 만듭니다.
3. 한 가지 의도가 드러나는 작은 커밋을 남깁니다.
4. Pull Request에 구현 내용, 화면, 테스트 결과, 판단 근거를 씁니다.
5. 자동 검사를 통과한 뒤 `main`에 병합합니다.

## 커밋 형식

Conventional Commits를 사용합니다.

```text
feat: add product filters
fix: prevent checkout with stale stock
docs: define product and brand concept
test: cover cart price calculation
chore: configure continuous integration
```

## 완료의 기준

- 요구사항과 예외 상황이 코드에 반영되어 있습니다.
- 관련 테스트가 추가되고 로컬·CI에서 통과합니다.
- 접근성, 반응형, 로딩·오류·빈 상태를 확인합니다.
- 중요한 설계 결정과 사용 방법을 문서에 반영합니다.
- 비밀 키나 개인정보가 커밋에 포함되지 않습니다.
