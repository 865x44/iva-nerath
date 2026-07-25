# Nerath identity policy — implementation report

Date: 2026-07-25

## HEAD

```text
BASE HEAD:  904d8403b0ee15f9699cf7a31d3c122086ac5481
FINAL HEAD: 904d8403b0ee15f9699cf7a31d3c122086ac5481  (uncommitted wave; no commit)
```

R1 dirty constitution was accepted as base and extended in-place (still uncommitted).

## Mutation manifest

| Path | Action |
|------|--------|
| `scripts/lib/nerath-mode.mjs` | CORE / IDENTITY_BOUNDARIES / OPT_IN card; `buildNerathAblationPrompt`; `isIdentityCardAmbientAllowed` |
| `tests/nerath-core.test.mjs` | focused pins for authority, capability, ordinary, handoff, identity, ablation, default-off |
| `.ai/evals/nerath-identity-ablation-cases.jsonl` | 18 cases (6 ordinary / 6 identity / 6 adversarial) |
| `.ai/evals/nerath-identity-ablation-rubric.md` | A/B/C rubric + gates |
| `.ai/reports/nerath-identity-policy-reality-check-2026-07-25.md` | wave 0 |
| `.ai/reports/nerath-identity-policy-implementation-2026-07-25.md` | this file |
| `.ai/reports/nerath-identity-ablation-results-2026-07-25.md` | prepared, not run |

Unchanged on purpose: `agent/instructions/30-nerath.ts` (still injects `NERATH_CONSTITUTION` = B), TUI/glitch, provider, main, dogfood, ordinary Iva.

## Architecture of change

```text
settings.nerathMode
  → isNerathModeOn()
  → 30-nerath.ts injects NERATH_CONSTITUTION (= B: CORE + IDENTITY_BOUNDARIES)
  → identity card NEVER in ambient path
  → buildNerathAblationPrompt(A|B|C) for offline harness only
```

Policy remains prompt-contract level: no session permission store, no capability registry, no `/handoff` command router, no memory migration.

## Tests added/extended

- authority carry + withdrawal/scope
- capability evidence + unknown qualify
- ordinary pass-through (no identity frame)
- short handoff block
- identity boundaries (state≠trait, project≠identity, play, no pathologize, correction wins, counterfactual)
- card not ambient; C only via builder
- default-off + character containment preserved

## Verify commands

```bash
cd /home/alx/.local/share/iva/worktrees/nerath-core-candidate-20260724T000000Z
node --test tests/nerath-core.test.mjs
git diff --check -- scripts/lib/nerath-mode.mjs tests/nerath-core.test.mjs
```

## Results

```text
node --test tests/nerath-core.test.mjs  → 27/27 pass
git diff --check                        → clean
iva.service                             → active (untouched)
iva-nerath-dogfood.service              → active (untouched; still 018c19a release)
```

## Limits

- Prompt-only; live LLM may still regress.
- Ablation generation not run (no provider pass).
- No structured session authority object.
- Dogfood endpoint not cut over to this tree.

## Rollback

```bash
cd /home/alx/.local/share/iva/worktrees/nerath-core-candidate-20260724T000000Z
git checkout -- scripts/lib/nerath-mode.mjs tests/nerath-core.test.mjs
rm -rf .ai/evals/nerath-identity-ablation-cases.jsonl \
       .ai/evals/nerath-identity-ablation-rubric.md \
       .ai/reports/nerath-identity-policy-reality-check-2026-07-25.md \
       .ai/reports/nerath-identity-policy-implementation-2026-07-25.md \
       .ai/reports/nerath-identity-ablation-results-2026-07-25.md
```

## Consciously not done

- ambient identity card
- Identity Lab / Customs / persona objects
- `/handoff` command plumbing
- memory migration / shared bus / Clarity link
- provider/model/TUI/glitch changes
- deploy, push, merge, dogfood restart
- live A/B/C generation

## Recommendation

```text
ACCEPT (policy-only B as candidate default)
NO RUNTIME INTEGRATION (identity card C) until blind ablation prefers C
```

## Next owner action

Optional local commit of the two product files + eval/report artifacts on the candidate branch; then separately run blinded A/B/C generation when ready — still no 8724 cutover without explicit command.
