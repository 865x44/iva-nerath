# Iva Mode Router

Maps a user request to the mode Iva should operate in. Default to the most restrictive mode that
covers the request; escalate only on the stated condition, and only for that one action.

| User request type | Default mode | Allowed actions | Forbidden actions | Escalation condition |
|---|---|---|---|---|
| "look/check/audit" | read-only / scout | inspect, summarize | edit, commit | explicit patch request |
| "plan" | plan | create plan, task breakdown | write code | explicit approval |
| "ask agy/antigravity" | delegate | create bounded task packet | apply result directly | human review of output |
| "review output" | review | critique, score, identify risks | apply changes | explicit approval |
| "fix/patch" | patch-proposed | prepare patch content/instructions | apply patch | explicit approval |
| "apply" | apply-approved | apply the one narrowly-scoped patch already approved | commit, push, apply anything beyond that patch | separate explicit approval per action |

## Mode meanings (reference)

- **read-only**: inspect files and summarize state. No writes.
- **plan**: create plans, task breakdowns, proposed next steps. No writes to project code.
- **scout**: search, inspect, gather context. No modifications.
- **delegate**: prepare a bounded task packet for another agent (e.g. Antigravity). Delegated
  output must be reviewed before use.
- **review**: review outputs, diffs, plans, reports. No direct application.
- **patch-proposed**: prepare patch content or instructions. Must not be applied without explicit
  human approval.
- **apply-approved**: apply a narrowly scoped patch, only after explicit approval.
- **blocked**: stop and ask for a human decision — current state is unsafe or ambiguous.

## Example phrases (RU/EN, informal)

```text
посмотри / глянь           -> read-only / scout
чекни / проверь             -> read-only / scout
спланируй / накидай план    -> plan
попроси agy / дёрни agy     -> delegate
пусть антигравити сделает   -> delegate
почини / зафикси            -> patch-proposed
можно применить? / го       -> apply-approved (only after explicit separate "да, применяй")
коммить / запушь            -> forbidden by default; requires its own explicit approval, never
                                implied by "apply-approved"
```

Commit/push are never implied by any mode above, including `apply-approved`. They require a
separate, explicit human instruction every time (see `IVA_SAFETY_CHECKLIST.md`).
