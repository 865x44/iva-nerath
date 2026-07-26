# C2–C4: mock-only provider harness and pre-launch run card

Status: **APPROVED BY ACTIVE GOAL — no application process launch**

## Objective

Create and verify a test-only harness that exercises Iva's real public provider
selection module with a synthetic OpenAI-compatible response, then write an
evidence-based C4 run card. Stop before starting Eve, Iva, a service, Telegram,
or any real provider.

## Fixed non-goals

- No `.env` read, no production vault/data access, and no service-manager call.
- No network request: the harness must install a fail-closed in-memory `fetch`
  implementation and never delegate to `globalThis.fetch`.
- No code changes to `agent/`, `bin/`, service files, provider credentials,
  production configuration, archives, refs, stashes, branches, or worktrees.
- No commit or push in this goal.

## C2 design

### Exact write scope

1. `scripts/lib/isolated-mock-provider.mjs` — new, test-only helper.
2. `tests/isolated-mock-provider.test.mjs` — new Node test.
3. `.ai/tasks/iva-c4-mock-only-run-card-20260726.md` — generated only after
   passing primary verification; it is an evidence/run-card artifact, not code.

The C3 RED/GREEN task briefs and review note are orchestration evidence under
`.ai/tasks/`; they are not application/runtime code and remain uncommitted.

No production write path is allowed. In particular, do not alter
`agent/provider.ts`: the harness must dynamically import it with a synthetic,
scoped `MODEL_PROVIDER` plus a synthetic non-secret provider base URL, then
restore the prior process environment after each call.

### Harness contract

`scripts/lib/isolated-mock-provider.mjs` must export a small API that:

- accepts only `ollama`, `opencode`, or `openrouter` provider selections;
  `codex` is rejected before model construction to avoid OAuth/data access;
- requires an explicit integer port different from `8723` and an absolute
  synthetic-root string under `/tmp/iva-mock-*`;
- rejects production Iva path strings or any root outside that synthetic prefix
  without reading the filesystem. This is a pre-launch string contract, not
  proof of real vault/data I/O isolation;
- dynamically loads `agent/provider.ts` after temporarily setting synthetic
  `MODEL_PROVIDER` and a synthetic provider base URL, extracts its selected
  model identity, then restores env;
- uses an OpenAI-compatible model client whose `fetch` is a local mock. The mock
  accepts only a reserved mock URL, returns one fixed synthetic chat completion,
  records calls, and throws for any unexpected URL. It must never delegate to
  the real fetch implementation.

## C3 TDD wave

### Dependency and baseline gate

Before writing code, verify that required project dependencies are available.
The existing targeted baseline is currently blocked by missing local packages.
An offline-only dependency restoration may be attempted only with:

```text
npm ci --offline --ignore-scripts
```

It must make no network request and must stop on a cache miss. No other package
manager command, install script, or service/runtime command is allowed.

The source checkout's ad-hoc full Node test invocation currently has two
pre-existing resolution failures: `agent/agent.ts` and
`tests/opencode-fetch.test.ts` import generated `.js` siblings that are absent
from the source root. Do not fix, suppress, or use those failures as evidence for
this wave. The green baseline for this narrow contract is the Node 24 provider
selection subset that excludes the compiled-agent test:

```text
/usr/bin/node-24 --test --test-name-pattern='defaults to ollama|falls back to ollama config|uses opencode defaults|accepts only explicit OpenCode|uses openrouter overrides|uses codex defaults|accepts only catalogued thinking effort|never routes the Anthropic-protocol' tests/agent-provider-routing.test.ts
```

The new dedicated harness test is the mandatory C3 gate; the unrelated existing
resolution failures must remain reported, not masked.

### RED

The new test must first fail because the helper is absent. It must specify:

1. the actual provider selection reports the expected provider/model through
   the synthetic import;
2. a synthetic completion returns the fixed response and only contacts the
   mock URL through the injected fetch;
3. port `8723`, production vault/data paths, a non-`/tmp/iva-mock-*` root, and
   `codex` are rejected before an SDK call; and
4. no caller-provided environment value remains changed after the harness call.

### GREEN and primary verification

Use one bounded `/agy-code` implementation wave. It may modify only the two
code/test files above, must not commit, and must report the exact commands and
test result. Primary verification reruns the new test, the targeted existing
provider/fetch tests, `npm run typecheck` if dependencies are available, and
`git diff --check`.

## C4 — pre-launch run card

After green evidence, write `.ai/tasks/iva-c4-mock-only-run-card-20260726.md`
with the exact tested synthetic root shape, a non-`8723` port, mock-only provider
behavior, expected test probe output, log destination, and cleanup statement.
It must state clearly that its probe is a Node test, **not** an Eve/Iva launch.
It must require new explicit approval before any application process launch.

## Stop conditions

Stop and report immediately if the offline dependency gate would use network,
the baseline fails after dependencies are present, an implementation touches an
unlisted path, a test attempts filesystem/network/service access outside its
synthetic contract, a preservation object changes, or any application process
would be started.

## Evidence required at handoff

- dependency-gate output and targeted baseline result;
- RED and GREEN test evidence;
- `git diff --name-status`, `git diff --check`, and primary test/typecheck output;
- C4 run card; and
- a post-wave preservation snapshot showing unchanged refs/stashes/archives.
