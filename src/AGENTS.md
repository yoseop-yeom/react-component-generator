# AGENTS.md (src/)

## Module Context

React 19 + TypeScript 프론트엔드. `useComponentGenerator` 훅이 생성 상태(`components`/`isLoading`/`error`)를 전담하고, `App.tsx`가 프로바이더/API 키 UI 상태와 이를 합성한다. 생성된 코드는 `react-live`로 실제 실행되어 미리보기를 만든다.

## Tech Stack & Constraints

- 스타일링은 순수 CSS(`App.css`)의 커스텀 프로퍼티 토큰 시스템만 사용한다 — Tailwind, styled-components 등 CSS 프레임워크/라이브러리를 추가하지 않는다.
- 폰트는 `--font-display`(Space Grotesk, 라틴 전용)/`--font-body`(IBM Plex Sans KR)/`--font-mono`(IBM Plex Mono) 세 토큰만 사용한다. 새 폰트를 추가할 땐 반드시 스택 끝에 한글 지원 폰트를 폴백으로 둔다 (그렇지 않으면 한글 텍스트가 깨진 폴백 폰트로 렌더링된다).
- 상태 관리 라이브러리(Redux, Zustand 등)를 추가하지 않는다 — 이 규모는 훅 + `useState`로 충분하다.

## Implementation Patterns

- 새 생성 관련 API 호출은 `hooks/useComponentGenerator.ts`에만 추가한다. 컴포넌트에서 직접 `fetch('/api/generate')`를 호출하지 않는다.
- `GeneratedComponent`(`types/index.ts`)에 필드를 추가하면 `ComponentCard`/`CodeView`/`LivePreview`까지 일관되게 갱신한다.
- 미리보기를 강제로 리마운트해야 할 때(애니메이션 재생 등)는 `key` prop을 bump하는 기존 패턴(`ComponentCard`의 `previewKey`)을 따른다.
- 순수 장식용 마크업(아이콘, 캐럿 등)에는 `aria-hidden="true"`를 붙인다 (`PromptInput`의 `.prompt-caret` 패턴 참고).

## Testing Strategy

- `bun run test -- src/components/PromptInput.test.tsx` 처럼 파일 단위로 실행한다.
- Testing Library 사용 시 `getByRole` 등 구조 기반 쿼리를 우선한다 — 클래스명이나 DOM 래퍼가 바뀌어도 테스트가 깨지지 않도록 한다.
- `src/test/setup.ts`가 jsdom 환경을 세팅한다 (`vite.config.ts`의 `test.setupFiles`). 새 테스트 파일에서 환경 설정을 반복하지 않는다.

## Local Golden Rules

- Do: 사용자에게 보이는 문자열은 한국어로 작성한다 (기존 UI 톤 유지).
- Do: `LivePreview`/`CodeView`는 서버가 이미 `ensureRenderCall`로 정규화한 `code: string`을 그대로 신뢰한다 — 프론트에서 재검증/재파싱하지 않는다.
- Don't: `App.css`의 색상 토큰(`--phosphor`, `--paper` 등)을 우회해 하드코딩된 hex 값을 새로 추가하지 않는다.
