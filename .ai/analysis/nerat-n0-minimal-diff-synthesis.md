# Nerath N0 Minimal-Diff Synthesis

## Evidence Metadata
- **evidence_base_sha:** `1ee221b39a8e7bf46e80305246293a7f627f78af`
- **reviewed_at:** `2026-07-24T13:36:00+05:00`
- **repo_path:** `/home/alx/.local/share/iva/worktrees/nerath-core-candidate-20260724T000000Z`
- **scope:** `agent/instructions`, `agent/tools/write_card.ts`, `scripts/memory/rollup.ts`, `scripts/lib/settings.mjs`, `scripts/lib/menu/character.mjs`
- **invalidated_by:** Core Eve framework updates, `agent.ts` architecture replacements, or changes to the base commit `1ee221b39a8e7bf46e80305246293a7f627f78af`

## Synthesis Answers

**1. What is the smallest viable disabled-by-default instruction integration?**
A new file `agent/instructions/30-nerath.ts` using `defineDynamic` on `turn.started`. It reads `data/settings.json` (just as `05-language.ts` does) and returns the Nerath constitution markdown only if Nerath mode is explicitly active. If inactive, it returns an empty string, keeping it completely disabled by default without needing `eve` manifest or routing changes.

**2. Can the existing settings mechanism be reused without a separate runtime?**
Yes. `scripts/lib/settings.mjs` centrally manages `data/settings.json`. A Nerath toggle can be added to this JSON. Instructions can parse this file locally on `turn.started` to evaluate their state on-the-fly, avoiding any separate runtime or process restarts.

**3. What is the exact narrow memory-firewall insertion point that preserves raw transcripts?**
The firewall must be inserted into the daily prompt inside `scripts/memory/rollup.ts`. Scout B's proposal to filter raw transcripts at write-time in `telegram.ts` or read-time in `read_file.ts` is explicitly rejected. Raw data (`vault/daily/YYYY-MM-DD.md`) stays untouched. The prompt in `rollup.ts` must instruct the LLM to differentiate user facts from agent metaphors/hypotheses and to require explicit user ratification for identity claims before calling `write_card`.

**4. What is the minimal production/test file map for N1a and N1b?**
* **N1a (Memory Firewall):**
  * Production: `scripts/memory/rollup.ts` (modifying the daily prompt)
  * Test: `tests/memory-firewall.test.ts` (or similar harness) + disposable synthetic daily transcript fixtures.
* **N1b (Disabled by Default Core):**
  * Production: `agent/instructions/30-nerath.ts` (the constitution block), `agent/instructions/25-persona.ts` (skipping persona if Nerath is active), `scripts/lib/menu/character.mjs` (UI block for persona changes).
  * Test: Unit tests checking the `turn.started` output of instructions based on mock `settings.json`.

**5. How should dynamic persona and `/menu` be contained only while Nerath mode is active?**
In `agent/instructions/25-persona.ts`, if the settings indicate Nerath mode is active, it should return an empty string to suppress the legacy `PERSONA.md`. Additionally, in `scripts/lib/menu/character.mjs`, the character quiz must intercept and block changes (or display a warning that legacy persona is disabled in Nerath mode) so the user cannot silently bypass Nerath.

**6. What is the smallest reproducible 15–25 case replay harness shape?**
A standalone CLI script (e.g., `scripts/nerath-replay.mjs`) that reads 15-25 static test fixtures. It initializes an `eve/client` instance connecting to the running agent, feeds each fixture's input, and logs the agent's response to a file for side-by-side human comparison. It avoids a shadow runtime and uses the real agent API just like `daily-digest.ts`.

**7. What are the risks, contradictions, and kill criteria?**
* **Contradictions:** Scout B recommended filtering raw transcripts (`agent/channels/telegram.ts`), which contradicts the product mandate to preserve raw data. The firewall must be at the extraction stage (`rollup.ts`).
* **Risks:** The daily prompt in `rollup.ts` is already large; adding 10 firewall constraints might cause instruction-following degradation on smaller models.
* **Kill Criteria:** The candidate must be killed if Nerath requires a separate runtime, cannot be proven to be disabled-by-default, changes vocabulary without providing operational decision value, or if the memory firewall suggestions bypass the extraction guards.

## Exact N0 Document Contents Outline
* `.ai/plans/iva-nerat-mvp-design.md`: Product authority, the Nerath constitution requirements, memory firewall principles, testing requirements, and acceptance criteria.
* `.ai/plans/iva-sequencing-index.md`: Short index pointing to execution slices (N1a: Firewall, N1b: Core integration, R: Replay evaluation, V: Verification).

## Exact Sequential Slice Ownership
* **N1a:** Primary handles the deterministic synthetic fixtures. Worker implements the prompt firewall in `scripts/memory/rollup.ts`.
* **N1b:** Worker creates `agent/instructions/30-nerath.ts`, adjusts `agent/instructions/25-persona.ts`, and locks `scripts/lib/menu/character.mjs`. Primary verifies default-off functionality.
* **R (Replay):** Worker builds `scripts/nerath-replay.mjs` and fixtures; Primary runs the review matrix.

AGY_ANALYZE_OK
