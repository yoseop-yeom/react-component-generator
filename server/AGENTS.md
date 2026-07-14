# AGENTS.md (server/)

## Module Context

Bun 전용 HTTP 프록시 서버. 프레임워크 없이 `Bun.serve` 하나로 전체 API 표면(`/api/config`, `/api/generate`)을 처리하며, Anthropic/Google LLM API를 직접 호출한다. `vite.config.ts`의 프록시 설정을 통해 프론트엔드(5173)와 연결된다 (포트 3002).

## Tech Stack & Constraints

- `Bun.serve`만 사용한다 — Express/Hono 등 다른 서버 프레임워크를 추가하지 않는다.
- HTTP 호출은 전역 `fetch`만 사용한다 (axios 등 별도 HTTP 클라이언트 라이브러리 추가 금지).
- 모든 응답에 `CORS_HEADERS`를 포함해야 한다 (OPTIONS 프리플라이트 포함).

## Implementation Patterns

- 프로바이더를 추가/변경할 때는 `Provider` 유니온 타입, `ENV_KEYS`, `resolveApiKey`, `callAnthropic`/`callGoogle` 네 지점을 함께 갱신한다.
- 여러 모델을 순서대로 시도해야 하는 경우(`GOOGLE_MODELS`처럼)는 `fallback.ts`의 `withModelFallback`을 재사용한다 — 별도 재시도 루프를 새로 작성하지 않는다.
- LLM 원본 응답을 클라이언트로 돌려주기 전에 반드시 `generator.ts`의 `stripCodeFences` → `ensureRenderCall` 순서로 정규화한다.
- 에러 메시지는 한국어 사용자 문구로 매핑한다 (503 → 과부하 안내, 429 → 요청 과다 안내 등 `index.ts`의 기존 패턴을 따른다).

## Testing Strategy

- `bun run test -- server/generator.test.ts` / `server/fallback.test.ts` 로 파일 단위 실행.
- `generator.ts`, `fallback.ts`에 로직을 추가할 때는 부수효과 없는 순수 함수로 유지하고, 대응하는 `*.test.ts`를 함께 작성한다 (서버 기동 없이 테스트 가능해야 한다).
- `index.ts`의 `Bun.serve` 핸들러 자체는 테스트 대상이 아니다 — 로직은 가능한 한 `generator.ts`/`fallback.ts`로 뽑아낸 뒤 그쪽을 테스트한다.

## Local Golden Rules

- Do: `SYSTEM_PROMPT`를 수정할 때 "no imports / no TypeScript syntax / must call render()" 제약을 반드시 유지한다.
- Don't: 클라이언트가 보낸 `apiKey`를 로그에 남기거나 응답에 그대로 반사(echo)하지 않는다.
- Don't: `resolveApiKey`의 우선순위(클라이언트 키 → env 키)를 뒤집지 않는다 — 프론트엔드의 "서버 키 사용 중" 문구와 어긋난다.
