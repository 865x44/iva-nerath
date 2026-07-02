# Agy/AgyC failure log — Kimi live-token repair

## Scope

Target: prevent Iva's long-lived Node process from holding an expired Kimi credential after the
existing refresh job rewrites `.env`.

## Agy Code — rejected

| Attempt | Result | Evidence | Consequence |
|---|---|---|---|
| 1 | No implementation | No helper or new diff; Agy log had `PlannerResponse without ModifiedResponse` | Rejected despite `typecheck` passing |
| 2 | No implementation | Same planner-loop signature; no helper | Rejected |
| 3 | User-interrupted while still in planner phase | No accepted artifact | Not counted as accepted work |

## AgyC — partial and rejected

| Attempt | Result | Evidence | Consequence |
|---|---|---|---|
| 1 | Created a helper, but no final report | Used `__dirname` in an ESM module and retried a POST from its original input | Runtime/replay risk; rejected |
| 2 | Partial correction | Replaced `__dirname` but left unsafe request replay | Rejected |
| 3 | Partial correction | Left undefined `reqClone`; `npm run typecheck` failed with TS2304 | Rejected |
| Review | No review artifact | `findings.md` missing; repeated planner-loop signature | Primary review required |

## Primary acceptance and repair

The final accepted helper uses an ESM-safe path, reads only `KIMI_API_KEY` from the project `.env`
per Kimi request, overrides Authorization, and performs one replay-safe retry only when a refreshed
key differs. `npm run typecheck` and `git diff --check` passed. The app was rebuilt with Node 24 and
`iva.service` restarted successfully.

## Guardrails for the next wave

1. Agy/AgyC stdout that contains planning prose but lacks the required final artifact is failure,
   not partial success.
2. After a tool invocation returns, check for lingering `agy` processes before editing or starting
   another wave; kill only the stale worker processes for that wave.
3. For small stateful network wrappers, require a focused compile check and review request-body
   replay before service deployment.
4. Do not treat `typecheck` as proof that a worker fulfilled its behavioral acceptance criteria.

## Machine-readable records

Detailed attempt records are appended to `/home/alx/.ai/logs/agent-failures.jsonl`.
