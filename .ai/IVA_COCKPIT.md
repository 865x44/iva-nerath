# Iva Cockpit

LAST_UPDATED: 2026-07-01T14:21:41Z
UPDATED_BY: bootstrap (OpenCode Iva Cockpit v0.1 implementation)

## Runtime

HARNESS: OpenCode
MODEL: DeepSeek/Kimi (exact model id: TBD — not recorded anywhere yet, confirm on next OpenCode session)
BACKEND: DeepSeek/Kimi (cheap backend, per task spec)
INTERFACE: OpenCode CLI (local operator/persona, no Telegram/VPS)
UPSTREAM_IVA: present in this repo (Node/eve framework, Telegram channel, systemd service `iva.service`) — this cockpit is NOT that runtime, see note below
LOCAL_IVA_MODE: operator/persona inside OpenCode — a separate, lighter-weight local control-plane layer, distinct from upstream Iva

Note: this repo already runs a full upstream Iva (Telegram bot on `eve`, see `agent/channels/telegram.ts`,
`bin/iva.mjs`, `iva.service`). The OpenCode/DeepSeek/Kimi operator described by this cockpit is a
**separate, parallel workflow** that happens to share this repo's `.ai/` directory for state. Do not
confuse the two. See `STALE_CONTEXT_RISKS` below for an open contradiction between this cockpit's
assumptions and prior recorded analysis.

## Safety

MODE: read-only
WRITE_PERMISSION: denied
GIT_BRANCH: main
GIT_DIRTY: dirty (11 changed/untracked paths as of bootstrap — includes pre-existing unrelated
  work in `agent/agent.ts`, `agent/subagents/planner/agent.ts`, `package-lock.json`; not caused by
  this cockpit)
LAST_SAFE_POINT: a9b8b1e "chore(release): 0.1.6" (2026-06-24)
RISK_LEVEL: unknown

## Current Task

TASK: (none — cockpit just bootstrapped, awaiting first real operator task)
TASK_SOURCE:
SUCCESS_CRITERIA:
STOP_CONDITION:

## Active Context

SOURCE_OF_TRUTH: `.ai/STATE.md` (higher authority than this cockpit — see `IVA_COCKPIT_RULES.md` rule 6)
PINNED_FILES:
RECENT_FILES:
DO_NOT_USE:
STALE_CONTEXT_RISKS:
- `.ai/analysis/compatibility-matrix.md` (2026-07-01) concluded OpenCode has **no write access to
  the filesystem** (critical gap #2) and recommended OpenCode as a **read-only analytical
  companion only**. This cockpit's mode taxonomy (`patch-proposed` → `apply-approved`) assumes a
  write-capable OpenCode operator. These two documents disagree. Do not assume write capability
  works until this is explicitly reconciled by a human — treat `apply-approved` as unverified
  until then.

## Delegations

| Agent | Status | Task | Input packet | Output | Needs review |
|-------|--------|------|--------------|--------|--------------|

## Pending User Decisions

- Reconcile the OpenCode write-capability contradiction noted in `STALE_CONTEXT_RISKS` before
  ever using `apply-approved` mode for real.
- Confirm the exact DeepSeek/Kimi model id in use (currently unrecorded).

## Risks / Guardrails

- Two parallel "sources of state" now exist in this repo's `.ai/`: `STATE.md` (Claude Code /
  `/handoff` convention, already established) and this cockpit (OpenCode / Iva-persona
  convention). Per `IVA_COCKPIT_RULES.md`, `STATE.md` wins on conflict — this cockpit must not
  become a second source of truth.
- Do not let this cockpit's existence imply OpenCode already has write/apply capability confirmed
  — see `STALE_CONTEXT_RISKS`.

## Next Action

NEXT: Use this cockpit starting from the next OpenCode/Iva session; update fields per
  `IVA_COCKPIT_RULES.md` triggers as real work happens.
OWNER: human
MODE_REQUIRED: read-only
