# C3 RED correction: make the mock-provider test enforce the real contract

Work in `/home/alx/projects/iva`.

## Goal

Correct the false-green test exactly as required by `.ai/review-findings.md` and
leave it functionally failing against the current helper.

## Scope

- Read `.ai/review-findings.md` and the current dedicated test.
- Modify only `tests/isolated-mock-provider.test.mjs`.
- Run only `/usr/bin/node-24 --test tests/isolated-mock-provider.test.mjs`.

## Out of Scope

- Do not modify `scripts/lib/isolated-mock-provider.mjs` or any other file.
- Do not read `.env`, secrets, vault/data contents, transcripts, MOC, knowledge,
  credentials, runtime logs, archives, or stashes.
- Do not use network or launch Eve, Iva, a service, Telegram, or a provider.
- Do not commit.

## Acceptance Criteria

- The revised test asserts dynamic use of `agent/provider.ts` with synthetic
  `MODEL_PROVIDER`, one fixed synthetic completion via injected mock fetch, the
  exact mock request URL/count, all C2 rejections before fetch, and restoration
  of prior `MODEL_PROVIDER` value/presence plus `globalThis.fetch`.
- The current helper causes a functional assertion/API failure, not import or
  dependency setup failure.

## Final Response

Maximum 15 lines: changed path, RED command/result, and the missing helper API
now required. Do not implement it or commit.
