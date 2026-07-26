# C5a: isolated mock-agent implementation plan

Status: **ACCEPTED — source/test gate only; runtime launch is not approved**

## Decision and source proof

Local Eve documentation establishes two relevant facts:

- Authored tools are discovered from an agent root, while a declared Eve
  subagent/standalone agent root does not inherit the IVA root's authored
  tool directory.
- The default harness still supplies `bash`, `write_file`, `web_fetch`, and
  `web_search`; each must be removed with a same-slug `disableTool()` sentinel.

C5a therefore creates a separate flat agent root below `dogfood/`, not a mode
switch inside `agent/`. Its injected fetch returns a deterministic response and
fails closed. Docker is declared only as a future sandbox backend with
`networkPolicy: "deny-all"`; C5a must not create a container or launch Eve.

## Bounded wave

Execute `.ai/tasks/iva-c5a-isolated-mock-agent-implementation-20260727.md`
through `/agy-code`. The task owns eight new files. This is an explicit,
user-approved exception to the five-file default because Eve requires four
independent framework-tool sentinels to prove the deny surface.

Primary acceptance checks:

1. inspect all changed paths and ensure no existing IVA source or protected
   location changed;
2. independently run the named isolated-agent test, typecheck, and diff check;
3. inspect Eve `info --json` result for an isolated agent root, no authored
   capabilities, and disabled framework tools;
4. recheck preservation state. `reported != accepted` until these checks pass.

## Accepted evidence (2026-07-27)

- `/usr/bin/node-24 --test tests/isolated-mock-agent.test.mjs` passed: 3/3.
  It proves the only model transport accepts the synthetic completion URL and
  fails closed otherwise in both ordinary and SSE streaming responses; it also
  confirms the separate flat root and the four disabled framework tools through
  Eve's compiled manifest.
- `npm run typecheck` and `git diff --check` passed.
- The `eve info --json` invocation was compile/discovery only from the isolated
  root, with a minimal environment and no `.env` or `.env.local` there. It did
  not start an Eve/Iva server, a Docker container, or a network request.
- All four safety tags, six archive tags, three stashes, and both external
  `SHA256SUMS` checks remained present and valid.
- Three `/agy-code` dispatches were rejected before repository work because of
  the individual quota. The narrow local implementation fallback was used only
  after those failures; no worker claim was accepted as evidence.

## Explicit exclusions

No C5 runtime is authorized. Do not run `eve build`, `eve start`, `eve dev`,
Docker, `bin/iva.mjs`, a service command, Telegram, real provider, or a network
probe. Do not read `.env*`, secrets, vault/data, transcripts, MOC, or knowledge.
Do not modify refs, tags, stashes, archives, worktrees, branches, or main.

## Next gates

- **C5a acceptance:** primary verification of the source/test result.
- **C5b design:** user approval for an exact, separate launch card, including
  OS-level network namespace preflight and explicit environment allow/unset
  lists. This plan does not authorize that preflight or any application process.
- **C5c:** one separately approved bounded application launch.
