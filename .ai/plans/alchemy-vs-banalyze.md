# Plan: Alchemy Table vs banalyze — Deep Comparison

## Goal
Compare Alchemy Table (symbolic depth) vs banalyze/narrative-build-engine (game-dev reskin). Determine:
1. Is Alchemy Table redundant given banalyze's coverage?
2. If not, what unique value does each bring?
3. Recommended action: merge Alchemy into banalyze, keep both, or drop one.

## Source Files
- **Alchemy Table (full spec):** `/tmp/agy-research/synod-alchemy/alchemy-table-spec-full.md` (477 lines, written by earlier task)
- **banalyze:** `/home/alx/iva/scratch/banalyze-skill.md` (1331 lines, narrative-build-engine v0.2)

## Scope
- READ-ONLY. Inventory both specs, compare structure, produce analysis report.
- Do NOT edit source files. Do NOT modify skills.
- Output only: analysis report.

## Out of Scope
- No implementation (no SKILL.md edits, no code)
- No changes to existing skills on disk
- No deployment

## Slices

### Slice 1: Scout — Alchemy Table Structure
- **Worker:** `/agy-scout`
- **Model:** `Gemini 2.5 Flash (High)` (fast, cheap for structured extraction)
- **Command:**
```bash
agy --model "Gemini 2.5 Flash (High)" --sandbox --print-timeout 10m \
  -p 'Read /tmp/agy-research/synod-alchemy/alchemy-table-spec-full.md.
   Extract and write to /tmp/agy-research/at-vs-ban/alchemy-structure.md:

   1. All 4 stages (Nigredo/Albedo/Citrinitas/Rubedo) with markers
   2. All 9 operations with elements and applications
   3. Tria Prima (Sulfur/Mercury/Salt) — diagnostic
   4. Compression/Expansion (Kabdh/Bast) — rhythm
   5. 7 stages of psyche maturity
   6. Kabiri — conditions
   7. 8 magical principles table
   8. All 3 protocols (text/strategy/human)
   9. Diagnostic questionnaire
   10. Cross-reference with Strategic Mind
   11. Literary corpus summary
   
   Write as a structured markdown table. Include line counts per section.'
```

### Slice 2: Scout — banalyze Structure
- **Worker:** `/agy-scout`
- **Model:** `Gemini 2.5 Flash (High)`
- **Command:**
```bash
agy --model "Gemini 2.5 Flash (High)" --sandbox --print-timeout 10m \
  -p 'Read /home/alx/iva/scratch/banalyze-skill.md.
   Extract and write to /tmp/agy-research/at-vs-ban/banalyze-structure.md:

   1. All 4 build phases (Crash/Debug/Night Compile/Gold) with markers
   2. All 9 operations (Fire Pass/Sandbox Melt/Layer Debug/Meta View/Build Lock/Fusion Build/Idle Compile/Meta Spread/Deploy)
   3. 3 build parameters (Core Drive/Mobility/World Physics)
   4. Cooldown/Flow — rhythm
   5. 7 player levels
   6. Night Compiler — conditions
   7. 8 systemic principles
   8. All 6 protocols (Battle/Editor/Strategy/Character/Reskin/Anti-cheese)
   9. Anti-cheese rules and red flags
   10. Canonical dictionary (old→new terms)
   11. Implementation notes
   12. Example answers (3 examples)
   
   Write as structured markdown table. Include line counts per section.'
```

### Slice 3: Analyze — Deep Comparison
- **Worker:** `/agy-analyze` (wave-local, over slice 1+2 reports)
- **Model:** `Gemini 3.1 Pro (High)` — needs reasoning depth for the verdict
- **Command:**
```bash
agy --model "Gemini 3.1 Pro (High)" --sandbox --print-timeout 15m \
  -p 'Read two scout reports:
   1. /tmp/agy-research/at-vs-ban/alchemy-structure.md
   2. /tmp/agy-research/at-vs-ban/banalyze-structure.md

   Produce a comparison analysis and write to /home/alx/projects/iva/.ai/analysis/alchemy-vs-banalyze.md.

   The analysis MUST include:

   ### Section A: Structural Map (table)
   | Alchemy Table | banalyze | Match Quality | Notes |
   |---|---|---|---|
   | Nigredo | Build Crash | exact/partial/none | ... |
   | Albedo | Debug Zone | ... | ... |
   | ... | ... | ... | ... |

   Map EVERY section from both systems.

   ### Section B: What Alchemy Table Has That banalyze Lacks
   List each unique element. For each: function, value (essential/nice/decorative), can it be translated to banalyze?

   ### Section C: What banalyze Has That Alchemy Table Lacks
   List each unique element (anti-cheese, struct formats, reskin protocol, etc.). For each: function, value.

   ### Section D: Verdict on Redundancy
   Answer clearly: IS Alchemy Table redundant given banalyze?
   - If YES: what from Alchemy Table should be absorbed into banalyze before archiving Alchemy Table?
   - If NO: what justifies keeping both?

   ### Section E: Merge Plan (if applicable)
   If merging is recommended, provide specific instructions:
   1. What to copy from Alchemy → banalyze (which sections)
   2. What to leave in Alchemy Table only (literary corpus? historical references?)
   3. What banalyze already does better
   4. Which format/protocol to use for the merged result

   Be specific. Use evidence from the reports. Do not be vague.'
```

### Slice 4 (optional): Implementation
If the analysis recommends merging AND user approves, `/agy-code` can implement the merge.

NOT in this wave — requires user approval first.

## Verification Gates

1. **Gate A (after slice 1+2):** Check both scout reports exist via `ls -la /tmp/agy-research/at-vs-ban/*.md`. If missing → re-run scout with error handling.
2. **Gate B (after slice 3):** Read the analysis report. Verify:
   - Every section from both systems has a row in the structural map
   - Verdict is explicit (yes/no/maybe), not vague
   - If merge recommended, the plan is specific enough to execute
3. **Gate C:** Analysis file is at `.ai/analysis/alchemy-vs-banalyze.md` and is ≥100 lines.

## Stop Gates
- Stop AFTER slice 3 and report for primary verification.
- Do NOT proceed to implementation (slice 4) without user approval.

## Hard Rules
- Read-only on source files. No edits.
- Workers produce reports to specified paths.
- Primary Planner verifies before accepting.
