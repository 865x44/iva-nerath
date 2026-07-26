# Nerath identity policy — reality check

Date: 2026-07-25  
Mode: inspect only (pre-implement freeze of facts)

## Actual HEAD

```text
root: /home/alx/.local/share/iva/worktrees/nerath-core-candidate-20260724T000000Z
branch: feature/nerat-memory-firewall
HEAD: 904d8403b0ee15f9699cf7a31d3c122086ac5481
parent dogfood-known: 018c19aa4f21bcb6ab6fc684b084772068b0c29b
```

Pre-existing dirty R1 (accepted as base for this wave):

- `scripts/lib/nerath-mode.mjs`
- `tests/nerath-core.test.mjs`

## File map

| Path | Role |
|------|------|
| `scripts/lib/nerath-mode.mjs` | `isNerathModeOn`, constitution string(s) |
| `agent/instructions/30-nerath.ts` | injects constitution on `turn.started` when ON |
| `agent/instructions/25-persona.ts` | suppresses persona when Nerath ON |
| `scripts/lib/menu/character.mjs` | blocks character quiz when ON |
| `tests/nerath-core.test.mjs` | mode + constitution pins + containment |
| `tests/memory-firewall.test.ts` | memory firewall pin |
| `scripts/nerath-replay.mjs` + `evals/nerath-replay-cases.json` | older A/B replay (not identity ablation) |

## Architecture (short)

1. `settings.json` `nerathMode === true` gates mode (default OFF).
2. On each turn start, `30-nerath.ts` injects `NERATH_CONSTITUTION` markdown when ON.
3. Persona/character paths are suppressed; no separate Nerath agent process.
4. Authority carry, capability truth, ordinary pass-through, handoff tone were **prompt-only** (R1).
5. No session permission object, no capability registry, no `/handoff` command router, no ambient identity card.
6. Live dogfood `127.0.0.1:8724` runs release `018c19a`, **not** candidate HEAD `904d840`.
7. Ordinary Iva on `8723` is separate; out of scope.

## Assumptions check

| Assumption | Result |
|------------|--------|
| Candidate worktree exists | confirmed |
| Branch `feature/nerat-memory-firewall` | confirmed |
| HEAD still `018c19a` | **false** — HEAD is `904d840` |
| Dogfood = candidate | **false** — dogfood pinned to older release |
| Permission store exists | **false** — prompt-only |
| Capability truth source | **false** — prompt qualify-only |
| Identity card ambient | **false** (good) |
| Memory migration needed | **false** for this wave |

## Minimal mutation scope

- `scripts/lib/nerath-mode.mjs` — CORE / IDENTITY_BOUNDARIES / opt-in card + ablation builder
- `tests/nerath-core.test.mjs` — focused pins
- `.ai/evals/*` — offline corpus + rubric
- `.ai/reports/*` — reality / implementation / ablation results (prepared)

## Risks

- Prompt-only authority/capability can still fail under live LLM variance.
- String-pin tests ≠ behavioral proof.
- Dirty R1 must not be mixed with unrelated `.ai/` bookkeeping commits without owner intent.
- Do not restart dogfood or touch main.

## Stop conditions

None hit: no memory migration, no provider change, no broad router required.
