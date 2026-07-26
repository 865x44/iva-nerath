# C0 isolated runtime dogfood run card

Status: **BLOCKED BEFORE LAUNCH — planning evidence only**

## Fixed baseline

- Accepted metadata commit: `75d0993dfbc977776f2ebdfc4c4f99bf650884dd`.
- No process, service, provider, Telegram path, production vault/data path, or
  protected configuration was opened or invoked while preparing this card.

## Public configuration evidence

1. `package.json` exposes `npm run start` as `eve start`.
2. The service template in `bin/iva.mjs` starts the built application via
   `node_modules/eve/bin/eve.js start` and supplies `PORT` from `.env` (default
   `8723`). This is the production launcher shape and is not an approved C run.
3. `agent/provider.ts` selects its provider from `MODEL_PROVIDER`; the reviewed
   provider surface is Ollama, OpenCode, OpenRouter, or Codex OAuth. Each is a
   real-provider route or relies on protected credentials. No mock adapter was
   established in this reviewed public surface.
4. `scripts/verify-dogfood-isolation.mjs` is a static check for the separate
   Nerath/Brother launchers and rollup guard. It does not establish an isolated,
   mock-provider launch contract for accepted `main`.

## C0 verdict

The current public evidence cannot prove all C requirements simultaneously:

- a non-production, disposable vault/data location;
- a non-`8723` port;
- a provider route that cannot send a real request; and
- a launcher/configuration contract that does not read `.env` or production
  state.

Therefore **do not create or run a process**. Substituting an arbitrary env
file, localhost endpoint, or dummy key would be an unproven configuration change
and could still reach a real endpoint or production path.

## Required next approval boundary

Choose one separately approved, bounded C1 design route before any runtime
launch is considered:

1. Plan a new isolated mock-provider harness/configuration adapter, with an
   explicit write scope, temporary data root, non-production port, and tests;
   or
2. Authorize a read-only investigation of a pre-existing, documented mock
   provider/isolation harness, if one exists outside the reviewed public surface.

Neither option authorizes starting Iva, `iva.service`, Eve, Telegram, a real
provider, or access to vault/data/secrets. After a route is approved, write a
new C1 run card and stop again for explicit launch approval.

## Preservation requirements

Keep safety/archive refs, all three stashes, both checksum-verified archives,
worktrees, branches, tags, and the parked B reconciliation track unchanged.
