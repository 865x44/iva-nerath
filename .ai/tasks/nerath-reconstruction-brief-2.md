# Task: Nerath Reconstruction — Brief 2: Composition + Voice Fabric

## Working directory (READ FIRST)

- **Source root (edit here):** `/home/alx/.local/share/iva/worktrees/nerath-reconstruction-alpha-20260725`
- **Branch:** `feature/nerath-reconstruction-alpha`
- **Dogfood runtime root:** `/home/alx/.local/share/iva/dogfood/nerath-reconstruction-alpha`
  (`<DOGFOOD>/vault` already seeded with PERSONA.md by Brief 1; `<DOGFOOD>/data/settings.json` has `nerathMode: true`)
- **Production (NEVER write):** `/home/alx/projects/iva/vault`, `/home/alx/projects/iva/data`

Tests run from the worktree root with hermetic fixture dirs via `ASSISTANT_VAULT_DIR` / `ASSISTANT_DATA_DIR`.

## Depends on

Brief 1 must be complete and reviewed: `NERATH_INVARIANT_KERNEL` exported, dogfood PERSONA.md seeded,
isolation + invariant tests green. Do not start if Brief 1 gate failed.

## Context

Wave 2 of `.ai/plans/nerath-reconstruction-alpha.md`. Replace PERSONA suppression with composition and build
the voice fabric. The frozen constitution (`NERATH_CONSTITUTION_CORE` + `NERATH_IDENTITY_BOUNDARIES`, D10 tech
freeze) says: *"use a one-turn operation, lens, relation, and register **without persistent internal
characters**"*. The voice fabric MUST honor this.

## Design decision (taken, override-only-by-owner)

**Voices are per-turn REGISTERS, not persistent characters.** This reconciles the "6 Voices of Nerat" intent
with the frozen constitution and needs NO D10 revisit:

- A voice is a tonal/operational register selected **once per turn** ("one call, one voice, one handoff").
- Voices are NEVER persistent characters: no voice state is stored in vault, data, CORE, or memory.
- Voices NEVER run in parallel: no debate, no parliament, no multi-call orchestration, no voice graph.
- When no voice adds a concrete signal, Nerath answers ordinarily (no voice selected) — per CORE.

If the owner instead wants persistent characters, that requires a D10 constitutional revision FIRST; this brief
does not do that.

## Task

### 1. Composition adapter (replace `return ""` in `agent/instructions/25-persona.ts`)

- Remove `if (isNerathModeOn()) return "";`.
- When `isNerathModeOn()` is true, still inject PERSONA.md (truncated to `MAX_CHARS`) as a character/lexicon
  underlayer, exactly as in non-Nerath mode.
- `agent/instructions/30-nerath.ts` continues to inject the constitution as the GOVERNING register.
- Precedence rule (make it explicit in the injected markdown when both are present): the constitution register
  governs tone, epistemics, and identity boundaries; PERSONA supplies character flavor and lexicon only and
  NEVER overrides epistemic hygiene, capability truth, or identity-boundary rules. On conflict, constitution wins.
- Keep both files as separate `defineDynamic` instructions firing on `turn.started` (load order 25 → 30). Do not
  merge them into one file.

### 2. Voice contracts (ADDITIVE exports in `scripts/lib/nerath-mode.mjs`)

Define 6 voice contracts plus Customs (ritual voice). Each contract is a plain frozen object:

```javascript
// Shape (illustrative — worker fills the register text):
// { id, label, register, useWhen, forbidden }
export const NERATH_VOICES = Object.freeze({
  hunt:            Object.freeze({ id: "hunt",            label: "Hunt",            /* register, useWhen, forbidden */ }),
  conferencier:    Object.freeze({ id: "conferencier",    label: "Conférencier",    /* ... */ }),
  archaeologist:   Object.freeze({ id: "archaeologist",   label: "Archaeologist",   /* ... */ }),
  trader:          Object.freeze({ id: "trader",          label: "Trader",          /* ... */ }),
  tacticalSupport: Object.freeze({ id: "tacticalSupport", label: "Tactical Support",/* ... */ }),
  glitch:          Object.freeze({ id: "glitch",          label: "Glitch",          /* ... */ }),
  customs:         Object.freeze({ id: "customs",         label: "Customs (ritual)",/* ... */ }),
});
```

Each `forbidden` field MUST include: "no persistent character state", "no parallel voice", "no identity claim
without evidence". Register text must stay consistent with the frozen CORE (concise, literal, dry baseline; a
voice colors register but never escalates ordinary questions into constitutional protocol).

### 3. Voice router (one call, one voice, one handoff)

Add a pure selector to `scripts/lib/nerath-mode.mjs`:

```javascript
// Returns exactly ONE voice id (or null = ordinary, no voice) for a request category.
// Pure function; no I/O; no stored state; deterministic.
export function selectNerathVoice(requestCategory) { /* ... */ }
```

- Returns a single `id` from `NERATH_VOICES`, or `null` when no voice adds signal.
- MUST NOT return multiple voices, MUST NOT store or read persistent state, MUST NOT trigger parallel calls.

### 4. Resonance modes (response modes, not agents)

Add `NERATH_RESONANCE = Object.freeze({ mirror, double, counter })` — three response-shaping modes orthogonal
to voice. Mirror reflects the user's frame; Double holds two readings; Counter offers reasoned disagreement.
These are modes applied within the single turn, never separate agents or calls.

### 5. Positive Nerath Constitution (ADDITIVE layer — do not reword the freeze)

Add a NEW export `NERATH_POSITIVE_LAYER` framing what Nerath actively does (develop strong ideas, offer
reasoned disagreement with reason+alternative, build artifacts, preserve user voice in external text). The
frozen `NERATH_CONSTITUTION_CORE` and `NERATH_IDENTITY_BOUNDARIES` text MUST remain byte-identical (Brief 1
snapshot guard enforces this). `30-nerath.ts` may inject CORE + IDENTITY_BOUNDARIES + POSITIVE_LAYER when mode
on; the freeze itself is unchanged.

### 6. Tests (hermetic, `node --test`)

- `tests/nerath-composition.test.mjs`:
  - With `nerathMode: true` AND a fixture PERSONA.md present, the persona instruction returns non-empty PERSONA
    content (no longer `""`).
  - With `nerathMode: true` and PERSONA.md missing, persona instruction returns `""` gracefully (no throw).
  - Precedence line present when both persona and constitution are injected.
  - `NERATH_CONSTITUTION_CORE` / `NERATH_IDENTITY_BOUNDARIES` snapshot unchanged (re-assert Brief 1 guard).
- `tests/nerath-voices.test.mjs`:
  - `NERATH_VOICES` has all 7 contracts (6 + Customs), each frozen with `register`/`useWhen`/`forbidden`.
  - `selectNerathVoice()` returns exactly one id or null; never an array; deterministic for a given category.
  - No-voice default: an ordinary operational category yields `null`.
  - Assert no persistent-character / no-parallel constraints appear in every voice `forbidden`.
  - `NERATH_RESONANCE` has mirror/double/counter.

## Allowed paths

- `agent/instructions/25-persona.ts` (remove suppression; composition + precedence)
- `agent/instructions/30-nerath.ts` (inject positive layer additively; freeze unchanged)
- `scripts/lib/nerath-mode.mjs` (ADD `NERATH_VOICES`, `selectNerathVoice`, `NERATH_RESONANCE`,
  `NERATH_POSITIVE_LAYER`; do not alter frozen exports)
- `tests/nerath-composition.test.mjs` (create)
- `tests/nerath-voices.test.mjs` (create)

## Forbidden

- Do NOT modify `NERATH_CONSTITUTION_CORE` or `NERATH_IDENTITY_BOUNDARIES` text.
- Do NOT create persistent voice/character state anywhere (vault, data, CORE, memory).
- Do NOT build a voice graph, parliament, debate, or any multi-call/multi-agent orchestration.
- Do NOT write to production vault/data; do NOT edit the main checkout.
- Do NOT commit, tag, push, or restart services.

## Gate

- `25-persona.ts` no longer returns `""` when mode on; PERSONA + constitution both inject with precedence.
- 7 voice contracts + router + resonance + positive layer exported; freeze byte-identical.
- `node --test tests/nerath-composition.test.mjs tests/nerath-voices.test.mjs` passes from worktree root.
- Brief 1 tests still pass (non-regression): `node --test tests/nerath-invariants.test.mjs`.
- No production writes (prove via `git -C /home/alx/projects/iva status --porcelain` unchanged for vault/data).

## Replay gate (offline)

- `node scripts/nerath-replay.mjs validate <corpus.json>` passes if a corpus exists.
- If a baseline responses file exists, `compare` must show no net regression vs the R2 freeze baseline.
- Live model replay deferred (D10 "A3 deferred"); record scores/decision in the report.

## Worker

- Requested: qwen 3.7 via /orc + /agy. **NOTE:** qwen 3.7 is NOT an agy model. Implementation must run on an
  agy-code model (default `gemini-3.1-pro-high`) unless the owner picks another.

## Stop-gate

After completing Brief 2, STOP and return a report (gate results, replay outcome, files touched, proof
production untouched). Do NOT continue to Brief 3 autonomously. The orchestrator reviews before Brief 3.

## Constraints

- Do NOT commit. Do NOT modify production vault or data. Do NOT restart services. Do NOT touch dirty main.
- Edit the worktree directly.
