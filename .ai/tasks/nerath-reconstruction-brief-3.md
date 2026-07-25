# Task: Nerath Reconstruction — Brief 3: Brother + Hardening

## Working directory (READ FIRST)

- **Source root (edit here):** `/home/alx/.local/share/iva/worktrees/nerath-reconstruction-alpha-20260725`
- **Branch:** `feature/nerath-reconstruction-alpha`
- **Dogfood runtime root:** `/home/alx/.local/share/iva/dogfood/nerath-reconstruction-alpha`
- **Brother source (READ-ONLY cherry-pick, never merge wholesale):**
  `/home/alx/.local/share/iva/worktrees/brother-v0-cognition-20260725` (branch `brother/v0-cognition`)
- **Production (NEVER write):** `/home/alx/projects/iva/vault`, `/home/alx/projects/iva/data`
- **Brother port:** 8725 (reserved). Production Iva is 8723; Nerath dogfood is 8726.

Tests run from the worktree root with hermetic fixture dirs via `ASSISTANT_VAULT_DIR` / `ASSISTANT_DATA_DIR`.

## Depends on

Brief 2 must be complete and reviewed: composition adapter, `NERATH_VOICES`, `selectNerathVoice`,
`NERATH_RESONANCE`, positive layer all exported and tested. Brother REUSES these; it does not reimplement them.

## Context

Wave 3 of `.ai/plans/nerath-reconstruction-alpha.md`. Add Brother as a glitch-wing companion mode over the SAME
Eve agent (invariant: no separate agent), reusing the voice fabric from Brief 2, plus a glitch-native TUI and
an isolated Play Canon. Then harden the whole package.

## Task

### 1. Brother instruction (`agent/instructions/35-brother.ts`, new)

- Cherry-pick SELECTIVELY from the `brother/v0-cognition` worktree (read-only). Do NOT merge that branch and do
  NOT copy files wholesale — take only the cognition/default logic needed, rewritten to sit on top of Brief 2.
- Brother is a mode/layer over the same agent (one binary, one vault). It configures defaults by importing from
  `scripts/lib/nerath-mode.mjs` — reuse `NERATH_VOICES` (glitch, conferencier) and `NERATH_RESONANCE` (mirror).
  Do NOT create duplicate voice definitions (invariant: no duplicate tools).
- Brother defaults:
  - Active registers: Glitch voice + Conférencier voice + Mirror resonance + frame-destruction stance.
  - Suppressed by default: Customs (ritual), productivity framing, Tactical Support voice.
- Loads in numeric order after 30-nerath (prefix 35). Must not break the 05→10→20→25→30→now load order.

### 2. Glitch-native TUI (`scripts/brother-stage2/brother-chat.mjs`)

- Semantic status line (what the agent is doing, not raw spinner).
- Glitch transitions between states.
- `--reduced-motion` flag (and respect a `REDUCED_MOTION` env) to disable animation.
- Clean shutdown: release the terminal, restore cursor, no dangling listeners on exit/SIGINT.
- Reuse the existing Eve client/session approach (see `scripts/nerath-stage2/nerath-chat.mjs`); do not fork the
  protocol layer.

### 3. Play Canon (isolated fictional artifact store)

- A store for explicitly-fictional creative artifacts. Every entry MUST be tagged `factual: false`.
- Compatibility with invariants (this is NOT a second transcript / CORE / rollup):
  - Play Canon is creative fiction, never a conversation transcript (invariant #1).
  - Play Canon never holds user identity/profile facts (invariant #2 — no second CORE).
  - Play Canon is excluded from rollup fact-extraction; it never feeds daily/weekly consolidation as fact
    (invariant #3). The rollup memory firewall must treat `factual: false` content as non-fact.
- Storage lives under the dogfood vault only (e.g. `<DOGFOOD>/vault/play-canon/`), never production.
- Add a guard: any Play Canon write aborts if the target path is under `/home/alx/projects/iva/vault`.

### 4. Hardening tests (`tests/brother-*.test.mjs`, hermetic `node --test`)

- Brother defaults: glitch+conferencier active; customs/productivity/tacticalSupport suppressed.
- `35-brother.ts` reuses (imports) Brief 2 voices/resonance — assert no duplicate voice definitions introduced.
- Play Canon: every entry tagged `factual: false`; write guard refuses production vault path; a sample Play Canon
  entry is NOT extracted as a fact by the rollup fact-extraction logic (assert against the firewall prompt/logic).
- Glitch TUI: reduced-motion path produces no animation frames; cleanup restores terminal state (unit-test the
  pure helpers, not a live TTY).
- Non-regression: `node --test tests/nerath-invariants.test.mjs tests/nerath-composition.test.mjs
  tests/nerath-voices.test.mjs` all still pass.

## Allowed paths

- `agent/instructions/35-brother.ts` (new; selective cherry-pick rewritten on Brief 2)
- `scripts/brother-stage2/brother-chat.mjs` (glitch TUI)
- `tests/brother-*.test.mjs` (create)
- `<DOGFOOD>/vault/play-canon/` (dogfood-only fictional store)

## Forbidden

- Do NOT merge or wholesale-copy the `brother/v0-cognition` branch.
- Do NOT create a separate agent, second transcript, second CORE, or second rollup graph.
- Do NOT let Play Canon leak into factual memory / CORE / cards / rollup facts.
- Do NOT modify the frozen constitution text.
- Do NOT write to production vault/data; do NOT edit the main checkout.
- Do NOT commit, tag, push, or restart services.

## Gate

- Brother defaults applied and reuse Brief 2 voices/resonance (no duplicates).
- Glitch TUI works: semantic status, transitions, reduced-motion, clean shutdown.
- Play Canon isolated: all entries `factual: false`, production-write guard active, excluded from fact extraction.
- All brother tests pass; all Nerath tests (Brief 1 + 2) still pass.
- No production writes (prove via `git -C /home/alx/projects/iva status --porcelain` unchanged for vault/data).

## Replay gate (offline)

- `node scripts/nerath-replay.mjs validate <corpus.json>` passes if a corpus exists.
- If baseline responses exist, `compare` shows no net regression vs the R2 freeze baseline.
- Live model replay deferred (D10); record in the report.

## Worker

- Requested: qwen 3.7 via /orc + /agy. **NOTE:** qwen 3.7 is NOT an agy model. Implementation must run on an
  agy-code model (default `gemini-3.1-pro-high`) unless the owner picks another.

## Stop-gate (FINAL)

After completing Brief 3, STOP and return the integrated dogfood package report:
- One launch command for Nerath, one for Brother, one rollback command.
- Source SHA, branch, worktree path, dogfood runtime paths.
- All test results (Brief 1 + 2 + 3) and replay outcome.
- Known limitations.
- Proof production untouched.
The OWNER then decides whether Nerath feels alive, voices are distinct, Mirror is recognisable, and whether
Brother deserves continued development. Do NOT merge or remove anything autonomously.

## Constraints

- Do NOT commit. Do NOT modify production vault or data. Do NOT restart services. Do NOT touch dirty main.
- Edit the worktree directly.
