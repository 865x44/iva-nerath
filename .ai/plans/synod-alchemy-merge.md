# Synod + Alchemy Table: Merge Scenarios

## Goal
Generate 3-5 concrete, implementable scenarios for integrating the Clarity Council (Synod) skill with the Alchemy Table skill. Each scenario should describe: trigger → which voices/operations fire → protocol → output.

## Source Material
- Synod spec: `/home/alx/.claude/skills/synod/SKILL.md`
- Alchemy Table spec: `/tmp/agy-research/synod-alchemy/alchemy-table-spec.md`
- Conversation context: user's explicit comparison question in the 2026-07-01 session

## Scope
- READ-ONLY inventory of both skill structures
- Produce synthetic merge scenarios
- Do NOT modify any skill files
- Do NOT implement any code

## Out of Scope
- No actual implementation (no code, no SKILL.md edits)
- No deployment or system changes
- No changes to existing skills

## Slices

### Slice 1: Scout — Synod Structure
- **Worker:** `/agy-scout`
- **Brief:** Read `/home/alx/.claude/skills/synod/SKILL.md`. Extract:
  1. Voice definitions (list all 7 voices, their trigger conditions, their tone)
  2. Trigger mapping (signal → which voice(s) fire)
  3. Invocation rules (max 2 voices, crisis → only Dispatcher)
  4. Response format
  5. Fallback logic
- **Output:** `/tmp/agy-research/synod-alchemy/synod-structure.md`

### Slice 2: Scout — Alchemy Table Structure
- **Worker:** `/agy-scout`
- **Brief:** Read `/tmp/agy-research/synod-alchemy/alchemy-table-spec.md`. Extract:
  1. The 4 stages of the Magnum Opus (Nigredo, Albedo, Citrinitas, Rubedo) with their markers
  2. The 9 operations (Calcinatio, Solutio, etc.) with their applications
  3. The 3 principles (Sulfur, Mercury, Salt) — diagnostic tool
  4. Compression/Expansion (Kabdh/Bast) — the Sufi rhythm
  5. The 7 stages of psyche maturity
  6. The 8 magical principles table
  7. The 3 protocols (text, strategy, human)
  8. Cross-reference with Strategic Mind
- **Output:** `/tmp/agy-research/synod-alchemy/alchemy-structure.md`

### Slice 3: Analyze — Merge Scenarios
- **Worker:** `/agy-analyze` (wave-local, over slice 1+2 reports)
- **Inputs:**
  - `/tmp/agy-research/synod-alchemy/synod-structure.md`
  - `/tmp/agy-research/synod-alchemy/alchemy-structure.md`
- **Brief:** Cross-reference the two systems and produce 3-5 merge scenarios.

  For each scenario, specify:
  1. **Name** — short label
  2. **Trigger** — what signal from the user activates this scenario
  3. **Synod voices** — which voices fire (max 2 per the Synod rule)
  4. **Alchemy stage/operation** — which alchemical stage is diagnosed and which operation is applied
  5. **Protocol** — step-by-step flow: how Synod and Alchemy interact
  6. **Output** — what the user sees (the combined response format)
  7. **Edge case** — what happens if the scenario fails or the user resists

  Scenarios to cover:
  - **Scenario A: Deep Nigredo** — user in crisis/paralysis/self-criticism. Synod triages (Dispatcher/Arheolog), then Alchemy maps to Nigredo stage
  - **Scenario B: Scope creep / Calcinatio** — user building 3rd system. Constructor + Alchemical Calcinatio to burn away excess
  - **Scenario C: Can't start / S压缩** — Provednik + Kabdh (compression) diagnosis
  - **Scenario D: Analysis request** — Analyst + Separatio/Solutio to dissolve rigid thinking
  - **Scenario E: Recurring pattern / Kabiri** — Pomehi detection + Kabiri conditions check

  Also produce:
  - **Integration architecture:** how the two systems could technically coexist (which is primary, how they hand off, what the merged response template looks like)
  - **Risk register:** what could go wrong (over-alchemizing, voice overload, losing Synod's speed)
- **Output:** `/home/alx/projects/iva/.ai/analysis/synod-alchemy-scenarios.md`

## Verification Gates

1. **Gate A (after slice 1+2):** Verify both scout reports cover ALL sections from the source specs. If any table/matrix is missing → rescout.
2. **Gate B (after slice 3):** Every scenario has all 7 fields filled (name, trigger, voices, alchemy, protocol, output, edge case). No half-baked scenarios.

## Hard Rules
- All worker lanes are read-only
- No edits to SKILL.md or any system files
- Scenarios should be practical, not poetic — these are meant to be implementable
