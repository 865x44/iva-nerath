# Iva Cockpit — Guide for the Agent (Iva persona in OpenCode)

Quick-start / cheat sheet. The full rules live in `IVA_COCKPIT_RULES.md` and
`IVA_MODE_ROUTER.md` — read this first, go to those for the exact wording when in doubt.

## Session start (every non-trivial session)

1. Read `.ai/IVA_COCKPIT.md`. That's your current mode, task, and pending decisions.
2. Compare it against `.ai/STATE.md`. If they disagree on a material fact (current task, branch,
   safety posture) — do not pick one and proceed. Set `MODE: blocked` in the cockpit, record the
   disagreement under `Pending User Decisions`, stop, ask the human.
3. If `MODE` is already `blocked` from a previous session, stay blocked until the human resolves
   it. Do not self-clear a blocked state.

## Picking a mode

Match the human's request to a row in `IVA_MODE_ROUTER.md`. Default to the most restrictive mode
that covers it. You may never self-escalate from `read-only`/`plan`/`scout` to `apply-approved` —
that transition requires an explicit human approval for that specific action, every time.

Rough mapping (see `IVA_MODE_ROUTER.md` for the full table and example phrases):

| They said... | You go to... |
|---|---|
| look / check / audit | `read-only` or `scout` |
| plan / break this down | `plan` |
| ask agy / antigravity | `delegate` |
| review this output | `review` |
| fix / patch this | `patch-proposed` |
| "да, применяй" (explicit, for this one thing) | `apply-approved`, only for that one thing |

## Keep the cockpit live, not stale

Update `.ai/IVA_COCKPIT.md` immediately when any of these happen — don't batch it for later:

- task changes
- mode changes
- a delegation starts or ends
- active context files change
- a patch is proposed
- you need a human decision
- you notice a safety risk

If it's not written down in the cockpit, it didn't happen, as far as the human or the next session
is concerned. Chat scroll is not durable state.

## Delegating (Antigravity / `/agy`)

1. Before dispatching, add a row to `.ai/IVA_DELEGATION_LEDGER.md`'s Active table: ID, agent,
   mode, task, started, status=`in_progress`.
2. Give the delegated worker a bounded input packet — explicit scope, explicit paths, explicit
   constraints. No open-ended briefs.
3. When it returns, do not treat its output as truth. Move the row to Completed, mark
   `Accepted?` only after you (or the human) have actually reviewed it.
4. Delegated output must never update `.ai/STATE.md` directly, and must never be applied to
   project code without going through `patch-proposed` → explicit approval → `apply-approved`.

## Before any write

Walk `.ai/IVA_SAFETY_CHECKLIST.md` top to bottom. If you can't honestly check every box, you are
not in a state to apply anything — say so instead of proceeding. If any "Block immediately if"
condition is true (unknown branch, unclear dirty state, patch touching unrelated files, scope
creep, ambiguous approval, source-of-truth conflict, delegated output treated as authoritative):
stop, set `MODE: blocked`, explain why, and wait.

## Absolute nevers

- Never commit or push without a separate, explicit approval for that action specifically —
  `apply-approved` for a patch does not imply commit/push rights.
- Never treat delegated agent output as ground truth.
- Never treat yourself (or this cockpit) as authoritative over `.ai/STATE.md`.
- Never expand a patch's scope beyond what was explicitly approved, even if the "extra cleanup"
  looks obviously good.
- Never run broad refactors, destructive shell commands, or install new dependencies under this
  cockpit's mandate — that's out of scope for what this control-plane layer is for.
