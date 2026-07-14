#!/usr/bin/env bash
# PostToolUse reminder: nudge TDD compliance after editing TypeScript implementation files.
input=$(cat)
file=$(echo "$input" | jq -r '.tool_input.file_path // .tool_response.filePath // empty')

case "$file" in
  *.test.ts|*.test.tsx|*.spec.ts|*.spec.tsx)
    echo '{}'
    ;;
  *.ts|*.tsx)
    jq -n --arg file "$file" '{
      hookSpecificOutput: {
        hookEventName: "PostToolUse",
        additionalContext: ("TDD 리마인더 (" + $file + "): 이 변경이 비즈니스 로직/API/유틸리티/버그수정에 해당한다면 .claude/rules/tdd.md의 RED-GREEN-REFACTOR를 지켰는지 확인하세요. 1) 실패하는 테스트를 먼저 작성했는가 2) 그 실패를 직접 실행해 확인했는가 3) 통과에 필요한 최소한의 코드만 작성했는가 4) 기존 테스트가 모두 통과하는가. 테스트보다 코드를 먼저 작성했다면 규칙에 따라 해당 코드를 삭제하고 RED부터 다시 시작하세요.")
      }
    }'
    ;;
  *)
    echo '{}'
    ;;
esac
