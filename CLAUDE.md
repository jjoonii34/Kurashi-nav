# Kurashi Nav — instructions for Claude Code

Housing check for foreign residents in Japan ("Should I sign this lease?").
Go backend now; Next.js frontend in `web/` later. This is the owner's Japan IT
job portfolio, and the owner is learning Go top-down.

Hosting: Go API on Google Cloud Run (Tokyo); frontend as a Next.js static
export on Cloudflare Workers static assets (ADR-0007). Frontend rules live in
`.claude/rules/web.md` and load when you work in `web/`.

## Talking to the user

- Reply in Korean. Write code, comments, commit messages and public docs
  (README, ADRs, DATA_SOURCES) in English. `docs/MVP.md` and `docs/*.ko.md` are Korean.
- Explain top-down: what changed at the API / entry point → which package →
  which function → details.
- The user must be able to explain every line in an interview. For core logic
  (domain rules, concurrency, error-handling design) propose the design and let
  the user write it, unless they ask you to write it.

## Commands

- `make check` — gofmt check + `go vet` + tests with `-race`. Must pass before a task is done.
- `go test ./internal/<pkg> -run <TestName> -v` — run one test.
- `make run` — server on :8080 with dummy data, no API key. It never exits:
  don't run it in the foreground; prefer `httptest`-based tests.
- `make run-live` — real MLIT API, loads `.env`. Ask the user first.

## Layout

```
cmd/api/            entry point: config → wiring → server → graceful shutdown
internal/server     HTTP: routes, middleware, JSON, error → status mapping
internal/housing    domain: housing check, ports (interfaces), messages
internal/cost       initial-cost calculator (pure)
internal/room       畳 / layout codes / 3D preview data (pure)
internal/reinfolib  MLIT API client + housing.LayerSource adapter
internal/fakesource dummy LayerSource for dev and tests
internal/geo, geocode, i18n, parallel, ratelimit, cache, config, logging, source
docs/               MVP.md (scope + backlog), adr/, DATA_SOURCES.md, LEARNING.ko.md
```

## Architecture rules

- Dependencies point inward. `server` calls `housing`, `room`, `cost`.
  Adapters (`reinfolib`, `fakesource`, `geocode`) implement `housing`
  interfaces. Only `cmd/api` picks concrete types. `housing` never imports an adapter.
- `cost`, `room`, `geo`, `i18n` are pure: no I/O, no clock, no mutable globals.
- The HTTP layer holds no business logic. Map domain sentinel errors to status
  codes in handlers; error bodies are `{"error":{"code","message","request_id"}}`.
- A failed data layer becomes a section with `status: "unavailable"`, never a
  failed request (ADR-0003).

## Code conventions

- Standard library only. Adding a module requires a new ADR (ADR-0001).
- Table-driven tests. Inject clocks (`now func() time.Time`) and fakes; never
  sleep for timing or call the real network in tests.
- Wrap errors with `%w`; check them with `errors.Is` / `errors.As`.
- Money is `int64` yen; month multipliers become hundredths before arithmetic.
- GeoJSON positions are `[lon, lat]`; `geo.Point` is `{Lat, Lon}`.
- Every user-facing string goes through an `i18n.Catalog` with `en`, `ko` and
  `ja-easy`; each package's catalogue test (`Missing()`) must pass.
- `gofmt` runs automatically after each edit (hook in `.claude/settings.json`).
- Comments are rare and say why, never what the code already says. Keep doc
  comments on exported names to a line or two. No excuse comments ("temporary",
  "works somehow"). The only TODOs allowed are `TODO(human)` and ones that name
  a backlog ID.

## Quality bar

- Pick the simplest solution the owner can explain in an interview.
- Stay inside the requested scope: no unrelated edits, no unrequested
  refactoring, no bonus features.
- Never invent an API, option or field name. Check it or ask.
- Never make a check pass by deleting or skipping a test, changing the expected
  value to match the output, hard-coding an input, or adding `//nolint`.
- Never discard an error silently. A deliberate `_ =` needs a comment saying
  why it is safe.
- Leave no unused code, commented-out code or debug prints.
- No interface, generic or helper with a single use; abstract when the second
  real use appears. No copy-pasted logic.
- Docs describe only what exists: no unimplemented features, unmeasured
  numbers or tests that were not run.

## Hard rules

- Never store or log user input (coordinates, address, rent). Access logs keep
  method, path, status, timing only (ADR-0002).
- Cache keys use public tile addresses, never user coordinates.
- Never scrape listing portals or use listing photos (ADR-0004, ADR-0006).
- Never call the MLIT API from the browser. Never put the API key in URLs,
  logs, code, tests or chat. Do not read `.env`.
- Never send user input to third-party or LLM APIs.
- Do not commit or push unless the user asks.
- Never add `Co-Authored-By: Claude` or "Generated with Claude Code" lines to
  commits or PRs. The owner is the only author.

## Workflow

- The backlog is `docs/MVP.md`: checkbox tasks with IDs such as `M1-3`.
  `/next-task [id]` runs one task end to end. Tasks tagged `[직접]` are for the user.
- One task = one branch (`feat/m1-3-flood-summary`) = one PR.
- Changes touching more than one package: plan first and wait for approval.
- Done means: `make check` green; relevant docs updated (DATA_SOURCES, ADR,
  README, LEARNING.ko.md); the task's checkbox ticked; a Conventional Commits
  message suggested (`feat(reinfolib): ...`).
- Bug fixes: write the failing test, watch it fail, fix, watch it pass.
- The final report covers: what changed per file, why this approach over at
  least one alternative, the commands run and their result (say so if a check
  was not run), remaining limits, and what the owner should study.
- When the same mistake comes up twice, propose a test, type or `go vet` check
  that prevents it before adding a rule to this file, and list every other
  place in the repo with the same pattern.
- A decision with real trade-offs gets an ADR: `/adr <title>`.
- Other commands: `/verify` (full check, explained), `/explain <path>` (top-down walkthrough).

## References

- MLIT API manual: https://www.reinfolib.mlit.go.jp/help/apiManual/
  (tile APIs accept z 11–15; empty tiles return 200 with no features)
- Field names marked `(unverified)` in `internal/reinfolib/endpoints.go` must be
  checked against that manual before relying on them.
