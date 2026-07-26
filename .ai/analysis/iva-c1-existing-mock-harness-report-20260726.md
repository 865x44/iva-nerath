# C1: existing mock/isolation harness search

Status: **REPORTED, NOT ACCEPTED — no runtime launch authority**

## Scope and privacy boundary

One sandboxed `/agy-scout` searched only the approved ordinary source/test/script
and documentation slice. It did not inspect `.env`, vault, data, transcripts,
MOC, knowledge, archives, stashes, external worktrees, user-level launchers,
runtime logs, credentials, or Git object contents. No code, tests, processes,
services, providers, or network calls were run.

The scout's full-repository pre/post manifests were identical and its report
contained `AGY_SCOUT_OK`. This is evidence gathering, not runtime acceptance.

## Primary-verified candidates

| Candidate | What is proven | Why it is insufficient for C runtime dogfood |
| --- | --- | --- |
| `scripts/check-reasoning-strip.mjs` | Uses `MockLanguageModelV4` from `ai/test` to exercise provider middleware entirely in memory. | It is a focused unit self-check, not a configured Eve/Iva server harness; it does not demonstrate isolated vault/data, port, launcher, or tool boundaries. |
| `scripts/nerath-replay.mjs` | Template output is fail-closed to an explicitly supplied `/tmp` output path. | It is a replay/template comparison surface, not an accepted-main server launcher or mock provider route. |
| `tests/opencode-fetch.test.ts` | Injected `mockFetch` simulates HTTP responses for retry behavior. | The mock is test-local and does not provide a documented process-level provider endpoint for Iva. |
| `tests/beerlight-tool.test.ts` | A temporary bash shim is used by that tool's test. | It is tool-specific test infrastructure and does not establish Iva runtime/provider/vault isolation. |

## C1 conclusion

No pre-existing, documented harness was established within the inspected safe
slice that proves all required C controls at once: an accepted-main launcher,
non-`8723` port, disposable non-production vault/data root, and provider behavior
that cannot send a real request.

This is **not** a claim that no such artifact exists anywhere; it is a
path-bounded conclusion. The excluded locations remain uninspected by design.

## Required next decision

To continue C, approve a new bounded design plan for a mock-provider/runtime
harness. That plan must state its exact write paths, synthetic fixture schema,
temporary data root, port, launcher contract, test gate, and a later separate
approval before any process is launched. It must not reuse production `.env`,
vault/data, service units, Telegram, or provider credentials.
