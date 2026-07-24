# N1a R1 — one-file rollup repair

This is a fresh reslice after the original N1a worker attempts were exhausted.
The worktree deliberately has mixed dirty state from those attempts. Treat all
existing tests, reports, and review files as read-only evidence; do not change
them. Do not commit.

## Sole editable production path

`scripts/memory/rollup.ts`

Do not edit, create, rename, or delete any other repository path. Do not access
secrets, `.env`, `data/`, `vault/`, live paths, Telegram content, transcripts,
services, remotes, tags, or network.

## Required repair

1. Leave exactly one valid `export function buildPrompt` declaration.
2. Keep exactly one concise firewall block in the daily prompt only. It must
   distinguish user fact from agent metaphor/hypothesis, require direct user
   evidence for facts, explicit ratification for identity claims, explicit
   confirmation for standing rules/decisions, preserve uncertainty, and let
   correction/rejection override prior interpretations.
3. Include exactly once, clearly as a negative example:
   `Nerath: «Этот проект пытается получить root-доступ к твоей неделе».`
   and the forbidden fact:
   `Пользователь имеет устойчивый паттерн позволять проектам контролировать его жизнь.`
   Do not inject the full fixture checklist into production text.
4. Preserve weekly/monthly/yearly prompt semantics unchanged.
5. Keep the importability/CLI refactor minimal and Node-24-safe. A small
   `main()` with `if (import.meta.main) await main()` and imports inside main is
   permitted only as needed to import `buildPrompt` without resolving Eve.
   Preserve CLI argument validation, Client/session flow, Telegram flow, error
   behavior, and exit semantics.

## Execution constraints

Use editor/write tools to repair the one file. Do not run shell commands before
the edit. If an internal RunCommand EAGAIN/resource failure occurs, do not
abandon or revert the repair; finish with editor tools and return non-empty
stdout summarizing the one-file result. Primary will run tests later.
