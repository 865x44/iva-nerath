# NERATH RECONSTRUCTION ALPHA — Worker Decomposition

## Verdict: PROCEED

Plan approved. Decompose into 3 sequential worker briefs.

## Top risks

1. **Composition adapter complexity** — replacing `return ""` with layered composition is the core technical challenge. Risk of prompt bloat or tone conflict between PERSONA and Nerath constitution.
2. **Voice Fabric scope** — 6 voices + routing + resonance + forms is large. Risk of over-engineering or unclear boundaries.
3. **Brother integration** — must reuse `brother/v0-cognition` selectively, not merge wholesale. Risk of scope creep or duplication.

## Decomposition

### Brief 1: Wave 1 Foundation + Invariant Kernel

**Scope:**
- Verify Sanitation Alpha deliverables (isolation, fail-closed, session resume)
- Extract Invariant Kernel (independent from Customs/personality)
- Verify memory-firewall preservation
- Add technical regression tests

**Allowed paths:**
- `scripts/lib/nerath-mode.mjs` (add Invariant Kernel extraction)
- `scripts/memory/rollup.ts` (verify firewall)
- `tests/nerath-*.test.mjs` (add regression tests)
- `scripts/verify-dogfood-isolation.mjs` (verify)

**Gate:**
- Invariant Kernel exported from `nerath-mode.mjs`
- Isolation verifier passes
- Memory firewall tests pass
- No production writes

**Worker:** /agy-code (Gemini 3.1 Pro High)

---

### Brief 2: Wave 2 Composition + Voice Fabric

**Scope:**
- Build composition adapter (replace `return ""` in `25-persona.ts`)
- Implement Positive Nerath Constitution
- Implement 6 Voice contracts (Hunt, Conférencier, Archaeologist, Trader, Tactical Support, Glitch)
- Implement Customs as ritual voice
- Implement routing (one call, one voice, one handoff)
- Implement Resonance (Mirror, Double, Counter)
- Implement Forms support

**Allowed paths:**
- `agent/instructions/25-persona.ts` (composition adapter)
- `agent/instructions/30-nerath.ts` (Positive Constitution + Voices)
- `scripts/lib/nerath-mode.mjs` (voice contracts)
- `tests/nerath-composition.test.mjs` (new)
- `tests/nerath-voices.test.mjs` (new)

**Gate:**
- Composition adapter replaces `return ""` with layered injection
- Positive Constitution present
- 6 voice contracts defined
- Routing: one call, one voice, one handoff
- No voice graph or multi-agent parliament
- Tests pass

**Worker:** /agy-code (Gemini 3.1 Pro High)

---

### Brief 3: Wave 3 Brother + Hardening

**Scope:**
- Implement Brother defaults (Glitch, Conférencier, Mirror, frame destruction)
- Suppress Customs/productivity/Tactical Support by default
- Implement Glitch-native TUI (semantic status, transitions, reduced-motion, cleanup)
- Implement Play Canon (fictional artifact store, `factual: false`)
- Run integrated hardening tests
- Fix technical failures

**Allowed paths:**
- `agent/instructions/35-brother.ts` (new, or cherry-pick from `brother/v0-cognition`)
- `scripts/brother-stage2/brother-chat.mjs` (glitch TUI)
- `tests/brother-*.test.mjs` (new)
- `tests/nerath-*.test.mjs` (verify)

**Gate:**
- Brother defaults applied
- Glitch TUI works (semantic status, transitions, cleanup)
- Play Canon isolated from factual memory
- All tests pass
- No production writes

**Worker:** /agy-code (Gemini 3.1 Pro High)

---

## Final checkpoint

After all 3 briefs:
- Return integrated dogfood package
- One launch command for Nerath, one for Brother
- One rollback command
- Source SHA, branch, worktree, runtime paths
- Test results
- Known limitations
- Proof production untouched

**Owner decides:**
- Whether Nerath feels alive
- Whether voices feel distinct
- Whether Mirror feels recognisable
- Whether Brother deserves continued development
- What to merge or remove

**Final verdict:**
- READY FOR INTEGRATED OWNER DOGFOOD
- REVISE BEFORE OWNER DOGFOOD
- BLOCKED

## Execution order

```
Brief 1 → Brief 2 → Brief 3 → Final checkpoint
```

Sequential. Each brief continues automatically after technical verification.

## Orchestrator audit

After all briefs:
1. Cross-brief consistency: composition adapter uses Invariant Kernel?
2. Forbidden paths: production vault/data untouched?
3. Isolation verified: all dogfood services isolated?
4. Tests pass: all regression tests green?
5. Deliverables complete: launch commands, rollback, test results?

## Launch prompt

> ⚠️ **RETIRED — superseded by `.ai/plans/nerath-reconstruction-alpha-launch.md`.**
> The autonomous chaining below ("continue to Brief 2 and Brief 3 autonomously") is no longer valid. Execution
> is per-brief with a hard stop-gate and orchestrator review between briefs. Briefs live in
> `.ai/tasks/nerath-reconstruction-brief-{1,2,3}.md`. Use the dispatch template in the launch artifact.

```
Execute .ai/tasks/nerath-reconstruction-brief-1.md exactly.
Edit this repository directly. Do not commit.
After completion, continue to Brief 2 and Brief 3 autonomously.
Return one integrated dogfood package at the end.
```
