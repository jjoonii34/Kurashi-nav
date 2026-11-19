---
name: verify
description: Run the full local check (gofmt, go vet, race tests) and explain any failure
disable-model-invocation: true
allowed-tools: Bash(make check) Bash(go test *) Bash(go vet *)
---

Run `make check`.

- If it passes, run `go test -cover ./...` and report per-package coverage as
  one short table, flagging packages below 70%.
- If it fails, for each failure show the failing test or vet message, explain
  the cause in Korean, and propose the smallest fix. Do not change code until
  the user agrees.
