---
name: adr
description: Record an architecture decision as the next numbered ADR in docs/adr
argument-hint: "[decision title]"
disable-model-invocation: true
---

Create the next numbered ADR in `docs/adr/` for: $ARGUMENTS

- Follow the existing ADRs: file name `NNNN-kebab-title.md`, then Status, Date
  (today), Context, Decision, Consequences. English, under 40 lines.
- If the context or the options considered are not clear from the
  conversation, ask the user before writing.
- Add the decision to the "Key decisions" list in `README.md`.
