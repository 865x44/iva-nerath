# Iva deployable source baseline r1

Status: `APPROVED BY USER PROMPT — IMPLEMENT IN ISOLATED WORKTREE`

Base: `known-good/iva-0.3.0-20260724` /
`a464fbdf6a122e6795311754dc0805a68346ff86`.

Worktree:
`/home/alx/.local/share/iva/worktrees/deployable-r1-20260724`.

Hard boundaries:

- Never modify `/home/alx/projects/iva` working-tree files or deployment.
- Never move `known-good/iva-0.3.0-20260724`.
- No service restart, Telegram smoke, live integration, automatic audit fix,
  force push, mirror push, or secrets in source/reports.
- Provider credentials are primary-owned and used only in memory for bounded
  smokes.

## Slice A — Beerlight process safety

Allowed paths:

- `agent/tools/beerlight.ts`
- `tests/beerlight-tool.test.ts`

Replace shell-string `exec` with `execFile` argv execution. Preserve timeouts,
buffer bounds, result shape, and temporary-file cleanup. Add hostile `$()`,
backtick, quote/semicolon, option-like, whitespace, and NUL tests. No shell may
interpret user-controlled input.

Gate: focused Beerlight tests, typecheck, hostile marker remains absent.

## Slice B1 — OpenCode retries and cancellation

Allowed paths:

- `agent/opencode-fetch.ts`
- `tests/opencode-fetch.test.ts`

Make the wrapper retry only. Preserve the same `AbortSignal` in every attempt,
make backoff sleep abortable, never retry/fallback after abort, and return a
stable retry-exhausted error. Add Request/init signal, abort-during-fetch,
abort-during-backoff, and no-post-abort-attempt tests.

## Slice B2 — protocol-compatible fallback and vision

Allowed paths:

- `agent/provider.ts`
- `agent/agent.ts`
- `agent/opencode-stream-fallback.ts`
- `agent/vision.ts`
- `tests/opencode-stream-fallback.test.ts`
- `tests/opencode-protocol-smoke.test.ts`
- `tests/agent-provider-routing.test.ts`
- `tests/vision.test.ts`

Use OpenAI-compatible `glm-5.2` as the default fallback, configurable through
`OPENCODE_FALLBACK_MODEL`. Qwen3.6 Plus is forbidden here because the current
Go contract serves it through Anthropic `/messages`. Keep primary and fallback
retries bounded and cancellation-safe. Do not start fallback after abort.

The current catalog does not contain the old `gemini-3-flash`; OpenCode vision
must default to disabled and may be enabled only through
`OPENCODE_VISION_MODEL`. Test no-network disabled behavior and override request
shape.

Gate: focused provider, fetch, stream, cancellation, and vision tests plus
typecheck.

## Slice C — reproducibility and provenance

Allowed paths:

- `package.json`
- `package-lock.json`
- `.node-version`
- `scripts/verify-baseline.mjs`
- `scripts/build-info.mjs`
- `tests/build-info.test.mjs`
- `.ai/analysis/iva-r1-dependency-advisory-triage.md`

Pin Node `24.14.1` and npm `10.9.7`; normalize lock root metadata to 0.3.0.
Provide one command, `/usr/bin/node-24 scripts/verify-baseline.mjs`, that checks
toolchain, runs deterministic `npm ci`, typecheck, all accepted tests, clean
build, complete provenance generation, and manifest verification.

`build-info.mjs` must write:

- `.output/build-info.json`;
- `.output/manifest.sha256` covering every regular payload file except the two
  manifest files;
- `.output/manifest.root.sha256` covering the completed manifest.

Record commit/tree/dirty state, Node/npm/platform, lock hash, patch hashes,
artifact hash, and manifest contract without secrets.

Triage advisories explicitly; never run `npm audit fix`.

## Final acceptance

- Full reproducible command PASS from a clean committed r1 source revision.
- Controlled isolated Beerlight/provider/fallback/cancellation/vision smokes.
- Full manifest/root verification and independent hash recomputation.
- Live HEAD/status hash and deployment remain unchanged.
- Create a new immutable annotated r1 tag only after PASS.
- Push only explicit r1 branch/tag refspecs to private `origin`; verify refs.
