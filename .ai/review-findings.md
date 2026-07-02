# Kimi live-token: blocking finding after Agy attempt 1

The first implementation attempt was rejected.

- It produced no shared request-time Kimi credential helper.
- `git diff --stat` showed only the pre-existing user changes to `agent/agent.ts`,
  `agent/subagents/planner/agent.ts`, and `package-lock.json`.
- `npm run typecheck` passed, but it does not cover the missing behavior.
- The Agy log contains `PlannerResponse without ModifiedResponse`.

## Required correction

The partial patch created `agent/kimi-helper.ts` and wired it into both providers, but it is not
acceptable yet:

1. This project is ESM; `__dirname` is not available at runtime. Resolve `.env` from
   `process.cwd()` (the systemd unit already sets it to the repository root), or use an ESM-safe
   `import.meta.url` conversion.
2. Its retry reuses `input` after a POST. Build one `Request`, clone it before the first send, and
   use a fresh clone for the one retry so the request body is replayable. Retry only when a refreshed
   non-empty key differs from the first key.

Preserve the existing uncommitted Kimi provider entries. Touch only `agent/kimi-helper.ts`,
`agent/agent.ts`, and `agent/subagents/planner/agent.ts`; do not touch `.env`, systemd, the refresh
script, `package-lock.json`, or any other file. Run `npm run typecheck` and `git diff --check`; do
not commit.
