# Plan: Optimize narrative-build-engine + wire as /anal-analyze

**Status:** draft  
**Date:** 2026-07-01  
**Planner:** Iva (via /planner)  
**Source input:** /home/alx/Documents/202/exprmnts/Inbox/newshiny.md.md  

---

## Critique

narrative-build-engine is a competent game-dev reskin of Alchemy Table. Prompt engineer VERIFY (via Gemini 3.1 Pro High) scored it 7/10 with 4 issues:

1. [HIGH] ~300 lines of IMPLEMENTATION_NOTES inside SKILL.md — dev meta in runtime prompt
2. [HIGH] Format conflict between §0 (7-field generic) and §12 (task-specific formats)
3. [MED] Sandbox Melt (§4.2) lacks safety boundary — can be read as jailbreak
4. [LOW] Idle Compile/Nocturnal protocol sounds like model should simulate physical actions

Optimization is bounded — single file, surgical edits. /anal-analyze wiring is lightweight: save optimized skill to ~/iva/scratch/ + register in OPEN_LOOPS.

**Top risks:**
1. Over-optimizing may break working sections — keep all operational content, touch only flagged lines
2. /anal-analyze definition is ambiguous — propose concrete meaning, user can redirect

---

## Phase 1 — Optimize newshiny (via /agy-code)

**Worker:** /agy-code  
**Scope:** Edit /home/alx/Documents/202/exprmnts/Inbox/newshiny.md.md  

Changes:

1. §0: Add yield clause after the 7-field template:  
   `"Если в Разделе 12 указан специфический формат для твоего типа задачи — используй его. Если нет — используй этот общий формат."`

2. §4.2 (Sandbox Melt): Append safety guard:  
   `"⚠️ Применяется только к рамкам, установленным пользователем. Не отменяет safety-правила модели и базовые ограничения."`

3. §4.7 / §8 (Idle Compile / Nocturnal Compiler): Prepend protocol with:  
   `"Протокол для пользователя (модель не выполняет — пользователь следует сам):"`

4. IMPLEMENTATION_NOTES section:  
   - Keep sections 1-4 (what changed, architecture, roles, what to keep in SKILL.md)  
   - Keep sections 5 (risk) and 6 (quality check)  
   - **Remove** sections 9 (smoke tests), 10 (v1.0 criteria), 11 (next file to create)  
   - Relabel section header to: `## [DEV] IMPLEMENTATION_NOTES — для разработчика`

5. Add `---` separator between SKILL.md body and IMPLEMENTATION_NOTES.

**Do not touch:** any operation descriptions, anti-cheese rules, routing tables, protocol sections, format examples, style guidelines.

**Output:** modified newshiny.md.md written in-place.

**Verification gate:** confirm file exists, grep for key phrases that should be present/absent.

---

## Phase 2 — Wire as /anal-analyze (via /agy-code)

**Worker:** /agy-code  
**Scope:** Write to ~/iva/ only

1. Copy optimized newshiny.md.md to ~/iva/scratch/anal-analyze-skill.md
2. Append to /home/alx/iva/OPEN_LOOPS.md a 🟢 entry:
   ```
   ### 🟢 narrative-build-engine / anal-analyze — skill available
   Optimized narrative-build-engine (game-dev Alchemy Table reskin) is available at ~/iva/scratch/anal-analyze-skill.md. Can be used on any text/project/situation. Difference from Alchemy Table: game-dev language, anti-cheese rules, structured output formats. Best for: devs, game designers, technical audiences.
   ```

**Output:** ~/iva/scratch/anal-analyze-skill.md + updated OPEN_LOOPS.md.

**Verification gate:** confirm both files exist and are non-empty.

---

## Phase 3 — Primary verification

1. Read optimized newshiny.md.md — confirm 4 changes were applied
2. Read ~/iva/scratch/anal-analyze-skill.md — confirm it's a copy with same content
3. Read OPEN_LOOPS.md — confirm entry exists
4. Report to user

---

## Stop gate

After Phase 1, show user the diff before proceeding to Phase 2. If they want to adjust /anal-analyze wiring, this is the point.

---

## Launch prompt for /orc

```text
Execute /home/alx/projects/iva/.ai/plans/newshiny-optimize.md.
- You are orchestrator/dispatcher only (use /orc).
- Use /agy workers only: /agy-code for approved implementation.
- Phase 1: edit newshiny.md.md — apply 4 specified changes, remove smoke tests/criteria/next-file sections from IMPLEMENTATION_NOTES, add --- separator.
- Phase 2: copy to ~/iva/scratch/anal-analyze-skill.md + update OPEN_LOOPS.md.
- Do not touch any other files.
- Stop after Phase 1 and show diff to user before Phase 2.
```
