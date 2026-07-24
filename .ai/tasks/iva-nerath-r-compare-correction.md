# Phase R corrective slice: compare semantics

Candidate root: `/home/alx/.local/share/iva/worktrees/nerath-core-candidate-20260724T000000Z`.

Edit **only**:

1. `scripts/nerath-replay.mjs`
2. `tests/nerath-replay.test.mjs`
3. `.ai/analysis/nerat-r-worker-report.md`

The corpus is read-only and must retain SHA-256 `eaef8b63d789799479d2123730dccad2162098b2e35864ffc169860ffb119a09`:
`evals/nerath-replay-cases.json`.

No commits, production/N1/corpus edits, model calls, external replay, data/vault/.env/live/release/services/network/remotes/tags, or Phase V.

## Required corrections

1. `validateCorpus` validates that `constraints` is an array and `review_focus` is a nonempty array, and validates all IDs/tasks/categories/axes plus required category/axis coverage. `createTemplate` and `compareReplay` invoke `validateCorpus`.
2. `compareReplay` requires baseline and Nerath metadata each to have exact model `Codex Luna`, nonblank effort, exact corpus task ID/task, nonblank disposable-memory ID and base config fingerprint, and correct mode flags. Require equality between modes for model, effort, task, task ID, disposable memory, and base config; only `nerath_mode` differs. Require outer ID/task/category and exact corpus order/length.
3. Require all eight review axes and allowed enum `better|same|worse|not_applicable`. Return deterministic `{rows, totals}`: each row includes ID/category and all eight supplied review values in stable axis order; totals count every allowed value per axis. Do not invent a verdict or `COMPARED` status.
4. Direct-function table-driven tests cover every rejection class: invalid constraints/review_focus; length/order/ID/task/category; exact model and model mismatch; effort missing/mismatch; disposable-memory missing/mismatch; config missing/mismatch; wrong modes; empty responses; missing/invalid review; valid deterministic rows/totals. No shell spawn.
5. Report worker sandbox provenance truthfully. Root previously independently verified 10/0 and CLI validation/diff on the prior snapshot; this worker may claim only commands it actually runs. Controlled replay remains `BLOCKED_NOT_RUN`; no benefit claim.

Run from candidate root:

```sh
/usr/bin/node-24 --test --test-isolation=none tests/nerath-replay.test.mjs
/usr/bin/node-24 scripts/nerath-replay.mjs validate evals/nerath-replay-cases.json
git diff --check
```
