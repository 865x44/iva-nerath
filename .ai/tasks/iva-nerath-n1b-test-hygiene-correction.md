# N1b corrective slice: test hygiene and report integrity

## Scope and authority

Candidate root: `/home/alx/.local/share/iva/worktrees/nerath-core-candidate-20260724T000000Z`.

Edit **only** these files:

1. `tests/nerath-core.test.mjs`
2. `.ai/analysis/nerat-n1b-worker-report.md`

Do not edit, create, delete, rename, stage, or commit any other path. Do not run replay work, deployment, service actions, remote actions, or change live Iva data.

The following production files are read-only and their SHA-256 hashes must remain exact:

- `scripts/lib/nerath-mode.mjs`: `128eb120eebcabdea347f4ae70bf0c04aa9eb204a93b1b13f79b4f572db41f33`
- `agent/instructions/30-nerath.ts`: `4b8d7aa647ddf67834dec1050faed995b37613e3b02aadedcd42840b65205abb`
- `agent/instructions/25-persona.ts`: `fc3ece605ccb2870f212e2db9898d6ed25ee6f934db60798421716ee2f594dc1`
- `scripts/lib/menu/character.mjs`: `c749d5be440611b5144767e6b55d98f202f6cd2d66c432c971f586690ffc4811`
- `scripts/memory/rollup.ts`: `04767674b97a6af9ab6fa93fa8c43b10c5c8f5e790eb2f9955efc263bd139dd3`

No commit.

## Required test fixes

In `tests/nerath-core.test.mjs`:

- Use `node:os` `tmpdir()` and create one synthetic root with `mkdtempSync(join(tmpdir(), "iva-nerath-"))`.
- Create `data/` and `vault/` children inside that root. Never use `process.cwd()` for temporary paths.
- Capture previous `ASSISTANT_DATA_DIR` and `ASSISTANT_VAULT_DIR` before modification. Register `after()` cleanup that restores each key exactly (or deletes it when it was absent) and recursively removes the synthetic root.
- Remove all `console.log` output.
- Replace the misleading `no environment leakage` assertion with a behavior test that proves registered cleanup/contained synthetic root. Post-process absence of candidate-root artifacts is primary-owned verification.
- Retain named tests for: missing/invalid/false OFF; true ON; fresh read; full constitution; OFF disposable `PERSONA` write; and ON containment where render plus every relevant verb (`go`, `redo`, `q`, `apply`) cannot create `PERSONA` or advance quiz state.
- Ensure the OFF test removes its disposable `PERSONA` before ON containment assertions.
- Use only synthetic disposable data.

## Required commands and report

Run these commands from the candidate root exactly:

```sh
/usr/bin/node-24 --test --test-isolation=none tests/nerath-core.test.mjs
/usr/bin/node-24 --test --test-isolation=none scripts/lib/menu/menu-screens.test.mjs
git diff --check
```

Update `.ai/analysis/nerat-n1b-worker-report.md` with exact actual counts and changed paths, synthetic-only boundary, cleanup behavior, and limitations. Distinguish worker sandbox evidence from final independent primary verification. Do not claim a gate that did not run from the candidate root. End with `AGY_CODE_N1B_OK` only when the scoped work is complete.
