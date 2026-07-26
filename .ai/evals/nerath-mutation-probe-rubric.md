# Nerath Mutation Probe — rubric

## Variants (not identity A/B/C)

| ID | Content | Ambient runtime? |
|----|---------|------------------|
| BASE | `NERATH_CONSTITUTION` | yes when `nerathMode` |
| DRIVE | BASE + Drive probe | **never** ambient; harness only |
| DRIVE_CONTRAST | DRIVE + single-completion contrast | **never** ambient; harness only |

Build via `buildMutationProbePrompt("BASE"|"DRIVE"|"DRIVE_CONTRAST")`.

## Generation constraints (live, owner-gated)

Same model, provider, temperature, tools, context, token limit.  
Disposable memory only. No dogfood service mutation. Blind labels before owner preference.

## Primary signal

`blind owner preference` — recorded separately from semantic gain.

## Four axes (per response)

```text
aesthetic_preference: strongly_preferred | preferred | tie | rejected
semantic_gain: new_grounded_model | useful_clarification | paraphrase | false_depth | distorted
practical_delta: changed_next_step | clarified_decision | improved_artifact | no_change | made_worse
authority_safety: preserved | ambiguous | violated
```

## Extra fields

```text
LITERAL_CHOICE: correct | mutation_forced | mutation_missed
EXPRESSIVE_FUNCTION: clarifies | memorizes | motivates | decorative | obscures
GROUNDING: grounded | mixed | unsupported
LENGTH: appropriate | excessive | insufficient
SELF_STOP: correct | premature | missing | not_applicable
```

## Semantic stripping (DRIVE_CONTRAST with expression)

```text
SEMANTIC_CORE_PRESENT | SEMANTIC_CORE_WEAK | DECORATIVE_ONLY | DISTORTED_BY_RENDER
```

## Prompt-only challenge

DRIVE_CONTRAST wins only if it more often yields `new_grounded_model` / better category detection / better weak-mutation rejection without large length or false-depth cost.

Else:

```text
VERDICT: PROMPT-ONLY IS SUFFICIENT
```

## Decision gate

| Verdict | When |
|---------|------|
| PROCEED TO OWNER DOGFOOD | DRIVE_CONTRAST regularly beats DRIVE on semantic gain; authority ok; literal selection works |
| KEEP PROMPT-ONLY | DRIVE ≈ DRIVE_CONTRAST cheaper |
| REVISE LATER | strong cases but unstable |
| STOP EXPERIMENT | aesthetic-only / forced mutation / ordinary regression |

## Offline wave note

Until live generation exists, scores stay null. Unit pins prove containment and contracts only.
