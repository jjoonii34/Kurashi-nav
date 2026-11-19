---
name: next-task
description: Carry one MVP backlog task from docs/MVP.md through plan, implementation, tests and docs
argument-hint: "[task-id, e.g. M1-3]"
disable-model-invocation: true
---

Work on MVP task $ARGUMENTS from `docs/MVP.md`.
If no task ID was given, take the first unchecked task in the earliest
milestone that is not tagged `[직접]` (those are for the user to do by hand).

1. Read the task line in `docs/MVP.md` and every file it names.
   Restate in Korean, in three lines: the goal, the done-criteria, the files to touch.
2. Propose a plan top-down: API / entry point → package → functions → tests.
   Point out which part is core logic the user should write (see CLAUDE.md).
   Stop and wait for approval.
3. After approval, implement in small steps. Write or extend table-driven tests
   first where practical.
4. Run `make check` and fix what fails.
5. Update the docs the change affects: `docs/DATA_SOURCES.md`, an ADR,
   `README.md`, `docs/LEARNING.ko.md`.
6. Tick the task's checkbox in `docs/MVP.md`.
7. Report in Korean: what changed (top-down), how it was verified, and two
   things the user should study from this change. Suggest a branch name and a
   Conventional Commits message. Do not commit or push unless asked.
