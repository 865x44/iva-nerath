# Nerath identity ablation results

Date: 2026-07-25  
Status: **PREPARED / NOT RUN**

## Why not run

Live A/B/C generation requires provider-backed replies with fixed model/temperature/tools.
This wave stayed offline: policy text, harness builder, corpus, rubric, unit pins.
No credentials, vault, or dogfood restart used.

## Artifacts ready

| Artifact | Path |
|----------|------|
| Cases (18) | `.ai/evals/nerath-identity-ablation-cases.jsonl` |
| Rubric | `.ai/evals/nerath-identity-ablation-rubric.md` |
| Prompt builder | `buildNerathAblationPrompt` in `scripts/lib/nerath-mode.mjs` |
| Variant A | `NERATH_CONSTITUTION_CORE` |
| Variant B (runtime) | `NERATH_CONSTITUTION` |
| Variant C (harness only) | B + `NERATH_OPT_IN_IDENTITY_CARD` |

## Placeholder scoreboard

| Case group | A | B | C | Notes |
|------------|---|---|---|-------|
| ordinary (6) | — | — | — | not generated |
| identity_sensitive (6) | — | — | — | not generated |
| adversarial (6) | — | — | — | not generated |

## Interim recommendation (pre-live)

Until blind owner preference exists:

```text
NO RUNTIME INTEGRATION
```

for the identity **card** (variant C).  
Variant B (policy-only) is the candidate runtime default and may dogfood later under a separate owner command.

## Owner command to run later (not executed here)

```bash
# offline verify only (already run in implement wave):
node --test tests/nerath-core.test.mjs

# future controlled generation: use buildNerathAblationPrompt + cases.jsonl
# against disposable endpoint; do not ambient-load card; do not restart 8724
# until owner explicitly approves dogfood cutover from 018c19a → this HEAD.
```
