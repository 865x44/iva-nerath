# Phase R corrective slice: replay harness contract

Candidate root: `/home/alx/.local/share/iva/worktrees/nerath-core-candidate-20260724T000000Z`.

Edit **only** these existing Phase R paths:

1. `evals/nerath-replay-cases.json`
2. `scripts/nerath-replay.mjs`
3. `tests/nerath-replay.test.mjs`
4. `.ai/analysis/nerat-r-worker-report.md`

No production/N1 files, no model calls, no external replay, no data/vault/.env/live/release/services/network/remotes/tags, no commit, and no Phase V.

## Corrections

1. Refactor the harness to export pure, import-safe functions such as `validateCorpus`, `createTemplate`, and `compareReplay`, plus a tiny `import.meta.main` CLI. Tests import functions directly: no `child_process`, `exec`, `spawn`, or shell.
2. Keep exactly 20 synthetic/anonymized cases covering the 12 required categories and 8 required axes. Replace vague placeholders with concrete decision-bearing scenarios suitable to evaluate mechanism value, restraint, memory/tool correctness, rejection handling, or voice preservation. No live/private data. Validation must enforce nonblank strings, unique IDs, 15–25 count (the corpus is 20), required category/axis coverage, and reject unknown categories/axes.
3. Templates must contain separate `baseline` and `nerath` objects, each with metadata `{model, effort, task_id/task, disposable_memory_id, base_config_fingerprint, nerath_mode}` and a null response. Baseline mode is false; Nerath mode is true. Do not fabricate output or scores.
4. Compare must reject empty responses; missing/extra/reordered IDs or task mismatch; model not exactly `Codex Luna`; baseline/Nerath mismatch in model, effort, task, disposable memory ID, or base config fingerprint; wrong mode flags; missing any of eight reviewer fields; and invalid reviewer values. Use explicit enum `better|same|worse|not_applicable`. Return/emit a deterministic compact matrix derived only from supplied reviews, without an invented verdict.
5. Direct-function tests must cover valid corpus; invalid count/duplicate/schema; missing/unknown category or axis; unfilled metadata-separated template; empty response rejection; every metadata mismatch class; missing/invalid review rejection; and deterministic valid compare. Do not shell-spawn. Prefer pure in-memory tests; if filesystem is needed, use `mkdtemp(tmpdir())` and cleanup.
6. CLI `validate` remains dependency-free and independently runnable. Template/compare may write only to explicitly supplied `/tmp` paths.
7. Report worker sandbox failures honestly. It may list independent primary commands only after those actually run; controlled external replay is `BLOCKED_NOT_RUN`, no benefit claim, and `AGY_CODE_R_OK` means harness-ready only.

Run from candidate root:

```sh
/usr/bin/node-24 --test --test-isolation=none tests/nerath-replay.test.mjs
/usr/bin/node-24 scripts/nerath-replay.mjs validate evals/nerath-replay-cases.json
git diff --check
```
