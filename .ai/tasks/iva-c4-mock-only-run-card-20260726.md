# C4 mock-only pre-launch run card

Status: **EVIDENCE READY — STOP BEFORE ANY EVE/IVA/SERVICE LAUNCH**

## Scope proven by C3

The test-only helper `scripts/lib/isolated-mock-provider.mjs` dynamically imports
the real `agent/provider.ts` under a synthetic `MODEL_PROVIDER`, then builds an
OpenAI-compatible client with an injected mock fetch. The test is deliberately
not an Eve/Iva runtime launch and does not create a listener, directory, service,
vault, data store, Telegram session, or real provider request.

## Exact synthetic contract

- Provider selection tested: `MODEL_PROVIDER=opencode`.
- Synthetic port string: `9876` (the helper rejects `8723`).
- Synthetic root string: `/tmp/iva-mock-root-12345` (the helper rejects the
  production Iva paths and any root outside `/tmp/iva-mock-*`). No directory is
  created.
- Synthetic endpoint string: `http://127.0.0.1:9876/v1/chat/completions`.
  It is passed only to the injected mock transport; no socket is opened and no
  request is delegated to `globalThis.fetch`.
- Synthetic output: `synthetic completion text` from a fixed in-memory
  OpenAI-compatible response.
- `codex` is rejected before model construction, preventing OAuth/data access.
- Temporary synthetic environment values are restored; the helper does not read
  `.env`.

## Output-bearing probe already run

```text
/usr/bin/node-24 --test tests/isolated-mock-provider.test.mjs
```

Primary result: 7 subtests passed. The related provider-selection baseline also
passed 8/8 and `npm run typecheck` passed. A future rerun may write only a
sanitized test log to `/tmp/iva-c4-mock-only-20260726.log`; it must not be
interpreted as an Iva runtime log.

## What this does not prove

This contract does not start or exercise Eve/Iva, agent tools, persistent memory,
vault/data I/O, Telegram, or a real endpoint. It is not evidence that an
application runtime can safely launch. It proves only the mock provider-selection
and synthetic-completion seam required to design a later launch proposal.

## Hard stop and future approval boundary

Do not run `eve start`, `npm run start`, `iva.service`, a launcher, or any
provider/Telegram command. A future application launch needs a new explicit user
approval that names the exact command, temporary filesystem paths, port, timeout,
expected output, network-deny mechanism, and cleanup method. It must separately
prove that agent-tool and vault/data paths cannot escape the synthetic boundary.

## Preservation state

Safety/archive refs, all three stashes, and both external checksum manifests were
rechecked after C3 and remained unchanged. Track B remains parked.
