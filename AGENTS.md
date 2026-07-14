# AGENTS.md

## Operational Commands

- Package manager: `bun` only. Do not use npm/yarn/pnpm (no lockfile for them exists; only `bun.lock`).
- `bun install` — install dependencies.
- `bun run dev` — run the API server and Vite frontend together.
- `bun run server` — run only the API proxy (`server/index.ts`, port 3002, `--watch`).
- `bun run build` — `tsc -b && vite build`. This is also the typecheck; there is no separate typecheck script.
- `bun run lint` — `eslint .`
- `bun run test` — `vitest run` (single run). Run one file: `bun run test -- server/generator.test.ts`.
- `bun run test:watch` — `vitest` in watch mode.

## Golden Rules

### Immutable

- Generated component code returned from `/api/generate` is executed by `react-live` with `noInline`. It must never contain `import` statements or TypeScript syntax, and must end with a `render(...)` call. Any change to `SYSTEM_PROMPT` (`server/index.ts`) or `server/generator.ts` must preserve these invariants.
- `server/generator.ts` and `server/fallback.ts` must stay pure (no `Bun.serve`, no `fetch`, no side effects) — this is what makes them unit-testable without a running server.
- `ANTHROPIC_API_KEY` / `GOOGLE_API_KEY` come only from `.env` (server-side) or the client-supplied `apiKey` field via `resolveApiKey` in `server/index.ts`. Never hardcode a key or log one.

### Do's & Don'ts

- Do route all new backend endpoints through the single `Bun.serve` fetch handler in `server/index.ts`; don't introduce a second server framework.
- Do keep provider-specific logic (`callAnthropic`, `callGoogle`) isolated behind the `Provider` union type; don't branch on the provider string outside that boundary.
- Don't add a CSS framework or component library to the frontend; it uses plain CSS with a custom-property token system (see `src/AGENTS.md`).
- Don't add a dependency for something Bun's built-ins already cover (`Bun.serve`, global `fetch`).

## Project Context

- 목적: 프롬프트를 입력하면 AI(Anthropic Claude / Google Gemini)가 React 컴포넌트를 생성하고, 실시간 미리보기와 코드를 함께 제공하는 도구.
- Tech Stack: React 19, TypeScript, Vite 8, Bun (server runtime + package manager), react-live, Vitest, Testing Library, ESLint (typescript-eslint, react-hooks, react-refresh).

## Standards & References

- 전체 실행 방법과 기능 설명은 `README.md`, 상세 아키텍처는 `CLAUDE.md`를 참고한다.
- 커밋 메시지: Conventional Commits + 한국어 요약 (예: `chore: gitignore 항목 추가`). 기존 `git log` 스타일을 따른다.
- Maintenance Policy: 코드와 이 문서 간 괴리가 발견되면, 코드를 바꾸는 김에 해당 `AGENTS.md` 갱신도 함께 제안한다.

## Context Map

- **[API 프록시 서버 수정 (BE)](./server/AGENTS.md)** — LLM 프로바이더 호출, 시스템 프롬프트, 폴백 로직 변경 시.
- **[프론트엔드 UI/상태 (FE)](./src/AGENTS.md)** — React 컴포넌트, 생성 상태 관리, 스타일 토큰 변경 시.
