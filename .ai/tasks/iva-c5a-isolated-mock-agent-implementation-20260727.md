# C5a.1: isolated mock-agent implementation

Status: **APPROVED FOR IMPLEMENTATION — NO RUNTIME LAUNCH**

## Authority

The user approved C5a after the C5 design. This task is intentionally broader
than the usual five-file slice because Eve requires one sentinel file per
framework tool that must be removed. It authorizes only the paths listed below.

## Objective

Create a standalone, opt-in Eve agent root that cannot discover IVA's authored
tools, uses an in-process fail-closed OpenAI-compatible mock model, and removes
the framework shell, file-write, and web tools. It is a C5a source/test
artifact, **not** a command to start Eve, Iva, a service, Telegram, or a real
provider.

## Allowed paths (exclusive)

- `dogfood/isolated-mock-agent/agent/agent.ts`
- `dogfood/isolated-mock-agent/agent/instructions.md`
- `dogfood/isolated-mock-agent/agent/sandbox.ts`
- `dogfood/isolated-mock-agent/agent/tools/bash.ts`
- `dogfood/isolated-mock-agent/agent/tools/write_file.ts`
- `dogfood/isolated-mock-agent/agent/tools/web_fetch.ts`
- `dogfood/isolated-mock-agent/agent/tools/web_search.ts`
- `tests/isolated-mock-agent.test.mjs`

Do not edit existing `agent/`, `bin/`, `.env*`, service files, provider config,
vault/data paths, package manifests, or any tracked C0--C4 artifacts. Do not
commit.

## Required implementation

1. Make `dogfood/isolated-mock-agent/agent/` a flat Eve agent root. It must
   import no project IVA agent/tool/provider module and declare no connections,
   channels, skills, hooks, schedules, subagents, or authored tools other than
   the four disable sentinels below.
2. `agent.ts` must construct its model with `createOpenAICompatible` and an
   injected local `fetch`. That fetch returns one deterministic OpenAI chat
   completion response and throws for every URL other than the exact synthetic
   `http://iva-mock.invalid/v1/chat/completions` request. It must not read
   `process.env`, call global `fetch`, include a credential, or fall back to a
   real provider. Use a clearly synthetic model/API-key value only.
3. `instructions.md` must state that the agent is mock-only, has no IVA data or
   vault access, and must never claim that external actions were executed.
4. `sandbox.ts` must pin Eve's `docker()` backend with `networkPolicy:
   "deny-all"`. Do not start Docker or pull an image in this task.
5. Each named framework tool must be disabled with the documented sentinel:
   `export default disableTool()` in exactly `bash.ts`, `write_file.ts`,
   `web_fetch.ts`, and `web_search.ts`. Do not replace tools with wrappers.
   The absence of an authored IVA `tools/` directory is the tool-deny boundary
   for IVA-specific vault, memory, task, Beerlight, Telegram, and subprocess
   tools; do not copy any into this root.
6. Add one focused Node test which executes `node_modules/eve/bin/eve.js info
   --json` **from the isolated agent root only**, using `/usr/bin/node-24`.
   The test must assert that discovery has no errors, the four disabled
   framework-tool names have status `disabled`, there are no authored tools,
   connections, channels, skills, schedules, or subagents, and the agent's
   root is the isolated directory. It may create ignored `.eve/` compiler
   artifacts under the isolated root; it must not start the server.

## Required gates

Run exactly:

```bash
/usr/bin/node-24 --test tests/isolated-mock-agent.test.mjs
npm run typecheck
git diff --check
git diff --stat
```

Report the exact commands/results, changed paths, and why no Eve/Iva runtime
was launched. A passing worker report is not acceptance.

## Hard stops

- Stop before `eve build`, `eve start`, `eve dev`, `bin/iva.mjs`, `npm run
  start`, any service command, Docker command, Telegram/provider request, or
  any real network call.
- Stop if Eve rejects the documented disable sentinel or the isolated root
  loads `.env`/project IVA modules.
- Do not read secrets, vault/data, transcripts, MOC, or knowledge.
