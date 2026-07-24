# N1a — Nerath memory firewall

## Authority and status

Approved execution slice within `.ai/tasks/iva-nerath-core-candidate-goal.md`.
Base SHA: `1ee221b39a8e7bf46e80305246293a7f627f78af`. Do not commit.

## Goal

Implement the narrow daily-rollup prompt firewall which prevents agent language
from becoming user identity or fact, while preserving raw transcripts and the
existing memory architecture. Add deterministic, importable behavior tests using
only synthetic in-memory/disposable inputs.

## Ownership and allowed paths

- `scripts/memory/rollup.ts` — the sole production file.
- `tests/memory-firewall.test.ts` and any narrowly necessary synthetic fixture
  files under `tests/`.
- `.ai/analysis/nerat-n1a-worker-report.md` — concise final evidence report.

Do not edit any other path. Do not create, read, or write `data/`, `vault/`,
`.env`, real transcripts, credentials, Telegram content, service configuration,
release/live paths, remotes, tags, or deployment files.

## Required implementation

1. Add the firewall only to the `daily` prompt in `scripts/memory/rollup.ts`.
   Preserve `appendDaily`/raw transcript behavior and all existing period flows.
2. Make the real daily-prompt construction importable/testable if necessary,
   without a redesign or a second runtime.
3. The daily prompt must explicitly separate user quote, user fact, inference,
   hypothesis, agent metaphor, temporary state, decision, confirmation, and
   ratification. It must require direct user evidence for a fact; explicit user
   ratification for identity claims; explicit confirmation for standing rules or
   user decisions; and must preserve uncertainty as hypothesis/inferred note/raw
   transcript rather than truth. User correction and explicit rejection override
   prior candidate interpretations.
4. Implement deterministic tests that exercise actual prompt-builder behavior,
   not broad source-text grep. Use a synthetic fixture matrix covering all:
   - agent statement is not a user fact;
   - agent metaphor is not a fact;
   - temporary state is not identity;
   - one episode is not a stable pattern;
   - proposed model is not a user decision;
   - identity claim requires explicit ratification;
   - standing rule requires explicit confirmation;
   - rejected model is not recorded as truth;
   - user correction wins;
   - uncertainty remains hypothesis/inferred note/raw transcript.
5. Include verbatim in the synthetic fixture the mandatory agent statement:
   `Nerath: «Этот проект пытается получить root-доступ к твоей неделе».`
   Test that it cannot yield the forbidden fact:
   `Пользователь имеет устойчивый паттерн позволять проектам контролировать его жизнь.`
   Do not call a model, a rollup process, or filesystem-backed vault code.

## Commands

Allowed only for this slice: source inspection in allowed paths and focused test
execution with `/usr/bin/node-24 --test tests/memory-firewall.test.ts` (or the
repository's already-existing equivalent if this exact command is incompatible).
Do not run build, full test suite, npm install, git commit, git reset, network,
or service commands.

## Acceptance evidence

Run the focused test and write `.ai/analysis/nerat-n1a-worker-report.md` with:
changed paths, exact test command/result/count, fixture-matrix result, statement
that only synthetic data was used, known limitations, and `AGY_CODE_N1A_OK`.
Keep final stdout to at most 15 lines.
