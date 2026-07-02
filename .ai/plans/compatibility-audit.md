# Compatibility Audit: Iva ↔ OpenCode

## Goal
Map every capability Iva uses (tools, memory, scheduling, subagents, hooks) and check whether the current OpenCode environment provides an equivalent. Produce a compatibility matrix + gap list + recommendations.

## Motivation
Iva (smixs/iva) is designed to run as an eve-framework agent in Telegram with full bash/filesystem/systemd access. Running its codebase through OpenCode CLI (as we are now) loses certain capabilities. We need an evidence-based map of what works, what's degraded, and what's missing.

## Scope
- READ-ONLY inventory of Iva's `agent/` directory: tools, hooks, subagents, connections
- READ-ONLY inventory of vault structure and memory persistence
- Cross-reference each Iva capability against the current OpenCode environment
- Do NOT modify any source files in the repo

## Out of Scope
- No implementation changes to Iva
- No deployment or systemd changes
- No migration of existing vault data

## Slices

### Slice 1: Scout — Iva Tools Inventory
- **Worker:** `/agy-scout`
- **Brief:** List ALL tools Iva registers (read `agent/tools/` directory, inspect each `.ts` file). For each tool, document: filename, zod schema/inputs, resources accessed (bash, filesystem, network, env vars), and whether it needs write permission.
- **Also inspect:** `agent/hooks/`, `agent/subagents/`, `agent/connections/`, `agent/skills/`
- **Output:** `/tmp/agy-research/compat-audit/iva-tools.md`
- **Gate:** Files inventoried cover 100% of `agent/tools/*.ts`

### Slice 2: Scout — Iva Memory & Scheduling
- **Worker:** `/agy-scout`
- **Brief:** Document: vault tree structure (`vault/`), CORE.md loading mechanism, nightly rollup scripts (search `agent/` for "rollup", "nightly", "systemd"), how daily logs are written, how tasks persistence works (search for tasks.json, DATA_DIR, ASSISTANT_DATA_DIR).
- **Output:** `/tmp/agy-research/compat-audit/iva-memory.md`
- **Gate:** Every persistence path identified

### Slice 3: Scout — OpenCode Environment
- **Worker:** `/agy-scout`
- **Brief:** Inventory what's available in the current OpenCode session: list available tools (their names and what they do), check if bash is available, check if direct file write is available, check if systemd/service management is available. Look at the current CLAUDE.md for role definition.
- **Output:** `/tmp/agy-research/compat-audit/opencode-env.md`
- **Gate:** Tool list is complete

### Slice 4: Analyze — Gap Synthesis
- **Worker:** `/agy-analyze` (wave-local, over slice 1+2+3 reports)
- **Inputs:** 
  - `/tmp/agy-research/compat-audit/iva-tools.md`
  - `/tmp/agy-research/compat-audit/iva-memory.md`
  - `/tmp/agy-research/compat-audit/opencode-env.md`
- **Brief:** Cross-reference Iva's capabilities against OpenCode's. Produce a table:

  | Capability | Iva uses | OpenCode has? | Gap | Severity | Workaround |
  |---|---|---|---|---|---|
  | Example | write_file (daily log) | ❌ no write tool | Full gap | High | None without infra change |

  Also note: what's identical, what's degraded (works but limited), what's missing entirely.
- **Output:** `/home/alx/projects/iva/.ai/analysis/compatibility-matrix.md`

## Verification Gates

1. **Gate A (after slice 1+2):** Primary spot-check that scout reports cover every file in `agent/tools/` (flat find). If a tool is missing → rescout.
2. **Gate B (after slice 4):** Every Iva capability from slices 1-2 has a row in the matrix. No capability is "we'll figure it out later".
3. **Gate C:** No false claims about OpenCode tool availability — verify by cross-referencing against known tool output.

## Hard Rules
- All worker lanes are read-only except the final analyze output file
- No commits, no edits to source files, no system changes
- Worker reports are signal, not proof — primary checks before acceptance

## Next After This Plan
- Present compatibility matrix to user
- Decide: which gaps need bridging (plan B), which are acceptable
