# Nerath N0 memory and rollup topology — Scout B

## Evidence Metadata
- **evidence_base_sha:** `1ee221b39a8e7bf46e80305246293a7f627f78af`
- **reviewed_at:** `2026-07-24T13:38:40+05:00`
- **repo_path:** `/home/alx/.local/share/iva/worktrees/nerath-core-candidate-20260724T000000Z`
- **scope:** `agent/channels/telegram.ts`, `scripts/memory/rollup.ts`, `vault/CORE.md`, `vault/MOC.md`, `agent/tools/write_card.ts`
- **invalidated_by:** Changes to base commit, memory extraction logic, or vault structure.

SCOUT_B_OK

1. Raw messages are written through `appendDaily` in `agent/channels/telegram.ts` to `vault/daily/YYYY-MM-DD.md`. Consolidation is orchestrated by `scripts/memory/rollup.ts`, whose prompts drive summaries and card updates.
2. CORE is loaded from `vault/CORE.md` with a 1200-character cap. MOC is `vault/MOC.md`, generated through the memory doctor. Cards are validated in `agent/tools/write_card.ts` with source provenance and `EXTRACTED | INFERRED | AMBIGUOUS` confidence.
3. No synthetic memory fixtures were found within the explicit `agent/`, `scripts/`, `tests/`, and `package.json` inspect scope.
4. Scout proposed read-time filtering in `agent/tools/read_file.ts` or write-time filtering in `agent/channels/telegram.ts`; this is advisory only and conflicts with the requirement to preserve raw transcripts unless synthesis proves otherwise.
5. `vault/` and `data/` are private/live boundaries and must remain untouched.
6. Scout did not read live/private data, transcripts, secrets, or environment files.

Primary must verify the actual rollup prompt and card-validation boundary before choosing an insertion point.
