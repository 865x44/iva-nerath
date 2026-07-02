# Kimi live-token refresh for Iva

Work in `/home/alx/projects/iva`.

## Goal

Iva keeps using the current Kimi OAuth credential while the cron refreshes it, without restarting the service or dropping a Telegram turn.

## Proven failure

- `logs/token-refresh.log` used to refresh Iva's `.env` every ten minutes; that cron was archived on 2026-07-02.
- The current canonical token store is `~/.local/share/opencode/auth.json`, refreshed by `/home/alx/bin/kimi-refresh-token.py`.
- Iva's `.env` `KIMI_API_KEY` became stale, causing `AI_APICallError: The API Key appears to be invalid or may have expired` until a manual restart.

## Scope

- Add one small shared, Kimi-only credential helper under `agent/`.
- The helper must read the current `kimi-for-coding-oauth.access` token from `~/.local/share/opencode/auth.json` at request time, falling back to `.env` only when the auth file is missing/unusable.
- If the token is expired/near expiry, the helper may invoke `/home/alx/bin/kimi-refresh-token.py` once and re-read the store.
- Wire both main Iva and planner `createOpenAICompatible` providers to use that helper only when `MODEL_PROVIDER=kimi`.
- Override stale static authorization on each Kimi request; on a 401, reread once and retry the same request at most once.
- Preserve the current uncommitted Kimi provider entries and all Ollama/OpenCode behavior.

## Out of Scope

- No service restart, systemd changes, provider/model migrations, context-window tuning, or repository-wide refactor.
- Do not inspect or print `.env` secrets.

## Invariants

- Touch only `agent/agent.ts`, `agent/subagents/planner/agent.ts`, `agent/kimi-helper.ts` (plus a focused test only if the existing toolchain supports it).
- No real network requests in tests.
- Do not commit.

## Acceptance Criteria

- A Kimi request gets its Authorization bearer value from the current `auth.json` store at request time rather than only process startup.
- A 401 produces at most one fresh-token retry; any second failure is returned normally.
- Non-Kimi provider behavior remains unchanged.
- `npm run typecheck` passes.
- `git diff --check` passes.

## Final Response

Maximum 15 lines: status, changed paths, test/gate result, known risks.
