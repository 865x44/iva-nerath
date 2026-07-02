# Iva Cockpit — Guide for the Human Operator

What this is: a set of plain markdown files that make the OpenCode/Iva-persona operator's state
visible, so you never have to scroll back through chat to answer "what was it doing, and is it
safe to let it write anything." This does not touch upstream Iva (the Telegram/eve service) —
it's a control-plane layer for the separate OpenCode/DeepSeek/Kimi workflow.

## The one-line habit

At the start of any session, or whenever you're unsure what's going on:

```bash
bash .ai/scripts/iva-cockpit-check.sh
```

This is a **one-shot status printer, not a TUI** — it prints six lines (branch, dirty-file count,
cockpit MODE, write permission) and exits. Nothing stays on screen, nothing is interactive. That's
by design (see the cockpit task's own hard rule: no full TUI in v0.1).

## The actual interactive chat (separate thing, built earlier)

If you want to actually talk to upstream Iva from a terminal instead of Telegram, that's a
different command, from a different piece of work (Lane 3 of `tui-frontend-plan.md`, not the
cockpit):

```bash
cd /home/alx/projects/iva
npm run chat
```

This drops you into a `you>` prompt and streams Iva's reply back. **Known live issue:** Iva's
model backend (Kimi via Ollama) currently returns `401 Unauthorized` on every turn — you'll see
the prompt and can type, but you won't get a real reply until that token is fixed. The client
itself does correctly surface the error (`[agent error] MODEL_CALL_FAILED: ...`) instead of hanging
silently.

Gives you branch, dirty-file count, and the cockpit's current `MODE` / `WRITE_PERMISSION` in five
lines. If you want the full picture (current task, pending decisions, delegation table), open
`.ai/IVA_COCKPIT.md` directly.

## Daily flow

1. **Check the cockpit** (`IVA_COCKPIT.md` or the check script above) before trusting anything the
   agent says about "what it's doing."
2. **Look at `MODE`.** It should always be the most restrictive mode that fits the current
   request (see `IVA_MODE_ROUTER.md` for the mapping). If you asked it to "посмотри" and `MODE`
   says anything past `read-only`/`scout`, something's off — ask why.
3. **Approvals are per-action, not standing permission.** Saying "да, применяй" once for one patch
   does not mean the agent can keep applying things afterward. Every `apply-approved` action needs
   its own explicit yes from you.
4. **Before approving an apply**, skim `IVA_SAFETY_CHECKLIST.md`. If the agent hasn't ticked
   through it (known branch, known dirty state, narrow scope, no scope creep, rollback clear),
   don't approve.
5. **If `MODE: blocked` shows up**, stop. Read `Pending User Decisions` in the cockpit — that's
   exactly the thing the agent couldn't resolve itself. Resolve it, then let the agent continue.
6. **Delegation (Antigravity/`/agy`)**: check `.ai/IVA_DELEGATION_LEDGER.md` for what's currently
   running and what came back. Delegated output is not pre-approved just because it exists in the
   ledger — review it before it's used for anything.
7. **Commit/push are never implied** by any mode, including `apply-approved`. The agent should
   always ask separately before either. If it doesn't, that's a rule violation — say so.

## Known open item (don't skip this)

`.ai/IVA_COCKPIT.md`'s `STALE_CONTEXT_RISKS` flags a real contradiction: an earlier analysis
(`.ai/analysis/compatibility-matrix.md`) concluded OpenCode has no filesystem write access at all,
but this cockpit's mode list assumes a write-capable operator (`patch-proposed` →
`apply-approved`). Until you've actually confirmed which is true in your current OpenCode setup,
treat `apply-approved` as unverified — don't rely on it for anything that matters.

## What you never have to do

Hunt through scrollback for "what was the task," "what did I approve," or "what's still pending."
All of that lives in `.ai/IVA_COCKPIT.md`. If it's not there, the agent didn't update it — that's
a process failure worth flagging (see `IVA_COCKPIT_RULES.md` rule 2 for when updates are required).

## File map

- `.ai/IVA_COCKPIT.md` — the live dashboard, read this first.
- `.ai/IVA_MODE_ROUTER.md` — what mode should apply to which kind of request.
- `.ai/IVA_SAFETY_CHECKLIST.md` — what must be true before you approve an apply.
- `.ai/IVA_DELEGATION_LEDGER.md` — what's been handed off to another agent.
- `.ai/IVA_COCKPIT_RULES.md` — the agent's operating rules (worth skimming once so you know what
  to expect from it).
- `.ai/scripts/iva-cockpit-check.sh` — read-only, five-line snapshot, safe to run any time.
