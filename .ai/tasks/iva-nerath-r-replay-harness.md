# Phase R: Nerath replay corpus and local harness

## Scope

Candidate root: `/home/alx/.local/share/iva/worktrees/nerath-core-candidate-20260724T000000Z`.

Edit or create **only**:

1. `evals/nerath-replay-cases.json`
2. `scripts/nerath-replay.mjs`
3. `tests/nerath-replay.test.mjs`
4. `.ai/analysis/nerat-r-worker-report.md`

No production instruction/memory/menu changes, no data/vault/.env/live/release/services/network/remotes/tags, no model calls, no commits, no deployment, and no Phase V.

## Synthetic corpus

Create exactly 20 anonymized, synthetic cases. Each includes a unique ID, task/input, category, and expected constraints/review focus. Do not copy live transcripts, vault contents, or user data.

Cover all 12 categories:

1. complex idea
2. literal question
3. technical task
4. creative co-authorship
5. disagreement
6. emotional statement
7. memory request
8. Beerlight
9. external message
10. tool action
11. night idea
12. rejection of proposed model

Collectively exercise every review axis: new useful mechanism; decorative metaphor without return; unnecessary intervention; false commitment; tool-call correctness; proposed memory write; disagreement/rejection handling; preservation of user voice in external text.

## Harness

Implement a dependency-free Node 24 CLI with `validate`, `template`, and `compare` commands (or an equivalently small interface).

- `validate` checks exact corpus count, schema, unique IDs, required categories, full axis coverage, and rejects missing/invalid data.
- `template` emits only baseline/Nerath response-review skeletons, clearly unscored and unfilled. Include metadata fields `model: "Codex Luna"`, effort, disposable-memory ID, and config fingerprint. Never fabricate model outputs.
- `compare` rejects empty responses, mismatched case ID/model/effort/task/config/memory metadata, and missing all eight reviewer fields. Given valid inputs, emit a deterministic compact matrix/summary without making its own model judgment.
- Default outputs must go only to explicitly supplied `/tmp` paths. Tests use `mkdtemp(tmpdir())` and cleanup.

## Verification and report

Run from candidate root:

```sh
/usr/bin/node-24 --test --test-isolation=none tests/nerath-replay.test.mjs
/usr/bin/node-24 scripts/nerath-replay.mjs validate evals/nerath-replay-cases.json
git diff --check
```

Report exact counts/coverage, commands, synthetic boundary, and honest execution status in `.ai/analysis/nerat-r-worker-report.md`. Isolated Codex Luna credentials/endpoints are unavailable and unauthorized: controlled external replay is `BLOCKED_NOT_RUN`; do not fake outputs or claim baseline-vs-Nerath benefit. `AGY_CODE_R_OK` may mean only harness/corpus ready, never replay passed.
