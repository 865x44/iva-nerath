# TUI Chat Client (Lane 3 of tui-frontend-plan.md)

Work in `/home/alx/projects/iva`.

## Goal
A new terminal script that lets the user chat with Iva interactively from a local shell,
reusing iva's existing `eveChannel` HTTP API via the first-party `eve/client` SDK — no changes
to iva's agent/channel code.

## Confirmed contract (do not re-derive, do not deviate)
- `eve/client` is already a usable subpath of the `eve` dependency already in package.json
  (exports `"./client"` -> `dist/src/client/index.d.ts`).
- Usage:
  ```ts
  import { Client } from "eve/client";
  const client = new Client({ host: HOST }); // HOST = same-box loopback URL
  const session = client.session();
  const response = await session.send(userInput);
  for await (const event of response) {
    if (event.type === "message.appended") process.stdout.write(event.data.messageDelta);
    if (event.type === "message.completed" && event.data.finishReason !== "tool-calls") {
      // finalized reply fragment for this turn
    }
  }
  ```
- Reuse ONE `ClientSession` for the whole process lifetime (one continuous conversation); call
  `session.send(input)` again for each new line of user input.
- Auth: none needed. iva's channel (`agent/channels/eve.ts:5-14`) includes `localDev()`, which
  trusts loopback requests (localhost/127.0.0.0/8/::1) with no header/token.
- Match the house style already used by `scripts/telegram-poll.mjs` for reading the local host:
  `PORT = process.env.IVA_PORT ?? "8723"`, `HOST = process.env.ASSISTANT_HOST ?? \`http://127.0.0.1:${PORT}\``.
  Check that file for the exact pattern and follow it.

## Scope
- Add ONE new script, `scripts/tui-chat.mjs` (plain Node, `.mjs`, matching
  `scripts/telegram-poll.mjs`'s style: shebang, top comment block in the repo's existing
  language/tone, `node:readline` or `node:readline/promises` for the input loop).
- Behavior: read a line from stdin in a loop (prompt like `you> `), send it via the session,
  stream the assistant's reply to stdout as it arrives (`message.appended` deltas; if the SDK
  doesn't emit deltas for some reason, fall back to printing `message.completed` text once), then
  prompt for the next line. Ctrl+C / EOF (Ctrl+D) exits the process cleanly (exit code 0).
- You MAY add exactly one new `"scripts"` entry to `package.json`, mirroring the existing
  `"poll": "node --env-file=.env scripts/telegram-poll.mjs"` pattern, e.g.
  `"chat": "node --env-file=.env scripts/tui-chat.mjs"`. This is the only `package.json` edit
  allowed.

## Out of Scope
- Do not touch `agent/channels/telegram.ts`, `agent/channels/eve.ts`, or any other
  agent/channel/hook file.
- Do not touch `.env`, `.env.example`, systemd unit files, or `bin/iva.mjs`.
- Do not run `npm install`, `npm run build`, `npm run dev`, `npm start`, or touch the running
  `iva` systemd service.
- Do not execute `scripts/tui-chat.mjs` yourself against the live agent to "test" it — iva is a
  live personal-agent service; the primary orchestrator smoke-tests separately after this wave.
- No new npm dependencies — `eve` is already installed.
- No persistence/history file — iva's own server-side transcript hook already logs to the vault.
- No TUI framework (blessed/ink/etc). Plain readline + stdout is the MVP target.

## Invariants
- Preserve iva's existing Telegram channel and service behavior — this task only adds new files
  plus one `package.json` scripts-entry line.
- Do not commit.

## Acceptance Criteria
- `scripts/tui-chat.mjs` exists and is syntactically valid Node ESM.
- `npm run typecheck` (repo's `tsgo` gate) still passes after the change (the new file is `.mjs`
  so it shouldn't be type-checked, but confirm the command still exits 0).
- The script imports `Client` from `eve/client` and does not hand-roll raw `fetch`/NDJSON parsing
  of the session protocol.
- No existing file outside `scripts/tui-chat.mjs` and `package.json` is modified.

## Required Tests
- N/A (no test framework targets this script per the plan); rely on the acceptance criteria and
  the orchestrator's separate manual smoke test after this wave.

## Final Response
Maximum 15 lines: status, exact changed/created paths, `npm run typecheck` result, known risks.
