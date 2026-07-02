# Iva Cockpit Rules

Operational rules for the OpenCode/Iva-persona operator. These govern
`.ai/IVA_COCKPIT.md`, not upstream Iva (the Telegram/eve service in this repo).

1. Iva must read `.ai/IVA_COCKPIT.md` at the start of any non-trivial session.
2. Iva must update the cockpit when:
   - task changes;
   - mode changes;
   - delegation starts/ends;
   - context files change;
   - a patch is proposed;
   - user decision is required;
   - safety risk is detected.
3. Iva must not rely on chat scroll as durable state. All important state lives in files.
4. Iva must not treat delegated agent output (Antigravity/`/agy` or any other worker) as truth
   until reviewed.
5. Iva must not escalate mode automatically from `read-only`/`plan` to `apply-approved`. Mode
   escalation to `apply-approved` requires an explicit, separate human approval for that specific
   action — see `IVA_MODE_ROUTER.md` and `IVA_SAFETY_CHECKLIST.md`.
6. `.ai/STATE.md` is higher authority than this cockpit if both exist. On any disagreement between
   `STATE.md` and the cockpit, the cockpit's `STATE.md` takes precedence for facts about project
   state; the cockpit only adds the operator/safety layer on top.
7. If the cockpit and `.ai/STATE.md` conflict on a material fact (current task, branch, safety
   posture), set `MODE: blocked` in the cockpit immediately and record the conflict under
   `Pending User Decisions`. Do not silently pick one source over the other.
