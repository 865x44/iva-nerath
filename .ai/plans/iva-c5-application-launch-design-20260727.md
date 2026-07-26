# C5: application-launch isolation design

Status: **ACCEPTED — mock-only isolated runtime dogfood completed; no promotion**

## Authority and current evidence

- User authorized this C5 design as a primary-only, read-only fallback after the
  `/agy-scout` preflight was blocked by its quota before dispatch.
- Live `main` is `75d0993dfbc977776f2ebdfc4c4f99bf650884dd`; `.ai/STATE.md`
  still reports the earlier `ea35396` baseline and is not current enough to
  authorize runtime action.
- C4 proved a synthetic provider-selection/model-call seam only. It did not
  create an Eve/Iva process or prove application tool/vault isolation.

## Original C5 verdict

**Do not launch.** A changed port and temporary environment alone are
insufficient. The inspected public source leaves two unproven/unsafe surfaces:

1. `agent/agent.ts` creates a real compatible provider at module load. C4's
   test-only helper is not an application provider switch.
2. The application has side-effecting tool modules: shell execution, arbitrary
   file writes, vault card writes/search, task-data writes, web search, and the
   Beerlight subprocess bridge. No inspected application-level allowlist or
   deny-list proves those are absent in a hypothetical dogfood process.

`bin/iva.mjs`'s normal service path also reads `.env` and runs `eve start` with
the production-shaped environment. It is expressly excluded from C5.

## Required C5a implementation plan (separate approval)

Before a process may be proposed, write and approve a small implementation plan
with one owner and an exact source/test scope. It must establish all of these:

1. **Explicit mock runtime mode:** a dedicated, opt-in environment switch that
   chooses only the C3-style fail-closed mock provider. It may not fall back to
   Ollama, OpenCode, OpenRouter, Codex, a real `fetch`, or credential storage.
2. **Tool deny contract:** the dogfood agent exposes no shell, file-write,
   vault/memory, task-data, web, Beerlight, or Telegram-capable tool. If Eve
   auto-discovers tools, prove the supported way to deny registration rather
   than assuming a missing import is sufficient.
3. **Synthetic filesystem contract:** explicit absolute temp roots for vault and
   data, with guards rejecting the project `vault/` and `data/` paths before any
   I/O. The current C3 string check is not enough.
4. **Network deny mechanism:** a verified process-level deny method, not merely
   a mock URL. Its availability and semantics must be demonstrated without
   launching Iva first.
5. **Test gates:** focused tests must prove mock-only provider selection,
   disallowed tools unavailable, production path rejection, port rejection, and
   network-deny behavior. Full C5a acceptance remains separate from runtime.

## C5b launch-card design (only after accepted C5a)

The eventual run card must name, verbatim:

- exact non-service launcher command;
- absolute temporary vault/data/log roots created under a fresh narrow `/tmp`
  directory;
- a concrete non-`8723` loopback port selected without consulting `.env`;
- environment allowlist and explicit unset list for provider, Telegram, bearer,
  search, and credential variables;
- OS-level network deny command and its preflight evidence;
- bounded output-bearing probe, timeout, expected exit code, and cleanup steps.

It must state that it does not call `iva.service`, `npm run start`, `eve start`
through the normal service configuration, `.env`, Telegram, or a real provider.

## User gates

- **Gate C5a:** approve the implementation scope that adds/proves mock runtime,
  tool denial, synthetic filesystem, and network denial.
- **Gate C5b:** after primary tests accept C5a, approve the exact launch card.
- **Gate C5c:** approve one actual bounded application launch. This is not
  granted by this design plan.

## Preservation and stop conditions

Track B remains parked. Never apply stashes, alter refs/archives/worktrees,
push, deploy, restart services, access production paths, or inspect protected
inputs. Stop if any proposed implementation needs an unknown Eve tool-registry
mechanism, a privileged network sandbox, `.env`, credentials, or an ambiguous
filesystem path.

## Primary verification required later

Before C5a is accepted, primary Codex must directly verify the implementation
and tests, check the exact diff scope, prove preservation refs/stashes/archives
unchanged, and distinguish `reported` from `accepted`. Before C5c, it must
verify the final command and all isolation preflights again.

## Accepted C5 outcome — 2026-07-27

The isolated app root, not the normal IVA root, completed one output-bearing
runtime probe. Its stream contained exactly `IVA mock-only response`; this
proves Eve invoked the injected fail-closed mock transport under the C5d
environment rather than Eve's `NODE_ENV=test` bootstrap adapter.

The probe used `env -i`, a fresh `/tmp/iva-c5d-mock-28Juvkvk/` root, only
loopback in a user network namespace, and port `127.0.0.1:18763`. The process
was stopped by its trap; the synthetic vault/data roots were empty. Focused
tests, typecheck, diff check, all safety/archive tags, three stashes, and both
external SHA-256 manifests were rechecked successfully.

This accepts **only** mock-only dogfood evidence. It does not authorize a
normal IVA launch, service restart, provider/Telegram use, Docker, deployment,
push, commit, archive reconciliation, or any promotion beyond this isolated
fixture.
