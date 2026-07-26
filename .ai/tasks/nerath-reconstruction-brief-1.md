# Task: Nerath Reconstruction — Brief 1: Foundation + Invariant Kernel

## Working directory (READ FIRST)

All SOURCE edits happen in the worktree, NOT in the main checkout:

- **Source root (edit here):** `/home/alx/.local/share/iva/worktrees/nerath-reconstruction-alpha-20260725`
- **Branch:** `feature/nerath-reconstruction-alpha` (base SHA `1b770bd`)
- **Dogfood runtime root (vault/data live here, NOT in the worktree):** `/home/alx/.local/share/iva/dogfood/nerath-reconstruction-alpha`
  - dogfood vault: `<DOGFOOD>/vault`
  - dogfood data: `<DOGFOOD>/data` (already contains `settings.json` with `{"nerathMode": true}`)
- **Production (NEVER write):** `/home/alx/projects/iva/vault`, `/home/alx/projects/iva/data`

The worktree has NO `vault/` or `data/` of its own (runtime dirs are gitignored). Tests must use
hermetic fixture dirs via `ASSISTANT_VAULT_DIR` / `ASSISTANT_DATA_DIR` env overrides, never ambient dirs.

## Context

Wave 1 of `.ai/plans/nerath-reconstruction-alpha.md`. Sanitation Alpha already delivered isolation,
fail-closed guards, and session resume (see `.ai/STATE.md` 2026-07-25 close). This brief VERIFIES those
deliverables (does not redo them), seeds the dogfood prerequisites that Wave 2 composition needs, and
extracts a formal Invariant Kernel.

## Current state (verified)

- `agent/instructions/25-persona.ts:18` contains `if (isNerathModeOn()) return "";` (the "dry Nerath" cause).
- `agent/instructions/30-nerath.ts` injects `NERATH_CONSTITUTION` when `isNerathModeOn()`.
- `scripts/lib/nerath-mode.mjs` exports `isNerathModeOn`, `NERATH_CONSTITUTION_CORE`,
  `NERATH_IDENTITY_BOUNDARIES`, `NERATH_CONSTITUTION`, `NERATH_OPT_IN_IDENTITY_CARD`,
  `buildNerathAblationPrompt`, `isIdentityCardAmbientAllowed`.
- `isNerathModeOn()` reads `<ASSISTANT_DATA_DIR>/settings.json` → `nerathMode === true`, defaults `false`.
- `scripts/memory/rollup.ts` already has the memory firewall (fact/inference/hypothesis/metaphor separation)
  and a dogfood fail-closed guard.
- `scripts/verify-dogfood-isolation.mjs` exists and passes.
- `scripts/nerath-replay.mjs` is OFFLINE tooling: `validate <corpus.json>`, `template <corpus> <outDir>`,
  `compare <corpus> <responses>`. It does NOT call a model.
- Dogfood vault `<DOGFOOD>/vault` is EMPTY — `PERSONA.md` is missing there (it exists only in the main
  checkout at `/home/alx/projects/iva/vault/PERSONA.md`).

## Task

### 1. Verify Sanitation Alpha deliverables (verify only, do not rewrite)

- Run `node scripts/verify-dogfood-isolation.mjs` from the worktree root → must pass.
- Confirm `scripts/memory/rollup.ts` still contains the dogfood fail-closed guard and the
  fact/inference/hypothesis/metaphor firewall prompt.
- Confirm `scripts/nerath-stage2/nerath-chat.mjs` still has session-state persistence (Brief 5 deliverable).
- Record pass/fail in the brief report. If any check fails, STOP and report — do not silently fix.

### 2. Seed dogfood prerequisites (dogfood-only, fail-closed)

- Copy `PERSONA.md` from the main checkout (READ-ONLY source) into the dogfood vault:
  - source: `/home/alx/projects/iva/vault/PERSONA.md` (read only)
  - dest: `<DOGFOOD>/vault/PERSONA.md`
  - This is a READ of production and a WRITE to dogfood only. Never write to `/home/alx/projects/iva/vault`.
- Verify `<DOGFOOD>/data/settings.json` contains `{"nerathMode": true}` (it already does). Do not change it
  unless missing; if missing, create it in the dogfood data dir only.
- Add a guard in any seed helper: abort if dest vault/data path equals `/home/alx/projects/iva/vault` or
  `/home/alx/projects/iva/data`.

### 3. Extract Invariant Kernel (ADDITIVE — do not reword the frozen constitution)

`NERATH_CONSTITUTION_CORE` + `NERATH_IDENTITY_BOUNDARIES` are a D10 tech freeze (R2 wording accepted).
Do NOT modify their text. Instead, add a NEW export to `scripts/lib/nerath-mode.mjs`:

```javascript
export const NERATH_INVARIANT_KERNEL = Object.freeze({
  // What Nerath MUST NOT do (hard prohibitions)
  mustNot: Object.freeze([
    "no second transcript (no nerath-session-memory.json or parallel conversation log)",
    "no second CORE (no parallel user-profile store)",
    "no second rollup graph (shared Iva DAG: daily -> weekly -> monthly -> yearly)",
    "no separate agent (one binary, one model provider, one vault)",
    "no duplicate tools (reuse Iva's; no nerath-search / nerath-grep-notes)",
    "no production writes during dogfood",
    "no persistent internal characters; no multi-voice parliament or debate graph",
    "no ambient identity card (NERATH_OPT_IN_IDENTITY_CARD never auto-loaded)",
  ]),
  // What Nerath MUST preserve
  mustPreserve: Object.freeze([
    "epistemic hygiene: fact / user words / inference / hypothesis / metaphor / state / decision separated privately",
    "capability truth: claims require runtime evidence; unknown = unconfirmed, not fabricated",
    "ordinary questions get ordinary answers (no constitutional escalation)",
    "explicit current-session permission preserved and scoped; latest correction overrides",
    "upstream operational/security/tool contracts preserved",
  ]),
  // Provenance — the kernel is derived from, and must never contradict, the frozen constitution
  derivedFrom: "NERATH_CONSTITUTION_CORE + NERATH_IDENTITY_BOUNDARIES (D10 tech freeze)",
});
```

The kernel is a formal index of the existing freeze, not a new policy. If a future change to the kernel
would contradict the frozen text, the constitution wins.

### 4. Regression tests (hermetic)

Create `tests/nerath-invariants.test.mjs` (run with `node --test`), using temp fixture dirs via
`ASSISTANT_VAULT_DIR` / `ASSISTANT_DATA_DIR`:

- `isNerathModeOn()` returns `false` when settings.json missing; `true` when `{"nerathMode": true}`.
- `NERATH_INVARIANT_KERNEL` is exported, frozen, and has non-empty `mustNot` / `mustPreserve`.
- Constitution snapshot guard: assert the exact current text of the D10 freeze — `NERATH_CONSTITUTION_CORE`
  and `NERATH_IDENTITY_BOUNDARIES` (store a hash/snapshot in the test) so any silent rewording of the freeze
  fails CI. Additive exports added later (e.g. a positive layer in Brief 2) are allowed and must NOT trip this
  guard — the guard protects the freeze text only, not new additive exports.
- `NERATH_OPT_IN_IDENTITY_CARD` is never ambient: `isIdentityCardAmbientAllowed()` returns `false`.
- Memory-firewall presence: assert `scripts/memory/rollup.ts` contains the
  fact/inference/hypothesis/metaphor separation prompt.
- Isolation: `node scripts/verify-dogfood-isolation.mjs` exits 0 (spawn it from the test or assert its checks).

## Allowed paths

- `scripts/lib/nerath-mode.mjs` (ADD `NERATH_INVARIANT_KERNEL` export only; do not alter existing exports)
- `tests/nerath-invariants.test.mjs` (create)
- `<DOGFOOD>/vault/PERSONA.md` (seed from main, dogfood-only)
- `<DOGFOOD>/data/settings.json` (verify only; create only if missing, dogfood-only)

## Forbidden

- Do NOT modify `NERATH_CONSTITUTION_CORE`, `NERATH_IDENTITY_BOUNDARIES`, or `NERATH_CONSTITUTION` text.
- Do NOT write to `/home/alx/projects/iva/vault` or `/home/alx/projects/iva/data` (production).
- Do NOT edit the main checkout `/home/alx/projects/iva` (dirty production) — worktree only.
- Do NOT commit, tag, push, or restart any service.

## Gate

- `node scripts/verify-dogfood-isolation.mjs` passes.
- `node --test tests/nerath-invariants.test.mjs` passes (run from worktree root).
- `NERATH_INVARIANT_KERNEL` exported and frozen; constitution snapshot unchanged.
- `<DOGFOOD>/vault/PERSONA.md` present; `<DOGFOOD>/data/settings.json` has `nerathMode: true`.
- No production writes (prove via `git -C /home/alx/projects/iva status --porcelain` unchanged for vault/data).

## Replay gate (offline)

- If a replay corpus exists, `node scripts/nerath-replay.mjs validate <corpus.json>` passes.
- Live model replay is deferred (matches D10 "A3 full replay deferred"); record this in the report.

## Worker

- Requested: qwen 3.7 via /orc + /agy. **NOTE:** qwen 3.7 is NOT an agy model (agy routes Gemini/Claude/gpt-oss
  only). Implementation must run on an agy-code model (default `gemini-3.1-pro-high`) unless the owner picks
  another. qwen3.7-max is read-only (/worker) and cannot edit code.

## Stop-gate

After completing Brief 1, STOP and return a report (gate results, files touched, proof production untouched).
Do NOT continue to Brief 2 autonomously. The orchestrator reviews before dispatching Brief 2.

## Constraints

- Do NOT commit.
- Do NOT modify production vault or data.
- Do NOT restart services.
- Do NOT touch dirty main.
- Edit the worktree directly.
