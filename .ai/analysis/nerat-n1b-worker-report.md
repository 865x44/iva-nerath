# Nerath Core N1b Worker Report

## Worker Sandbox Evidence

The worker's chained gate was not valid acceptance evidence: its first test
attempt failed with `EROFS` while creating a temporary directory, so the later
menu and diff checks in that chain did not run. The worker report was corrected
by primary verification rather than treating that sandbox attempt as green.

## Independent Primary Verification

- `/usr/bin/node-24 --test --test-isolation=none tests/nerath-core.test.mjs`:
  PASS, 7 tests passed and 0 failed.
- `/usr/bin/node-24 --test --test-isolation=none scripts/lib/menu/menu-screens.test.mjs`:
  PASS, 5 tests passed and 0 failed.
- `git diff --check`: PASS with no output.
- Candidate-root artifact check after both suites: PASS; no
  `iva-nerath-*` or `iva-menu-*` paths remained.
- Twelve earlier synthetic `iva-nerath-data-*` / `iva-nerath-vault-*`
  artifacts were moved recoverably to
  `/tmp/iva-nerath-n1b-quarantine.du9FNy`.

## Changed Paths
1. `scripts/lib/nerath-mode.mjs` (Created)
2. `agent/instructions/30-nerath.ts` (Created)
3. `agent/instructions/25-persona.ts` (Modified)
4. `scripts/lib/menu/character.mjs` (Modified)
5. `tests/nerath-core.test.mjs` (Modified)
6. `.ai/analysis/nerat-n1b-worker-report.md` (Modified)

## Default-Off / Persona / Menu Proofs
- **Missing/invalid/false OFF:** Tested and proven in `nerath-core.test.mjs`. When disabled, the normal bot operates without Nerath constraints.
- **Persona Proof:** `personaMarkdown()` explicitly checks `isNerathModeOn()`. If true, it returns an empty string.
- **Menu Proof:** In `character.mjs`, `render()` and all relevant verbs (`go`, `redo`, `q`, `apply`) return "disabled in Nerath mode" if ON, bypassing any quiz progression or PERSONA writes.
- **Fresh Read Per Call:** `isNerathModeOn()` always reads `settings.json` afresh on every turn.

## Synthetic-Only Boundary and Cleanup Behavior
Tests now strictly use a synthetic root created with `mkdtempSync(join(tmpdir(), "iva-nerath-"))` from `node:os`. Tests never use `process.cwd()` for temporary paths and only use synthetic disposable data. The previous environment variables are captured and an `after()` block exactly restores (or deletes) these variables and recursively removes the synthetic root.

A behavior test proves the synthetic root is contained within `os.tmpdir()`, does not leak into `process.cwd()`, and that the test environment targets the synthetic directories.

## Limitations
- Performance: Because `settings.json` is read synchronously from the filesystem on every `turn.started` and every menu action, it introduces minor overhead (bounded to synchronous disk read).
- Strict Fallback: Any invalid `settings.json` structure causes the feature to silently fail to `false` (default off).

AGY_CODE_N1B_OK
