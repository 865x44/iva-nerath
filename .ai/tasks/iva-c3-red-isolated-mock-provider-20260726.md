# C3 RED: isolated mock-provider contract test

Work in `/home/alx/projects/iva`.

## Goal

Create one focused Node test that specifies the C2 mock-only provider harness,
and leave it failing at an assertion (not an import/setup error).

## Scope

- Create only `tests/isolated-mock-provider.test.mjs`.
- If needed to make the test load, create the smallest possible
  `scripts/lib/isolated-mock-provider.mjs` stub that exports the named API and
  throws `Not implemented`. It must contain no provider/SDK, filesystem,
  network, environment, or process logic.
- The test must specify all C2 requirements: provider selection uses the real
  provider module with synthetic env; a fixed synthetic completion comes only
  through an injected mock fetch; `8723`, production paths, invalid synthetic
  roots, and `codex` reject before any model call; and environment is restored.
- Run only `/usr/bin/node-24 --test tests/isolated-mock-provider.test.mjs`.

## Out of Scope

- Do not implement the helper beyond the minimal throwing stub.
- Do not alter `agent/`, `bin/`, package files, production configuration,
  services, vault/data, archives, refs, stashes, worktrees, or existing tests.
- Do not read `.env`, secrets, vault/data contents, transcripts, MOC, knowledge,
  credentials, or runtime logs.
- Do not use network; do not start Eve, Iva, a service, Telegram, or a provider.
- Do not commit.

## Invariants

- The test must use only synthetic `/tmp/iva-mock-*` strings and a non-`8723`
  port; it must not create those paths.
- No real fetch delegation, subprocess, or filesystem I/O is allowed.

## Acceptance Criteria

- The test fails only because the minimal stub throws or does not satisfy an
  asserted contract; not because of a missing module/dependency.
- The failing output names the expected contract behavior.

## Final Response

Maximum 15 lines: status, changed paths, exact RED command/result, and risks.
Do not implement GREEN and do not commit.
