# C3 GREEN: satisfy the isolated mock-provider test

Work in `/home/alx/projects/iva`.

## Goal

Make the currently failing `tests/isolated-mock-provider.test.mjs` pass with the
minimal implementation in `scripts/lib/isolated-mock-provider.mjs`.

## Scope

- Read the failing test and its current Node 24 failure output.
- Modify only `scripts/lib/isolated-mock-provider.mjs`.
- Run only `/usr/bin/node-24 --test tests/isolated-mock-provider.test.mjs`.

## Out of Scope

- Do not modify the test, any production `agent/` file, package files, service
  files, config, or any path other than the helper.
- Do not read `.env`, secrets, vault/data contents, transcripts, MOC, knowledge,
  credentials, or runtime logs.
- Do not use network, delegate to real fetch, create files/directories, launch
  Eve/Iva/services/Telegram/providers, commit, stage, or change refs.

## Invariants

- Implement only behavior required by the failing test.
- Any mock transport must fail closed on an unexpected URL and never delegate.
- Restore any temporary process-environment changes before returning or throwing.
- Do not commit.

## Acceptance Criteria

- All subtests in the named test pass under Node 24.
- Only the helper file changes during this GREEN wave.

## Final Response

Maximum 15 lines: status, changed paths, exact test command/result, and known
risks. Do not modify tests or commit.
