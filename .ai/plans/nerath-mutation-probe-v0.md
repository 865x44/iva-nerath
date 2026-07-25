# Nerath Mutation Probe v0 (amended)

Status: **APPROVED FOR OFFLINE IMPLEMENTATION**  
Date: 2026-07-25  
Authority: owner go after red-team plan + pre-flight patch.

## Worktree

```text
/home/alx/.local/share/iva/worktrees/nerath-core-candidate-20260724T000000Z
```

Do not touch `~/projects/iva` main, dogfood 8724, Brother, Glitch Stage2.

## Pre-flight amendments (mandatory)

1. **Variant names** (do not reuse identity A/B/C):
   - `BASE` = current runtime `NERATH_CONSTITUTION` (policy-only)
   - `DRIVE` = BASE + Drive probe contract (harness-only)
   - `DRIVE_CONTRAST` = DRIVE + single-completion contrast (harness-only)
2. **Do not modify** `buildNerathAblationPrompt` semantics or ambient identity card rules.
3. **Reuse** `scripts/nerath-replay.mjs` pattern + `.ai/evals/*` style. One thin script, no CLI framework.
4. **DRIVE_CONTRAST = one completion only.** No second model call. No judge agent.
5. **Cut from v0:** SPECIMEN, DECISION, TUI, visual glitch, profiles, Object Forge, motif DB.
6. **Corpus:** new mutation-targeted 15 cases. Do not overload identity ablation corpus.
7. **Runtime:** Drive contracts stay harness-only. No ambient load into `NERATH_CONSTITUTION`.
8. **Live generation** requires explicit owner go. Offline wave may stop at PREPARED.

## Hypothesis

Controlled semantic mutations (category correction, institutional absurdity, meta-system detection) yield a new grounded model and practical delta after expressive form is stripped. Decorative reformulation fails.

## Discipline

```text
inspect → preserve baseline → smallest probe → compare → one refine → verdict → stop
```

## Operators (content only)

- category_correction
- institutional_absurdity
- meta_system

Max one mutation candidate. Max one expressive operator. Literal payload firewall.

## Prompt-only challenge

DRIVE_CONTRAST is justified only if it beats DRIVE on grounded semantic gain, not aesthetics.  
`PROMPT-ONLY IS SUFFICIENT` is a successful outcome.

## Non-goals

Search Chamber, multi-model explore, Rhetoric Compiler subsystem, Object Forge, persistent memory,
new provider path, orchestration framework, Glitch character, profiles, Clarity, telemetry, live deploy,
accepted release mutation, main Iva changes, identity A/B/C rewrite.

## Deliverables (offline)

```text
.ai/plans/nerath-mutation-probe-v0.md
.ai/reports/nerath-mutation-probe-reality-check-2026-07-25.md
.ai/evals/nerath-mutation-probe-cases.jsonl
.ai/evals/nerath-mutation-probe-rubric.md
.ai/evals/nerath-mutation-probe-baseline.md
scripts/lib/nerath-mutation-probe.mjs
scripts/nerath-mutation-probe.mjs
tests/nerath-mutation-probe.test.mjs
.ai/reports/nerath-mutation-probe-implementation-2026-07-25.md
.ai/reports/nerath-mutation-probe-verdict-2026-07-25.md
```

## Live generation (owner-gated, not this wave)

Same model/provider/temperature/limits; disposable memory; no dogfood service mutation; blind pack.

## Verdict options

PROCEED TO OWNER DOGFOOD | KEEP PROMPT-ONLY | REVISE LATER | STOP EXPERIMENT
