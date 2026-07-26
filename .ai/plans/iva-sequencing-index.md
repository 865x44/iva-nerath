# Iva Sequencing Index

## Evidence Metadata
- **evidence_base_sha:** `1ee221b39a8e7bf46e80305246293a7f627f78af`
- **reviewed_at:** `2026-07-24T13:38:40+05:00`
- **repo_path:** `/home/alx/.local/share/iva/worktrees/nerath-core-candidate-20260724T000000Z`
- **scope:** `Control-plane sequencing of Nerath Core (N1b/R/V)`
- **invalidated_by:** `Any modification to MVP design authority, out-of-order execution, or branch merge`

This index sequences the execution of the Nerath Core candidate implementation. For full design details, refer to the MVP Design in `iva-nerat-mvp-design.md`.

1. **Phase N1a: Memory Firewall First**
   - See: MVP Design (Memory Firewall)
   - Ownership: `scripts/memory/rollup.ts`, `tests/memory-firewall.test.ts`
   - Gate: N1a worker report passes tests.

2. **Phase N1b: Nerath Core Disabled by Default**
   - See: MVP Design (Default-Off Behavior, Persona / Menu Containment)
   - Ownership: `agent/instructions/30-nerath.ts`, `agent/instructions/25-persona.ts`, `scripts/lib/menu/character.mjs`
   - Gate: Default-off validation passes.

3. **Phase R: Replay Corpus and Candidate Evaluation**
   - See: MVP Design (Replay Categories & Review Matrix)
   - Ownership: `scripts/nerath-replay.mjs`, replay fixtures
   - Gate: Replay evaluation completes without triggering Kill Criteria.

4. **Phase V: Full Verification and Candidate Report**
   - See: MVP Design (Kill Criteria)
   - Ownership: Candidate report
   - Gate: Complete static checks and generate final worker report.
