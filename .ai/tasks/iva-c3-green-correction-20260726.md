# C3 GREEN correction: satisfy the enforced mock-provider contract

Work in `/home/alx/projects/iva`.

## Goal

Make the corrected `tests/isolated-mock-provider.test.mjs` pass by modifying
only `scripts/lib/isolated-mock-provider.mjs`.

## Scope

- Read the failing test and `.ai/review-findings.md`.
- Modify only `scripts/lib/isolated-mock-provider.mjs`.
- Run only `/usr/bin/node-24 --test tests/isolated-mock-provider.test.mjs`.

## Out of Scope

- Do not modify tests, production `agent/` files, package files, config,
  services, or any other path.
- Do not read `.env`, secrets, vault/data contents, transcripts, MOC, knowledge,
  credentials, runtime logs, archives, or stashes.
- Do not use network or delegate to real `fetch`; do not create files/directories
  or start Eve, Iva, services, Telegram, or providers.
- Do not commit.

## Invariants

- Dynamically import the real provider module only after installing synthetic
  `MODEL_PROVIDER`; restore its exact prior value/presence on every path.
- Reject `codex` before dynamic import/model construction.
- Use an injected mock fetch with a fixed synthetic response and fail closed on
  unexpected URL. Never replace or delegate `globalThis.fetch`.
- Implement only behavior needed by the corrected failing test.

## Acceptance Criteria

- The dedicated Node 24 test passes completely.
- Only the helper file changes during this wave.

## Final Response

Maximum 15 lines: status, changed path, exact test command/result, and risks.
Do not modify tests or commit.
