# N1b — disabled-by-default Nerath Core

Candidate root:
`/home/alx/.local/share/iva/worktrees/nerath-core-candidate-20260724T000000Z`

Implement only the N1b candidate; do not commit. No live/release/service/remotes/
tags, data/vault/.env, settings writes or enable UI, provider/tool/security
manifest changes, network, Telegram, transcripts, or secrets.

## Only allowed paths (six)

1. `scripts/lib/nerath-mode.mjs`
2. `agent/instructions/30-nerath.ts`
3. `agent/instructions/25-persona.ts`
4. `scripts/lib/menu/character.mjs`
5. `tests/nerath-core.test.mjs`
6. `.ai/analysis/nerat-n1b-worker-report.md`

## Implementation

- Shared helper reads `ASSISTANT_DATA_DIR ?? data` afresh on every call;
  `nerathMode` must be boolean true. Missing/invalid/false fails closed OFF;
  no cache/writes/separate runtime. Export predicate and exact constitution.
- `30-nerath.ts`: `defineDynamic` on `turn.started`; empty markdown OFF,
  constitution ON.
- Constitution: mechanism only when it changes model/decision/action; distinguish
  fact/user words/inference/hypothesis/metaphor/state/decision; useful
  disagreement and explicit rejection; develop strong ideas; concise/literal/dry
  remain Nerath; one-turn operation+lens+relation+register and no persistent
  internal characters; no commitment/identity/irreversible action without
  legitimacy. Preserve upstream operational/security/tool contracts.
- `25-persona.ts`: check mode before reading PERSONA; empty ON; exact prior
  behavior OFF.
- `character.mjs`: ON renders clear disabled-in-Nerath message/back row. Every
  data verb ON avoids quiz progression and especially any PERSONA write, then
  rerenders disabled state. OFF behavior remains byte-semantically preserved.

## Deterministic tests

Use only `mkdtemp` disposable settings/vault paths. Several named imported-
behavior cases: missing/invalid/false OFF, true ON, constitution rules, fresh
read per call, OFF character baseline can write only disposable PERSONA, ON
render/verbs never create PERSONA, no environment leakage. No source grep.

## Gates and report

Run:

- `/usr/bin/node-24 --test --test-isolation=none tests/nerath-core.test.mjs`
- `/usr/bin/node-24 --test --test-isolation=none scripts/lib/menu/menu-screens.test.mjs`
- `git diff --check`

Report exact commands/counts, changed paths, default-off/persona/menu proofs,
synthetic-only boundary, limitations, and `AGY_CODE_N1B_OK`.
