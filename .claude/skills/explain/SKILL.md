---
name: explain
description: Explain a package or file top-down for learning, with questions to check understanding
argument-hint: "[path, e.g. internal/housing]"
disable-model-invocation: true
---

Explain `$ARGUMENTS` to a developer who is learning Go and studies top-down.
Answer in Korean. Do not modify any file.

1. **한 줄 요약** — what problem this code solves and who calls it (find the callers).
2. **흐름** — the main path from the entry point through this code, as a short
   numbered list or a Mermaid diagram of at most 10 nodes.
3. **핵심 타입·함수 3–5개** — one line each on what it is for.
4. **Go 포인트** — language features or idioms used here (context, interfaces,
   generics, goroutines, table-driven tests …) and why they fit.
5. **확인 질문 3개** — questions that test understanding. Do not answer them
   unless the user asks.
